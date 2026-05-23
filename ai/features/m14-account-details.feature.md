# 🤖 AI_FEATURE — Account Details (Module 14)

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01, 02, and 03 must be complete before starting this one.
> This document describes only the Account Details feature for both customer and courier roles.

---

## Feature Identity

- **Feature Name:** Account Details
- **Related Area:** Mobile — UI / API Integration (Customer + Courier)

---

## Feature Goal

Build a shared Account screen that works for both the customer and courier roles. Both screens display the same three fields — primary email (read-only), role-type email (editable), and role-type phone (editable) — but fetch and update data using the logged-in user's ID and role type. A single shared `AccountScreen` component handles the UI for both roles, keeping code DRY. Tapping UPDATE ACCOUNT saves changes to the API. The screen must match the wireframe for both customer and courier layouts.

---

## Feature Scope

### In Scope (Included)

- `components/AccountScreen.tsx` — shared component used by both customer and courier account screens
- `app/customer/account/index.tsx` — customer account screen (passes `type='customer'`)
- `app/courier/account/index.tsx` — courier account screen (passes `type='courier'`)
- `GET /api/account/{id}` — fetch account details on mount
- `PUT /api/account/{id}?type={user_type}` — save updated email and phone
- Primary email field is read-only — cannot be edited
- Role-type email and phone fields are editable `TextInput` components
- UPDATE ACCOUNT button — disabled while saving, shows loading state
- Success and error feedback after save attempt
- Token and user ID read from AsyncStorage on mount

### Out of Scope (Excluded)

- Changing the primary login email or password
- Profile photo or avatar
- Deleting the account
- Any modification to the Spring Boot API

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Shared Component:** Create `components/AccountScreen.tsx`. It accepts `type` prop (`'customer'` | `'courier'`) and `userId` prop. It handles all state, API calls, and rendering internally. Both `app/customer/account/index.tsx` and `app/courier/account/index.tsx` simply read from AsyncStorage and render `<AccountScreen type="customer" userId={id} />` or `<AccountScreen type="courier" userId={id} />`.
- **R2 — Fetch Account Data:** On mount, call `GET /api/account/{userId}` with Bearer token. Add a console log of the full response before building the UI — field names must be confirmed. Store `primaryEmail`, `typeEmail`, and `typePhone` in state.
- **R3 — Field Display:** Three fields matching the wireframe:
  - **Primary Email (Read Only)** — label, read-only `TextInput` with grey background, helper text: "Email used to log in to the application."
  - **Customer/Courier Email** — label shows role-specific name, editable `TextInput`, helper text: "Email used for your {role} account."
  - **Customer/Courier Phone** — label shows role-specific name, editable `TextInput`, helper text: "Phone number for your {role} account."
- **R4 — Role-Specific Labels:** The label text changes based on the `type` prop:
  - `type='customer'` → "Customer Email", "Customer Phone"
  - `type='courier'` → "Courier Email", "Courier Phone"
- **R5 — "Logged In As" Label:** Below the "MY ACCOUNT" heading, display: "Logged In As: Customer" or "Logged In As: Courier" based on the `type` prop.
- **R6 — UPDATE ACCOUNT Button:** Full-width button, background `#DA583B`, white text. On tap: validate fields are non-empty, disable button, call `PUT /api/account/{userId}?type={type}` with updated email and phone. Re-enable on success or failure. Show brief success/error message.
- **R7 — Add to `services/api.ts`:** Add `getAccountDetails(userId, token)` and `updateAccountDetails(userId, type, email, phone, token)` functions.
- **R8 — Token and User ID:** Both wrapper screens read `token` from AsyncStorage and `user` from AsyncStorage (parse JSON → `.id`). If token is null, `router.replace('/')`.

---

## User Flow / Logic (High Level)

1. User taps Account tab → screen mounts
2. Token and user ID read from AsyncStorage
3. `GET /api/account/{userId}` called → fields populated
4. User edits role-type email and/or phone
5. User taps UPDATE ACCOUNT → button disables → `PUT /api/account/{userId}?type={type}` sent
6. On success → success message shown → button re-enables
7. On failure → error message shown → button re-enables

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create or Modify

| File | Action | Purpose |
|---|---|---|
| `components/AccountScreen.tsx` | Create | Shared account UI component for both roles |
| `app/customer/account/index.tsx` | Modify | Replace placeholder — renders `<AccountScreen type="customer" />` |
| `app/courier/account/index.tsx` | Modify | Replace placeholder — renders `<AccountScreen type="courier" />` |
| `services/api.ts` | Modify | Add `getAccountDetails` and `updateAccountDetails` |

