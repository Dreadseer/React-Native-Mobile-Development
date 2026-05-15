# 🤖 AI_FEATURE — Order History Page

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01–06 must be complete before starting this one.
> This document describes only the Order History Page feature.

---

## Feature Identity

- **Feature Name:** Order History Page
- **Related Area:** Mobile — UI / API Integration

---

## Feature Goal

Replace the Order History placeholder screen with a fully functional page that fetches and displays the customer's past orders in a structured table. Each row shows the restaurant name, order status, and a view button. Tapping the view button opens the Order History Detail Modal (built in Feature 08). The screen must match the wireframe layout and color scheme exactly.

---

## Feature Scope

### In Scope (Included)

- Fetch all past orders for the logged-in customer from the API
- Display orders in a structured table with three columns: ORDER, STATUS, VIEW
- Each row shows the restaurant name, order status, and a magnifier icon button
- Tapping the magnifier icon opens the Order History Detail Modal for that order
- Loading state while the API call is in progress
- Empty state if the customer has no orders
- Token and customer ID read from AsyncStorage on mount
- Screen matches the wireframe layout exactly

### Out of Scope (Excluded)

- The Order History Detail Modal itself (covered in `order-history-modal.feature.md`)
- Filtering or sorting orders
- Pagination
- Deleting or cancelling orders
- Any modification to the Spring Boot API

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Data Fetch on Load:** On screen mount, read `token` and `customer` from AsyncStorage. Parse `customer` JSON to get `customerId`. Call `getCustomerOrders(customerId, token)` from `services/api.ts`. Show a loading indicator while fetching.
- **R2 — Table Header Row:** Render a styled header row with three column labels: `ORDER`, `STATUS`, `VIEW`. Header row background `#222126`, text white, matching the wireframe.
- **R3 — Order Rows:** Each order renders as a table row with:
  - ORDER column: restaurant name
  - STATUS column: order status (e.g. `PENDING`)
  - VIEW column: a magnifier icon using FontAwesome `faMagnifyingGlass`
- **R4 — View Button:** Tapping the magnifier icon sets the selected order in state and opens the Order History Detail Modal. Pass the selected order to the modal as a prop.
- **R5 — "MY ORDERS" Heading:** The screen displays a "MY ORDERS" heading above the table, matching the wireframe.
- **R6 — Empty State:** If the customer has no orders, display a simple message: "No orders yet."
- **R7 — Token Check:** If `token` is null on mount, call `router.replace('/')` immediately.
- **R8 — Modal Placeholder:** Wire up `selectedOrder` state and `isModalVisible` state. Render a placeholder `<Modal>` for now — the full modal UI is Feature 08. Make sure the open/close mechanism is in place so Feature 08 can slot in cleanly.

---

## User Flow / Logic (High Level)

1. User taps Order History tab → screen mounts
2. Token and customer ID read from AsyncStorage
3. `getCustomerOrders(customerId, token)` called → loading indicator shown
4. Orders render as table rows
5. User taps magnifier icon on a row → `selectedOrder` set to that order → modal opens
6. Modal closes → `selectedOrder` cleared → back to the table

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create or Modify

| File | Action | Purpose |
|---|---|---|
| `app/customer/order-history/index.tsx` | Modify | Replace placeholder with full Order History UI |
| `services/api.ts` | Modify | Add `getCustomerOrders(customerId, token)` function |

### Backend / API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/customers/:id/orders` | Bearer token | Fetch all orders for the logged-in customer |

> The exact endpoint path may vary from the Module 12 implementation.
> Confirm the correct path and log the response shape before building the UI.

---

## Data Used or Modified

**Read from AsyncStorage:**
- `'token'` — Bearer token for the API request
- `'customer'` — parsed JSON to get `customer.id`

**Order object shape (expected from API):**
```
{
  id: number,
  restaurant_name: string,
  status: string,         // e.g. 'PENDING'
  created_at: string,
  courier_name: string | null,
  products: [
    { name: string, quantity: number, unit_price: number }
  ]
}
```

> The actual shape depends on the Module 12 API. Log the response and adjust accordingly.

**Local state:**
```
orders: Order[]
selectedOrder: Order | null
isModalVisible: boolean
isLoading: boolean
error: string | null
```

---

## Tech Constraints (Feature-Level)

- Use a `ScrollView` wrapping manually rendered rows — not `FlatList` — so the table layout stays consistent and aligned
- Table columns must use fixed or proportional widths so ORDER, STATUS, and VIEW stay aligned across all rows
- Do not use any third-party table library
- FontAwesome `faMagnifyingGlass` for the VIEW column icon
- Token check: if null, `router.replace('/')` immediately
- Base URL uses `process.env.EXPO_PUBLIC_NGROK_URL` via `services/api.ts`

### Wireframe Layout Reference

```
[  HEADER  ]

MY ORDERS                        ← screen heading

┌──────────────┬──────────┬──────┐
│ ORDER        │ STATUS   │ VIEW │  ← header row: bg #222126, white text
├──────────────┼──────────┼──────┤
│ Sweet Dragon │ PENDING  │  🔍  │
├──────────────┼──────────┼──────┤
│ Spice BBQ    │ PENDING  │  🔍  │
├──────────────┼──────────┼──────┤
│ Golden Bar   │ PENDING  │  🔍  │
└──────────────┴──────────┴──────┘

[  FOOTER TAB BAR — Order History tab active  ]

Column widths (approximate):
- ORDER: flex 2 (widest — restaurant names can be long)
- STATUS: flex 1
- VIEW: fixed ~50px, centered
```

---

## Acceptance Criteria

- [ ] Screen fetches customer orders on mount using bearer token
- [ ] "MY ORDERS" heading is displayed above the table
- [ ] Table header row shows ORDER, STATUS, VIEW with dark background and white text
- [ ] Each order row shows restaurant name, status, and magnifier icon
- [ ] Tapping the magnifier icon sets `selectedOrder` and opens the modal
- [ ] Empty state message shown if no orders exist
- [ ] Loading indicator shown while fetching
- [ ] Token read from AsyncStorage — missing token redirects to Login
- [ ] Customer ID read from AsyncStorage `'customer'` object
- [ ] Modal placeholder is wired up and toggles correctly
- [ ] Header and footer are visible (inherited from layout)
- [ ] Order History tab is the active tab on this screen

---

## Notes for the AI

- The `getCustomerOrders` function needs the customer ID in the URL path. Parse it from the stored customer object: `const customer = JSON.parse(await AsyncStorage.getItem('customer')); const customerId = customer.id`.
- Log the raw API response with `console.log('Orders response:', JSON.stringify(data, null, 2))` before building the UI so the actual field names are confirmed. The Module 12 API response shape varies — `restaurant_name` might be `restaurantName` (camelCase) or nested inside a `restaurant` object.
- For the table layout, use a consistent row component pattern:
  ```tsx
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <Text style={{ flex: 2 }}>{order.restaurant_name}</Text>
    <Text style={{ flex: 1 }}>{order.status}</Text>
    <TouchableOpacity style={{ width: 50, alignItems: 'center' }}>
      <FontAwesomeIcon icon={faMagnifyingGlass} />
    </TouchableOpacity>
  </View>
  ```
- Alternate row background colors (white / very light grey `#F9F9F9`) can be added for readability but are not required by the wireframe — keep it simple if in doubt.
- The modal placeholder should just be `<Modal visible={isModalVisible} transparent><View /></Modal>` — Feature 08 will replace it with the full UI.
