# 🤖 AI_FEATURE — Courier Delivery (Module 14)

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01 and 02 must be complete before starting this one.
> This document describes only the Courier Delivery feature.

---

## Feature Identity

- **Feature Name:** Courier Delivery
- **Related Area:** Mobile — Courier UI / API Integration

---

## Feature Goal

Replace the Courier Deliveries placeholder screen with a fully functional delivery management screen. Couriers see all PENDING orders (from any customer) plus their own IN PROGRESS and DELIVERED orders in a single table. Each row has a colored status button that advances the order through PENDING → IN PROGRESS → DELIVERED when tapped, and a VIEW button that opens the Delivery Details Modal showing the full order breakdown. Once DELIVERED, the status is permanently locked.

---

## Feature Scope

### In Scope (Included)

- Fetch all PENDING orders via `GET /api/orders/pending`
- Fetch courier's own IN PROGRESS and DELIVERED orders via `GET /api/orders?type=courier&id={courierId}`
- Merge and display both sets in a single table
- Table columns: ORDER ID, ADDRESS, STATUS (button), VIEW (magnifier icon)
- Status button color: red for PENDING, orange for IN PROGRESS, green for DELIVERED
- Tapping status button advances order to next status via `POST /api/order/{id}/status`
- DELIVERED status is locked — button is disabled and cannot be tapped
- Tapping VIEW opens the Delivery Details Modal for that order
- `components/DeliveryDetailsModal.tsx` — full delivery detail modal
- Loading state while fetching, error state if fetch fails
- Token and courier ID read from AsyncStorage on mount

### Out of Scope (Excluded)

- Filtering or sorting the delivery table
- Couriers seeing other couriers' IN PROGRESS or DELIVERED orders
- Real-time updates / auto-refresh
- Fetching `/api/order-statuses` — not needed (see confirmed implementation notes)
- Any modification to the Spring Boot API

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Fetch Deliveries:** On mount, make two parallel API calls using `Promise.all`:
  - `GET /api/orders/pending` — all pending orders (any courier can see these)
  - `GET /api/orders?type=courier&id={courierId}` — this courier's IN PROGRESS + DELIVERED orders
  - Normalize all status strings to uppercase after fetch
  - Merge both arrays, filter courier orders to exclude PENDING (avoids duplicates)
- **R2 — Table Layout:** `ScrollView` with manually rendered rows. Four columns: ORDER ID (narrow), ADDRESS (flex, widest), STATUS (fixed width button), VIEW (fixed width icon). Header row background `#222126`, white text.
- **R3 — Status Button:** Each row's status column is a `TouchableOpacity` button showing the current status text. Colors:
  - PENDING → `#851919` (Dark Red)
  - IN PROGRESS → `#DA583B` (Orange Red)
  - DELIVERED → `#609475` (Muted Green)
  - DELIVERED button is `disabled={true}` with no opacity change — it stays green but is not tappable
- **R4 — Status Advancement:** Tapping a non-DELIVERED status button calls `POST /api/order/{id}/status` with `{ "status": "in progress" }` (lowercase name string). On success, update the order's status in local state — do not refetch the entire list.
- **R5 — Status Progression Logic:**
  - PENDING → next is IN PROGRESS
  - IN PROGRESS → next is DELIVERED
  - DELIVERED → no next, button disabled
- **R6 — VIEW Button:** FontAwesome `faMagnifyingGlass` icon. Tapping sets `selectedOrder` and opens `DeliveryDetailsModal`.
- **R7 — Delivery Details Modal:** `components/DeliveryDetailsModal.tsx` — shows delivery address, restaurant name, order date, product line items (name, quantity, price), and total. Dark header with "DELIVERY DETAILS" title and order status subtitle. White body. × close button always visible.
- **R8 — Token and Courier ID:** Read `token` from AsyncStorage. Read `courier` from AsyncStorage, parse JSON, use `courier.id` as `courierId`. If token is null, `router.replace('/')`.
- **R9 — Add to `services/api.ts`:** Add `getPendingOrders(token)`, `getCourierOrders(courierId, token)`, and `updateOrderStatus(orderId, statusName, token)`. `getOrderStatuses` is NOT needed — see confirmed notes.

---

## Confirmed API Response Shapes

> All field names below were verified from Metro console logs during implementation.

### GET /api/orders/pending

```json
{
  "data": [
    {
      "id": 3,
      "customer_id": 4,
      "customer_name": "Dr. Jessie Ratke",
      "customer_address": "88638 Kermit Point",
      "restaurant_id": 1,
      "restaurant_name": "Updated Restaurant",
      "restaurant_address": "456 Updated Ave",
      "courier_id": null,
      "courier_name": null,
      "status": "pending",
      "products": [
        {
          "product_name": "Updated Burger",
          "quantity": 3,
          "unit_cost": 11,
          "total_cost": 33,
          "product_id": 1
        }
      ],
      "total_cost": 109,
      "created_on": "2026-05-05T10:51:19.514057"
    }
  ]
}
```

