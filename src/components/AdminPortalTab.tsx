import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  ExternalLink,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import {
  checkIsKvkAdmin,
  createSchemeInFirestore,
  deleteSchemeInFirestore,
  grantKvkAdminRole,
  markSchemeVerifiedToday,
  SchemeFormInput,
  seedInitialSchemesToFirestore,
  subscribeAdminSchemes,
  toggleSchemeActive,
  updateSchemeInFirestore,
} from '../services/schemeService';
import {
  BenefitCategory,
  GenderEligibility,
  GovernmentLevel,
  Language,
  Scheme,
} from '../types';
import { TranslationPack } from '../data/translations';
import { getSchemeTitle } from '../utils/eligibilityEngine';

interface AdminPortalTabProps {
  language: Language;
  t: TranslationPack;
}

const ALL_CATEGORIES: BenefitCategory[] = [
  'income_support',
  'irrigation',
  'crop_insurance',
  'equipment_subsidy',
  'solar_pump',
  'credit_loan',
  'organic_farming',
  'soil_health',
];

function emptyForm(): SchemeFormInput {
  return {
    slug: '',
    officialUrl: 'https://',
    lastVerified: new Date().toISOString().slice(0, 10),
    verifiedBy: 'KVK Pune Verification Desk',
    governmentLevel: 'state',
    states: ['Maharashtra'],
    categories: ['equipment_subsidy'],
    minLandHectares: 0.2,
    maxLandHectares: 0,
    maxIncomeINR: 0,
    genderEligibility: 'all',
    titleEn: '',
    titleHi: '',
    titleMr: '',
    benefitEn: '',
    benefitHi: '',
    benefitMr: '',
    summaryEn: '',
    summaryHi: '',
    summaryMr: '',
    documentsEn: ['7/12 Land Extract (Satbara)', '8-A Khata Extract'],
    documentsHi: ['7/12 भूमि अभिलेख', '8-A खाता अभिलेख'],
    documentsMr: ['७/१२ उतारा', '८-अ खाते उतारा'],
    helpline: '1800-180-1551',
    isActive: true,
  };
}

