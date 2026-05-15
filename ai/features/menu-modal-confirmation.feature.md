# 🤖 AI_FEATURE — Order Confirmation Modal

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01–05 must be complete before starting this one.
> The modal placeholder and `isModalVisible` state must already exist in `app/customer/restaurant/[id].tsx`.
> This document describes only the Order Confirmation Modal feature.

---

## Feature Identity

- **Feature Name:** Order Confirmation Modal
- **Related Area:** Mobile — UI / API Integration

---

## Feature Goal

Replace the modal placeholder from Feature 05 with a fully functional Order Confirmation Modal. The modal displays an order summary (items, quantities, prices, total), and walks the user through three states: default (confirm), processing (waiting for API), success (order placed), and failure (order failed). On confirm, a POST request creates the order via the API. The modal must match the wireframe for all four states exactly.

---

## Feature Scope

### In Scope (Included)

- `components/OrderConfirmationModal.tsx` — the full modal component
- Order summary table: item name, quantity, unit price per row, total at the bottom
- Currency formatting on all prices: `$ X.XX`
- CONFIRM ORDER button that triggers the POST order request
- Processing state: button disabled, label changes to "PROCESSING ORDER…"
- Success state: CONFIRM ORDER button hidden, green checkmark icon, success message
- Failure state: CONFIRM ORDER button reappears, red X icon, failure message shown below
- POST to `/api/orders` with correct payload built from the quantities state
- Modal close button (×) in the top-right corner — only closeable before confirming or after failure, not during processing
- Integration: replace the placeholder `<Modal>` in `app/customer/restaurant/[id].tsx` with `<OrderConfirmationModal />`

### Out of Scope (Excluded)

- Navigation after success (user closes the modal manually and stays on the menu screen)
- Saving order history locally
- Retry logic beyond re-enabling the CONFIRM ORDER button on failure
- Any modification to the Spring Boot API

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Modal Component:** Create `components/OrderConfirmationModal.tsx`. It receives props from the menu screen and manages its own internal UI state (default / processing / success / failure).
- **R2 — Order Summary Table:** Display only items with quantity > 0. Each row shows item name, `x{quantity}`, and `$ price.toFixed(2)`. A divider line separates the rows from the total. The total row shows `TOTAL: $ X.XX` summed from all included items.
- **R3 — Currency Formatting:** Every price value uses `$ X.XX` format (space between `$` and the number). Use `.toFixed(2)` consistently.
- **R4 — Default State:** Shows the order summary and a full-width CONFIRM ORDER button with background `#DA583B` and white text.
- **R5 — Processing State:** When CONFIRM ORDER is tapped, set state to `processing`. The button becomes disabled and its label changes to "PROCESSING ORDER…". The close button (×) should also be disabled during processing.
- **R6 — API Call:** POST to `/api/orders` with the order payload. Add `createOrder(payload, token)` to `services/api.ts`. The payload shape is defined below.
- **R7 — Success State:** On HTTP 200 response: hide the CONFIRM ORDER button entirely, show a green (`#609475`) FontAwesome `faCircleCheck` icon centered, and the message "Thank you! Your order has been received." No close button needed in success — the user closes by tapping outside or a done button.
- **R8 — Failure State:** On non-200 or network error: show a red FontAwesome `faCircleXmark` icon and the message "Your order was not processed successfully. Please try again." The CONFIRM ORDER button reappears so the user can retry. The close button (×) re-enables.
- **R9 — Modal Header:** Dark header bar (`#222126`) with the text "Order Confirmation" in white and a white × close button on the right, matching the wireframe.
- **R10 — Integration:** In `app/customer/restaurant/[id].tsx`, replace the placeholder `<Modal>` with `<OrderConfirmationModal>`. Pass the required props: `visible`, `onClose`, `products`, `quantities`, `token`, `customerId`.

---

## User Flow / Logic (High Level)

1. User taps CREATE ORDER on the menu screen → `isModalVisible` set to true → modal opens
2. Modal renders order summary — only items with quantity > 0 are listed
3. User reviews the summary and taps CONFIRM ORDER
4. Button disables, label → "PROCESSING ORDER…", close button disables
5. POST `/api/orders` sent with the order payload
6a. **Success (200):** Button disappears → green checkmark + "Thank you!" message shown
6b. **Failure:** Red X + failure message shown → CONFIRM ORDER button reappears → user can retry or close
7. User taps × to close (default or failure state only) → `onClose()` called → modal closes → user is back on the menu screen with quantities still intact

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create or Modify

| File | Action | Purpose |
|---|---|---|
| `components/OrderConfirmationModal.tsx` | Create | Full modal component with all four states |
| `services/api.ts` | Modify | Add `createOrder(payload, token)` function |
| `app/customer/restaurant/[id].tsx` | Modify | Replace placeholder Modal with `<OrderConfirmationModal />` |

### Backend / API