### GET /api/orders?type=courier&id={courierId}

Same shape as pending orders. Returns `{ "message": "Success", "data": [] }` when the courier has no orders — this is correct and not an error.

### POST /api/order/{id}/status

**Request body — CONFIRMED:**
```json
{ "status": "in progress" }
```

> ⚠️ The original spec said `{ "order_status_id": number }` — this is WRONG.
> The API expects the field name `status` with a **lowercase string value**, not a numeric ID.
> Sending `order_status_id` returns `400 Bad Request: "Status is required"`.

**Confirmed working body values:** `"pending"`, `"in progress"`, `"delivered"` (all lowercase).

---

## Confirmed Field Name Mapping

| Original assumption | Actual API field |
|---|---|
| `address` | `customer_address` |
| `created_at` | `created_on` |
| `p.name` | `p.product_name` |
| `p.unit_price` | `p.unit_cost` |
| status uppercase `"PENDING"` | lowercase `"pending"` in response |
| `status_id` in response | **not present** — not returned by API |

---

## Confirmed `updateOrderStatus` Signature

```ts
// statusName is lowercase — e.g. "in progress", "delivered"
export async function updateOrderStatus(orderId: number, statusName: string, token: string) {
  const response = await fetch(`${BASE_URL}/api/order/${orderId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status: statusName }),
  });

  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
}
```

Call it with `next.toLowerCase()` where `next` is the uppercase next status string from `nextStatusName`.

---

## `getOrderStatuses` — NOT NEEDED

> The original spec included fetching `/api/order-statuses` and building a `{ [name]: id }` lookup.
> This is **not required**. The status update endpoint accepts the status name string directly.
> Do not add `getOrderStatuses` to `services/api.ts` or call it from the screen.
> Do not build or store a `statusMap` in component state.

---

## User Flow / Logic (High Level)

1. Courier logs in → routed to `/courier` → Deliveries tab is default
2. Screen mounts → token + courierId read from AsyncStorage → two fetch calls made in parallel
3. All orders merged, statuses normalized to uppercase, displayed in table
4. Courier taps PENDING button → `POST /api/order/{id}/status` body `{ status: "in progress" }` → local state updated → button turns orange
5. Courier taps IN PROGRESS button → `POST /api/order/{id}/status` body `{ status: "delivered" }` → local state updated → button turns green and is disabled
6. Courier taps VIEW → Delivery Details Modal opens with full order info
7. Modal × tapped → modal closes → back to table

---

## Interfaces (Pages, Endpoints, Screens)

### Files Created or Modified

| File | Action | Purpose |
|---|---|---|
| `app/courier/deliveries/index.tsx` | Modified | Replaced placeholder with full Deliveries screen |
| `components/DeliveryDetailsModal.tsx` | Created | Delivery detail modal for couriers |
| `services/api.ts` | Modified | Added 3 new functions: `getPendingOrders`, `getCourierOrders`, `updateOrderStatus` |
| `app/courier/_layout.tsx` | Modified | Added `<Header />` (matches customer layout pattern) |

### Backend / API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/orders/pending` | Bearer | All PENDING orders |
| GET | `/api/orders?type=courier&id={id}` | Bearer | Courier's IN PROGRESS + DELIVERED orders |
| POST | `/api/order/{id}/status` | Bearer | Advance order — body: `{ status: "in progress" }` |

---

## Data Used or Modified

**Read from AsyncStorage:**
- `'token'` — Bearer token
- `'courier'` — parsed JSON `{ id: number }` — use `.id` as `courierId`

**Confirmed Order type:**
```ts
type OrderProduct = {
  product_name: string;
  quantity: number;
  unit_cost: number;
  product_id: number;
};

type Order = {
  id: number;
  status: string;           // normalized to uppercase after fetch
  customer_address: string;
  restaurant_name: string;
  created_on: string;
  products: OrderProduct[];
};
```

**Local state:**
```ts
orders: Order[]
selectedOrder: Order | null
isModalVisible: boolean
isLoading: boolean
error: string | null
```

---

## Status Normalization

The API returns status strings in **lowercase** (`"pending"`, `"in progress"`, `"delivered"`). Normalize to uppercase immediately after fetch so all comparisons and lookups use consistent casing:

```ts
const normalize = (list: any[]): Order[] =>
  list.map(o => ({ ...o, status: (o.status as string).toUpperCase() }));

const merged: Order[] = [
  ...normalize(pendingOrders),
  ...normalize(courierOrders).filter(o => o.status !== 'PENDING'),
];
```

When calling `updateOrderStatus`, convert back to lowercase:
```ts
await updateOrderStatus(order.id, next.toLowerCase(), token);
```

---

## Tech Constraints (Feature-Level)

