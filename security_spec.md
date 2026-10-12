# Security Specification — ContactSphere

## 1. Data Invariants
1. **User Isolation**: A user (`userId`) can strictly read, write, and delete ONLY contacts located under `/users/{userId}/contacts/*`.
2. **Path Sanitization**: All IDs (`userId`, `contactId`, `activityId`) must conform to alphanumeric characters, hyphens, and underscores, bounded to 128 characters max.
3. **Contact Validation**:
   - `name`: string between 1 and 120 characters (mandatory).
   - `phone`: string between 1 and 40 characters (mandatory).
   - `email`: optional, string <= 150 characters.
   - `address`, `company`, `jobTitle`: optional strings <= 300 / 120 / 120 chars.
   - `category`: string <= 50 chars.
   - `tags`: list of strings <= 20 entries.
   - `isFavorite`: boolean.
4. **Activity Logs**: Immutable once created, user-isolated.
5. **No Cross-User Access**: Unauthenticated users or User B cannot read or modify User A's contacts.

## 2. The Dirty Dozen Payloads Handled
1. Unauthenticated read to `/users/{userA}/contacts` -> REJECTED (auth required).
2. User B read to `/users/{userA}/contacts` -> REJECTED (UID mismatch).
3. Path poisoning (`../../etc/passwd` or oversized 2KB key) -> REJECTED (isValidId check).
4. Blank contact creation (missing name or phone) -> REJECTED (name.size() > 0 && phone.size() > 0).
5. Injection of arbitrary fields or oversized notes (>2000 chars) -> REJECTED (notes.size() <= 2000).
6. Non-boolean `isFavorite` (e.g. string "true" or object) -> REJECTED (isFavorite is bool).
7. Impersonating another user's activity log -> REJECTED (isOwner constraint).
8. Modification of immutable activity logs -> REJECTED (allow update: if false).
9. Attempted deletion of another user's profile -> REJECTED.
10. Overflow of tags list (> 20 items) -> REJECTED.
11. User profile escalation -> REJECTED.
12. Blanket catch-all access -> REJECTED (Default Deny).
