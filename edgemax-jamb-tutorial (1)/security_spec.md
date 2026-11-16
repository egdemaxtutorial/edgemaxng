# EdgeMax Security Specification

## 1. Data Invariants
1. A student profile record (`StudentProfile`) is immutable once created (`allow update: if false;`, `allow delete: if false;`).
2. `id` must match `^EDG-2027-[A-Z2-9]{4}$` and `ownerUid` must match `request.auth.uid`.
3. `subjects` must contain strictly 4 subjects with `English` included first (`subjects.size() == 4 && subjects[0] == 'English'`).
4. PII (`email`, `phone`) is strictly restricted so non-owners cannot read or list another user's student document.
5. Tutor records (`TutorAccount`) must only allow valid `EG-*` IDs (`EG-TUTOR-KOLE`, `EG-TUTOR-ISAAC`, `EG-TUTOR-DAVIES`, `EG-MARVY`, `EG-TUTOR-MAVERICK`), never expose password hashes in Firestore documents, and prevent unauthorized self-promotion or arbitrary updates.

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Be Denied)
1. **Unauthenticated Student Read**: `get(/students/EDG-2027-ABCD)` with `auth = null` -> `PERMISSION_DENIED`.
2. **Unauthenticated Student List Scrape**: `list(/students)` with `auth = null` -> `PERMISSION_DENIED`.
3. **Cross-User Student Read (PII Leak)**: `get(/students/EDG-2027-ABCD)` as `uid: "other-user"` when `ownerUid == "owner-1"` -> `PERMISSION_DENIED`.
4. **Blanket Query Scrape**: `list(/students)` without `where('ownerUid', '==', auth.uid)` -> `PERMISSION_DENIED`.
5. **Identity Spoofing on Create**: `create(/students/EDG-2027-ABCD)` with `ownerUid: "someone-else"` -> `PERMISSION_DENIED`.
6. **Shadow Field Injection**: `create(/students/EDG-2027-ABCD)` containing unexpected key `isAdmin: true` -> `PERMISSION_DENIED`.
7. **Post-Registration Edit Attempt**: `update(/students/EDG-2027-ABCD)` modifying `fullName` or `subjects` -> `PERMISSION_DENIED` (profiles are strictly immutable).
8. **Malicious Subject Array Poisoning**: `create(/students/EDG-2027-ABCD)` with `subjects: ["English", 123, "Biology", "Physics"]` or `subjects.size() == 5` -> `PERMISSION_DENIED`.
9. **ID Poisoning**: `create(/students/A_VERY_LONG_ID_OVER_128_CHARS...)` or invalid ID pattern -> `PERMISSION_DENIED`.
10. **Client Timestamp Forgery**: `create(/students/EDG-2027-ABCD)` with `createdAt` not matching `request.time` -> `PERMISSION_DENIED`.
11. **Unverified Email Spoof**: `create(/students/EDG-2027-ABCD)` when `request.auth.token.email_verified == false` -> `PERMISSION_DENIED`.
12. **Tutor Record Tampering**: `update(/tutors/EG-MARVY)` by non-admin attempting to alter `phone` or inject `role: "superadmin"` -> `PERMISSION_DENIED`.
