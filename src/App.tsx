import { useEffect, useState } from 'react';
import { TRANSLATIONS } from './data/translations';
import { SEED_SCHEMES } from './data/seedSchemes';
import { subscribePublicSchemes } from './services/schemeService';
import { FarmerProfile, Language, Scheme, TabId } from './types';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { FindBenefitsTab } from './components/FindBenefitsTab';
import { LiveVoiceTab } from './components/LiveVoiceTab';
import { AdminPortalTab } from './components/AdminPortalTab';
import { FundingTab } from './components/FundingTab';
import { ChecklistModal } from './components/ChecklistModal';
import { ApplicationGuideModal } from './components/ApplicationGuideModal';
import { JanYuktiLogo } from './components/JanYuktiLogo';

function JanYuktiWorkspace() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<TabId>('find');
  const [liveSchemes, setLiveSchemes] = useState<Scheme[]>([]);

  // Shared Find Benefits state (also populated via 1-tap Live Voice bridge)
  const [queryText, setQueryText] = useState('');
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [autoParseTrigger, setAutoParseTrigger] = useState(0);

  // Modals
  const [checklistScheme, setChecklistScheme] = useState<Scheme | null>(null);
  const [guideScheme, setGuideScheme] = useState<Scheme | null>(null);

  const t = TRANSLATIONS[language];

  // Live subscription to active Firestore schemes; gracefully uses verified seed catalog when Firestore is empty
  useEffect(() => {
    const unsub = subscribePublicSchemes(
      (docs) => {
        setLiveSchemes(docs);
      },
      () => {
        // Fallback silently to verified catalog if offline
        setLiveSchemes([]);
      }
    );
    return () => unsub();
  }, []);

  const effectiveSchemes = liveSchemes.length > 0 ? liveSchemes : SEED_SCHEMES;

  const handleBridgeFromVoice = (extractedText: string) => {
    setQueryText(extractedText);
    setActiveTab('find');
    setAutoParseTrigger((n) => n + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#16221B] flex flex-col">
      <Header
        language={language}
        onLanguageChange={setLanguage}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        t={t}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12">
        {activeTab === 'find' && (
          <FindBenefitsTab
            language={language}
            t={t}
            schemes={effectiveSchemes}
            queryText={queryText}
            onQueryTextChange={setQueryText}
            profile={profile}
            onProfileParsed={setProfile}
            autoParseTrigger={autoParseTrigger}
            onOpenChecklist={(scheme) => setChecklistScheme(scheme)}
            onOpenGuide={(scheme) => setGuideScheme(scheme)}
          />
        )}

        {activeTab === 'voice' && (
          <LiveVoiceTab
            language={language}
            t={t}
            onBridgeToFinder={handleBridgeFromVoice}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortalTab language={language} t={t} />
        )}

        {activeTab === 'funding' && <FundingTab t={t} />}
      </main>

      <footer className="border-t border-[#E2E7DF] bg-white pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#5A6B60]">
          <div className="flex items-center gap-2.5">
            <JanYuktiLogo className="w-5 h-5 shrink-0" />
            <p>{t.footer.note}</p>
          </div>
          <p className="font-medium text-[#15613E] whitespace-nowrap">
            {t.footer.zeroPiiTag}
          </p>
        </div>
      </footer>

      <ChecklistModal
        scheme={checklistScheme}
        language={language}
        t={t}
        onClose={() => setChecklistScheme(null)}
      />

      <ApplicationGuideModal
        scheme={guideScheme}
        profile={profile}
        language={language}
        t={t}
        onClose={() => setGuideScheme(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <JanYuktiWorkspace />
    </ErrorBoundary>
  );
}
