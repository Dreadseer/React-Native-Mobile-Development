# 🤖 AI_FEATURE — Role-Based Navigation (Module 14)

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Feature 01 (Navigation Structure) must be complete before starting this one.
> This document describes only the Role-Based Navigation feature.

---

## Feature Identity

- **Feature Name:** Role-Based Navigation
- **Related Area:** Mobile — Authentication / Conditional Routing

---

## Feature Goal

After a successful login, the app determines which role(s) the user has and routes them to the correct section automatically. Users with only a customer account go directly to the customer area. Users with only a courier account go directly to the courier area. Users with both accounts see the Account Selection screen where they choose which experience to enter for the session. The Account Selection screen must match the wireframe exactly.

---

## Feature Scope

### In Scope (Included)

- Update the login flow in `app/index.tsx` to check the API response for customer and courier role data
- Route to `/customer`, `/courier`, or `/selection` based on which roles the user has
- Store role-relevant data in AsyncStorage (`customer`, `courier`, `role`)
- Build the full Account Selection screen UI in `app/selection.tsx`
- Selecting Customer on the selection screen navigates to `/customer` and stores `role: 'customer'`
- Selecting Courier on the selection screen navigates to `/courier` and stores `role: 'courier'`
- Update `services/api.ts` login function to use the correct endpoint `/api/auth`

### Out of Scope (Excluded)