| Method | Endpoint | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/api/orders` | Bearer token | Order payload (see below) | Create a new order |

**Order payload shape:**
```json
{
  "customer_id": number,
  "restaurant_id": number,
  "products": [
    { "product_id": number, "quantity": number },
    { "product_id": number, "quantity": number }
  ]
}
```

> Only include products where `quantity > 0`.
> `customer_id` comes from AsyncStorage `'customer'` (parse the JSON, read the `id` field).
> `restaurant_id` comes from the route param `id` (parse to integer).

---

## Data Used or Modified

**Props received by `OrderConfirmationModal`:**
```tsx
{
  visible: boolean,
  onClose: () => void,
  products: Product[],            // full product list from the menu screen
  quantities: { [id: number]: number },  // from menu screen state
  token: string,
  customerId: number,
  restaurantId: number
}
```

**Internal modal state:**
```
orderStatus: 'idle' | 'processing' | 'success' | 'failure'
```

**Derived inside the modal (not passed as props):**
- `orderedItems` — filter `products` to only those with `quantities[id] > 0`
- `orderTotal` — sum of `price * quantity` for all ordered items

---

## Tech Constraints (Feature-Level)

- Use React Native's built-in `<Modal>` component — do not install a third-party modal library
- `orderStatus` should be a single state string (`'idle' | 'processing' | 'success' | 'failure'`) — not multiple booleans
- The modal background overlay should be semi-transparent dark: `rgba(0, 0, 0, 0.5)`
- Modal card background: white (`#FFFFFF`)
- Modal header background: `#222126`, text white
- Success icon color: `#609475` (Muted Green from the color scheme)
- Failure icon color: red — use `#851919` (Dark Red from the color scheme)
- Do not reset quantities on the menu screen when the modal closes — the user may want to retry
- `customerId` must come from the parsed `'customer'` object in AsyncStorage — read it in `[id].tsx` and pass it as a prop
- Price total: use `products.reduce()` to sum `price * quantity` for all ordered items

### Wireframe Layout Reference

```
┌─────────────────────────────────┐
│ Order Confirmation           ×  │  ← dark header #222126, white text + × button
├─────────────────────────────────┤
│ Order Summary                   │
│                                 │
│ Cheeseburger      x1   $ 0.50  │
│ Scotch Eggs       x1   $ 20.25 │
│ Cauliflower Penne x1   $ 9.00  │
│ ─────────────────────────────── │
│               TOTAL: $ 29.75   │
│                                 │
│  [      CONFIRM ORDER       ]   │  ← #DA583B, white text (idle state)
│  [   PROCESSING ORDER...    ]   │  ← disabled (processing state)
│                                 │
│  ✓  Thank you!                  │  ← #609475 icon (success state, button hidden)
│     Your order has been         │
│     received.                   │
│                                 │
│  ✗  Your order was not          │  ← #851919 icon (failure state)
│     processed successfully.     │
│     Please try again.           │
│  [      CONFIRM ORDER       ]   │  ← button reappears on failure
└─────────────────────────────────┘
```

---

## Acceptance Criteria

- [ ] `components/OrderConfirmationModal.tsx` exists and is integrated into `[id].tsx`
- [ ] Modal opens when CREATE ORDER is tapped on the menu screen
- [ ] Modal header shows "Order Confirmation" with a × close button
- [ ] Only items with quantity > 0 are listed in the summary
- [ ] Each row shows item name, quantity as `x{n}`, and price as `$ X.XX`
- [ ] Total is calculated correctly and shown as `TOTAL: $ X.XX`
- [ ] CONFIRM ORDER button is present and styled correctly in the idle state
- [ ] Tapping CONFIRM ORDER disables the button and shows "PROCESSING ORDER…"
- [ ] × close button is disabled during processing
- [ ] Successful POST shows green checkmark and success message, button hidden
- [ ] Failed POST shows red X icon, failure message, and re-enables CONFIRM ORDER
- [ ] `createOrder` in `services/api.ts` sends the correct payload with only qty > 0 items
- [ ] `customer_id` is read from AsyncStorage `'customer'` and included in the payload
- [ ] Modal overlay is semi-transparent dark background
- [ ] Closing the modal does not reset quantities on the menu screen

---

## Notes for the AI

- The single `orderStatus` string approach is much cleaner than managing `isProcessing`, `isSuccess`, `isError` as separate booleans. Use a `switch` or conditional rendering based on `orderStatus` to show the correct UI.
- `customerId` should be retrieved in `[id].tsx` (not inside the modal) and passed as a prop. Read it from AsyncStorage: `const customer = JSON.parse(await AsyncStorage.getItem('customer')); const customerId = customer.id`.
- The `restaurantId` prop should be `parseInt(id)` where `id` is the route param string — the API expects a number.
- Watch the payload construction — filter `Object.entries(quantities)` to only entries where `value > 0`, then map to `{ product_id: parseInt(key), quantity: value }`.
- After a success, do NOT automatically close the modal or reset quantities. The user reads the confirmation and then dismisses manually. This also means the × close button behavior on success can either be hidden or shown — the wireframe doesn't show it on success, so hide it.
- The × button in the header should call `onClose()` only when `orderStatus` is `'idle'` or `'failure'` — guard it so it does nothing during `'processing'` and is hidden during `'success'`.
