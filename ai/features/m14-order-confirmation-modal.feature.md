# 🤖 AI_FEATURE — Order Confirmation Modal Update (Module 14)

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01–04 must be complete before starting this one.
> This document describes only the Order Confirmation Modal updates for Module 14.

---

## Feature Identity

- **Feature Name:** Order Confirmation Modal Update
- **Related Area:** Mobile — Customer UI / API Integration

---

## Feature Goal

Extend the existing Order Confirmation Modal from Module 13 with SMS and email notification opt-in checkboxes. When the customer confirms an order, two boolean fields — `sendSMS` and `sendEmail` — are included in the POST payload based on the checkbox state. The notification is only sent if the order creation is successful. The modal UI must match the Module 14 wireframe exactly.

---

## Feature Scope

### In Scope (Included)

- Add two checkboxes to the existing `OrderConfirmationModal` — "By Email" and "By Phone"
- Add `sendEmail` and `sendSMS` boolean state to the modal
- Include `sendEmail` and `sendSMS` in the `POST /api/orders` payload
- Add explanatory text above the checkboxes: "Would you like to receive your order confirmation by email and/or text?"
- Checkboxes are visible in the idle state only — hidden during processing, success, and failure
- The rest of the modal behavior is unchanged from Module 13

### Out of Scope (Excluded)

- Actually sending SMS or email from the app — the Spring Boot API handles that
- Twilio or Notify.EU integration (Extra Miles only)
- Any changes to the courier section
- Any changes to the order history modal

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Checkbox State:** Add two boolean state values to `OrderConfirmationModal.tsx`: `sendEmail` (default `false`) and `sendSMS` (default `false`). Reset both to `false` when the modal closes (inside `handleClose`).
- **R2 — Checkbox UI:** Render two checkboxes below the order total and above the CONFIRM ORDER button. Use React Native's `CheckBox` from `@react-native-community/checkbox` or a custom `TouchableOpacity` checkbox implementation if the community package is unavailable. Each checkbox has a label: "By Email" and "By Phone".
- **R3 — Explanatory Text:** Above the two checkboxes, render: "Would you like to receive your order confirmation by email and/or text?" in body text style, centered or left-aligned matching the wireframe.
- **R4 — Payload Update:** In the `createOrder` call inside the modal, add `sendSMS` and `sendEmail` to the payload:
  ```json
  {
    "customer_id": number,
    "restaurant_id": number,
    "products": [...],
    "sendSMS": boolean,
    "sendEmail": boolean
  }
  ```
- **R5 — Visibility:** The notification section (explanatory text + checkboxes) is only visible when `orderStatus === 'idle'`. Hide it during processing, success, and failure states — same as the CONFIRM ORDER button.
- **R6 — Close Handler Reset:** When the modal closes via `handleClose`, reset `sendEmail` and `sendSMS` back to `false` along with `orderStatus` back to `'idle'`.
- **R7 — Close Button Fix (from previous fix prompt):** Confirm the × close button is visible in all states and only disabled during `processing`. If the fix from the previous prompt was not applied, apply it now.

---

## User Flow / Logic (High Level)

1. User taps CREATE ORDER → modal opens in idle state
2. Order summary shown with notification opt-in section below the total
3. User optionally checks "By Email" and/or "By Phone"
4. User taps CONFIRM ORDER → `sendEmail` and `sendSMS` included in POST payload
5. Processing state → notification checkboxes hidden with the button
6. Success/failure state → modal shows result
7. User taps × → modal closes → checkboxes reset to unchecked for next order

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Modify

| File | Action | Purpose |
|---|---|---|
| `components/OrderConfirmationModal.tsx` | Modify | Add checkbox state, UI, and payload fields |

### Backend / API

| Method | Endpoint | Auth | Change |
|---|---|---|---|
| POST | `/api/orders` | Bearer | Add `sendSMS` and `sendEmail` boolean fields to body |

**Updated order payload:**
```json
{
  "customer_id": 24,
  "restaurant_id": 2,
  "products": [
    { "product_id": 10, "quantity": 1 }
  ],
  "sendSMS": false,
  "sendEmail": true
}
```