export const AdminPortalTab: React.FC<AdminPortalTabProps> = ({ language, t }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBootstrap, setIsBootstrap] = useState(false);

  const [firestoreSchemes, setFirestoreSchemes] = useState<Scheme[]>([]);
  const [loadingSchemes, setLoadingSchemes] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Editor modal state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SchemeFormInput>(emptyForm());
  const [statesText, setStatesText] = useState('Maharashtra');
  const [docsEnText, setDocsEnText] = useState('');
  const [docsHiText, setDocsHiText] = useState('');
  const [docsMrText, setDocsMrText] = useState('');
  const [saving, setSaving] = useState(false);

  // KVK officer delegation (bootstrap admin only)
  const [officerUid, setOfficerUid] = useState('');
  const [officerOrg, setOfficerOrg] = useState('');
  const [grantingRole, setGrantingRole] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        try {
          const role = await checkIsKvkAdmin();
          setIsAdmin(role.isAdmin);
          setIsBootstrap(role.isBootstrap);
        } catch (err) {
          setIsAdmin(false);
          setIsBootstrap(false);
          setErrorMessage(err instanceof Error ? err.message : 'Unable to verify admin role.');
        }
      } else {
        setIsAdmin(false);
        setIsBootstrap(false);
        setFirestoreSchemes([]);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;
    setLoadingSchemes(true);
    const unsub = subscribeAdminSchemes(
      isBootstrap,
      (items) => {
        setFirestoreSchemes(items);
        setLoadingSchemes(false);
      },
      (err) => {
        setErrorMessage(err.message);
        setLoadingSchemes(false);
      }
    );
    return () => unsub();
  }, [authReady, user, isBootstrap]);

  const handleSignIn = async () => {
    setErrorMessage('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Google Sign-In was cancelled or blocked.'
      );
    }
  };

  const handleSignOut = async () => {
    setErrorMessage('');
    setStatusMessage('');
    await signOut(auth);
  };

  const openNewEditor = () => {
    const fresh = emptyForm();
    setEditingId(null);
    setForm(fresh);
    setStatesText(fresh.states.join(', '));
    setDocsEnText(fresh.documentsEn.join('\n'));
    setDocsHiText(fresh.documentsHi.join('\n'));
    setDocsMrText(fresh.documentsMr.join('\n'));
    setErrorMessage('');
    setEditorOpen(true);
  };

  const openEditEditor = (scheme: Scheme) => {
    setEditingId(scheme.id);
    setForm({
      slug: scheme.slug,
      officialUrl: scheme.officialUrl,
      lastVerified: scheme.lastVerified,
      verifiedBy: scheme.verifiedBy,
      governmentLevel: scheme.governmentLevel,
      states: scheme.states,
      categories: scheme.categories,
      minLandHectares: scheme.minLandHectares,
      maxLandHectares: scheme.maxLandHectares,
      maxIncomeINR: scheme.maxIncomeINR,
      genderEligibility: scheme.genderEligibility,
      titleEn: scheme.titleEn,
      titleHi: scheme.titleHi,
      titleMr: scheme.titleMr,
      benefitEn: scheme.benefitEn,
      benefitHi: scheme.benefitHi,
      benefitMr: scheme.benefitMr,
      summaryEn: scheme.summaryEn,
      summaryHi: scheme.summaryHi,
      summaryMr: scheme.summaryMr,
      documentsEn: scheme.documentsEn,
      documentsHi: scheme.documentsHi,
      documentsMr: scheme.documentsMr,
      helpline: scheme.helpline,
      isActive: scheme.isActive,
    });
    setStatesText(scheme.states.join(', '));
    setDocsEnText(scheme.documentsEn.join('\n'));
    setDocsHiText(scheme.documentsHi.join('\n'));
    setDocsMrText(scheme.documentsMr.join('\n'));
    setErrorMessage('');
    setEditorOpen(true);
  };

  const toggleCategory = (cat: BenefitCategory) => {
    setForm((prev) => {
      const exists = prev.categories.includes(cat);
      if (exists && prev.categories.length === 1) return prev;
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== cat)
          : [...prev.categories, cat],
      };
    });
  };

  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    setStatusMessage('');

    const payload: SchemeFormInput = {
      ...form,
      states: statesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      documentsEn: docsEnText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      documentsHi: docsHiText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      documentsMr: docsMrText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (editingId) {
        await updateSchemeInFirestore(editingId, payload);
        setStatusMessage(`Updated "${payload.titleEn}" in Firestore.`);
      } else {
        await createSchemeInFirestore(payload);
        setStatusMessage(`Published "${payload.titleEn}" to Firestore.`);
      }
      setEditorOpen(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save scheme.');
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyToday = async (scheme: Scheme) => {
    setBusyId(scheme.id);
    setErrorMessage('');
    setStatusMessage('');
    try {
      await markSchemeVerifiedToday(
        scheme.id,
        user?.displayName ? `KVK Desk (${user.displayName})` : scheme.verifiedBy
      );
      setStatusMessage(t.admin.verifiedSuccess);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to verify scheme.');
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (scheme: Scheme) => {
    setBusyId(scheme.id);
    setErrorMessage('');
    try {
      await toggleSchemeActive(scheme.id, !scheme.isActive);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update visibility.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (scheme: Scheme) => {
    setBusyId(scheme.id);
    setErrorMessage('');
    try {
      await deleteSchemeInFirestore(scheme.id);
      setStatusMessage(`Removed "${scheme.titleEn}" from Firestore.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to delete scheme.');
    } finally {
      setBusyId(null);
    }
  };

  const handleSeedSchemes = async () => {
    setSeeding(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      const added = await seedInitialSchemesToFirestore();
      setStatusMessage(
        added > 0
          ? `Synced ${added} verified agricultural schemes to Firestore.`
          : 'All 8 verified schemes are already live in Firestore.'
      );
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to sync schemes.');
    } finally {
      setSeeding(false);
    }
  };

  const handleGrantOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrantingRole(true);
    setErrorMessage('');
    setStatusMessage('');
    try {
      await grantKvkAdminRole(officerUid, officerOrg);
      setOfficerUid('');
      setOfficerOrg('');
      setStatusMessage('Granted KVK Admin write permissions in Firestore.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to grant KVK access.');
    } finally {
      setGrantingRole(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-white border border-[#E2E7DF] rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium text-[#15613E]">{t.admin.kicker}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#16221B] leading-tight">
            {t.admin.headline}
          </h1>
          <p className="text-sm text-[#4A5B50] leading-relaxed">{t.admin.subheadline}</p>
        </div>

        <div className="shrink-0">
          {!authReady ? (
            <div className="inline-flex items-center gap-2 text-sm text-[#4A5B50]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Checking session...
            </div>
          ) : !user ? (
            <button
              type="button"
              onClick={() => void handleSignIn()}
              className="inline-flex items-center justify-center gap-2.5 px-5 min-h-[48px] rounded-xl bg-[#15613E] text-white text-sm font-semibold hover:bg-[#0E4A2F] transition-colors whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" />
              {t.admin.signInBtn}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-left sm:text-right">
                <p className="text-xs text-[#5A6B60]">{t.admin.signedInAs}</p>
                <p className="text-sm font-semibold text-[#16221B]">{user.email}</p>
                <p
                  className={`text-xs font-medium ${
                    isAdmin ? 'text-[#15613E]' : 'text-amber-800'
                  }`}
                >
                  {isAdmin ? t.admin.roleVerified : t.admin.roleReadOnly}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] rounded-xl border border-[#D4DDD1] text-sm font-medium text-[#16221B] hover:bg-[#F1F4EE] whitespace-nowrap transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {t.admin.signOutBtn}
              </button>
            </div>
          )}
        </div>
      </section>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-[#EDF5F0] border border-[#C6DEC9] flex items-start gap-2.5 text-sm text-[#124D32]">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <p>{statusMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-sm text-amber-950">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="break-words">{errorMessage}</p>
        </div>
      )}

      {/* Authenticated Admin Workspace */}
      {user && (
        <>
          {/* Action Toolbar */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-[#4A5B50]">
              <Database className="w-4 h-4 text-[#15613E]" />
              <span className="font-mono font-semibold text-[#16221B] tabular-nums">
                {firestoreSchemes.length}
              </span>
              <span>{t.admin.liveCountLabel}</span>
            </div>

            {isAdmin && (
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => void handleSeedSchemes()}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-white border border-[#D4DDD1] text-sm font-semibold text-[#16221B] hover:bg-[#F1F4EE] disabled:opacity-50 whitespace-nowrap transition-colors"
                >
                  {seeding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Database className="w-4 h-4 text-[#15613E]" />
                  )}
                  {seeding ? t.admin.seeding : t.admin.seedBtn}
                </button>

                <button
                  type="button"
                  onClick={openNewEditor}
                  className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-[#15613E] text-white text-sm font-semibold hover:bg-[#0E4A2F] whitespace-nowrap transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t.admin.addSchemeBtn}
                </button>
              </div>
            )}
          </section>

          {/* Schemes Live List */}
          <section className="bg-white border border-[#E2E7DF] rounded-2xl overflow-hidden">
            {loadingSchemes ? (
              <div className="p-10 flex items-center justify-center gap-2 text-sm text-[#4A5B50]">
                <Loader2 className="w-5 h-5 animate-spin text-[#15613E]" />
                Loading live Firestore schemes...
              </div>
            ) : firestoreSchemes.length === 0 ? (
              <div className="p-8 text-center space-y-4">
                <p className="text-sm text-[#4A5B50] max-w-xl mx-auto leading-relaxed">
                  {t.admin.emptyFirestoreNotice}
                </p>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => void handleSeedSchemes()}
                    disabled={seeding}
                    className="inline-flex items-center gap-2 px-5 min-h-[46px] rounded-xl bg-[#15613E] text-white text-sm font-semibold hover:bg-[#0E4A2F] transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    {seeding ? t.admin.seeding : t.admin.seedBtn}
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-[#EDF1EA]">
                {firestoreSchemes.map((scheme) => {
                  const busy = busyId === scheme.id;
                  return (
                    <div
                      key={scheme.id}
                      className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#5A6B60]">
                          <span
                            className={`font-semibold ${
                              scheme.isActive ? 'text-[#15613E]' : 'text-amber-800'
                            }`}
                          >
                            {scheme.isActive ? t.admin.activeLabel : t.admin.draftLabel}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {t.framing.lastVerified}: {scheme.lastVerified}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{scheme.verifiedBy}</span>
                        </div>

                        <h3 className="font-display text-base sm:text-lg font-bold text-[#16221B]">
                          {getSchemeTitle(scheme, language)}
                        </h3>

                        <a
                          href={scheme.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-mono text-[#15613E] hover:underline break-all"
                        >
                          {scheme.officialUrl}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>

                      {isAdmin && (
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleVerifyToday(scheme)}
                            className="inline-flex items-center gap-1.5 px-3 min-h-[42px] rounded-xl bg-[#EDF5F0] text-[#15613E] text-xs font-semibold hover:bg-[#DCECE2] disabled:opacity-50 whitespace-nowrap transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {t.admin.verifyTodayBtn}
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleToggleActive(scheme)}
                            className="px-3 min-h-[42px] rounded-xl border border-[#D4DDD1] text-xs font-semibold text-[#16221B] hover:bg-[#F7F8F5] disabled:opacity-50 whitespace-nowrap transition-colors"
                          >
                            {scheme.isActive ? t.admin.draftLabel : t.admin.activeLabel}
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => openEditEditor(scheme)}
                            className="inline-flex items-center gap-1.5 px-3 min-h-[42px] rounded-xl border border-[#D4DDD1] text-xs font-semibold text-[#16221B] hover:bg-[#F7F8F5] whitespace-nowrap transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            {t.admin.editBtn}
                          </button>

                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleDelete(scheme)}
                            aria-label={`${t.admin.deleteBtn} ${scheme.titleEn}`}
                            className="inline-flex items-center justify-center min-w-[42px] min-h-[42px] rounded-xl border border-[#E7D8D8] text-red-700 hover:bg-red-50 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* KVK Officer Role Delegation (Bootstrap Admin Only) */}
          {isBootstrap && (
            <section className="bg-white border border-[#E2E7DF] rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#15613E]" />
                <h2 className="font-display text-base font-bold text-[#16221B]">
                  {t.admin.officerPanelTitle}
                </h2>
              </div>
              <form
                onSubmit={(e) => void handleGrantOfficer(e)}
                className="grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                <input
                  type="text"
                  required
                  value={officerUid}
                  onChange={(e) => setOfficerUid(e.target.value)}
                  placeholder={t.admin.officerUidPlaceholder}
                  className="min-h-[44px] rounded-xl border border-[#D4DDD1] bg-[#FAFBF9] px-3.5 text-sm font-mono text-[#16221B] focus:bg-white focus:border-[#15613E] focus:outline-none"
                />
                <input
                  type="text"
                  required
                  value={officerOrg}
                  onChange={(e) => setOfficerOrg(e.target.value)}
                  placeholder={t.admin.officerOrgPlaceholder}
                  className="min-h-[44px] rounded-xl border border-[#D4DDD1] bg-[#FAFBF9] px-3.5 text-sm text-[#16221B] focus:bg-white focus:border-[#15613E] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={grantingRole}
                  className="min-h-[44px] rounded-xl bg-[#15613E] text-white text-sm font-semibold hover:bg-[#0E4A2F] disabled:opacity-50 transition-colors"
                >
                  {t.admin.grantAccessBtn}
                </button>
              </form>
            </section>
          )}
        </>
      )}

      {/* Scheme Add / Edit Modal */}
      {editorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          <form
            onSubmit={(e) => void handleSaveScheme(e)}
            className="w-full sm:max-w-3xl bg-white rounded-t-3xl sm:rounded-2xl border border-[#E2E7DF] max-h-[92vh] flex flex-col overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E2E7DF] flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#16221B]">
                {editingId ? t.admin.editSchemeTitle : t.admin.newSchemeTitle}
              </h2>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[#4A5B50] hover:bg-[#F1F4EE]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-sm">
              {/* Core Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Scheme Slug (lowercase-hyphen)
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingId)}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="mahadbt-polyhouse-grant"
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3 font-mono text-xs disabled:bg-[#F1F4EE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Official Government Portal (https://)
                  </label>
                  <input
                    type="url"
                    required
                    value={form.officialUrl}
                    onChange={(e) => setForm({ ...form, officialUrl: e.target.value })}
                    placeholder="https://mahadbt.maharashtra.gov.in"
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Last Verified (YYYY-MM-DD)
                  </label>
                  <input
                    type="date"
                    required
                    value={form.lastVerified}
                    onChange={(e) => setForm({ ...form, lastVerified: e.target.value })}
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Verified By (KVK / Department)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.verifiedBy}
                    onChange={(e) => setForm({ ...form, verifiedBy: e.target.value })}
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3 text-sm"
                  />
                </div>
              </div>

              {/* Eligibility Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-[#EDF1EA]">
                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Government Level
                  </label>
                  <select
                    value={form.governmentLevel}
                    onChange={(e) =>
                      setForm({ ...form, governmentLevel: e.target.value as GovernmentLevel })
                    }
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3 bg-white"
                  >
                    <option value="central">Central</option>
                    <option value="state">State</option>
                    <option value="joint">Joint (Central + State)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    States (comma-separated or ALL)
                  </label>
                  <input
                    type="text"
                    required
                    value={statesText}
                    onChange={(e) => setStatesText(e.target.value)}
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Gender Rule
                  </label>
                  <select
                    value={form.genderEligibility}
                    onChange={(e) =>
                      setForm({ ...form, genderEligibility: e.target.value as GenderEligibility })
                    }
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3 bg-white"
                  >
                    <option value="all">All Farmers</option>
                    <option value="female_priority">Female Priority Slab</option>
                    <option value="female_only">Female Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Min Land (Hectares)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.minLandHectares}
                    onChange={(e) =>
                      setForm({ ...form, minLandHectares: Number(e.target.value) })
                    }
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Max Land Cap (0 = no cap)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.maxLandHectares}
                    onChange={(e) =>
                      setForm({ ...form, maxLandHectares: Number(e.target.value) })
                    }
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Max Income INR (0 = no cap)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={form.maxIncomeINR}
                    onChange={(e) => setForm({ ...form, maxIncomeINR: Number(e.target.value) })}
                    className="w-full min-h-[42px] rounded-xl border border-[#D4DDD1] px-3 font-mono"
                  />
                </div>
              </div>

              {/* Benefit Categories */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-[#4A5B50]">
                  Benefit Categories
                </span>
                <div className="flex flex-wrap gap-2">
                  {ALL_CATEGORIES.map((cat) => {
                    const selected = form.categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 min-h-[38px] rounded-lg text-xs font-semibold transition-colors ${
                          selected
                            ? 'bg-[#15613E] text-white'
                            : 'bg-[#F1F4EE] text-[#4A5B50] hover:text-[#16221B]'
                        }`}
                      >
                        {t.finder.categories[cat]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trilingual Titles & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-[#EDF1EA]">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#4A5B50]">Title (EN)</label>
                  <input
                    type="text"
                    required
                    value={form.titleEn}
                    onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                    className="w-full min-h-[40px] rounded-xl border border-[#D4DDD1] px-3"
                  />
                  <label className="block text-xs font-semibold text-[#4A5B50]">Benefit (EN)</label>
                  <textarea
                    rows={2}
                    required
                    value={form.benefitEn}
                    onChange={(e) => setForm({ ...form, benefitEn: e.target.value })}
                    className="w-full rounded-xl border border-[#D4DDD1] p-2.5 text-xs"
                  />
                  <label className="block text-xs font-semibold text-[#4A5B50]">Summary (EN)</label>
                  <textarea
                    rows={2}
                    required
                    value={form.summaryEn}
                    onChange={(e) => setForm({ ...form, summaryEn: e.target.value })}
                    className="w-full rounded-xl border border-[#D4DDD1] p-2.5 text-xs"
                  />
                  <label className="block text-xs font-semibold text-[#4A5B50]">
                    Docs (EN, 1 per line)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={docsEnText}
                    onChange={(e) => setDocsEnText(e.target.value)}
                    className="w-full rounded-xl border border-[#D4DDD1] p-2.5 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#4A5B50]">
                    Title (हिंदी)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titleHi}
                    onChange={(e) => setForm({ ...form, titleHi: e.target.value })}
                    className="w-full min-h-[40px] rounded-xl border border-[#D4DDD1] px-3"
                  />
                  <label className="block text-xs font-semibold text-[#4A5B50]">
                    Benefit (हिंदी)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.benefitHi}
                    onChange={(e) => setForm({ ...form, benefitHi: e.target.value })}
                    className="w-full rounded-xl border border-[#D4DDD1] p-2.5 text-xs"
                  />
                  <label className="block text-xs font-semibold text-[#4A5B50]">
                    Summary (हिंदी)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.summaryHi}
                    onChange={(e) => setForm({ ...form, summaryHi: e.target.value })}
                    className="w-full rounded-xl border border-[#D4DDD1] p-2.5 text-xs"
                  />
                  <label className="block text-xs font-semibold text-[#4A5B50]">
                    Docs (हिंदी, 1 per line)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={docsHiText}
                    onChange={(e) => setDocsHiText(e.target.value)}
                    className="w-full rounded-xl border border-[#D4DDD1] p-2.5 text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#4A5B50]">
                    Title (मराठी)
                  </label>
                  <input
                    type="text"
                    required
                    value={form.titleMr}
                    onChange={(e) => setForm({ ...form, titleMr: e.target.value })}
                    className="w-full min-h-[40px] rounded-xl border border-[#D4DDD1] px-3"
                  />
                  <label className="block text-xs font-semibold text-[#4A5B50]">
                    Benefit (मराठी)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.benefitMr}
                    onChange={(e) => setForm({ ...form, benefitMr: e.target.value })}
                    className="w-full rounded-xl border border-[#D4DDD1] p-2.5 text-xs"
                  />
                  <label className="block text-xs font-semibold text-[#4A5B50]">
                    Summary (मराठी)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={form.summaryMr}
                    onChange={(e) => setForm({ ...form, summaryMr: e.target.value })}
                    className="w-full rounded-xl border border-[#D4DDD1] p-2.5 text-xs"
                  />
                  <label className="block text-xs font-semibold text-[#4A5B50]">
                    Docs (मराठी, 1 per line)
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={docsMrText}
                    onChange={(e) => setDocsMrText(e.target.value)}
                    className="w-full rounded-xl border border-[#D4DDD1] p-2.5 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#4A5B50] mb-1">
                    Official Helpline
                  </label>
                  <input
                    type="text"
                    required
                    value={form.helpline}
                    onChange={(e) => setForm({ ...form, helpline: e.target.value })}
                    className="w-full min-h-[40px] rounded-xl border border-[#D4DDD1] px-3 font-mono text-xs"
                  />
                </div>
                <label className="flex items-center gap-2.5 pt-5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 accent-[#15613E]"
                  />
                  <span className="text-sm font-medium text-[#16221B]">
                    Publish live to farmers immediately
                  </span>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-[#E2E7DF] bg-[#FAFBF9] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-4 min-h-[44px] text-sm font-medium text-[#4A5B50] hover:text-[#16221B]"
              >
                {t.admin.cancelBtn}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-xl bg-[#15613E] text-white text-sm font-semibold hover:bg-[#0E4A2F] disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {t.admin.saveBtn}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
