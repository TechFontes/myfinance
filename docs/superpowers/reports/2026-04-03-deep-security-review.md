# Deep Security Review -- MyFinance Application

**Date:** 2026-04-03
**Auditor:** Claude Opus 4.6 (automated)
**Scope:** Full application security audit -- authentication, authorization, input validation, XSS, CSRF, error handling, sensitive data, cookies, rate limiting, dependencies

---

## Findings

### FINDING-01: JWT Secret Falls Back to Hardcoded Value

- **Severity:** CRITICAL
- **Category:** Authentication
- **File:** `app/modules/auth/session.ts`, line 4
- **Description:** The JWT signing secret uses a fallback value `"dev-secret"` when `JWT_SECRET` is not set in the environment. If the environment variable is missing in production (misconfiguration, container restart without secrets), all tokens are signed with a publicly known, trivially guessable secret. An attacker who discovers this can forge arbitrary JWT tokens for any user, including admin accounts.
- **Risk:** Complete authentication bypass. Attacker can impersonate any user, escalate to admin, and access or modify all financial data.
- **Recommendation:** Remove the fallback entirely. Crash on startup if `JWT_SECRET` is not set. Add a startup validation check:
  ```ts
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) throw new Error("JWT_SECRET environment variable is required")
  ```

---

### FINDING-02: CSV Import Preview Secret Falls Back to Hardcoded Value

- **Severity:** CRITICAL
- **Category:** Authentication
- **File:** `app/api/imports/transactions/preview/route.ts`, lines 55-60; `app/api/imports/transactions/commit/route.ts`, lines 94-99
- **Description:** The `getPreviewSecret()` function falls back through `CSV_IMPORT_PREVIEW_SECRET` -> `AUTH_SECRET` -> `"myfinance-import-preview-secret"`. If no environment secrets are configured, the HMAC signing key is a hardcoded string. An attacker could forge preview tokens to inject arbitrary transactions into a user's account.
- **Risk:** Unauthorized transaction creation via forged import tokens. Financial data manipulation.
- **Recommendation:** Remove the hardcoded fallback. Require `CSV_IMPORT_PREVIEW_SECRET` or `AUTH_SECRET` to be set, or fail loudly.

---

### FINDING-03: No Rate Limiting on Login Endpoint

- **Severity:** HIGH
- **Category:** Authentication / Brute Force
- **File:** `app/api/auth/login/route.ts`
- **Description:** The login endpoint has no rate limiting or account lockout mechanism. An attacker can make unlimited password guessing attempts without any throttling, delay, or lockout.
- **Risk:** Credential brute-force attacks. Given the minimum password length of 6 characters (for login validation), weak passwords can be cracked quickly.
- **Recommendation:** Implement rate limiting (e.g., via `next-rate-limit`, Upstash ratelimit, or middleware-based IP throttling). Consider progressive delays or temporary account lockout after N failed attempts.

---

### FINDING-04: No Rate Limiting on Registration Endpoint

- **Severity:** HIGH
- **Category:** Authentication / Abuse
- **File:** `app/api/auth/register/route.ts`
- **Description:** The registration endpoint has no rate limiting. An attacker can create unlimited accounts, which could be used for spam, resource exhaustion, or database bloat.
- **Risk:** Mass account creation, resource exhaustion, potential DDoS vector.
- **Recommendation:** Add rate limiting per IP address on the registration endpoint.

---

### FINDING-05: No Rate Limiting on Password Reset Request

- **Severity:** HIGH
- **Category:** Authentication / Abuse
- **File:** `app/api/auth/password/request-reset/route.ts`
- **Description:** The password reset request endpoint has no rate limiting. An attacker could flood a user's email with reset requests, or use the endpoint to enumerate valid email addresses (though the current implementation returns `{ success: true }` regardless, which is good for enumeration prevention -- but still no rate limit).
- **Risk:** Email flooding for targeted users. Resource exhaustion.
- **Recommendation:** Add rate limiting per IP and per email address.

---

### FINDING-06: Missing `sameSite` Cookie Attribute

