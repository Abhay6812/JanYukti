import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  ClipboardList,
  ExternalLink,
  Info,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  SquareCheck,
} from 'lucide-react';
import { FarmerProfile, Language, Scheme } from '../types';
import { TranslationPack } from '../data/translations';
import {
  evaluateSchemes,
  formatINR,
  getRuleLabel,
  getSchemeBenefit,
  getSchemeSummary,
  getSchemeTitle,
  scrubPiiClient,
} from '../utils/eligibilityEngine';

const HERO_IMAGE_PATH = '/src/assets/images/hero_indian_farmland_1795334732884.jpg';

interface FindBenefitsTabProps {
  language: Language;
  t: TranslationPack;
  schemes: Scheme[];
  queryText: string;
  onQueryTextChange: (val: string) => void;
  profile: FarmerProfile | null;
  onProfileParsed: (profile: FarmerProfile | null) => void;
  autoParseTrigger: number;
  onOpenChecklist: (scheme: Scheme) => void;
  onOpenGuide: (scheme: Scheme) => void;
}

export const FindBenefitsTab: React.FC<FindBenefitsTabProps> = ({
  language,
  t,
  schemes,
  queryText,
  onQueryTextChange,
  profile,
  onProfileParsed,
  autoParseTrigger,
  onOpenChecklist,
  onOpenGuide,
}) => {
  const [isParsing, setIsParsing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [piiBanner, setPiiBanner] = useState(false);
  const [heroImgError, setHeroImgError] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef<number>(autoParseTrigger);

  const runProfileParse = async (rawInput: string) => {
    const trimmed = rawInput.trim();
    if (!trimmed) return;

    const { cleaned, redacted } = scrubPiiClient(trimmed);
    setPiiBanner(redacted);
    if (redacted) {
      onQueryTextChange(cleaned);
    }

    setIsParsing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/parse-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleaned, language }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not parse farm profile.');
      }
      if (data.profile?.piiRedacted) {
        setPiiBanner(true);
      }
      onProfileParsed(data.profile);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to parse farm details.');
    } finally {
      setIsParsing(false);
    }
  };

  // Trigger automatic parsing when bridged back from Live Voice tab
  useEffect(() => {
    if (autoParseTrigger !== lastTriggerRef.current && queryText.trim()) {
      lastTriggerRef.current = autoParseTrigger;
      void runProfileParse(queryText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoParseTrigger]);

  const handleJudgeDemo = (demoPrompt: string) => {
    onQueryTextChange(demoPrompt);
    void runProfileParse(demoPrompt);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType: preferredMime });
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(audioChunksRef.current, { type: preferredMime });
        if (blob.size < 200) return;

        setIsTranscribing(true);
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = String(reader.result || '');
              const idx = result.indexOf(',');
              resolve(idx >= 0 ? result.slice(idx + 1) : result);
            };
            reader.onerror = () => reject(new Error('Failed to read recorded audio.'));
            reader.readAsDataURL(blob);
          });

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: preferredMime,
              language,
            }),
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Audio transcription failed.');
          }
          if (data.piiRedacted) {
            setPiiBanner(true);
          }
          if (data.transcript) {
            onQueryTextChange(data.transcript);
            await runProfileParse(data.transcript);
          }
        } catch (err) {
          setErrorMsg(err instanceof Error ? err.message : 'Voice transcription failed.');
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setErrorMsg(t.voice.micError);
    }
  };

  const handleReset = () => {
    onQueryTextChange('');
    onProfileParsed(null);
    setPiiBanner(false);
    setErrorMsg('');
  };

  const matchResults = evaluateSchemes(schemes, profile);

  return (
    <div className="space-y-8">
      {/* Editorial Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-[#E2E7DF] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <p className="text-xs font-medium text-[#15613E]">{t.hero.kicker}</p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#16221B] tracking-tight leading-[1.15] text-balance max-w-2xl">
              {t.hero.headline}
            </h1>
            <p className="text-sm sm:text-base text-[#4A5B50] leading-relaxed max-w-2xl">
              {t.hero.subheadline}
            </p>
          </div>

          {/* Visible Zero-PII Trust Strip */}
          <div className="pt-4 border-t border-[#EDF1EA] flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EDF5F0] text-[#15613E] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#16221B]">{t.zeroPii.badgeTitle}</p>
              <p className="text-xs sm:text-sm text-[#4A5B50] mt-0.5 leading-relaxed">
                {t.zeroPii.badgeDetail}
              </p>
            </div>
          </div>
        </div>

        {/* Hero Field Documentary Photograph */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#E2E7DF] min-h-[220px] lg:min-h-0 bg-[#1B3325]">
          {!heroImgError ? (
            <img
              src={HERO_IMAGE_PATH}
              alt="Sunlit green farmland in Maharashtra, India"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgError(true)}
              className="w-full h-full object-cover lg:h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#15613E] to-[#0E3A26] p-6 flex items-end" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-5 sm:p-6">
            <p className="text-xs font-medium text-white/85">
              {t.framing.likelyEligible} · {t.framing.verifyOnPortal}
            </p>
            <p className="text-sm text-white font-medium mt-1 leading-snug">
              {t.framing.disclaimer}
            </p>
          </div>
        </div>
      </section>

      {/* Judge 1-Tap Demo Profiles + Plain-Language & Voice Input Workspace */}
      <section className="bg-white border border-[#E2E7DF] rounded-2xl p-5 sm:p-7 space-y-6">
        {/* 2 Pre-seeded 1-Tap Judge Demo Profiles */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-[#4A5B50]">{t.hero.demoHeading}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleJudgeDemo(t.hero.demo1Prompt)}
              disabled={isParsing || isTranscribing}
              className="text-left p-4 min-h-[64px] rounded-xl border border-[#DCE4D9] bg-[#FAFBF9] hover:border-[#15613E] hover:bg-[#F3F8F4] transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15613E]"
            >
              <span className="block text-sm font-semibold text-[#16221B]">
                01. {t.hero.demo1Title}
              </span>
              <span className="block text-xs text-[#4A5B50] mt-1 leading-relaxed">
                {t.hero.demo1Subtitle}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleJudgeDemo(t.hero.demo2Prompt)}
              disabled={isParsing || isTranscribing}
              className="text-left p-4 min-h-[64px] rounded-xl border border-[#DCE4D9] bg-[#FAFBF9] hover:border-[#15613E] hover:bg-[#F3F8F4] transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15613E]"
            >
              <span className="block text-sm font-semibold text-[#16221B]">
                02. {t.hero.demo2Title}
              </span>
              <span className="block text-xs text-[#4A5B50] mt-1 leading-relaxed">
                {t.hero.demo2Subtitle}
              </span>
            </button>
          </div>
        </div>

        {/* Plain-Language / Dialect Input + Mic Voice Recorder */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runProfileParse(queryText);
          }}
          className="space-y-3"
        >
          <label
            htmlFor="farmer-query-input"
            className="block text-sm font-semibold text-[#16221B]"
          >
            {t.finder.inputLabel}
          </label>
          <textarea
            id="farmer-query-input"
            rows={3}
            value={queryText}
            onChange={(e) => onQueryTextChange(e.target.value)}
            placeholder={t.finder.inputPlaceholder}
            className="w-full rounded-xl border border-[#D4DDD1] bg-[#FAFBF9] px-4 py-3 text-sm sm:text-base text-[#16221B] placeholder:text-[#7B8B80] focus:bg-white focus:border-[#15613E] focus:outline-none focus:ring-2 focus:ring-[#15613E]/20 transition-all"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-[#5A6B60]">{t.finder.unitHint}</p>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => void toggleRecording()}
                disabled={isTranscribing || isParsing}
                className={`inline-flex items-center justify-center gap-2 px-4 min-h-[46px] rounded-xl text-sm font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15613E] ${
                  isRecording
                    ? 'bg-red-700 text-white hover:bg-red-800'
                    : 'bg-[#F1F4EE] text-[#16221B] hover:bg-[#E4EAE0]'
                }`}
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.finder.transcribing}
                  </>
                ) : isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    {t.finder.stopRecording}
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-[#15613E]" />
                    {t.finder.recordVoice}
                  </>
                )}
              </button>

              {(queryText || profile) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 min-h-[46px] rounded-xl border border-[#D4DDD1] text-sm font-medium text-[#4A5B50] hover:text-[#16221B] hover:bg-[#F7F8F5] whitespace-nowrap transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  {t.finder.clearButton}
                </button>
              )}

              <button
                type="submit"
                disabled={isParsing || isTranscribing || !queryText.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 min-h-[46px] rounded-xl bg-[#15613E] text-white text-sm font-semibold hover:bg-[#0E4A2F] disabled:opacity-50 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15613E]"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.finder.analyzing}
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    {t.finder.analyzeButton}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Zero-PII Redaction Alert */}
        {piiBanner && (
          <div className="p-3.5 rounded-xl bg-[#EDF5F0] border border-[#C6DEC9] flex items-start gap-2.5 text-xs sm:text-sm text-[#124D32]">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{t.zeroPii.redactedAlert}</p>
          </div>
        )}

        {/* API / Mic Error Notice */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs sm:text-sm text-amber-900">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMsg}</p>
          </div>
        )}
      </section>

      {/* Parsed Structured Zero-PII Profile Summary */}
      {profile && (
        <section
          ref={resultsRef}
          className="bg-white border border-[#E2E7DF] rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EDF1EA]">
            <h2 className="font-display text-lg font-bold text-[#16221B]">
              {t.finder.parsedHeading}
            </h2>
            <span className="text-xs font-medium text-[#15613E]">
              {t.zeroPii.badgeTitle}
            </span>
          </div>

          {profile.summaryInLanguage && (
            <p className="text-sm text-[#314238] leading-relaxed">
              {profile.summaryInLanguage}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-1">
            <div>
              <span className="block text-xs text-[#5A6B60]">{t.finder.landLabel}</span>
              <span className="block text-sm font-mono font-semibold text-[#16221B] tabular-nums mt-0.5">
                {profile.landAreaAcres !== null
                  ? `${profile.landAreaAcres} ac / ${profile.landAreaHectares} ha`
                  : t.finder.notSpecified}
              </span>
              {profile.landAreaRaw && profile.landAreaRaw !== 'Not specified' && (
                <span className="block text-xs text-[#5A6B60] truncate">
                  {profile.landAreaRaw}
                </span>
              )}
            </div>

            <div>
              <span className="block text-xs text-[#5A6B60]">{t.finder.incomeLabel}</span>
              <span className="block text-sm font-mono font-semibold text-[#16221B] tabular-nums mt-0.5">
                {profile.annualIncomeINR !== null
                  ? formatINR(profile.annualIncomeINR)
                  : t.finder.notSpecified}
              </span>
            </div>

            <div>
              <span className="block text-xs text-[#5A6B60]">{t.finder.stateLabel}</span>
              <span className="block text-sm font-semibold text-[#16221B] mt-0.5">
                {profile.state || t.finder.notSpecified}
              </span>
            </div>

            <div>
              <span className="block text-xs text-[#5A6B60]">{t.finder.genderLabel}</span>
              <span className="block text-sm font-semibold text-[#16221B] mt-0.5">
                {t.finder.genderValues[profile.gender]}
              </span>
            </div>

            <div>
              <span className="block text-xs text-[#5A6B60]">{t.finder.categoryLabel}</span>
              <span className="block text-sm font-semibold text-[#16221B] mt-0.5">
                {t.finder.farmerCategories[profile.farmerCategory]}
              </span>
            </div>

            <div>
              <span className="block text-xs text-[#5A6B60]">{t.finder.needsLabel}</span>
              <span className="block text-sm font-semibold text-[#16221B] mt-0.5">
                {profile.needs.length > 0
                  ? profile.needs.map((n) => t.finder.categories[n] || n).join(', ')
                  : t.finder.notSpecified}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Matched Scheme Cards */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#16221B]">
            {profile ? t.finder.resultsHeading : t.finder.allSchemesHeading}
          </h2>
          <p className="text-xs sm:text-sm font-mono text-[#4A5B50] tabular-nums">
            {matchResults.length} {t.finder.matchedCountLabel}
          </p>
        </div>

        {matchResults.length === 0 ? (
          <div className="bg-white border border-[#E2E7DF] rounded-2xl p-8 text-center space-y-2">
            <h3 className="font-display text-lg font-semibold text-[#16221B]">
              {t.finder.noMatchesTitle}
            </h3>
            <p className="text-sm text-[#4A5B50] max-w-md mx-auto">
              {t.finder.noMatchesBody}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {matchResults.map(({ scheme, rules, priorityNote }) => {
              const title = getSchemeTitle(scheme, language);
              const benefit = getSchemeBenefit(scheme, language);
              const summary = getSchemeSummary(scheme, language);

              return (
                <article
                  key={scheme.id}
                  className="bg-white border border-[#E2E7DF] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-4">
                    {/* Clean Unboxed Metadata Header (Zero-Pill Rule) */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#4A5B50]">
                        <span className="font-semibold text-[#15613E]">
                          {t.framing.likelyEligible}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{t.finder.govLevel[scheme.governmentLevel]}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {t.framing.lastVerified}: {scheme.lastVerified}
                        </span>
                      </div>

                      <h3 className="font-display text-lg sm:text-xl font-bold text-[#16221B] leading-snug">
                        {title}
                      </h3>

                      {priorityNote && (
                        <p className="text-xs font-semibold text-amber-800">
                          {priorityNote[language]}
                        </p>
                      )}
                    </div>

                    {/* Benefit & Summary */}
                    <div className="space-y-2">
                      <p className="text-sm sm:text-[15px] font-semibold text-[#124D32] leading-relaxed">
                        {benefit}
                      </p>
                      <p className="text-sm text-[#4A5B50] leading-relaxed">{summary}</p>
                    </div>

                    {/* Transparent Matched Eligibility Rules */}
                    <div className="pt-3 border-t border-[#EDF1EA] space-y-2">
                      <p className="text-xs font-semibold text-[#4A5B50]">
                        {t.finder.whyLikelyTitle}
                      </p>
                      <ul className="space-y-1.5">
                        {rules.map((rule) => (
                          <li
                            key={rule.id}
                            className="flex items-start gap-2 text-xs sm:text-[13px] text-[#2B3D32] leading-snug"
                          >
                            {rule.status === 'verify_on_portal' ? (
                              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            ) : (
                              <Check className="w-4 h-4 text-[#15613E] shrink-0 mt-0.5" />
                            )}
                            <span>{getRuleLabel(rule, language)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Verifier + Helpline Metadata Line */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5A6B60]">
                      <span>
                        {t.framing.verifiedBy}: {scheme.verifiedBy}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {t.framing.helpline}: {scheme.helpline}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Bar */}
                  <div className="pt-4 border-t border-[#EDF1EA] flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => onOpenChecklist(scheme)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] rounded-xl bg-[#F1F4EE] text-[#16221B] text-xs sm:text-sm font-semibold hover:bg-[#E4EAE0] whitespace-nowrap transition-colors"
                    >
                      <ClipboardList className="w-4 h-4 text-[#15613E]" />
                      {t.finder.checklistBtn}
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenGuide(scheme)}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 min-h-[44px] rounded-xl bg-white border border-[#D4DDD1] text-[#16221B] text-xs sm:text-sm font-semibold hover:bg-[#F7F8F5] whitespace-nowrap transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-[#15613E]" />
                      {t.finder.guideBtn}
                    </button>

                    <a
                      href={scheme.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[44px] rounded-xl bg-[#15613E] text-white text-xs sm:text-sm font-semibold hover:bg-[#0E4A2F] whitespace-nowrap transition-colors ml-auto"
                    >
                      {t.finder.visitPortalBtn}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Strict "Likely Eligible" Footer Banner */}
        <div className="p-4 rounded-xl bg-[#F4F7F3] border border-[#DDE5DA] flex items-start gap-3 text-xs sm:text-sm text-[#3A4B40]">
          <SquareCheck className="w-4 h-4 text-[#15613E] shrink-0 mt-0.5" />
          <p className="leading-relaxed">{t.framing.disclaimer}</p>
        </div>
      </section>
    </div>
  );
};
