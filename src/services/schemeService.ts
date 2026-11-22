import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  Unsubscribe,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { SEED_SCHEMES } from '../data/seedSchemes';
import {
  AdminRoleRecord,
  BenefitCategory,
  GenderEligibility,
  GovernmentLevel,
  Scheme,
} from '../types';

const SCHEMES_COLLECTION = 'schemes';
const ADMINS_COLLECTION = 'admins';

// Blueprint-synchronized regex constants (matching firebase-blueprint.json & firestore.rules verbatim)
const SLUG_REGEX = /^[a-z0-9-]+$/;
const HTTPS_URL_REGEX = /^https:\/\/[a-zA-Z0-9.-]+(\/.*)?$/;
const DATE_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

export interface SchemeFormInput {
  slug: string;
  officialUrl: string;
  lastVerified: string;
  verifiedBy: string;
  governmentLevel: GovernmentLevel;
  states: string[];
  categories: BenefitCategory[];
  minLandHectares: number;
  maxLandHectares: number;
  maxIncomeINR: number;
  genderEligibility: GenderEligibility;
  titleEn: string;
  titleHi: string;
  titleMr: string;
  benefitEn: string;
  benefitHi: string;
  benefitMr: string;
  summaryEn: string;
  summaryHi: string;
  summaryMr: string;
  documentsEn: string[];
  documentsHi: string[];
  documentsMr: string[];
  helpline: string;
  isActive: boolean;
}

function clampString(val: string, minLen: number, maxLen: number, fallback: string): string {
  const trimmed = (val || '').trim();
  if (trimmed.length < minLen) return fallback.slice(0, maxLen);
  return trimmed.slice(0, maxLen);
}

function sanitizeStringArray(arr: string[], maxItems: number, fallbackItem: string): string[] {
  const cleaned = arr
    .map((item) => item.trim().slice(0, 200))
    .filter((item) => item.length > 0)
    .slice(0, maxItems);
  return cleaned.length > 0 ? cleaned : [fallbackItem];
}

export function validateAndSanitizeSchemeInput(input: SchemeFormInput): {
  valid: boolean;
  error?: string;
  sanitized?: SchemeFormInput;
} {
  const slug = input.slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  if (!SLUG_REGEX.test(slug) || slug.length < 2) {
    return { valid: false, error: 'Scheme slug must be 2–80 lowercase letters, numbers, or hyphens.' };
  }

  const officialUrl = input.officialUrl.trim().slice(0, 300);
  if (!HTTPS_URL_REGEX.test(officialUrl) || officialUrl.length < 10) {
    return { valid: false, error: 'Official portal URL must start with https:// (valid government portal).' };
  }

  const lastVerified = input.lastVerified.trim();
  if (!DATE_REGEX.test(lastVerified)) {
    return { valid: false, error: 'Last Verified date must follow YYYY-MM-DD format.' };
  }

  const minLandHectares = Math.max(0, Math.min(1000, Number(input.minLandHectares) || 0));
  const maxLandHectares = Math.max(0, Math.min(1000, Number(input.maxLandHectares) || 0));
  if (maxLandHectares > 0 && minLandHectares > maxLandHectares) {
    return { valid: false, error: 'Minimum land area cannot exceed maximum land cap.' };
  }

  const maxIncomeINR = Math.max(0, Math.min(100000000, Math.round(Number(input.maxIncomeINR) || 0)));

  const sanitized: SchemeFormInput = {
    slug,
    officialUrl,
    lastVerified,
    verifiedBy: clampString(input.verifiedBy, 2, 100, 'KVK Verification Desk'),
    governmentLevel: ['central', 'state', 'joint'].includes(input.governmentLevel)
      ? input.governmentLevel
      : 'central',
    states: sanitizeStringArray(input.states, 40, 'ALL'),
    categories: sanitizeStringArray(input.categories, 10, 'income_support') as BenefitCategory[],
    minLandHectares,
    maxLandHectares,
    maxIncomeINR,
    genderEligibility: ['all', 'female_only', 'female_priority'].includes(input.genderEligibility)
      ? input.genderEligibility
      : 'all',
    titleEn: clampString(input.titleEn, 3, 160, 'Agricultural Welfare Scheme'),
    titleHi: clampString(input.titleHi, 3, 200, input.titleEn || 'कृषि कल्याण योजना'),
    titleMr: clampString(input.titleMr, 3, 200, input.titleEn || 'कृषी कल्याण योजना'),
    benefitEn: clampString(input.benefitEn, 5, 260, 'Verified government subsidy assistance.'),
    benefitHi: clampString(input.benefitHi, 5, 320, input.benefitEn || 'सत्यापित सरकारी अनुदान सहायता।'),
    benefitMr: clampString(input.benefitMr, 5, 320, input.benefitEn || 'पडताळणीकृत शासकीय अनुदान सहाय्य.'),
    summaryEn: clampString(input.summaryEn, 10, 600, 'Subject to official department verification.'),
    summaryHi: clampString(input.summaryHi, 10, 700, input.summaryEn || 'आधिकारिक विभागीय सत्यापन के अधीन।'),
    summaryMr: clampString(input.summaryMr, 10, 700, input.summaryEn || 'अधिकृत विभागीय पडताळणीच्या अधीन.'),
    documentsEn: sanitizeStringArray(input.documentsEn, 15, '7/12 Land Extract'),
    documentsHi: sanitizeStringArray(input.documentsHi, 15, '7/12 भूमि अभिलेख'),
    documentsMr: sanitizeStringArray(input.documentsMr, 15, '७/१२ जमिनीचा उतारा'),
    helpline: clampString(input.helpline, 3, 60, '1800-180-1551'),
    isActive: Boolean(input.isActive),
  };

  return { valid: true, sanitized };
}