- **Severity:** HIGH
- **Category:** Cookie Security / CSRF
- **File:** `app/api/auth/login/route.ts`, lines 28-33; `app/api/auth/logout/route.ts`, lines 8-13
- **Description:** The auth cookie is set with `httpOnly` and conditional `secure`, but the `sameSite` attribute is not set. Without an explicit `sameSite` value, the browser default applies (which is `Lax` in modern browsers, but older browsers may default to `None`). For a financial application, this should be explicitly set to `Strict` or `Lax` to prevent CSRF attacks.
- **Risk:** Cross-site request forgery in older browsers or misconfigured environments. An attacker's page could trigger state-changing requests with the user's auth cookie.
- **Recommendation:** Explicitly set `sameSite: 'lax'` (or `'strict'`) on all cookie operations.

---

### FINDING-07: Login Endpoint Does Not Validate Input with Zod

- **Severity:** MEDIUM
- **Category:** Input Validation
- **File:** `app/api/auth/login/route.ts`, line 9
- **Description:** The login route destructures `email` and `password` directly from `await req.json()` without using the `loginInputSchema` Zod validator that exists in `app/modules/auth/validators.ts`. While the values are used safely (email lookup, bcrypt compare), the lack of validation means malformed or oversized payloads are not rejected early.
- **Risk:** Potential for unexpected types being passed to downstream functions. A very large password string could cause bcrypt to consume excessive CPU (bcrypt has a 72-byte limit, but bcryptjs will hash the full input before truncation depending on implementation).
- **Recommendation:** Add `loginInputSchema.parse(await req.json())` before processing, consistent with the register endpoint pattern.

---

### FINDING-08: Middleware Does Not Verify JWT for Non-Admin API Routes

- **Severity:** MEDIUM
- **Category:** Authorization
- **File:** `app/middleware.ts`, lines 44-56
- **Description:** The middleware only verifies the JWT token and checks the role for `/admin` routes. For all other protected API routes, the middleware only checks for token *existence* (not validity). The actual JWT verification happens inside each route handler via `getUserFromRequest()`. While this means invalid tokens are still rejected at the route level, the middleware allows requests with expired or forged tokens to reach the route handler and execute code up to the auth check.
- **Risk:** Slightly increased attack surface -- requests with invalid tokens still reach application code. Not a direct bypass since routes individually check auth, but defense-in-depth is weakened.
- **Recommendation:** Verify the JWT in middleware for all protected routes, not just admin routes. This provides a single enforcement point and reduces the chance of a route accidentally skipping auth.

---

### FINDING-09: Profile Update Endpoint Lacks Zod Validation

- **Severity:** MEDIUM
- **Category:** Input Validation
- **File:** `app/api/auth/profile/route.ts`, line 20
- **Description:** The profile update endpoint casts `await req.json()` as `ProfilePayload` using a TypeScript type assertion. This provides no runtime validation. Any unexpected fields in the payload are silently passed through. While the `updateUserById` function uses Prisma (which has its own schema), there is no validation on field lengths, formats, or allowed fields.
- **Risk:** Unexpected data could be passed to the update function. The `name` and `email` fields are not validated for format or length. Potential for database constraint violations reaching the client as unhandled errors.
- **Recommendation:** Create a Zod schema for profile updates and validate the input.

---

### FINDING-10: Password Reset Does Not Validate Password Strength

- **Severity:** MEDIUM
- **Category:** Authentication
- **File:** `app/api/auth/password/reset/route.ts`, lines 6-8
- **Description:** The password reset endpoint checks that `password` and `confirmPassword` match, and that the token is valid, but does not enforce any minimum password length or complexity. The registration endpoint enforces `min(8)` via Zod, but the reset endpoint allows any non-empty string.
- **Risk:** Users can reset their password to a single character, creating a trivially guessable credential.
- **Recommendation:** Apply the same password validation rules as registration (`z.string().min(8)`) to the reset endpoint.

---

### FINDING-11: Password Reset Does Not Invalidate Existing Sessions

- **Severity:** MEDIUM
- **Category:** Session Management
- **File:** `app/api/auth/password/reset/route.ts`
- **Description:** After a password reset, existing JWT tokens remain valid until they expire (7 days). There is no session invalidation mechanism. If an attacker has compromised a session, changing the password does not revoke their access.
- **Risk:** Compromised sessions persist after password change. A user who suspects their account is compromised cannot effectively lock out the attacker by changing their password.
- **Recommendation:** Implement a token versioning mechanism (e.g., store a `tokenVersion` on the user record, include it in the JWT, and check it during verification). Increment the version on password change.

