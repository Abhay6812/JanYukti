import React, { useState } from 'react';
import {
  CheckSquare,
  Download,
  ExternalLink,
  Printer,
  Share2,
  ShieldCheck,
  Square,
  X,
} from 'lucide-react';
import { Language, Scheme } from '../types';
import { TranslationPack } from '../data/translations';
import {
  getSchemeBenefit,
  getSchemeDocuments,
  getSchemeTitle,
} from '../utils/eligibilityEngine';
import { JanYuktiLogo } from './JanYuktiLogo';

interface ChecklistModalProps {
  scheme: Scheme | null;
  language: Language;
  t: TranslationPack;
  onClose: () => void;
}

export const ChecklistModal: React.FC<ChecklistModalProps> = ({
  scheme,
  language,
  t,
  onClose,
}) => {
  const [checkedIndices, setCheckedIndices] = useState<Record<number, boolean>>({});
  const [shareFeedback, setShareFeedback] = useState<string>('');

  if (!scheme) return null;

  const title = getSchemeTitle(scheme, language);
  const benefit = getSchemeBenefit(scheme, language);
  const docs = getSchemeDocuments(scheme, language);
  const checkedCount = Object.values(checkedIndices).filter(Boolean).length;

  const toggleDoc = (idx: number) => {
    setCheckedIndices((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const buildPlainTextChecklist = () => {
    const lines = [
      `${t.brandName} — ${t.checklist.title}`,
      `========================================`,
      `${title}`,
      `${t.framing.likelyEligible} (${t.framing.verifyOnPortal})`,
      `${benefit}`,
      ``,
      `${t.framing.lastVerified}: ${scheme.lastVerified} | ${scheme.verifiedBy}`,
      `${t.framing.officialPortal}: ${scheme.officialUrl}`,
      `${t.framing.helpline}: ${scheme.helpline}`,
      ``,
      `${t.checklist.title}:`,
      ...docs.map((docItem, idx) => `${checkedIndices[idx] ? '[x]' : '[ ]'} ${idx + 1}. ${docItem}`),
      ``,
      `Zero-PII Notice: ${t.zeroPii.checklistNotice}`,
      `${t.framing.disclaimer}`,
    ];
    return lines.join('\n');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = buildPlainTextChecklist();
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `janyukti-checklist-${scheme.slug}-${language}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = buildPlainTextChecklist();
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${title} — ${t.checklist.title}`,
          text,
        });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareFeedback(t.checklist.copiedMsg);
      setTimeout(() => setShareFeedback(''), 2500);
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setShareFeedback(t.checklist.copiedMsg);
        setTimeout(() => setShareFeedback(''), 2500);
      } catch {
        setShareFeedback(t.checklist.copiedMsg);
        setTimeout(() => setShareFeedback(''), 2500);
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checklist-modal-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      <div
        id="janyukti-printable-checklist"
        className="w-full sm:max-w-xl bg-white rounded-t-3xl sm:rounded-2xl border border-[#E2E7DF] max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Drag handle on mobile */}
        <div className="sm:hidden w-10 h-1.5 bg-[#D4DDD1] rounded-full mx-auto mt-3 no-print" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E2E7DF] flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <JanYuktiLogo className="w-8 h-8 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#15613E] mb-1">
                {t.brandName} · {t.framing.likelyEligible} · {t.framing.lastVerified} {scheme.lastVerified}
              </p>
              <h2
                id="checklist-modal-title"
                className="font-display text-xl font-bold text-[#16221B] leading-snug"
              >
                {t.checklist.title}
              </h2>
              <p className="text-sm text-[#4A5B50] mt-1">{title}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.checklist.closeBtn}
            className="no-print min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#4A5B50] hover:bg-[#F1F4EE] hover:text-[#16221B] transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div className="flex items-center justify-between text-xs text-[#4A5B50]">
            <span>{t.checklist.subtitle}</span>
            <span className="font-mono font-semibold text-[#15613E] tabular-nums shrink-0 ml-3">
              {checkedCount}/{docs.length} {t.checklist.checkedProgress}
            </span>
          </div>

          <ul className="divide-y divide-[#EDF1EA] border border-[#E2E7DF] rounded-xl overflow-hidden">
            {docs.map((item, idx) => {
              const checked = Boolean(checkedIndices[idx]);
              return (
                <li key={idx}>
                  <button
                    type="button"
                    onClick={() => toggleDoc(idx)}
                    className={`w-full text-left px-4 py-3.5 min-h-[52px] flex items-start gap-3 transition-colors ${
                      checked ? 'bg-[#F3F8F4]' : 'bg-white hover:bg-[#F7F8F5]'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-5 h-5 text-[#15613E] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-5 h-5 text-[#8A9A8F] shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-sm leading-relaxed ${
                        checked ? 'text-[#4A5B50] line-through' : 'text-[#16221B] font-medium'
                      }`}
                    >
                      {item}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Zero-PII & Official Portal Notice */}
          <div className="p-4 rounded-xl bg-[#F4F7F3] border border-[#DDE5DA] space-y-2">
            <div className="flex items-start gap-2.5 text-xs text-[#16221B]">
              <ShieldCheck className="w-4 h-4 text-[#15613E] shrink-0 mt-0.5" />
              <p className="leading-relaxed">{t.zeroPii.checklistNotice}</p>
            </div>
            <div className="pt-2 border-t border-[#E2E7DF] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[#4A5B50]">{t.checklist.portalNote}</span>
              <a
                href={scheme.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono font-medium text-[#15613E] hover:underline break-all"
              >
                {scheme.officialUrl}
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {shareFeedback && (
            <p className="text-xs font-medium text-[#15613E] text-center no-print">
              {shareFeedback}
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="no-print px-6 py-4 border-t border-[#E2E7DF] bg-[#FAFBF9] flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-[#15613E] text-white text-sm font-medium hover:bg-[#0E4A2F] transition-colors whitespace-nowrap"
            >
              <Printer className="w-4 h-4" />
              {t.checklist.printBtn}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-white border border-[#D4DDD1] text-[#16221B] text-sm font-medium hover:bg-[#F1F4EE] transition-colors whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              {t.checklist.downloadBtn}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-white border border-[#D4DDD1] text-[#16221B] text-sm font-medium hover:bg-[#F1F4EE] transition-colors whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" />
              {t.checklist.shareBtn}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 min-h-[44px] text-sm font-medium text-[#4A5B50] hover:text-[#16221B] transition-colors whitespace-nowrap"
          >
            {t.checklist.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
