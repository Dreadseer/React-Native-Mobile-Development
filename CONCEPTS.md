# CONCEPTS.md — Rocket Food Delivery Mobile App

Three challenging concepts encountered and implemented during Module 13.

---

## Concept 1 — Three-Level Nested Navigation with expo-router

**Purpose in the project:**
The app requires three distinct levels of navigation working together simultaneously: a root Stack navigator that controls access between the Login screen and the customer area, a Tab navigator that provides the bottom tab bar for the Restaurants and Order History sections, and a nested Stack navigator inside the Restaurants tab that handles moving between the restaurant list and an individual restaurant's menu. expo-router uses file-based routing, meaning the folder and file structure of the `app/` directory directly determines the navigation hierarchy — creating a folder creates a route, and `_layout.tsx` files define the navigator at each level.

**Why it was challenging:**
Understanding that navigation is structural (driven by folder nesting) rather than declarative (written as component trees) required a shift in thinking. The biggest difficulty was understanding how `_layout.tsx` files interact with each other at different levels — a `<Stack>` inside a `<Tabs>` inside another `<Stack>` — and ensuring native headers were hidden at every level so the custom Header component could take over. Getting all three levels working together without any level accidentally rendering a duplicate header or losing the tab bar during navigation required careful reading of how expo-router propagates layout options down the file tree.

**Usage location:**
- `app/_layout.tsx` — Root Stack Navigator
- `app/customer/_layout.tsx` — Customer Tab Navigator
- `app/customer/restaurant/_layout.tsx` — Restaurant Stack Navigator

---

## Concept 2 — Async Token-Based Authentication with AsyncStorage

**Purpose in the project:**
Every authenticated API call in the app requires a JWT Bearer token that was issued during login and must persist across screen navigations, app restarts, and tab switches. AsyncStorage is React Native's key-value storage system for persisting data on the device. After a successful login, the token is stored in AsyncStorage under the key `'token'` and the customer record under `'customer'`. Every screen that requires authentication reads the token from AsyncStorage on mount, includes it in the `Authorization: Bearer` header of API requests, and redirects to the Login screen if it is missing. The logout function removes both keys from AsyncStorage before navigating back to Login.

**Why it was challenging:**
AsyncStorage operations are asynchronous, which means reading the token requires `await` inside a `useEffect` on component mount — a pattern that combines React lifecycle management with asynchronous JavaScript. A key bug encountered during development was that the login response returned the user ID (`49`) rather than the customer ID (`24`), because the `customers` and `users` tables are separate in the database with a foreign key relationship. The fix required adding a second API call immediately after login to fetch the correct customer record and store that instead, ensuring the order creation payload always contained the correct `customer_id`. Another challenge was understanding that `router.replace` must be used for logout navigation instead of `router.push`, to prevent the user from navigating back into the authenticated area after the token has been cleared.

**Usage location:**
- `app/index.tsx` — token storage after login and customer ID resolution
- `services/api.ts` — Bearer token included in all authenticated fetch calls
- `components/Header.tsx` — token removal on logout
- `app/customer/restaurant/index.tsx`, `app/customer/restaurant/[id].tsx`, `app/customer/order-history/index.tsx` — token read and null check on mount

---

## Concept 3 — Controlled Quantity State and Derived UI with useState

**Purpose in the project:**
The Restaurant Menu screen tracks the quantity of each menu item the user has selected using a single state object keyed by product ID: `{ [productId]: number }`. All quantities start at 0 on mount and can only be changed through the `+` and `−` stepper buttons — direct keyboard input is intentionally disabled. The Create Order button's enabled/disabled state is derived from this quantities object: if every value is 0, the button is disabled; if any value is greater than 0, it enables. When the Order Confirmation Modal opens, it receives the quantities object as a prop and uses it to filter the full product list down to only the ordered items, calculate the line-item prices, and build the exact payload sent to the API. The quantities also reset to 0 every time the screen mounts, ensuring a fresh state when the user navigates to a different restaurant.

**Why it was challenging:**
Managing a dynamic object in React state where the keys are not known in advance (they come from the API response) required understanding how to initialize state from fetched data and how to update a single key inside a state object without mutating it directly. The derived UI pattern — where the button's disabled state, the modal's item list, the order total, and the API payload are all computed from the same source of truth rather than tracked as separate state variables — was conceptually difficult but resulted in much cleaner code. A common mistake early on was attempting to track `isButtonEnabled` as separate state, which caused it to fall out of sync with the quantities. Replacing it with `Object.values(quantities).every(q => q === 0)` computed inline made the relationship between the data and the UI explicit and reliable.

**Usage location:**
- `app/customer/restaurant/[id].tsx` — quantities state initialization, increment/decrement handlers, Create Order button disabled logic
- `components/MenuItemRow.tsx` — receives quantity and stepper callbacks as props
- `components/OrderConfirmationModal.tsx` — receives quantities as prop, derives ordered items and total, builds order payload

---

*File locations and line numbers are approximate — refer to the actual source files for exact references.*