function docToScheme(id: string, data: Record<string, unknown>): Scheme {
  return {
    id,
    slug: String(data.slug || id),
    officialUrl: String(data.officialUrl || 'https://pmkisan.gov.in'),
    lastVerified: String(data.lastVerified || new Date().toISOString().slice(0, 10)),
    verifiedBy: String(data.verifiedBy || 'KVK Desk'),
    governmentLevel: (data.governmentLevel as GovernmentLevel) || 'central',
    states: Array.isArray(data.states) ? data.states.map(String) : ['ALL'],
    categories: Array.isArray(data.categories)
      ? (data.categories.map(String) as BenefitCategory[])
      : ['income_support'],
    minLandHectares: Number(data.minLandHectares ?? 0),
    maxLandHectares: Number(data.maxLandHectares ?? 0),
    maxIncomeINR: Number(data.maxIncomeINR ?? 0),
    genderEligibility: (data.genderEligibility as GenderEligibility) || 'all',
    titleEn: String(data.titleEn || ''),
    titleHi: String(data.titleHi || ''),
    titleMr: String(data.titleMr || ''),
    benefitEn: String(data.benefitEn || ''),
    benefitHi: String(data.benefitHi || ''),
    benefitMr: String(data.benefitMr || ''),
    summaryEn: String(data.summaryEn || ''),
    summaryHi: String(data.summaryHi || ''),
    summaryMr: String(data.summaryMr || ''),
    documentsEn: Array.isArray(data.documentsEn) ? data.documentsEn.map(String) : [],
    documentsHi: Array.isArray(data.documentsHi) ? data.documentsHi.map(String) : [],
    documentsMr: Array.isArray(data.documentsMr) ? data.documentsMr.map(String) : [],
    helpline: String(data.helpline || '1800-180-1551'),
    isActive: Boolean(data.isActive),
    createdByUid: String(data.createdByUid || ''),
    source: 'firestore',
  };
}

