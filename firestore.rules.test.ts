/**
 * Phase 0 Security Test Specification for Haq Firestore Security Rules.
 * Verifies that all "Dirty Dozen" attack payloads are rejected by firestore.rules.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'create' | 'update' | 'delete' | 'get' | 'list';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_PAYLOADS: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Scheme Create',
    collectionPath: '/schemes/unauth-scheme',
    operation: 'create',
    auth: null,
    payload: { slug: 'unauth-scheme', titleEn: 'Fake Scheme' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Non-Admin Verified User Scheme Create',
    collectionPath: '/schemes/regular-user-scheme',
    operation: 'create',
    auth: { uid: 'user-123', email: 'farmer@example.com', email_verified: true },
    payload: { slug: 'regular-user-scheme', officialUrl: 'https://pmkisan.gov.in' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Unverified Email Admin Spoof',
    collectionPath: '/schemes/spoof-scheme',
    operation: 'create',
    auth: { uid: 'spoof-uid', email: 'solankeabhay936@gmail.com', email_verified: false },
    payload: { slug: 'spoof-scheme', officialUrl: 'https://pmkisan.gov.in' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow Field Injection',
    collectionPath: '/schemes/shadow-scheme',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'solankeabhay936@gmail.com', email_verified: true },
    payload: { slug: 'shadow-scheme', isGuaranteedPayout: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Insecure HTTP Phishing URL',
    collectionPath: '/schemes/http-scheme',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'solankeabhay936@gmail.com', email_verified: true },
    payload: { slug: 'http-scheme', officialUrl: 'http://phishing-subsidy.in' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Malformed Last Verified Date',
    collectionPath: '/schemes/bad-date',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'solankeabhay936@gmail.com', email_verified: true },
    payload: { slug: 'bad-date', lastVerified: '21-Nov-2026' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Resource Poisoning Document ID',
    collectionPath: `/schemes/${'a'.repeat(160)}`,
    operation: 'create',
    auth: { uid: 'admin-1', email: 'solankeabhay936@gmail.com', email_verified: true },
    payload: { slug: 'poison-id' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Immutable createdByUid Tampering',
    collectionPath: '/schemes/pm-kisan',
    operation: 'update',
    auth: { uid: 'admin-1', email: 'solankeabhay936@gmail.com', email_verified: true },
    payload: { createdByUid: 'different-uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Client Timestamp Forgery',
    collectionPath: '/schemes/pm-kisan',
    operation: 'update',
    auth: { uid: 'admin-1', email: 'solankeabhay936@gmail.com', email_verified: true },
    payload: { updatedAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Array Overflow DoS (documentsEn > 15)',
    collectionPath: '/schemes/overflow-scheme',
    operation: 'create',
    auth: { uid: 'admin-1', email: 'solankeabhay936@gmail.com', email_verified: true },
    payload: { documentsEn: Array.from({ length: 20 }, (_, i) => `Doc ${i}`) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Self-Assigned KVK Admin Escalation',
    collectionPath: '/admins/attacker-uid',
    operation: 'create',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    payload: { uid: 'attacker-uid', role: 'kvk_admin', organization: 'Fake KVK', grantedByUid: 'attacker-uid' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unauthenticated Draft/Inactive Scheme Read',
    collectionPath: '/schemes/inactive-draft',
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
];
