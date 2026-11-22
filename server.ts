import 'dotenv/config';
import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Zero-PII server-side redaction before sending any farmer text to Gemini
function redactPII(input: string): { cleaned: string; redacted: boolean } {
  let redacted = false;
  let cleaned = input;

  // Redact 12-digit Aadhaar-like sequences (with optional spaces or hyphens)
  const aadhaarPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  if (aadhaarPattern.test(cleaned)) {
    redacted = true;
    cleaned = cleaned.replace(aadhaarPattern, '[REDACTED-ID]');
  }

  // Redact 10-digit Indian mobile numbers (with optional +91 / 0 prefix)
  const phonePattern = /(?:\+91[\s-]?|0)?\b[6-9]\d{9}\b/g;
  if (phonePattern.test(cleaned)) {
    redacted = true;
    cleaned = cleaned.replace(phonePattern, '[REDACTED-PHONE]');
  }

  // Redact IFSC codes (e.g., SBIN0001234)
  const ifscPattern = /\b[A-Z]{4}0[A-Z0-9]{6}\b/gi;
  if (ifscPattern.test(cleaned)) {
    redacted = true;
    cleaned = cleaned.replace(ifscPattern, '[REDACTED-BANK]');
  }

  return { cleaned, redacted };
}

function languageLabel(lang: string): string {
  if (lang === 'hi') return 'Hindi (हिंदी, Devanagari script)';
  if (lang === 'mr') return 'Marathi (मराठी, Devanagari script)';
  return 'English';
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'janyukti-farmer-benefits' });
  });

  // 1. Transcribe recorded browser audio via gemini-3.5-transcribe
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType, language } = req.body as {
        audioBase64?: string;
        mimeType?: string;
        language?: string;
      };

      if (!audioBase64 || typeof audioBase64 !== 'string') {
        res.status(400).json({ error: 'Missing audioBase64 payload.' });
        return;
      }

      const safeMime =
        typeof mimeType === 'string' && mimeType.startsWith('audio/')
          ? mimeType.split(';')[0]
          : 'audio/webm';

      const ai = getGeminiClient();
      const langHint = languageLabel(language || 'en');

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: safeMime,
                data: audioBase64,
              },
            },
            {
              text: `Transcribe this Indian farmer's voice note accurately. Preserve regional agricultural terms and land units (acres, hectare, guntha, bigha, drip irrigation, power tiller, crop insurance). Preferred script if spoken in that language: ${langHint}. Return ONLY the plain transcript text without commentary.`,
            },
          ],
        },
      });

      const rawTranscript = (response.text ?? '').trim();
      const { cleaned, redacted } = redactPII(rawTranscript);

      res.json({
        transcript: cleaned,
        piiRedacted: redacted,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Audio transcription failed.';
      console.error('[/api/transcribe] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  // 2. Structured Farmer Profile Parsing via gemini-4-hydrogen
  app.post('/api/parse-profile', async (req, res) => {
    try {
      const { text, language } = req.body as { text?: string; language?: string };

      if (!text || typeof text !== 'string' || text.trim().length < 2) {
        res.status(400).json({ error: 'Please describe your farm details or needs.' });
        return;
      }

      const { cleaned, redacted } = redactPII(text.trim().slice(0, 1500));
      const ai = getGeminiClient();
      const targetLang = languageLabel(language || 'en');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Parse the following Indian farmer description into a Zero-PII structured eligibility profile. NEVER extract or output any personal name, Aadhaar number, phone number, or bank details.\n\nFarmer input:\n"${cleaned}"`,
        config: {
          systemInstruction: `You are an Indian agricultural policy eligibility parser for JanYukti (Zero-PII Farmer Benefits Finder).
Convert Indian regional land area units accurately:
- 1 hectare = 2.47105 acres
- 40 guntha = 1 acre (1 guntha = 0.025 acres = 0.010117 hectares)
- 1 bigha ≈ 0.619 acres (0.2505 hectares) standard reference unless state-specific
- Farmer categories by Indian Ministry of Agriculture: marginal (<= 1.0 ha), small (> 1.0 and <= 2.0 ha), medium (> 2.0 and <= 10.0 ha), large (> 10.0 ha).
Normalize state names to standard English Indian state names (e.g., "Maharashtra", "Uttar Pradesh", "Madhya Pradesh", "Karnataka", "Gujarat", "Punjab", "Rajasthan", "Bihar", "Tamil Nadu", "Andhra Pradesh", "Telangana", "West Bengal", "Odisha", "Haryana"). If a district like Nashik, Pune, Satara, Nagpur, Kolhapur, Vidarbha, Marathwada is mentioned, set state to "Maharashtra".
Map needs strictly to one or more of these enum values:
["income_support", "irrigation", "crop_insurance", "equipment_subsidy", "solar_pump", "credit_loan", "organic_farming", "soil_health"].
Write summaryInLanguage in ${targetLang}, strictly framing results as preliminary and "Likely Eligible" (never guarantee payouts).`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              landAreaRaw: {
                type: Type.STRING,
                description: 'Original land area phrase mentioned by the farmer, e.g., "1.5 acres (60 guntha)" or "Not specified".',
              },
              landUnit: {
                type: Type.STRING,
                description: 'One of: acre, hectare, guntha, bigha, unknown',
              },
              landAreaAcres: {
                type: Type.NUMBER,
                description: 'Normalized land area in acres. Use -1 if not mentioned.',
              },
              landAreaHectares: {
                type: Type.NUMBER,
                description: 'Normalized land area in hectares. Use -1 if not mentioned.',
              },
              annualIncomeINR: {
                type: Type.NUMBER,
                description: 'Annual household income in INR. Use -1 if not mentioned.',
              },
              state: {
                type: Type.STRING,
                description: 'Normalized Indian state name in English, or "All India" if unspecified.',
              },
              gender: {
                type: Type.STRING,
                description: 'One of: female, male, other, unspecified',
              },
              farmerCategory: {
                type: Type.STRING,
                description: 'One of: marginal, small, medium, large, unspecified',
              },
              needs: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Normalized benefit need tags from allowed set.',
              },
              cropOrContext: {
                type: Type.STRING,
                description: 'Brief crop or farming context (e.g., rainfed crops, sugarcane, horticulture), max 60 chars, zero PII.',
              },
              summaryInLanguage: {
                type: Type.STRING,
                description: '2-sentence Zero-PII summary in the requested UI language.',
              },
            },
            required: [
              'landAreaRaw',
              'landUnit',
              'landAreaAcres',
              'landAreaHectares',
              'annualIncomeINR',
              'state',
              'gender',
              'farmerCategory',
              'needs',
              'cropOrContext',
              'summaryInLanguage',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());

      // Normalize sentinel -1 values to null and double-check unit conversions deterministically
      let landAreaAcres: number | null =
        typeof parsed.landAreaAcres === 'number' && parsed.landAreaAcres >= 0
          ? Number(parsed.landAreaAcres.toFixed(2))
          : null;
      let landAreaHectares: number | null =
        typeof parsed.landAreaHectares === 'number' && parsed.landAreaHectares >= 0
          ? Number(parsed.landAreaHectares.toFixed(2))
          : null;

      if (landAreaAcres !== null && landAreaHectares === null) {
        landAreaHectares = Number((landAreaAcres / 2.47105).toFixed(2));
      } else if (landAreaHectares !== null && landAreaAcres === null) {
        landAreaAcres = Number((landAreaHectares * 2.47105).toFixed(2));
      }

      const annualIncomeINR: number | null =
        typeof parsed.annualIncomeINR === 'number' && parsed.annualIncomeINR >= 0
          ? Math.round(parsed.annualIncomeINR)
          : null;

      const allowedNeeds = new Set([
        'income_support',
        'irrigation',
        'crop_insurance',
        'equipment_subsidy',
        'solar_pump',
        'credit_loan',
        'organic_farming',
        'soil_health',
      ]);
      const needs: string[] = Array.isArray(parsed.needs)
        ? parsed.needs.filter((n: unknown) => typeof n === 'string' && allowedNeeds.has(n))
        : [];

      let farmerCategory = parsed.farmerCategory || 'unspecified';
      if (landAreaHectares !== null) {
        if (landAreaHectares <= 1.0) farmerCategory = 'marginal';
        else if (landAreaHectares <= 2.0) farmerCategory = 'small';
        else if (landAreaHectares <= 10.0) farmerCategory = 'medium';
        else farmerCategory = 'large';
      }

      res.json({
        profile: {
          landAreaRaw: parsed.landAreaRaw || 'Not specified',
          landUnit: parsed.landUnit || 'unknown',
          landAreaAcres,
          landAreaHectares,
          annualIncomeINR,
          state: parsed.state || 'All India',
          gender: ['female', 'male', 'other'].includes(parsed.gender) ? parsed.gender : 'unspecified',
          farmerCategory,
          needs,
          cropOrContext: parsed.cropOrContext || '',
          summaryInLanguage: parsed.summaryInLanguage || '',
          piiRedacted: redacted,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse farmer profile.';
      console.error('[/api/parse-profile] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  // 3. AI Step-by-Step Application Guide via gemini-4-hydrogen
  app.post('/api/application-guide', async (req, res) => {
    try {
      const { scheme, profile, language } = req.body as {
        scheme?: {
          titleEn: string;
          titleHi: string;
          titleMr: string;
          officialUrl: string;
          benefitEn: string;
          helpline: string;
          documentsEn: string[];
        };
        profile?: {
          state?: string;
          landAreaHectares?: number | null;
          gender?: string;
          farmerCategory?: string;
        } | null;
        language?: string;
      };

      if (!scheme || !scheme.titleEn || !scheme.officialUrl) {
        res.status(400).json({ error: 'Invalid scheme details provided.' });
        return;
      }

      const ai = getGeminiClient();
      const targetLang = languageLabel(language || 'en');

      const farmerContext = profile
        ? `State: ${profile.state || 'India'}, Land: ${
            profile.landAreaHectares != null ? `${profile.landAreaHectares} hectares` : 'unspecified'
          }, Category: ${profile.farmerCategory || 'unspecified'}, Gender: ${profile.gender || 'unspecified'}`
        : 'General Indian farmer seeking guidance';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Create a clear, practical, step-by-step application guide in ${targetLang} for this agricultural welfare scheme:
Scheme: ${scheme.titleEn} (${scheme.titleHi} / ${scheme.titleMr})
Official Portal: ${scheme.officialUrl}
Benefit: ${scheme.benefitEn}
Helpline: ${scheme.helpline}
Required Documents: ${(scheme.documentsEn || []).join(', ')}
Farmer Profile (Zero-PII): ${farmerContext}

Rules:
- Strictly frame eligibility as "Likely Eligible" — NEVER guarantee approval or payouts.
- NEVER ask the user to enter Aadhaar, mobile, or bank details inside JanYukti; explain that official verification happens ONLY on the government portal (${scheme.officialUrl}) or at an authorized CSC / Maha e-Seva Kendra / Talathi / Krishi Sahayak desk.
- Provide 5 concise, actionable steps in simple everyday ${targetLang}.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              likelyEligibleNote: { type: Type.STRING },
              estimatedTimeline: { type: Type.STRING },
              whereToApply: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    stepNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    detail: { type: Type.STRING },
                  },
                  required: ['stepNumber', 'title', 'detail'],
                },
              },
              zeroPiiReminder: { type: Type.STRING },
              fraudPreventionTip: { type: Type.STRING },
            },
            required: [
              'headline',
              'likelyEligibleNote',
              'estimatedTimeline',
              'whereToApply',
              'steps',
              'zeroPiiReminder',
              'fraudPreventionTip',
            ],
          },
        },
      });

      const guide = JSON.parse((response.text ?? '{}').trim());
      res.json({ guide });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate application guide.';
      console.error('[/api/application-guide] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  // Frontend static / Vite middleware setup
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);

  // 4. WebSocket Server for JanYukti Live Voice (Gemini 3.8 Live API)
  const wss = new WebSocketServer({ server, path: '/api/live' });

  wss.on('connection', async (clientWs: WebSocket, req) => {
    const reqUrl = new URL(req.url || '/api/live', `http://${req.headers.host || 'localhost'}`);
    const lang = reqUrl.searchParams.get('lang') || 'en';
    const langName = languageLabel(lang);

    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;
    let isClosed = false;

    const sendSafe = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    try {
      const ai = getGeminiClient();

      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
          systemInstruction: `You are JanYukti Sahayak, a warm, respectful agricultural welfare voice guide for Indian farmers.
Speak naturally and concisely in ${langName} (or immediately match the farmer's spoken language among English, Hindi, or Marathi).
CRITICAL RULES:
1. ZERO-PII: NEVER ask for Aadhaar number, phone number, bank account number, IFSC, or full name. Only ask non-personal eligibility details: state/district, land size (acres/hectare/guntha/bigha), approximate annual income, whether female farmer, and what agricultural support they need (irrigation, equipment subsidy, crop insurance, solar pump, income support, KCC loan).
2. LIKELY ELIGIBLE FRAMING: NEVER promise or guarantee government payouts. Always say "you are likely eligible subject to official department verification" and mention official portals like pmkisan.gov.in, mahadbt.maharashtra.gov.in, pmfby.gov.in, or pmkusum.mnre.gov.in.
3. Keep spoken answers crisp (2 to 4 short sentences) so farmers on mobile networks can follow easily.`,
        },
        callbacks: {
          onopen: () => {
            sendSafe({ type: 'ready' });
          },
          onmessage: (message: LiveServerMessage) => {
            const content = message.serverContent;

            if (content?.inputTranscription?.text) {
              sendSafe({
                type: 'input_transcript',
                text: content.inputTranscription.text,
              });
            }

            if (content?.outputTranscription?.text) {
              sendSafe({
                type: 'output_transcript',
                text: content.outputTranscription.text,
              });
            }

            for (const part of content?.modelTurn?.parts ?? []) {
              if (part.inlineData?.data) {
                sendSafe({
                  type: 'audio',
                  data: part.inlineData.data,
                });
              }
            }

            if (content?.interrupted) {
              sendSafe({ type: 'interrupted' });
            }

            if (content?.turnComplete) {
              sendSafe({ type: 'turn_complete' });
            }
          },
          onerror: (err: unknown) => {
            const msg = err instanceof Error ? err.message : 'Live session error';
            console.error('[/api/live] Gemini Live error:', msg);
            sendSafe({ type: 'error', message: msg });
          },
          onclose: () => {
            if (!isClosed) {
              sendSafe({ type: 'closed' });
            }
          },
        },
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Gemini Live.';
      console.error('[/api/live] Connection error:', msg);
      sendSafe({ type: 'error', message: msg });
      clientWs.close();
      return;
    }

    clientWs.on('message', (raw) => {
      if (!liveSession) return;
      try {
        const msg = JSON.parse(raw.toString()) as {
          type?: string;
          audio?: string;
          text?: string;
        };

        if (msg.type === 'audio' && msg.audio) {
          liveSession.sendRealtimeInput({
            audio: {
              data: msg.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (msg.type === 'text' && msg.text) {
          const { cleaned } = redactPII(msg.text.slice(0, 600));
          liveSession.sendRealtimeInput({
            text: cleaned,
          });
        }
      } catch (err) {
        console.error('[/api/live] Bad client message:', err);
      }
    });

    clientWs.on('close', () => {
      isClosed = true;
      try {
        liveSession?.close();
      } catch {
        // Ignore close errors
      }
    });
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`JanYukti server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start JanYukti server:', err);
  process.exit(1);
});
