# CONCEPTS.md — Rocket Food Delivery Extended App (Module 14)

Three challenging concepts encountered and implemented during Module 14.

---

## Concept 1 — Role-Based Conditional Navigation

**Purpose in the project:**
After a successful login, the app needs to route the user to one of three different places depending on which role(s) their account has: the customer area, the courier area, or an Account Selection screen if they have both. This is handled in `app/index.tsx` immediately after the `/api/auth` response is received. The auth response is a flat object containing `customer_id` and `courier_id` fields — if a field is non-null, the user has that role. Based on which combination is present, the app calls `router.replace('/customer')`, `router.replace('/courier')`, or `router.replace('/selection')`. The active role is stored in AsyncStorage so every subsequent screen knows which context the user is in.

**Why it was challenging:**
The first challenge was understanding the auth response shape. The original assumption was that the API would return nested customer and courier objects — but the actual response is flat, with only `customer_id` and `courier_id` as numbers. Building the role detection on nested objects would have silently failed for anyone with a courier account. The second challenge was understanding that `router.replace` is essential here — not `router.push`. Using push would leave the Login screen in the navigation stack, meaning a user could press back from the customer area and land on the Login screen while still authenticated. Replace removes the previous screen from history entirely, which is the correct behavior for an auth flow. The third challenge was the three-way branch itself — most navigation tutorials show simple two-state auth (logged in / not logged in), but three destinations with different AsyncStorage writes for each path required careful sequencing.

**Usage location:**
- `app/index.tsx` lines 35–36 — `hasCustomer` and `hasCourier` null-check detection
- `app/index.tsx` lines 38–41 — `AsyncStorage.setItem` writes for `token`, `user`, `customer`, `courier`
- `app/index.tsx` lines 44–52 — three-way routing branch (`/selection`, `/customer`, `/courier`)
- `app/selection.tsx` lines 10–13 — `handleSelectCustomer`: sets `role` in AsyncStorage, calls `router.replace('/customer')`
- `app/selection.tsx` lines 15–18 — `handleSelectCourier`: sets `role` in AsyncStorage, calls `router.replace('/courier')`
- `services/api.ts` lines 4–17 — `loginCustomer` function, `POST /api/auth`, returns flat response

---

## Concept 2 — Shared Component Pattern (`AccountScreen.tsx`)

**Purpose in the project:**
Both the customer and courier roles have an Account screen that displays three fields — primary email (read-only), role-type email (editable), and role-type phone (editable) — with an UPDATE ACCOUNT button that saves changes via the API. The layout, state management, API call pattern, and update logic are identical between the two. Rather than building two separate account screen files that duplicate the same code, a single `components/AccountScreen.tsx` component was built that accepts a `type` prop (`'customer'` | `'courier'`) and a `userId` prop. The two wrapper screens — `app/customer/account/index.tsx` and `app/courier/account/index.tsx` — each just read the token and user ID from AsyncStorage and render `<AccountScreen type="customer" userId={id} token={token} />` or `<AccountScreen type="courier" userId={id} token={token} />`. Everything else — state, API calls, labels, form handling, success and error messages — lives inside the shared component.

**Why it was challenging:**
The pattern itself is not complex, but knowing when to apply it was the real skill. The temptation was to build the customer account screen first, get it working, then copy-paste it and change the labels for the courier version. That approach would have created two files to maintain and update every time something changed — exactly what the code reusability requirement penalizes. Understanding that the `type` prop could drive all the differences (label text, API query parameter, "Logged In As" display) meant the component could be written once and work correctly for both roles. The `type` prop also flows directly into the PUT request as `?type=customer` or `?type=courier`, which means the same update function handles both roles without any branching inside the component.

**Usage location:**
- `components/AccountScreen.tsx` lines 21–25 — `Props` type defining `type`, `userId`, and `token`
- `components/AccountScreen.tsx` line 27 — `roleLabel` map that converts `type` to a display string
- `components/AccountScreen.tsx` line 38 — `const label = roleLabel[type]` drives all field labels and the "Logged In As" subtitle
- `components/AccountScreen.tsx` line 44 — `data[type]` accesses the role-specific sub-object from the GET response
- `components/AccountScreen.tsx` line 72 — `updateAccountDetails(userId, type, ...)` passes `type` as the `?type=` query parameter
- `app/customer/account/index.tsx` line 27 — `<AccountScreen type="customer" userId={userId} token={token} />`
- `app/courier/account/index.tsx` line 27 — `<AccountScreen type="courier" userId={userId} token={token} />`
- `services/api.ts` lines 178–193 — `getAccountDetails`: `GET /api/account/{id}`
- `services/api.ts` lines 195–216 — `updateAccountDetails`: `PUT /api/account/{id}?type={type}`

---

## Concept 3 — Parallel Async Fetching with `Promise.all` and Data Normalization

**Purpose in the project:**
The Courier Deliveries screen needs three pieces of data before it can render: all PENDING orders (visible to any courier), this courier's own IN PROGRESS and DELIVERED orders, and the order status mapping. If these were fetched sequentially — waiting for the first to finish before starting the second — each round trip through Ngrok would add noticeable delay. `Promise.all` fires all three requests simultaneously and waits for all of them to resolve before proceeding, making the combined wait time equal to the slowest single request rather than the sum of all three. After fetching, the two order lists are merged and deduplicated — PENDING orders that appear in both lists are filtered out of the courier-specific list before merging, preventing the same order from appearing twice in the table. The status strings from the API also arrive in lowercase (`"pending"`, `"in progress"`, `"delivered"`) and are normalized to uppercase on fetch so all comparison logic in the component uses a consistent format. When sending a status update back to the API, the uppercase value is converted back to lowercase before the POST.

**Why it was challenging:**
Three things compounded here. First, `Promise.all` requires understanding that JavaScript promises are not sequential by default — wrapping multiple awaits in `Promise.all` is a deliberate choice for parallelism that must be reasoned about, not just applied automatically. Second, the merge/deduplication logic — `[...pendingOrders, ...courierOrders.filter(o => o.status !== 'PENDING')]` — is only one line but requires understanding why a PENDING order might appear in both lists and why including it twice would be wrong. Third, the normalization pattern (uppercase for internal use, lowercase for API calls) was necessary because the API returns lowercase but the status color lookup object uses uppercase keys — without normalization, no status button would ever match its color.

**Usage location:**
- `app/courier/deliveries/index.tsx` lines 74–77 — `Promise.all([getPendingOrders(token), getCourierOrders(courierId, token)])` parallel fetch
- `app/courier/deliveries/index.tsx` lines 80–81 — `normalize` helper: maps each order's `status` to uppercase
- `app/courier/deliveries/index.tsx` lines 84–87 — merge and deduplication: spreads pending orders then filtered courier orders (PENDING excluded)
- `app/courier/deliveries/index.tsx` lines 97–112 — `handleStatusAdvance`: looks up next status in `nextStatusName`, calls `updateOrderStatus` with lowercase value, then updates state optimistically via `setOrders`
- `services/api.ts` lines 125–140 — `getPendingOrders`: `GET /api/orders/pending`
- `services/api.ts` lines 142–157 — `getCourierOrders`: `GET /api/orders?type=courier&id={courierId}`
- `services/api.ts` lines 159–176 — `updateOrderStatus`: `POST /api/order/{id}/status` with `{ status: statusName }`

---

