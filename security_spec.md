# Haq — Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Zero-PII Guarantee**: No collection stores Aadhaar numbers, farmer phone numbers, bank account numbers, IFSC codes, or farmer personal names.
2. **Official HTTPS Mandate**: Every scheme's `officialUrl` MUST begin with `https://` and match strict URL length bounds (`10..300`).
3. **Verification Integrity**: Every scheme MUST carry a valid ISO `YYYY-MM-DD` `lastVerified` date and non-empty `verifiedBy` institution string.
4. **Immutable Audit Fields**: `createdByUid` and `createdAt` on `/schemes/{schemeId}` are immutable after creation; `createdAt` and `updatedAt` MUST equal `request.time`.
5. **Verified Admin Gate**: Only verified Google accounts (`email_verified == true`) that are either the bootstrapped admin (`solankeabhay936@gmail.com`) or listed in `/admins/{uid}` may create, update, or delete schemes.
6. **No Self-Assigned Roles**: Only the bootstrapped admin may create or revoke `/admins/{adminUid}` records.
7. **Secure Public Reads**: Unauthenticated farmers may read ONLY schemes where `resource.data.isActive == true`, without any `get()`/`exists()` calls inside `allow list`.

## 2. The "Dirty Dozen" Attack Payloads (Must All Return PERMISSION_DENIED)
1. **Unauthenticated Scheme Create**: Anonymous client writes to `/schemes/fake-scheme`.
2. **Non-Admin Verified User Scheme Create**: Regular signed-in user not in `/admins` creates a scheme.
3. **Unverified Email Spoof**: Request with admin email but `email_verified: false` tries to create/update `/schemes/pm-kisan`.
4. **Shadow Field Injection**: Admin creates a scheme with an extra undocumented key (`isGuaranteedPayout: true`).
5. **HTTP Phishing URL Injection**: Admin sets `officialUrl: "http://fake-subsidy.xyz"` instead of `https://`.
6. **Malformed Verification Date**: Admin writes `lastVerified: "yesterday"` instead of `YYYY-MM-DD`.
7. **Resource Poisoning Document ID**: Admin creates `/schemes/` with a 200-char or invalid-character ID (`../../etc/passwd`).
8. **Immutable Field Tampering**: Admin updates `/schemes/pm-kisan` while altering `createdByUid` or `createdAt`.
9. **Client Timestamp Forgery**: Admin submits a backdated client timestamp instead of `serverTimestamp()` (`request.time`).
10. **Array Overflow DoS**: Admin submits 50 entries in `documentsEn` (exceeding max 15) or 100 entries in `states` (exceeding max 40).
11. **Self-Assigned Admin Escalation**: Non-bootstrap user creates `/admins/{theirUid}` with `role: "kvk_admin"`.
12. **Draft/Inactive Scheme Scraping**: Unauthenticated user queries `/schemes` without `where('isActive', '==', true)` or reads an inactive scheme document.
