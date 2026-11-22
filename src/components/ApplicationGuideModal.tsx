import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertCircle,
  ExternalLink,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  ApplicationGuideResponse,
  FarmerProfile,
  Language,
  Scheme,
} from '../types';
import { TranslationPack } from '../data/translations';
import { getSchemeTitle } from '../utils/eligibilityEngine';

interface ApplicationGuideModalProps {
  scheme: Scheme | null;
  profile: FarmerProfile | null;
  language: Language;
  t: TranslationPack;
  onClose: () => void;
}

export const ApplicationGuideModal: React.FC<ApplicationGuideModalProps> = ({
  scheme,
  profile,
  language,
  t,
  onClose,
}) => {
  const [guide, setGuide] = useState<ApplicationGuideResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchGuide = useCallback(async () => {
    if (!scheme) return;
    setLoading(true);
    setError('');
    setGuide(null);
    try {
      const res = await fetch('/api/application-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheme: {
            titleEn: scheme.titleEn,
            titleHi: scheme.titleHi,
            titleMr: scheme.titleMr,
            officialUrl: scheme.officialUrl,
            benefitEn: scheme.benefitEn,
            helpline: scheme.helpline,
            documentsEn: scheme.documentsEn,
          },
          profile: profile
            ? {
                state: profile.state,
                landAreaHectares: profile.landAreaHectares,
                gender: profile.gender,
                farmerCategory: profile.farmerCategory,
              }
            : null,
          language,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not generate application guide.');
      }
      setGuide(data.guide);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI guide.');
    } finally {
      setLoading(false);
    }
  }, [scheme, profile, language]);

  useEffect(() => {
    if (scheme) {
      void fetchGuide();
    }
  }, [scheme, fetchGuide]);

  if (!scheme) return null;

  const title = getSchemeTitle(scheme, language);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="guide-modal-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl border border-[#E2E7DF] max-h-[90vh] flex flex-col overflow-hidden">
        <div className="sm:hidden w-10 h-1.5 bg-[#D4DDD1] rounded-full mx-auto mt-3" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E2E7DF] flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#15613E] mb-1">
              {t.framing.likelyEligible} · {t.framing.lastVerified} {scheme.lastVerified}
            </p>
            <h2
              id="guide-modal-title"
              className="font-display text-xl font-bold text-[#16221B] leading-snug"
            >
              {t.guide.title}
            </h2>
            <p className="text-sm text-[#4A5B50] mt-1">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.guide.closeBtn}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#4A5B50] hover:bg-[#F1F4EE] hover:text-[#16221B] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
              <Loader2 className="w-7 h-7 text-[#15613E] animate-spin" />
              <p className="text-sm font-medium text-[#4A5B50]">{t.guide.loading}</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
              <div className="flex items-start gap-2.5 text-amber-900 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
              <button
                type="button"
                onClick={() => void fetchGuide()}
                className="px-4 min-h-[44px] rounded-xl bg-[#15613E] text-white text-sm font-medium hover:bg-[#0E4A2F] transition-colors"
              >
                {t.guide.retryBtn}
              </button>
            </div>
          )}

          {!loading && guide && (
            <>
              <div className="p-4 rounded-xl bg-[#F4F7F3] border border-[#DDE5DA] space-y-2">
                <p className="text-sm font-semibold text-[#16221B]">{guide.headline}</p>
                <p className="text-xs text-[#4A5B50] leading-relaxed">
                  {guide.likelyEligibleNote}
                </p>
                <div className="pt-2 border-t border-[#E2E7DF] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#5A6B60] block">{t.guide.whereLabel}</span>
                    <span className="font-medium text-[#16221B]">{guide.whereToApply}</span>
                  </div>
                  <div>
                    <span className="text-[#5A6B60] block">{t.guide.timelineLabel}</span>
                    <span className="font-medium text-[#16221B]">{guide.estimatedTimeline}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-[#16221B] mb-3">
                  {t.guide.stepsHeading}
                </h3>
                <ol className="space-y-3">
                  {guide.steps.map((step) => (
                    <li
                      key={step.stepNumber}
                      className="flex items-start gap-3.5 p-3.5 rounded-xl border border-[#E2E7DF] bg-white"
                    >
                      <span className="w-7 h-7 rounded-lg bg-[#15613E] text-white text-xs font-mono font-semibold flex items-center justify-center shrink-0 tabular-nums">
                        {step.stepNumber}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#16221B]">{step.title}</p>
                        <p className="text-sm text-[#4A5B50] leading-relaxed mt-0.5">
                          {step.detail}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-[#F4F7F3] border border-[#DDE5DA] flex items-start gap-2.5 text-xs text-[#16221B]">
                  <ShieldCheck className="w-4 h-4 text-[#15613E] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{guide.zeroPiiReminder}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">{t.guide.fraudHeading}</span>
                    <p className="leading-relaxed">{guide.fraudPreventionTip}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E7DF] bg-[#FAFBF9] flex flex-wrap items-center justify-between gap-3">
          <a
            href={scheme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-[#15613E] text-white text-sm font-medium hover:bg-[#0E4A2F] transition-colors whitespace-nowrap"
          >
            {t.guide.openPortalBtn}
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="px-4 min-h-[44px] text-sm font-medium text-[#4A5B50] hover:text-[#16221B] transition-colors"
          >
            {t.guide.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