---

### FINDING-12: Profile Password Change Does Not Invalidate Existing Sessions

- **Severity:** MEDIUM
- **Category:** Session Management
- **File:** `app/api/auth/profile/route.ts`
- **Description:** Same issue as FINDING-11 but for the profile password change flow. After changing password via profile, all existing sessions (other browser tabs, devices) remain valid for up to 7 days.
- **Risk:** Same as FINDING-11.
- **Recommendation:** Same as FINDING-11.

---

### FINDING-13: Inconsistent `Number()` Parsing Without NaN Checks on Some Routes

- **Severity:** MEDIUM
- **Category:** Input Validation
- **File:** `app/api/accounts/[accountId]/route.ts`, line 17; `app/api/categories/[categoryId]/route.ts`, lines 20, 42; `app/api/invoices/[invoiceId]/route.ts`, lines 17, 54
- **Description:** Several routes convert URL parameters to numbers using `Number(param)` without checking for `NaN` or validating that the result is a positive integer. Other routes in the application (transactions, cards, goals, transfers) correctly use a `parseXxxId()` helper that validates `Number.isInteger(parsedId) && parsedId > 0`. The inconsistency means routes like accounts and categories could pass `NaN` to Prisma queries.
- **Risk:** `NaN` values passed to Prisma `where` clauses may cause unexpected behavior or errors. While Prisma typically handles this gracefully, it is inconsistent and fragile.
- **Recommendation:** Apply the same `parseId()` validation pattern used in transactions/cards/goals to all routes that parse numeric URL parameters.

---

### FINDING-14: Error Messages Expose Internal Error Details

- **Severity:** MEDIUM
- **Category:** Information Leakage
- **File:** `app/api/transactions/[transactionId]/settle/route.ts`, line 52; `app/api/transactions/[transactionId]/cancel/route.ts`, line 40; `app/api/transfers/[transferId]/settle/route.ts`, line 41; `app/api/transfers/[transferId]/cancel/route.ts`, line 34; `app/api/invoices/[invoiceId]/pay/route.ts`, line 40
- **Description:** Multiple route handlers catch errors and return `error.message` directly to the client. If an unexpected error occurs (e.g., a Prisma constraint violation, a database connection error), the raw error message including internal details (table names, column names, constraint names) could be exposed.
- **Risk:** Information leakage that helps attackers understand the database schema and application internals.
- **Recommendation:** Only return known domain error messages to the client. For unexpected errors, return a generic message and log the details server-side.

---

### FINDING-15: Unhandled Zod Parse Errors in Multiple Routes

- **Severity:** MEDIUM
- **Category:** Error Handling
- **File:** `app/api/accounts/route.ts`, line 28; `app/api/transactions/route.ts`, line 74; `app/api/transactions/[transactionId]/route.ts`, line 30; `app/api/categories/route.ts`, line 28; `app/api/cards/route.ts`, line 25; `app/api/goals/route.ts`, line 25; `app/api/goals/[goalId]/route.ts`, line 29; `app/api/accounts/[accountId]/route.ts`, line 18; `app/api/cards/[cardId]/route.ts`, line 29; `app/api/categories/[categoryId]/route.ts`, line 21
- **Description:** Many routes call `schema.parse()` without a try/catch. If validation fails, Zod throws a `ZodError` that propagates as an unhandled exception. Next.js will catch this and return a 500 error, but the error response may include Zod's detailed error messages including field paths and validation details. Some routes (recurrence, transfers) properly catch `ZodError` and return 400s, but the pattern is inconsistent.
- **Risk:** Users see 500 errors instead of 400s for malformed input. Error responses may leak schema details. Inconsistent API behavior.
- **Recommendation:** Use `schema.safeParse()` consistently across all routes, or wrap `schema.parse()` in try/catch blocks that return proper 400 responses.

---

### FINDING-16: Long JWT Expiration (7 Days)