export function subscribePublicSchemes(
  onData: (schemes: Scheme[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, SCHEMES_COLLECTION), where('isActive', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => docToScheme(d.id, d.data() as Record<string, unknown>));
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, SCHEMES_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export function subscribeAdminSchemes(
  isBootstrapAdmin: boolean,
  onData: (schemes: Scheme[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const ref = isBootstrapAdmin
    ? collection(db, SCHEMES_COLLECTION)
    : query(collection(db, SCHEMES_COLLECTION), where('isActive', '==', true));

  return onSnapshot(
    ref,
    (snapshot) => {
      const items = snapshot.docs.map((d) => docToScheme(d.id, d.data() as Record<string, unknown>));
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, SCHEMES_COLLECTION);
      } catch (wrapped) {
        if (onError && wrapped instanceof Error) {
          onError(wrapped);
        }
      }
    }
  );
}

export async function checkIsKvkAdmin(): Promise<{
  isAdmin: boolean;
  isBootstrap: boolean;
}> {
  const user = auth.currentUser;
  if (!user || !user.emailVerified) {
    return { isAdmin: false, isBootstrap: false };
  }
  if (user.email === BOOTSTRAP_ADMIN_EMAIL) {
    return { isAdmin: true, isBootstrap: true };
  }
  const path = `${ADMINS_COLLECTION}/${user.uid}`;
  try {
    const snap = await getDoc(doc(db, ADMINS_COLLECTION, user.uid));
    return { isAdmin: snap.exists(), isBootstrap: false };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createSchemeInFirestore(input: SchemeFormInput): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('You must sign in with Google first.');

  const check = validateAndSanitizeSchemeInput(input);
  if (!check.valid || !check.sanitized) {
    throw new Error(check.error || 'Invalid scheme data.');
  }

  const docId = check.sanitized.slug;
  const path = `${SCHEMES_COLLECTION}/${docId}`;
  try {
    await setDoc(doc(db, SCHEMES_COLLECTION, docId), {
      ...check.sanitized,
      createdByUid: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSchemeInFirestore(
  schemeId: string,
  input: SchemeFormInput
): Promise<void> {
  const check = validateAndSanitizeSchemeInput(input);
  if (!check.valid || !check.sanitized) {
    throw new Error(check.error || 'Invalid scheme data.');
  }

  const path = `${SCHEMES_COLLECTION}/${schemeId}`;
  try {
    await updateDoc(doc(db, SCHEMES_COLLECTION, schemeId), {
      ...check.sanitized,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function markSchemeVerifiedToday(
  schemeId: string,
  verifiedBy: string
): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const safeVerifier = clampString(verifiedBy, 2, 100, 'KVK Verification Officer');
  const path = `${SCHEMES_COLLECTION}/${schemeId}`;
  try {
    await updateDoc(doc(db, SCHEMES_COLLECTION, schemeId), {
      lastVerified: today,
      verifiedBy: safeVerifier,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleSchemeActive(schemeId: string, isActive: boolean): Promise<void> {
  const path = `${SCHEMES_COLLECTION}/${schemeId}`;
  try {
    await updateDoc(doc(db, SCHEMES_COLLECTION, schemeId), {
      isActive,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteSchemeInFirestore(schemeId: string): Promise<void> {
  const path = `${SCHEMES_COLLECTION}/${schemeId}`;
  try {
    await deleteDoc(doc(db, SCHEMES_COLLECTION, schemeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function seedInitialSchemesToFirestore(): Promise<number> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in with Google to sync schemes.');

  let count = 0;
  for (const s of SEED_SCHEMES) {
    const path = `${SCHEMES_COLLECTION}/${s.slug}`;
    try {
      const existing = await getDoc(doc(db, SCHEMES_COLLECTION, s.slug));
      if (!existing.exists()) {
        const { id: _id, source: _source, createdByUid: _uid, ...rest } = s;
        await setDoc(doc(db, SCHEMES_COLLECTION, s.slug), {
          ...rest,
          createdByUid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        count += 1;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
  return count;
}

export async function grantKvkAdminRole(targetUid: string, organization: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error('Sign in required.');

  const uid = targetUid.trim();
  if (!ID_REGEX.test(uid) || uid.length > 128) {
    throw new Error('Invalid Firebase UID format.');
  }
  const org = clampString(organization, 2, 120, 'Krishi Vigyan Kendra');
  const path = `${ADMINS_COLLECTION}/${uid}`;
  const payload: AdminRoleRecord = {
    uid,
    role: 'kvk_admin',
    organization: org,
    grantedByUid: user.uid,
  };
  try {
    await setDoc(doc(db, ADMINS_COLLECTION, uid), {
      ...payload,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
