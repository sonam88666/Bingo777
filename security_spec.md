# Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Default-Deny Catch-All**: Every path not explicitly matched is unconditionally denied (`allow read, write: if false;`).
2. **Master Admin Authority (`isAdmin()`)**: Only authenticated users whose UID exists in `/admins/$(request.auth.uid)` or whose verified email matches the bootstrapped owner email (`sonam88666@gmail.com` with `request.auth.token.email_verified == true`) have Master Admin privileges. Clients can NEVER write to `/admins/{adminUid}` to self-escalate privileges.
3. **PII Isolation**: User PII (`phone`, `email`) is stored in `/users/{userId}/private/{docId}` and is readable ONLY by the document owner (`request.auth.uid == userId`) or `isAdmin()`.
4. **Wallet & Balance Protection**: Direct client-side balance inflation or status tampering on `/users/{userId}` is strictly blocked. Standard users can only create their initial profile with `balance == 0`, `status == 'active'`, `vipLevel == 0`, and can only update their `username` and `updatedAt`. Only `isAdmin()` can modify `balance`, `status`, `vipLevel`, or financial totals.
5. **Immutable Financial Ledger (`/transactions/{txId}`)**: Transactions can only be created by `isAdmin()`, can never be updated or deleted (`allow update, delete: if false;`), and can only be read (`get`/`list`) by the transaction owner (`resource.data.uid == request.auth.uid`) or `isAdmin()`.
6. **Terminal State Locking on Deposits & Withdrawals (`/deposits/{depositId}`, `/withdrawals/{withdrawalId}`)**:
   - Users can create a pending request for their own `uid` (`incoming().uid == request.auth.uid && incoming().status == 'pending' && incoming().amount > 0`).
   - Once `status` leaves `'pending'` (e.g., `'approved'` or `'rejected'`), terminal state locking prevents non-admin updates. Only `isAdmin()` can transition `status` to `'approved'` or `'rejected'`.
7. **Live Bets Integrity (`/live_bets/{betId}`)**:
   - Users can only place bets for themselves (`incoming().uid == request.auth.uid`) with `status == 'pending'`, `actualPayout == 0`, and `amount >= 50`.
   - Only `isAdmin()` can settle bets (`status` -> `'won'` or `'lost'`, `actualPayout`).
8. **Temporal Integrity**: Every `createdAt` and `updatedAt` field must match `request.time`.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Shadow Field Injection on User Profile**: `{ uid: "u1", username: "Alice", balance: 0, vipLevel: 0, status: "active", isSuperAdmin: true, createdAt: request.time, updatedAt: request.time }` -> Rejected by `hasOnly()`.
2. **Self-Balance Inflation on User Creation**: `{ uid: "u1", username: "Alice", balance: 999999, vipLevel: 5, status: "active", createdAt: request.time, updatedAt: request.time }` -> Rejected because non-admin creation enforces `balance == 0 && vipLevel == 0`.
3. **Update-Gap Balance Tampering**: User attempts `update` on `/users/u1` changing `balance` from `0` to `50000` -> Rejected by `affectedKeys().hasOnly(['username', 'updatedAt'])`.
4. **Unverified Admin Email Spoof**: Attacker signs in with unverified email `sonam88666@gmail.com` (`email_verified == false`) and attempts to write `/settings/global` -> Rejected because `isAdmin()` strictly requires `request.auth.token.email_verified == true`.
5. **PII Cross-User Read**: Authenticated user `u2` attempts `get` on `/users/u1/private/info` -> Rejected because `request.auth.uid != 'u1'` and `!isAdmin()`.
6. **Cross-User Transaction List Scraping**: Authenticated user `u2` executes unfiltered `list` on `/transactions` -> Rejected because `allow list` enforces `resource.data.uid == request.auth.uid || isAdmin()`.
7. **Client-Side Fake Deposit Approval**: User `u1` attempts to update `/deposits/dep_1` with `{ status: "approved" }` -> Rejected because only `isAdmin()` can update deposits.
8. **Client-Side Settled Bet Manipulation**: User `u1` attempts to update `/live_bets/bet_1` with `{ status: "won", actualPayout: 10000 }` -> Rejected because only `isAdmin()` can update `live_bets`.
9. **ID Poisoning Attack**: User attempts to create `/deposits/` with a 500-character junk ID containing special characters -> Rejected by `isValidId(depositId)`.
10. **Forged Timestamp Attack**: User attempts to create a bet with a past timestamp `createdAt: Timestamp.fromMillis(100000)` -> Rejected by `incoming().createdAt == request.time`.
11. **Self-Privilege Escalation on `/admins`**: User `u1` attempts to create `/admins/u1` with `{ uid: "u1", role: "master_admin" }` -> Rejected because only an existing `isAdmin()` can write to `/admins`.
12. **Audit Log Deletion / Tampering**: Attacker or user attempts `delete` or `update` on `/audit_logs/log_1` -> Rejected because `allow update, delete: if false;` on `/audit_logs`.