- Registering new accounts or switching roles mid-session
- Persisting role selection between app restarts (role is chosen fresh each login)
- Any courier or customer screen content (handled in later features)
- Logout from the selection screen (user hasn't entered an app yet)

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Login Endpoint Update:** The login function in `services/api.ts` uses `POST /api/auth`. The request body is `{ email, password }`. Add `console.log('=== AUTH RESPONSE ===', JSON.stringify(data, null, 2))` before returning so the response shape is visible in the Metro terminal on first login.
- **R2 — Role Detection:** The `/api/auth` response is a flat object — it does NOT return nested customer/courier objects. Role presence is determined by checking whether `customer_id` and `courier_id` are non-null. See confirmed response shape below.
- **R3 — AsyncStorage Update:** Store the following on successful login:
  - `'token'` — value of `data.accessToken`
  - `'user'` — `JSON.stringify({ id: data.user_id, email })` where `email` is from the login form
  - `'customer'` — `JSON.stringify({ id: data.customer_id })` or `JSON.stringify(null)` if `customer_id` is null
  - `'courier'` — `JSON.stringify({ id: data.courier_id })` or `JSON.stringify(null)` if `courier_id` is null
- **R4 — Routing Logic:** After storing data, apply this logic:
  - Has customer AND courier → `router.replace('/selection')`
  - Has customer only → store `role: 'customer'` → `router.replace('/customer')`
  - Has courier only → store `role: 'courier'` → `router.replace('/courier')`
- **R5 — Account Selection Screen:** Replace the `app/selection.tsx` placeholder with the full UI. See confirmed implementation details below.
- **R6 — Selection Navigation:** Tapping Customer card → `AsyncStorage.setItem('role', 'customer')` → `router.replace('/customer')`. Tapping Courier card → `AsyncStorage.setItem('role', 'courier')` → `router.replace('/courier')`.
- **R7 — No Back Navigation:** All post-login navigation uses `router.replace` — not `router.push` — so the user cannot press back to reach the login screen while authenticated.

---

## Confirmed API Response Shape

> This was verified by logging the `/api/auth` response in the Metro terminal during implementation.
> Do not guess or assume nested objects — the response is flat.

```json
{
  "accessToken": "eyJhbGci...",
  "success": true,
  "user_id": 1,
  "customer_id": 1,
  "courier_id": 23
}
```

**Field mapping:**
| Response field | Used as |
|---|---|
| `accessToken` | JWT — stored under `'token'` key in AsyncStorage |
| `user_id` | Stored as `{ id: data.user_id }` under `'user'` key |
| `customer_id` | Non-null = user has customer role. Stored as `{ id: data.customer_id }` |
| `courier_id` | Non-null = user has courier role. Stored as `{ id: data.courier_id }` |

**Role detection:**
```ts
const hasCustomer = data.customer_id != null;
const hasCourier = data.courier_id != null;
```

---

## User Flow / Logic (High Level)

**Scenario 1 — Customer only:**
Login → `customer_id` non-null, `courier_id` null → store token + customer → `router.replace('/customer')`

**Scenario 2 — Courier only:**
Login → `courier_id` non-null, `customer_id` null → store token + courier → `router.replace('/courier')`

**Scenario 3 — Both roles:**
Login → both non-null → store token + customer + courier → `router.replace('/selection')` → user taps Customer or Courier card → store role → `router.replace('/customer')` or `router.replace('/courier')`

---

## Interfaces (Pages, Endpoints, Screens)

### Files Modified

| File | Change |
|---|---|
| `services/api.ts` | Added console log of full auth response before returning |
| `app/index.tsx` | Updated post-login logic for role detection, AsyncStorage writes, and branching routing |
| `app/selection.tsx` | Replaced placeholder with full Account Selection UI |

### Backend / API

| Method | Endpoint | Body | Purpose |
|---|---|---|---|
| POST | `/api/auth` | `{ email, password }` | Login — returns flat object with accessToken, user_id, customer_id, courier_id |

---

## Data Used or Modified

**AsyncStorage keys written on login:**

| Key | Value |
|---|---|
| `'token'` | `data.accessToken` (JWT string) |
| `'user'` | `JSON.stringify({ id: data.user_id, email })` |
| `'customer'` | `JSON.stringify({ id: data.customer_id })` or `JSON.stringify(null)` |
| `'courier'` | `JSON.stringify({ id: data.courier_id })` or `JSON.stringify(null)` |
| `'role'` | `'customer'` or `'courier'` — written at routing time, not at login |

---

## Tech Constraints (Feature-Level)

- Login endpoint is `POST /api/auth` — not `/api/customers/login`
- All post-login navigation uses `router.replace` — never `router.push`
- The selection screen has a white `#FFFFFF` background — consistent with all other screens
- No Header component on the selection screen — it's a transition screen, not a content screen
- `role` is stored in AsyncStorage at the point of routing (login or card tap), not at initial login
- The auth response is flat — there are no nested `customer` or `courier` objects, only IDs

---

## Confirmed Account Selection Screen Implementation

### Layout

- White `#FFFFFF` background, no Header, no tab bar
- Logo (`assets/images/logo2.png`) anchored near the top with `paddingTop: 80`
- Logo dimensions: `width: 220, height: 100`
- Heading + cards wrapped in a `flex: 1` container with `justifyContent: 'center'` and `paddingBottom: 240` to visually center the group between the logo and bottom of screen
- "Select Account Type" heading: `Fonts.heading` (Oswald 700), `fontSize: 24`, color `#222126`
- Cards: `flexDirection: 'row'`, full width, `gap: 16`, equal width via `flex: 1` on each card

### Icons

| Card | Icon | Size | Color |
|---|---|---|---|
| Customer | `faUser` from `@fortawesome/free-solid-svg-icons` | 160 | `#DA583B` |
| Courier | `faTaxi` from `@fortawesome/free-solid-svg-icons/faTaxi` | 160 | `#222126` |

### Card Style

```ts
card: {
  flex: 1,
  backgroundColor: '#FFFFFF',
  borderRadius: 12,
  paddingVertical: 36,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.12,
  shadowRadius: 8,
  elevation: 4,
}
```

### Wireframe Layout Reference

```
Background: #FFFFFF

[  logo2.png — top, paddingTop: 80  ]

         ↕ flex: 1 center zone (paddingBottom: 240)

  "Select Account Type"  ← Oswald, #222126, centered

┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │
│  faUser (160)   │  │  faTaxi (160)   │
│   #DA583B       │  │   #222126       │
│                 │  │                 │
│   Customer      │  │    Courier      │
└─────────────────┘  └─────────────────┘
```

---

## Acceptance Criteria

- [x] Login calls `POST /api/auth`
- [x] Full `/api/auth` response is logged to Metro terminal on login
- [x] Customer-only user is routed directly to `/customer` after login
- [x] Courier-only user is routed directly to `/courier` after login
- [x] Dual-role user is routed to `/selection` after login
- [x] Account Selection screen has white background, logo, heading, two cards
- [x] Tapping Customer card navigates to `/customer` and stores `role: 'customer'`
- [x] Tapping Courier card navigates to `/courier` and stores `role: 'courier'`
- [x] All post-login navigation uses `router.replace` — back button does not return to Login
- [x] Token, user, customer, and courier data are stored correctly in AsyncStorage
- [x] Selection screen has no Header or footer tab bar

---

## Notes for the AI

- The `/api/auth` response is flat — `customer_id` and `courier_id` are top-level fields, not nested objects. Use `data.customer_id != null` for role detection, not `!!data.customer`.
- The token field is `accessToken`, not `token`. This differs from what many APIs use — do not assume `data.token`.
- There is no `user` object in the response — only `user_id`. Build the user object manually: `{ id: data.user_id, email }`.
- The courier icon is `faTaxi` (imported from `@fortawesome/free-solid-svg-icons/faTaxi`), not `faCar`.
- The logo on the selection screen is `logo2.png`, not `logo.png`. Both files must exist in `assets/images/` — Metro cannot bundle assets from outside the `client/` project folder.
- The `paddingBottom: 240` on the middle container is intentional — it offsets the flex centering point upward so the cards appear visually centered on the screen rather than sitting in the lower half.
- Keep the selection screen self-contained with its own styles — no shared layout wraps it.