---

## Data Used or Modified

**New state in `OrderConfirmationModal.tsx`:**
```ts
sendEmail: boolean   // default false
sendSMS: boolean     // default false
```

**Updated `createOrder` payload (in `services/api.ts` or inline in modal):**
- Add `sendSMS` and `sendEmail` to the existing payload object

---

## Tech Constraints (Feature-Level)

- Prefer a custom checkbox implementation using `TouchableOpacity` + FontAwesome icons (`faSquare` unchecked, `faSquareCheck` checked) over `@react-native-community/checkbox` — avoids a native module install that can cause Expo compatibility issues
- Checkbox and explanatory text only render when `orderStatus === 'idle'`
- Field names in the POST body are `sendSMS` and `sendEmail` (camelCase) — confirm with the API if these are correct or if the API expects `send_sms` / `send_email` (snake_case)
- Do not change any other part of the modal — order summary, total, button states, and close button behavior are all unchanged

### Custom Checkbox Pattern (Recommended)

```tsx
import { faSquare, faSquareCheck } from '@fortawesome/free-solid-svg-icons';

// Unchecked
<FontAwesomeIcon icon={faSquare} size={20} color="#222126" />

// Checked
<FontAwesomeIcon icon={faSquareCheck} size={20} color="#DA583B" />

// Usage
<TouchableOpacity
  style={styles.checkboxRow}
  onPress={() => setSendEmail(prev => !prev)}
>
  <FontAwesomeIcon
    icon={sendEmail ? faSquareCheck : faSquare}
    size={20}
    color={sendEmail ? '#DA583B' : '#222126'}
  />
  <Text style={styles.checkboxLabel}>By Email</Text>
</TouchableOpacity>
```

### Wireframe Layout Reference

```
┌─────────────────────────────────────┐
│ Order Confirmation               ×  │
├─────────────────────────────────────┤
│ Order Summary                       │
│ Cauliflower Penne    x1   $ 19.50  │
│ ─────────────────────────────────── │
│                  TOTAL: $ 19.50    │
│                                     │
│ Would you like to receive your      │
│ order confirmation by email         │
│ and/or text?                        │
│                                     │
│ ☐ By Email        ☐ By Phone       │
│                                     │
│ [      CONFIRM ORDER           ]    │
└─────────────────────────────────────┘

Checkboxes side by side, centered or evenly spaced
Checked state: #DA583B checkbox icon
Unchecked state: #222126 outline icon
```

---

## Acceptance Criteria

- [ ] `OrderConfirmationModal.tsx` has `sendEmail` and `sendSMS` boolean state (default false)
- [ ] Explanatory text appears above the checkboxes in idle state
- [ ] "By Email" checkbox toggles `sendEmail` state
- [ ] "By Phone" checkbox toggles `sendSMS` state
- [ ] Checkboxes are hidden during processing, success, and failure states
- [ ] POST `/api/orders` payload includes `sendSMS` and `sendEmail`
- [ ] Both values reset to `false` when modal closes
- [ ] `orderStatus` resets to `'idle'` when modal closes
- [ ] × close button is visible in all states, disabled only during processing
- [ ] Rest of modal behavior unchanged from Module 13

---

## Notes for the AI

- This is a small, focused change — do not refactor the rest of the modal. Touch only what's needed: add two state variables, add the checkbox UI section, update the payload.
- The explanatory text and checkboxes should be wrapped in a container that conditionally renders based on `orderStatus === 'idle'` — same condition as the CONFIRM ORDER button.
- If `faSquareCheck` is not available in the installed version of FontAwesome, use `faCheckSquare` as the alternative import name.
- Confirm the POST body field names with a console log after a successful order — log the full payload before sending: `console.log('=== ORDER PAYLOAD ===', JSON.stringify(payload, null, 2))`. This will confirm whether the API expects `sendSMS`/`sendEmail` or `send_sms`/`send_email`.
- The checkbox row layout: two checkboxes side by side using `flexDirection: 'row'` with `justifyContent: 'space-around'` or `gap`.
