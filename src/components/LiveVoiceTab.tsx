import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Mic,
  PhoneOff,
  Send,
  ShieldCheck,
  Volume2,
} from 'lucide-react';
import { Language, LiveTranscriptTurn } from '../types';
import { TranslationPack } from '../data/translations';

const VOICE_PORTRAIT_PATH = '/src/assets/images/voice_field_assist_1795334732725.jpg';

interface LiveVoiceTabProps {
  language: Language;
  t: TranslationPack;
  onBridgeToFinder: (extractedText: string) => void;
}

function float32ToPcm16Base64(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const samples = Math.floor(len / 2);
  const float32 = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    float32[i] = view.getInt16(i * 2, true) / 32768;
  }
  return float32;
}

export const LiveVoiceTab: React.FC<LiveVoiceTabProps> = ({
  language,
  t,
  onBridgeToFinder,
}) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const [turns, setTurns] = useState<LiveTranscriptTurn[]>([]);
  const [draftInput, setDraftInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [imgError, setImgError] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const pendingPromptRef = useRef<string | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const stopOutputAudio = () => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch {
        // Ignore already stopped source
      }
    });
    activeSourcesRef.current = [];
    if (outputCtxRef.current) {
      nextStartTimeRef.current = outputCtxRef.current.currentTime;
    }
  };

  const cleanupSession = () => {
    stopOutputAudio();
    try {
      processorRef.current?.disconnect();
    } catch {
      // Ignore
    }
    processorRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (inputCtxRef.current) {
      void inputCtxRef.current.close();
      inputCtxRef.current = null;
    }

    if (outputCtxRef.current) {
      void outputCtxRef.current.close();
      outputCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch {
        // Ignore
      }
      wsRef.current = null;
    }

    setStatus('idle');
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      cleanupSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [turns]);

  const appendTranscript = (role: 'user' | 'assistant', chunk: string) => {
    const text = chunk.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTurns((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role) {
        const needsSpace = last.text.length > 0 && !last.text.endsWith(' ') && !text.startsWith(' ');
        return [
          ...prev.slice(0, -1),
          { ...last, text: `${last.text}${needsSpace ? ' ' : ''}${text}` },
        ];
      }
      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role,
          text,
          timestamp: time,
        },
      ];
    });
  };

  const playPcm24kChunk = (base64Audio: string) => {
    const outCtx = outputCtxRef.current;
    if (!outCtx) return;
    if (outCtx.state === 'suspended') {
      void outCtx.resume();
    }

    const float32 = base64Pcm16ToFloat32(base64Audio);
    const buffer = outCtx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);

    const source = outCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(outCtx.destination);

    const now = outCtx.currentTime;
    const startAt = Math.max(now, nextStartTimeRef.current);
    source.start(startAt);
    nextStartTimeRef.current = startAt + buffer.duration;

    activeSourcesRef.current.push(source);
    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
    };
  };

  const startLiveSession = async (initialPrompt?: string) => {
    if (status !== 'idle') {
      if (initialPrompt && wsRef.current?.readyState === WebSocket.OPEN) {
        appendTranscript('user', initialPrompt);
        wsRef.current.send(JSON.stringify({ type: 'text', text: initialPrompt }));
      }
      return;
    }

    setErrorMsg('');
    setStatus('connecting');
    pendingPromptRef.current = initialPrompt ?? null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/api/live?lang=${language}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            type: string;
            data?: string;
            text?: string;
            message?: string;
          };

          if (msg.type === 'ready') {
            setStatus('connected');

            // Start 16kHz PCM microphone capture
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (wsRef.current?.readyState !== WebSocket.OPEN) return;
              const channel = e.inputBuffer.getChannelData(0);

              // Subtle real-time mic amplitude meter
              let sum = 0;
              for (let i = 0; i < channel.length; i += 8) {
                sum += Math.abs(channel[i]);
              }
              const avg = Math.min(1, (sum / (channel.length / 8)) * 6);
              setAudioLevel(avg);

              const base64 = float32ToPcm16Base64(channel);
              wsRef.current.send(JSON.stringify({ type: 'audio', audio: base64 }));
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);

            if (pendingPromptRef.current) {
              const prompt = pendingPromptRef.current;
              pendingPromptRef.current = null;
              appendTranscript('user', prompt);
              ws.send(JSON.stringify({ type: 'text', text: prompt }));
            }
          } else if (msg.type === 'audio' && msg.data) {
            playPcm24kChunk(msg.data);
          } else if (msg.type === 'input_transcript' && msg.text) {
            appendTranscript('user', msg.text);
          } else if (msg.type === 'output_transcript' && msg.text) {
            appendTranscript('assistant', msg.text);
          } else if (msg.type === 'interrupted') {
            stopOutputAudio();
          } else if (msg.type === 'error') {
            setErrorMsg(msg.message || 'Live voice session encountered an error.');
            cleanupSession();
          } else if (msg.type === 'closed') {
            cleanupSession();
          }
        } catch {
          // Ignore malformed ws messages
        }
      };

      ws.onerror = () => {
        setErrorMsg('Live voice connection closed. Please try starting the call again.');
        cleanupSession();
      };

      ws.onclose = () => {
        if (status !== 'idle') {
          cleanupSession();
        }
      };
    } catch {
      setErrorMsg(t.voice.micError);
      cleanupSession();
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = draftInput.trim();
    if (!cleaned) return;
    setDraftInput('');

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      appendTranscript('user', cleaned);
      wsRef.current.send(JSON.stringify({ type: 'text', text: cleaned }));
    } else {
      void startLiveSession(cleaned);
    }
  };

  const handleBridgeToSchemeFinder = () => {
    const userSpoken = turns
      .filter((item) => item.role === 'user')
      .map((item) => item.text)
      .join(' ')
      .trim();

    const fallbackContext =
      userSpoken ||
      turns
        .map((item) => item.text)
        .join(' ')
        .trim() ||
      t.hero.demo1Prompt;

    cleanupSession();
    onBridgeToFinder(fallbackContext);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Live Voice Control & Quick Prompts */}
        <div className="lg:col-span-5 bg-white border border-[#E2E7DF] rounded-2xl p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs font-medium text-[#15613E]">{t.voice.kicker}</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#16221B] leading-tight text-balance">
              {t.voice.headline}
            </h1>
            <p className="text-sm text-[#4A5B50] leading-relaxed">{t.voice.subheadline}</p>
          </div>

          {/* Documentary Field Portrait */}
          <div className="relative rounded-xl overflow-hidden border border-[#E2E7DF] aspect-[4/3] bg-[#1B3325]">
            {!imgError ? (
              <img
                src={VOICE_PORTRAIT_PATH}
                alt="Indian woman farmer speaking on a mobile phone in a sunlit agricultural field"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#15613E] to-[#0E3A26]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4">
              <div className="flex items-center gap-2 text-xs text-white font-medium">
                {status === 'connected' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                )}
                <span>
                  {status === 'connecting'
                    ? t.voice.connecting
                    : status === 'connected'
                      ? t.voice.listening
                      : t.voice.idleStatus}
                </span>
              </div>

              {/* Real live mic waveform bars when connected */}
              {status === 'connected' && (
                <div className="mt-2.5 flex items-end gap-1 h-5" aria-hidden="true">
                  {[0.35, 0.7, 1.0, 0.65, 0.85, 0.5, 0.75, 0.4].map((weight, i) => (
                    <span
                      key={i}
                      className="w-1.5 rounded-full bg-emerald-300 transition-transform duration-100"
                      style={{
                        height: `${Math.max(20, Math.round(audioLevel * weight * 100))}%`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Call Trigger Button */}
          <div className="space-y-3">
            {status === 'idle' ? (
              <button
                type="button"
                onClick={() => void startLiveSession()}
                className="w-full min-h-[52px] rounded-xl bg-[#15613E] text-white text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-[#0E4A2F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15613E]"
              >
                <Mic className="w-5 h-5" />
                {t.voice.startBtn}
              </button>
            ) : (
              <button
                type="button"
                onClick={cleanupSession}
                className="w-full min-h-[52px] rounded-xl bg-red-700 text-white text-sm font-semibold flex items-center justify-center gap-2.5 hover:bg-red-800 transition-colors"
              >
                <PhoneOff className="w-5 h-5" />
                {t.voice.stopBtn}
              </button>
            )}

            <div className="flex items-start gap-2 text-xs text-[#4A5B50]">
              <ShieldCheck className="w-4 h-4 text-[#15613E] shrink-0 mt-0.5" />
              <span>{t.zeroPii.badgeDetail}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Transcripts, Quick Prompts, and 1-Tap Bridge */}
        <div className="lg:col-span-7 bg-white border border-[#E2E7DF] rounded-2xl p-6 flex flex-col justify-between gap-5">
          {/* Quick Voice Prompts */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold text-[#4A5B50]">{t.voice.quickPromptsTitle}</p>
            <div className="grid grid-cols-1 gap-2">
              {t.voice.quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => void startLiveSession(prompt)}
                  className="text-left px-3.5 py-2.5 min-h-[44px] rounded-xl border border-[#DCE4D9] bg-[#FAFBF9] hover:border-[#15613E] hover:bg-[#F3F8F4] text-xs sm:text-sm text-[#16221B] transition-colors flex items-center justify-between gap-3"
                >
                  <span className="leading-snug">{prompt}</span>
                  <Volume2 className="w-4 h-4 text-[#15613E] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs sm:text-sm text-amber-900">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Live Transcript Feed */}
          <div className="flex-1 min-h-[240px] max-h-[380px] overflow-y-auto rounded-xl border border-[#E2E7DF] bg-[#FAFBF9] p-4 space-y-3">
            <p className="text-xs font-semibold text-[#5A6B60] pb-2 border-b border-[#E8EDE5]">
              {t.voice.transcriptTitle}
            </p>

            {turns.length === 0 ? (
              <p className="text-sm text-[#5A6B60] py-10 text-center max-w-sm mx-auto leading-relaxed">
                {t.voice.transcriptEmpty}
              </p>
            ) : (
              <div className="space-y-3">
                {turns.map((turn) => (
                  <div
                    key={turn.id}
                    className={`flex flex-col ${
                      turn.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[11px] font-medium text-[#5A6B60] mb-1">
                      {turn.role === 'user' ? t.voice.youLabel : t.voice.assistantLabel} ·{' '}
                      <span className="font-mono tabular-nums">{turn.timestamp}</span>
                    </span>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        turn.role === 'user'
                          ? 'bg-[#15613E] text-white'
                          : 'bg-white border border-[#DCE4D9] text-[#16221B]'
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                ))}
                <div ref={transcriptEndRef} />
              </div>
            )}
          </div>

          {/* Text Follow-Up + 1-Tap Bridge Back to Scheme Finder */}
          <div className="space-y-3">
            <form onSubmit={handleSendText} className="flex items-center gap-2">
              <input
                type="text"
                value={draftInput}
                onChange={(e) => setDraftInput(e.target.value)}
                placeholder={t.voice.sendTextPlaceholder}
                className="flex-1 min-h-[44px] rounded-xl border border-[#D4DDD1] bg-[#FAFBF9] px-3.5 text-sm text-[#16221B] focus:bg-white focus:border-[#15613E] focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draftInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[#F1F4EE] text-[#16221B] text-sm font-semibold hover:bg-[#E4EAE0] disabled:opacity-50 whitespace-nowrap transition-colors"
              >
                <Send className="w-4 h-4 text-[#15613E]" />
                {t.voice.sendBtn}
              </button>
            </form>

            <div className="pt-3 border-t border-[#EDF1EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-[#5A6B60] leading-relaxed">{t.voice.bridgeHint}</p>
              <button
                type="button"
                onClick={handleBridgeToSchemeFinder}
                className="inline-flex items-center justify-center gap-2 px-4 min-h-[46px] rounded-xl bg-[#15613E] text-white text-sm font-semibold hover:bg-[#0E4A2F] whitespace-nowrap transition-colors shrink-0"
              >
                {t.voice.bridgeBtn}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