- Use `Promise.all([getPendingOrders(token), getCourierOrders(courierId, token)])` — two fetches in parallel, not three
- Status update body is `{ status: "in progress" }` — lowercase string, NOT `{ order_status_id: number }`
- Status update optimistically updates local state — do not refetch the full list
- Use `ScrollView` for the table — not `FlatList`
- DELIVERED button: `disabled={true}`, full green color maintained — no opacity reduction
- `DeliveryDetailsModal` is a new component — do not reuse `OrderHistoryModal`
- Header is added to `app/courier/_layout.tsx`, not inside individual screens
- Base URL: `process.env.EXPO_PUBLIC_NGROK_URL`

### Status Colors and Progression

```ts
const statusColors: { [key: string]: string } = {
  'PENDING': '#851919',
  'IN PROGRESS': '#DA583B',
  'DELIVERED': '#609475',
};

const nextStatusName: { [key: string]: string } = {
  'PENDING': 'IN PROGRESS',
  'IN PROGRESS': 'DELIVERED',
};
```

### Wireframe Layout Reference

```
[  HEADER  ]

MY DELIVERIES               ← screen heading, Oswald font

┌────────┬──────────────┬─────────────┬──────┐
│ORDER ID│ ADDRESS      │ STATUS      │ VIEW │  ← #222126 header row
├────────┼──────────────┼─────────────┼──────┤
│ 104    │ 88638 Kermit │ [PENDING]   │  🔍  │  ← red button
├────────┼──────────────┼─────────────┼──────┤
│ 105    │ 123 Main St. │[IN PROGRESS]│  🔍  │  ← orange button
├────────┼──────────────┼─────────────┼──────┤
│ 106    │ 456 Elm Ave. │ [DELIVERED] │  🔍  │  ← green button, disabled
└────────┴──────────────┴─────────────┴──────┘

Column widths:
- ORDER ID: width 60
- ADDRESS: flex 1 (widest)
- STATUS: width 120
- VIEW: width 50, centered

DeliveryDetailsModal:
┌─────────────────────────────────┐
│ DELIVERY DETAILS             ×  │  ← #222126 header, #DA583B title (Oswald)
│ Status: IN PROGRESS             │  ← white subtitle
├─────────────────────────────────┤
│ Delivery Address: 88638 Kermit  │
│ Restaurant: Updated Restaurant  │
│ Order Date: 5/5/2026            │
│                                 │
│ Order Details:                  │
│ Updated Burger    x3   $ 11.00  │
│ Som Tam           x3   $  6.00  │
│ ─────────────────────────────── │
│              TOTAL: $ 109.00    │
└─────────────────────────────────┘
```

---

## Acceptance Criteria

- [x] Screen fetches PENDING orders and courier's own orders on mount using `Promise.all`
- [x] All orders display in table with ORDER ID, ADDRESS, STATUS button, VIEW icon
- [x] PENDING button is dark red `#851919`
- [x] IN PROGRESS button is orange `#DA583B`
- [x] DELIVERED button is green `#609475`
- [x] Tapping PENDING button advances to IN PROGRESS — color updates immediately
- [x] Tapping IN PROGRESS button advances to DELIVERED — color updates immediately
- [x] DELIVERED button is disabled — cannot be tapped
- [x] Status update calls `POST /api/order/{id}/status` with `{ status: "in progress" }` (lowercase)
- [x] Tapping VIEW opens Delivery Details Modal with correct data
- [x] Modal shows delivery address, restaurant, date, product line items, total
- [x] Modal × close button always visible
- [x] Token and courier ID read from AsyncStorage
- [x] Missing token redirects to Login
- [x] Loading indicator shown while fetching
- [x] `services/api.ts` has 3 functions: `getPendingOrders`, `getCourierOrders`, `updateOrderStatus`
- [x] Header visible on courier screens (added to `app/courier/_layout.tsx`)

---

## Notes for the AI

- **Do NOT call `GET /api/order-statuses`** — it is not needed. The status update endpoint accepts the status name string directly. Building a `statusMap` from IDs will cause a key-casing bug (API returns lowercase names, but you'll be looking up with uppercase keys) and adds unnecessary complexity.
- **Status body field is `status`, not `order_status_id`** — sending `order_status_id` returns `400 Bad Request: "Status is required"`. This was the primary bug during implementation.
- **Status strings from the API are lowercase** — normalize to uppercase on load with `.toUpperCase()` for all internal comparisons, color lookups, and progression logic. Convert back to lowercase when sending to the API with `.toLowerCase()`.
- **Courier orders returning `data: []`** is normal — it means the courier has no IN PROGRESS or DELIVERED orders yet, not an API error.
- The `customer_address` field holds the delivery address — there is no `address` field. Using `order.address` will silently render as blank.
- Product fields are `product_name` and `unit_cost` — not `name` and `unit_price`. The modal total must use `p.unit_cost * p.quantity`.
- Date field is `created_on` — not `created_at`. Passing `created_at` to `new Date()` returns `Invalid Date`.
- `DeliveryDetailsModal` must use the same confirmed type definitions — keep them in sync with the screen's `Order` and `OrderProduct` types.
- Keep the selection screen self-contained with its own styles — no shared layout wraps it.
