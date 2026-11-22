import React from 'react';
import { Mic, Search, ShieldCheck, Landmark } from 'lucide-react';
import { Language, TabId } from '../types';
import { TranslationPack } from '../data/translations';
import { JanYuktiLogo } from './JanYuktiLogo';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  t: TranslationPack;
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
];

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  t,
}) => {
  const navItems: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'find', label: t.nav.find, icon: Search },
    { id: 'voice', label: t.nav.voice, icon: Mic },
    { id: 'admin', label: t.nav.admin, icon: ShieldCheck },
    { id: 'funding', label: t.nav.funding, icon: Landmark },
  ];

  return (
    <>
      {/* Desktop & Mobile Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="sticky top-0 z-30 h-14 md:h-16 bg-white/95 backdrop-blur-md border-b border-[#E2E7DF]">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 md:gap-8">
          {/* Zone 1: Brand Emblem + Wordmark */}
          <button
            type="button"
            onClick={() => onTabChange('find')}
            className="inline-flex items-center gap-2.5 font-display text-lg sm:text-xl font-bold tracking-tight text-[#15613E] whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15613E] rounded-lg px-1"
          >
            <JanYuktiLogo className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" />
            <span>{t.brandName}</span>
          </button>

          {/* Zone 2: 4 Clean Single-Line Navigation Links (Desktop) */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-7"
          >
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`relative py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15613E] rounded ${
                    isActive
                      ? 'text-[#15613E] font-semibold'
                      : 'text-[#4A5B50] hover:text-[#16221B]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute left-0 right-0 -bottom-[17px] h-0.5 bg-[#15613E]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 3-Language Live Segmented Toggle */}
          <div
            role="group"
            aria-label="Language switcher"
            className="flex items-center p-1 bg-[#F1F4EE] rounded-xl shrink-0"
          >
            {LANGUAGES.map((lang) => {
              const active = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onLanguageChange(lang.code)}
                  aria-pressed={active}
                  className={`px-2.5 sm:px-3 min-h-[36px] text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15613E] ${
                    active
                      ? 'bg-white text-[#15613E] shadow-xs'
                      : 'text-[#4A5B50] hover:text-[#16221B]'
                  }`}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Ergonomic Thumb Zone, <= 15% aggregate sticky height) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E7DF]"
      >
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center min-h-[44px] gap-1 px-1 transition-colors focus-visible:outline-none focus-visible:bg-[#F1F4EE] ${
                  isActive ? 'text-[#15613E]' : 'text-[#5A6B60]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                <span className="text-[11px] font-medium leading-none truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
