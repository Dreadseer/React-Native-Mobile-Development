# CONCEPTS.md — Rocket Food Delivery Extended App (Module 14)

Three concepts I found challenging while building Module 14.

---

## Concept 1 — Role-Based Conditional Navigation

**Purpose in the project:**
After a user logs in, the app needs to figure out where to send them. Not everyone goes to the same place — a customer-only account goes straight to the customer app, a courier-only account goes straight to the courier app, and someone with both accounts gets sent to a selection screen where they pick which one they want. The login response from `/api/auth` comes back with two fields — `customer_id` and `courier_id`. If either one is null, the user doesn't have that role. That's how we know where to route them.

**Why it was challenging:**
I assumed the API would come back with full customer and courier objects nested inside the response. It didn't — it's a flat response with just the IDs. That took some debugging to figure out. The other thing I had to learn was the difference between `router.replace` and `router.push` for navigation. I was using push at first, which meant the Login screen stayed in the navigation stack — so a user could press back after logging in and end up back on the Login screen while still authenticated. Replace removes the previous screen from history completely, which is the right behavior for a login flow. I also hadn't dealt with three possible destinations after login before — most examples I'd seen only show two states (logged in or not). Managing three branches with different AsyncStorage writes for each one took some careful thinking to get right.

**Usage location:**
- `app/index.tsx` lines 35–36 — `hasCustomer` and `hasCourier` null-check detection
- `app/index.tsx` lines 38–41 — AsyncStorage writes for `token`, `user`, `customer`, `courier`
- `app/index.tsx` lines 44–52 — the three-way routing branch
- `app/selection.tsx` lines 10–13 — Customer card handler: sets role, navigates to `/customer`
- `app/selection.tsx` lines 15–18 — Courier card handler: sets role, navigates to `/courier`
- `services/api.ts` lines 4–17 — `loginCustomer` function using `POST /api/auth`

---

## Concept 2 — Shared Component Pattern (`AccountScreen.tsx`)

**Purpose in the project:**
Both the customer app and the courier app have an Account screen. They look almost identical — a read-only primary email at the top, then an editable role-specific email and phone below, and an UPDATE ACCOUNT button. The only real differences are the field labels ("Customer Email" vs "Courier Email") and which type value gets sent to the API. Instead of building two separate screen files that do basically the same thing, I built one shared `AccountScreen` component that takes a `type` prop — either `'customer'` or `'courier'`. That one prop controls what labels show up, what the "Logged In As" text says, and what gets sent in the API update call. The two actual screen files just read from AsyncStorage and pass the right props in — they're only about 30 lines each.

**Why it was challenging:**
The hard part wasn't building the component — it was recognizing I should build it that way in the first place. My first instinct was to get the customer account screen working and then copy the file and change the labels for the courier version. That would have worked, but code reusability is a graded requirement in this module and having two near-identical files would have been penalized. Once I figured out that the `type` prop could drive all the differences, it clicked. The same `type` value that changes the labels also flows directly into the PUT request as `?type=customer` or `?type=courier` — so one function handles both without needing any if/else logic inside the component.

**Usage location:**
- `components/AccountScreen.tsx` lines 21–25 — `Props` type defining `type`, `userId`, and `token`
- `components/AccountScreen.tsx` line 27 — `roleLabel` map that converts the type prop to a display string
- `components/AccountScreen.tsx` line 38 — `const label = roleLabel[type]` drives all the labels
- `components/AccountScreen.tsx` line 72 — `updateAccountDetails(userId, type, ...)` passes type as the query param
- `app/customer/account/index.tsx` line 27 — renders `<AccountScreen type="customer" />`
- `app/courier/account/index.tsx` line 27 — renders `<AccountScreen type="courier" />`
- `services/api.ts` lines 178–193 — `getAccountDetails`: `GET /api/account/{id}`
- `services/api.ts` lines 195–216 — `updateAccountDetails`: `PUT /api/account/{id}?type={type}`

---

## Concept 3 — Parallel Async Fetching with `Promise.all` and Data Normalization

**Purpose in the project:**
The Courier Deliveries screen needs to load two different sets of orders at the same time — all the PENDING orders that any courier can see, and this specific courier's own IN PROGRESS and DELIVERED orders. If I fetched them one at a time, the screen would have to wait for the first request to finish before even starting the second. `Promise.all` lets you fire multiple requests at once and wait for all of them to come back together, which is noticeably faster especially over a Ngrok tunnel. After both come back, I merge them into one list — but I have to filter out any PENDING orders from the courier-specific list first, because a PENDING order would show up in both responses and appear twice in the table. There's also a normalization issue — the API sends status values in lowercase (`"pending"`, `"in progress"`, `"delivered"`) but my status color lookup uses uppercase keys. So I convert everything to uppercase right after fetching, keep it uppercase throughout the component, and only convert back to lowercase when sending an update to the API.

**Why it was challenging:**
`Promise.all` was new to me. I understood `await` for single requests but I hadn't used it for running multiple things at the same time. The idea that you can start several promises and then wait for all of them at once took some getting used to. The deduplication part also wasn't obvious — I only realized orders could show up in both lists after I saw the same order appearing twice in the table. The normalization issue was another thing I found by testing rather than anticipating — the status buttons weren't showing the right colors and it took a while to trace it back to the lowercase/uppercase mismatch between what the API returns and what my color lookup expected.

**Usage location:**
- `app/courier/deliveries/index.tsx` lines 74–77 — `Promise.all` firing both order fetches at the same time
- `app/courier/deliveries/index.tsx` lines 80–81 — `normalize` helper converting status strings to uppercase
- `app/courier/deliveries/index.tsx` lines 84–87 — merge and deduplication logic
- `app/courier/deliveries/index.tsx` lines 97–112 — `handleStatusAdvance`: finds next status, calls API with lowercase value, updates local state
- `services/api.ts` lines 125–140 — `getPendingOrders`: `GET /api/orders/pending`
- `services/api.ts` lines 142–157 — `getCourierOrders`: `GET /api/orders?type=courier&id={courierId}`
- `services/api.ts` lines 159–176 — `updateOrderStatus`: `POST /api/order/{id}/status`