### Backend / API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/account/{id}` | Bearer | Fetch account details — no `?type` param on GET |
| PUT | `/api/account/{id}?type=customer` | Bearer | Update customer email + phone |
| PUT | `/api/account/{id}?type=courier` | Bearer | Update courier email + phone |

**PUT request body:**
```json
{
  "email": "updated@email.com",
  "phone": "555-123-4567"
}
```

> Field names in the PUT body must be confirmed from the API response log.
> The GET response field names will determine what keys to send in the PUT body.

---

## Data Used or Modified

**Read from AsyncStorage:**
- `'token'` — Bearer token
- `'user'` — parsed JSON → `{ id, email }` → use `.id` as `userId`

**Account response shape (to be confirmed from console log):**
```
{
  user_email: string,      // primary login email — read-only
  type_email: string,      // customer or courier email — editable
  type_phone: string       // customer or courier phone — editable
}
```

> Log the actual response and adjust field names if they differ from the above assumption.

**Local state (inside `AccountScreen.tsx`):**
```ts
primaryEmail: string
typeEmail: string
typePhone: string
isLoading: boolean
isSaving: boolean
successMessage: string
errorMessage: string
```

---

## Tech Constraints (Feature-Level)

- `AccountScreen.tsx` must be a **shared component** — do not build two separate account components
- Primary email `TextInput` uses `editable={false}` and a visually distinct style (grey background `#F0F0F0`)
- All `TextInput` components use `autoCapitalize="none"` and `keyboardType` appropriate to the field
- Phone field uses `keyboardType="phone-pad"`
- Email fields use `keyboardType="email-address"`
- UPDATE ACCOUNT button uses `disabled={isSaving}` with reduced opacity during save
- Base URL: `process.env.EXPO_PUBLIC_NGROK_URL`
- All API calls through `services/api.ts`

### Wireframe Layout Reference

```
[  HEADER  ]

MY ACCOUNT                     ← Oswald heading
Logged In As: Customer         ← body text, role-specific

Primary Email (Read Only)      ← label
[ erica.ger@gmail.com      ]   ← grey bg, editable={false}
Email used to log in...        ← helper text

Customer Email:                ← label (or "Courier Email:" for courier)
[ miguelina@adams.org      ]   ← editable TextInput
Email used for your Customer account.

Customer Phone:                ← label (or "Courier Phone:" for courier)
[ 817-268-8862             ]   ← editable TextInput
Phone number for your Customer account.

[      UPDATE ACCOUNT      ]   ← #DA583B button, full width

[  FOOTER TAB BAR  ]
```

---

## Acceptance Criteria

- [ ] `components/AccountScreen.tsx` exists and is used by both customer and courier screens
- [ ] Both wrapper screens read token and user ID from AsyncStorage and pass to `AccountScreen`
- [ ] GET `/api/account/{id}` is called on mount and populates all three fields
- [ ] Full GET response is logged to Metro terminal — field names confirmed
- [ ] Primary email field is read-only with grey background
- [ ] Role-type email field is editable
- [ ] Role-type phone field is editable
- [ ] Labels show "Customer Email / Phone" for customer, "Courier Email / Phone" for courier
- [ ] "Logged In As: Customer/Courier" shown below heading
- [ ] Tapping UPDATE ACCOUNT calls PUT with correct `?type` query param
- [ ] Button disables and shows loading state during save
- [ ] Success message shown after successful save
- [ ] Error message shown after failed save
- [ ] Missing token redirects to Login
- [ ] `services/api.ts` has `getAccountDetails` and `updateAccountDetails`

---

## Notes for the AI

- The `AccountScreen` component receives `type` and `userId` as props — it does NOT read from AsyncStorage itself. AsyncStorage reads happen in the wrapper screens (`app/customer/account/index.tsx` and `app/courier/account/index.tsx`) and are passed down as props. This keeps the shared component pure and testable.
- Log the full GET `/api/account/{id}` response before building the form — the field names `user_email`, `type_email`, `type_phone` are assumptions. The actual field names from the API may differ.
- The PUT body field names should match whatever the GET response returns for the editable fields — if GET returns `type_email`, the PUT body likely expects `email` or `type_email`. Confirm from the log.
- The `type` prop value sent in the PUT query param must be lowercase: `?type=customer` or `?type=courier`.
- Keep the `AccountScreen` styles self-contained with a `StyleSheet` at the bottom of the component file.
- The success/error message can be a simple `<Text>` that renders conditionally below the UPDATE ACCOUNT button — no modal or alert needed.
