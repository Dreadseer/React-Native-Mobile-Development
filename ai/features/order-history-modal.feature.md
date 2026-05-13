# 🤖 AI_FEATURE — Order History Modal

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01–07 must be complete before starting this one.
> The modal placeholder and `isModalVisible` / `selectedOrder` state must already exist in `app/customer/order-history/index.tsx`.
> This document describes only the Order History Detail Modal feature.

---

## Feature Identity

- **Feature Name:** Order History Modal
- **Related Area:** Mobile — UI Component

---

## Feature Goal

Replace the Order History modal placeholder with a fully functional detail modal that displays complete information about a selected past order. The modal shows the order date, status, courier name, a line-item breakdown of products with quantities and prices, and a total. It must match the wireframe layout and color scheme exactly.

---

## Feature Scope

### In Scope (Included)

- `components/OrderHistoryModal.tsx` — the full modal component
- Display: restaurant name, order date, status, courier name
- Display: product line items with name, quantity, unit price
- Display: order total calculated from line items
- Close button (×) in the modal header
- Integration: replace the placeholder `<Modal>` in `app/customer/order-history/index.tsx` with `<OrderHistoryModal />`

### Out of Scope (Excluded)

- Re-ordering from history
- Cancelling or modifying past orders
- Sharing or exporting order details
- Any API call — all data is passed in via props from the order history screen
- Any modification to the Spring Boot API

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Modal Component:** Create `components/OrderHistoryModal.tsx`. Receives the selected order as a prop and renders all its details. No internal API calls — data comes entirely from props.
- **R2 — Modal Header:** Dark header bar (`#222126`) with the restaurant name in orange (`#DA583B`) on the left and a white × close button on the right, matching the wireframe.
- **R3 — Order Meta:** Below the header, display three lines:
  - `Order Date: {formatted date}`
  - `Status: {status}`
  - `Courier: {courier_name or 'Not assigned'}`
- **R4 — Product Line Items:** A table-style list showing each product with name, quantity as `x{n}`, and unit price as `$ X.XX`. Match the wireframe layout with name on the left, quantity and price on the right.
- **R5 — Divider and Total:** A horizontal divider line separating the items from the total row. Total row shows `TOTAL: $ X.XX` right-aligned, calculated by summing `unit_price * quantity` for all products.
- **R6 — Currency Formatting:** All prices use `$ X.XX` format with `.toFixed(2)`.
- **R7 — Date Formatting:** The `created_at` date from the API should be formatted as a readable string. Use JavaScript's `new Date(order.created_at).toLocaleDateString()` — no external date library needed.
- **R8 — Close Button:** Tapping × calls `onClose()` from props. The modal closes and `selectedOrder` is cleared in the parent screen.
- **R9 — Integration:** In `app/customer/order-history/index.tsx`, replace the placeholder `<Modal>` with `<OrderHistoryModal>`. Pass the required props: `visible`, `onClose`, `order`.

---

## User Flow / Logic (High Level)

1. User taps the magnifier icon on an order row → `selectedOrder` set → `isModalVisible` true → modal opens
2. Modal renders all details from the `selectedOrder` object
3. User taps × → `onClose()` called → `isModalVisible` false → `selectedOrder` null → modal closes
4. User is back on the Order History table

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create or Modify

| File | Action | Purpose |
|---|---|---|
| `components/OrderHistoryModal.tsx` | Create | Full order detail modal component |
| `app/customer/order-history/index.tsx` | Modify | Replace placeholder Modal with `<OrderHistoryModal />` |

### Backend / API

None — all data is already in the `selectedOrder` object passed as a prop. No additional API calls needed.

---

## Data Used or Modified

**Props received by `OrderHistoryModal`:**
```tsx
{
  visible: boolean,
  onClose: () => void,
  order: Order | null     // the full order object from the history list
}
```

**Order object shape (as confirmed from Feature 07 API response):**
```
{
  id: number,
  restaurant_name: string,
  status: string,
  created_at: string,
  courier_name: string | null,
  products: [
    {
      name: string,
      quantity: number,
      unit_price: number
    }
  ]
}
```

> Use the actual field names confirmed from the Feature 07 console log — adjust if the API
> uses camelCase or nesting differently.

**Derived inside the modal:**
- `orderTotal` — `order.products.reduce((sum, p) => sum + p.unit_price * p.quantity, 0)`
- `formattedDate` — `new Date(order.created_at).toLocaleDateString()`

---

## Tech Constraints (Feature-Level)

- Use React Native's built-in `<Modal>` component — no third-party modal library
- No additional API calls inside this component — purely presentational
- Modal overlay: `transparent={true}` with semi-transparent dark background `rgba(0, 0, 0, 0.5)`
- Modal card background: `#FFFFFF`
- Modal header background: `#222126`
- Restaurant name in header: `#DA583B`
- Guard against `order` being null — render nothing or return null if `order` is null
- Use `ScrollView` inside the modal body in case the product list is long
- No external date or currency formatting libraries

### Wireframe Layout Reference

```
┌─────────────────────────────────────┐
│ Sweet Dragon                     ×  │  ← header: #222126 bg, name in #DA583B, × white
├─────────────────────────────────────┤
│ Order Date: 05/12/2026              │
│ Status: PENDING                     │
│ Courier:                            │
│                                     │
│ Cheeseburger      x1      $ 0.50   │
│ Scotch Eggs       x1      $ 20.25  │
│ ─────────────────────────────────── │
│                  TOTAL: $ 20.75    │
└─────────────────────────────────────┘

Modal card: white, rounded corners, centered on screen
Overlay: rgba(0,0,0,0.5)
```

---

## Acceptance Criteria

- [ ] `components/OrderHistoryModal.tsx` exists and renders without errors
- [ ] Modal opens when magnifier icon is tapped on the Order History screen
- [ ] Modal header shows restaurant name in `#DA583B` and × close button in white on `#222126` background
- [ ] Order date is displayed in a readable format
- [ ] Status is displayed correctly
- [ ] Courier name is displayed (or "Not assigned" if null)
- [ ] All products with quantity > 0 are listed with name, `x{qty}`, and `$ X.XX` price
- [ ] A divider separates the items from the total
- [ ] Total is calculated correctly and shown as `TOTAL: $ X.XX`
- [ ] All prices use `$ X.XX` format with `.toFixed(2)`
- [ ] Tapping × calls `onClose()` and closes the modal
- [ ] `selectedOrder` is cleared when modal closes
- [ ] Modal handles a null `order` prop gracefully without crashing
- [ ] Modal overlay is semi-transparent dark
- [ ] Modal body scrolls if the product list is long

---

## Notes for the AI

- Guard the entire render with `if (!order) return null` at the top of the component — the modal might briefly receive a null order while closing and this prevents a crash.
- The product field names in the order history response may differ from what's listed above — use whatever field names were confirmed in the Feature 07 console log (`name`, `product_name`, `unit_price`, `price`, etc.).
- Keep this component purely presentational — no `useState` needed except potentially for nothing at all. All data flows in through props.
- The × button behavior is simple — just call `onClose()`. No internal state change needed inside the modal itself.
- `ScrollView` inside the modal body ensures long product lists don't overflow the modal card on smaller screens.