- **Severity:** LOW
- **Category:** Session Management
- **File:** `app/modules/auth/session.ts`, line 7
- **Description:** JWT tokens expire after 7 days. For a financial application, this is a long session lifetime. Combined with the lack of session invalidation (FINDING-11/12), a compromised token remains valid for up to a week.
- **Risk:** Extended window of opportunity if a token is stolen.
- **Recommendation:** Reduce token lifetime to 1-4 hours and implement a refresh token mechanism. Alternatively, use server-side session storage that can be revoked.

---

### FINDING-17: Password Minimum Length Mismatch Between Login and Register

- **Severity:** LOW
- **Category:** Input Validation
- **File:** `app/modules/auth/validators.ts`, lines 4, 9
- **Description:** The login schema allows passwords with `min(6)` while the registration schema requires `min(8)`. The login validation is less strict than registration, which is acceptable (it needs to validate legacy passwords), but the mismatch suggests the minimum was lowered at some point. No migration path exists to enforce the stronger minimum.
- **Risk:** Minimal direct risk, but indicates potential for accumulated weak passwords.
- **Recommendation:** Consider enforcing the `min(8)` requirement on login as well, or add a mechanism to prompt users with short passwords to update them.

---

### FINDING-18: Register Endpoint Does Not Return Auth Token

- **Severity:** LOW
- **Category:** Authentication UX
- **File:** `app/api/auth/register/route.ts`
- **Description:** After registration, the endpoint returns user data but does not set an auth cookie. The user must log in separately after registering. While not a security vulnerability per se, this means the registration flow requires two round-trips and users might skip the login step.
- **Risk:** No direct security risk. Minor UX concern.
- **Recommendation:** Consider setting the auth cookie on successful registration (login-after-register pattern).

---

### FINDING-19: Admin Self-Block Not Prevented

- **Severity:** LOW
- **Category:** Authorization
- **File:** `app/api/admin/users/[userId]/block/route.ts`
- **Description:** The admin block endpoint does not check whether the admin is attempting to block their own account. An admin could accidentally lock themselves out.
- **Risk:** Admin account self-lockout. Requires database intervention to recover.
- **Recommendation:** Add a check that `userId !== result.user.id` before allowing the block operation.

---

### FINDING-20: No Global Error Handler for API Routes

- **Severity:** LOW
- **Category:** Error Handling
- **File:** All API route files
- **Description:** There is no global error handling middleware for API routes. Unhandled exceptions (Prisma errors, unexpected runtime errors) will be caught by Next.js and returned as generic 500 errors in production, but in development mode they may expose stack traces and internal details.
- **Risk:** In development or misconfigured production environments, stack traces and internal paths could leak.
- **Recommendation:** Consider adding a global error handler or wrapper function for API routes that catches all errors, logs them server-side, and returns sanitized responses.

---

### FINDING-21: Invoice PATCH Endpoint Does Not Validate Body With Zod

- **Severity:** LOW
- **Category:** Input Validation
- **File:** `app/api/invoices/[invoiceId]/route.ts`, line 38
- **Description:** The invoice PATCH handler reads `await request.json()` directly and checks for specific fields manually without Zod validation. While the handler is restrictive (only allows `status: 'PAID'`), the approach is fragile and inconsistent with the rest of the codebase.
- **Risk:** Minor -- the handler rejects most inputs, but the manual validation pattern is error-prone for future changes.
- **Recommendation:** Create a Zod schema for the allowed invoice update operations.

---

### FINDING-22: Goal Withdrawal Endpoint Lacks Zod Validation

- **Severity:** LOW
- **Category:** Input Validation
- **File:** `app/api/goals/[goalId]/withdraw/route.ts`, lines 30-33
- **Description:** The withdrawal endpoint manually validates `amount` without Zod. The check `!amount || Number(amount) <= 0` is loose -- it would accept string values like `"0.001"` but also truthy non-numeric strings.
- **Risk:** Minor input validation gap. The service layer likely provides additional validation.
- **Recommendation:** Use Zod schema validation consistent with other endpoints.

---

### FINDING-23: No CORS Configuration

- **Severity:** INFO
- **Category:** CSRF / Configuration
- **File:** `app/middleware.ts`
- **Description:** There is no explicit CORS configuration. Next.js API routes default to same-origin, which is generally safe. However, if the application is ever served behind a reverse proxy or needs to support cross-origin requests, the lack of explicit CORS headers could be a concern.
- **Risk:** Currently none, as same-origin policy is in effect. Future risk if deployment architecture changes.
- **Recommendation:** Document the CORS policy. If cross-origin requests are never needed, consider adding explicit CORS rejection headers as defense-in-depth.

