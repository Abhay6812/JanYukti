import React, { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { TranslationPack } from '../data/translations';

const FUNDING_IMAGE_PATH = '/src/assets/images/funding_rural_kvk_1795334732466.jpg';

interface FundingTabProps {
  t: TranslationPack;
}

export const FundingTab: React.FC<FundingTabProps> = ({ t }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="space-y-8">
      {/* Hero Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 bg-white border border-[#E2E7DF] rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-3">
            <p className="text-xs font-medium text-[#15613E]">{t.funding.kicker}</p>
            <h1 className="font-display text-2xl sm:text-4xl font-bold text-[#16221B] leading-[1.15] text-balance">
              {t.funding.headline}
            </h1>
            <p className="text-sm sm:text-base text-[#4A5B50] leading-relaxed">
              {t.funding.subheadline}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#EDF5F0] border border-[#C6DEC9] flex items-start gap-3.5">
            <span className="font-mono text-2xl sm:text-3xl font-bold text-[#15613E] tabular-nums shrink-0 leading-none pt-0.5">
              ₹0
            </span>
            <div>
              <p className="text-sm font-bold text-[#124D32]">{t.funding.zeroFeeTitle}</p>
              <p className="text-xs sm:text-sm text-[#2A4D3B] mt-0.5 leading-relaxed">
                {t.funding.zeroFeeBody}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-[#E2E7DF] min-h-[240px] lg:min-h-0 bg-[#1B3325]">
          {!imgError ? (
            <img
              src={FUNDING_IMAGE_PATH}
              alt="Krishi Vigyan Kendra agricultural extension officer inspecting drip irrigation with an Indian farmer"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover lg:h-full"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#15613E] to-[#0E3A26]" />
          )}
        </div>
      </section>

      {/* Funding Split Visual Bar + 3 Institutional Sources */}
      <section className="bg-white border border-[#E2E7DF] rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#16221B]">
            {t.funding.sourcesHeading}
          </h2>
          {/* Stacked Proportional Bar */}
          <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-[#EDF1EA]">
            <div className="bg-[#15613E] h-full" style={{ width: '55%' }} />
            <div className="bg-[#2F855A] h-full border-l border-white" style={{ width: '30%' }} />
            <div className="bg-[#74A98B] h-full border-l border-white" style={{ width: '15%' }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {t.funding.sources.map((src, idx) => (
            <article
              key={idx}
              className="p-5 rounded-xl border border-[#E2E7DF] bg-[#FAFBF9] flex flex-col justify-between gap-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono text-2xl font-bold text-[#15613E] tabular-nums">
                    {src.percent}%
                  </span>
                  <span className="text-xs text-[#5A6B60]">{src.fundingModel}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[#16221B] leading-snug">
                  {src.title}
                </h3>
                <p className="text-sm text-[#4A5B50] leading-relaxed">{src.description}</p>
              </div>

              <div className="pt-3 border-t border-[#E6ECE3] flex items-start gap-2 text-xs text-[#2B3D32]">
                <ShieldCheck className="w-4 h-4 text-[#15613E] shrink-0 mt-0.5" />
                <p className="leading-relaxed">{src.safeguard}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Unit Economics Table + Trust Charter */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E2E7DF] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#16221B]">
            {t.funding.economicsHeading}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-[#EDF1EA]">
                {t.funding.economicsRows.map((row, idx) => (
                  <tr key={idx}>
                    <td className="py-3.5 pr-4 text-sm font-medium text-[#16221B]">
                      {row.metric}
                      <span className="block text-xs font-normal text-[#5A6B60] mt-0.5">
                        {row.notes}
                      </span>
                    </td>
                    <td className="py-3.5 pl-4 text-right font-mono text-base font-bold text-[#15613E] tabular-nums whitespace-nowrap align-top">
                      {row.figure}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white border border-[#E2E7DF] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-xl font-bold text-[#16221B]">
            {t.funding.charterHeading}
          </h2>
          <ul className="space-y-3.5">
            {t.funding.charterPoints.map((point, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm text-[#2B3D32] leading-relaxed"
              >
                <Check className="w-4 h-4 text-[#15613E] shrink-0 mt-1" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