---

### FINDING-24: Financial Values Use Prisma Decimal (Good Practice)

- **Severity:** INFO
- **Category:** Data Integrity
- **File:** `prisma/schema.prisma` (multiple lines)
- **Description:** All financial values (`value`, `amount`, `limit`, `total`, `initialBalance`, `targetAmount`) use `Decimal(10,2)` in the database schema. This correctly avoids floating-point precision issues for financial calculations.
- **Risk:** None -- this is a positive finding.
- **Recommendation:** No action needed. Ensure that any JavaScript-side arithmetic on these values also uses string-based or Decimal operations, not native `Number` math.

---

### FINDING-25: `.env` Files Properly Excluded From Git

- **Severity:** INFO
- **Category:** Sensitive Data
- **File:** `.gitignore`, line 34
- **Description:** The `.gitignore` file includes `.env*` which covers all environment files. This is correct practice.
- **Risk:** None -- this is a positive finding.
- **Recommendation:** No action needed.

---

### FINDING-26: No `dangerouslySetInnerHTML` Usage Found

- **Severity:** INFO
- **Category:** XSS
- **Description:** A codebase-wide search found no usage of `dangerouslySetInnerHTML`. React's default escaping provides XSS protection for rendered content.
- **Risk:** None -- this is a positive finding.
- **Recommendation:** No action needed. Continue avoiding `dangerouslySetInnerHTML`.

---

### FINDING-27: No Raw SQL Queries Found

- **Severity:** INFO
- **Category:** Injection
- **Description:** A codebase-wide search found no usage of `$queryRaw` or `$executeRaw`. All database access goes through Prisma's parameterized query builder, which prevents SQL injection.
- **Risk:** None -- this is a positive finding.
- **Recommendation:** No action needed. Continue using Prisma's query builder exclusively.

---

### FINDING-28: Dependencies Appear Current

- **Severity:** INFO
- **Category:** Dependencies
- **File:** `package.json`
- **Description:** Key security-relevant packages are at recent versions: `bcryptjs@3.0.3`, `jsonwebtoken@9.0.2`, `next@16.0.10`, `zod@4.1.12`, `@prisma/client@6.19.0`. No known critical vulnerabilities were identified in these versions at the time of review.
- **Risk:** None at time of review. Dependencies should be regularly audited.
- **Recommendation:** Run `npm audit` periodically. Consider adding Dependabot or Renovate for automated dependency updates.

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 2     |
| HIGH     | 4     |
| MEDIUM   | 8     |
| LOW      | 6     |
| INFO     | 6     |
| **Total**| **26**|

### Overall Security Posture

The application demonstrates **solid foundational security practices**: consistent use of `getUserFromRequest()` for authentication in every route, proper tenant isolation via `userId` in all database queries, Zod validation on most inputs, Prisma for SQL injection prevention, bcrypt for password hashing, httpOnly cookies, and no XSS vectors. The admin routes have proper role-based access control.

However, there are **two critical findings** (hardcoded JWT and import secrets) that could lead to complete authentication bypass if environment variables are not set. The absence of rate limiting on authentication endpoints is a significant gap for a financial application.

### Top 3 Priorities

1. **Remove hardcoded secret fallbacks** (FINDING-01, FINDING-02) -- These are the most dangerous issues. A single missing environment variable gives attackers the ability to forge tokens and impersonate any user. Fix: crash on startup if secrets are not configured.

2. **Add rate limiting to authentication endpoints** (FINDING-03, FINDING-04, FINDING-05) -- Login, registration, and password reset endpoints are all unlimited. For a financial application, brute-force protection is essential. Fix: add rate limiting middleware.

3. **Add `sameSite` cookie attribute and implement session invalidation** (FINDING-06, FINDING-11, FINDING-12) -- Explicitly set `sameSite: 'lax'` on all cookies and implement a token versioning mechanism so that password changes invalidate all existing sessions. Fix: update cookie options and add `tokenVersion` to user model and JWT payload.
