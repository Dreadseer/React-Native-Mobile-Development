# 🤖 AI_FEATURE — Restaurant Menu Page

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01–04 must be complete before starting this one.
> This document describes only the Restaurant Menu Page feature.

---

## Feature Identity

- **Feature Name:** Restaurant Menu Page
- **Related Area:** Mobile — UI / API Integration

---

## Feature Goal

Replace the Restaurant Menu placeholder with a fully functional screen that fetches and displays the selected restaurant's menu items. The user can increment or decrement item quantities using stepper buttons only — no typing allowed. When at least one item has a quantity greater than zero, the Create Order button enables and opens the Order Confirmation Modal. Quantities reset to zero whenever the user navigates to a different restaurant. The screen must match the wireframe exactly.

---

## Feature Scope

### In Scope (Included)

- Fetch the selected restaurant's details and menu items from the API using the `id` param from the route
- Display restaurant name, price range, and star rating at the top of the screen
- Display each menu item with a static image (`RestaurantMenu.jpg`), name, price, description, and a quantity stepper (− / qty / +)
- Quantity starts at 0 for all items, cannot go below 0
- Quantities can only be changed via the + and − buttons — no keyboard input
- CREATE ORDER button is disabled when all quantities are 0
- CREATE ORDER button is enabled when at least one item has quantity > 0
- Tapping CREATE ORDER opens the Order Confirmation Modal (built in Feature 06)
- Quantities reset to 0 when the screen loads a new restaurant (on mount)
- All menu item images use the same static file: `images/restaurants/RestaurantMenu.jpg`

### Out of Scope (Excluded)

- The Order Confirmation Modal itself (covered in `menu-modal-confirmation.feature.md`)
- Any ability to type quantities directly into an input field
- Per-item images from the API (all items use the static image)
- Cart persistence between sessions
- Any modification to the Spring Boot API

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Route Param:** Read the restaurant `id` from the route using `useLocalSearchParams`. Use it to fetch the restaurant's menu from the API on mount.
- **R2 — Data Fetch:** Call `getRestaurantProducts(id, token)` from `services/api.ts`. Store the restaurant info and its product list in state. Show a loading indicator while fetching.
- **R3 — Restaurant Header Info:** At the top of the screen display the restaurant name in bold, price range, and star rating using FontAwesome `faStar` icons — matching the wireframe layout.
- **R4 — CREATE ORDER Button:** Positioned in the top-right area next to the restaurant name/info, matching the wireframe. Disabled (greyed out) when all quantities are 0. Enabled (background `#DA583B`, white text) when at least one quantity > 0.
- **R5 — Menu Item List:** Render each product using a `ScrollView` or `FlatList`. Each row shows:
  - Static image: `RestaurantMenu.jpg` (same for every item)
  - Item name
  - Price formatted as `$ X.XX`
  - Description text (lorem ipsum or real description from API)
  - Stepper: `−` button / quantity number / `+` button
- **R6 — Quantity State:** Store quantities as an object keyed by product id: `{ [productId]: number }`. Initialize all to 0 on mount. Never allow a value below 0.
- **R7 — Stepper Buttons:** The `−` button is visually disabled (or does nothing) when the item's quantity is already 0. The `+` button always increments. No maximum quantity enforced.
- **R8 — Quantity Reset on Mount:** Every time this screen mounts, all quantities reset to 0. This ensures switching restaurants always starts fresh.
- **R9 — Open Modal:** When CREATE ORDER is tapped and at least one quantity > 0, open the Order Confirmation Modal. Pass the current quantities and product list to the modal as props. The modal itself is built in Feature 06 — for now, render a placeholder `<Modal>` or leave a clearly marked `// TODO: replace with OrderConfirmationModal` comment.
- **R10 — Token from AsyncStorage:** Authenticated GET request uses the bearer token from AsyncStorage. If token is null, redirect to Login.

---

## User Flow / Logic (High Level)

1. User taps a restaurant card on the list → navigates here with the restaurant `id`
2. Screen mounts → quantities initialized to all 0 → token read from AsyncStorage → `getRestaurantProducts(id, token)` called
3. Loading indicator shown while fetching
4. Restaurant info and menu items render — CREATE ORDER button is disabled
5. User taps `+` on an item → that item's quantity increments → CREATE ORDER button enables
6. User taps `−` on an item with quantity > 0 → quantity decrements
7. User taps `−` on an item with quantity = 0 → nothing happens
8. User taps CREATE ORDER → Order Confirmation Modal opens with current item selections
9. User navigates back to Restaurant List → comes back to a different restaurant → quantities are reset to 0 on mount

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create or Modify

| File | Action | Purpose |
|---|---|---|
| `app/customer/restaurant/[id].tsx` | Modify | Replace placeholder with full Menu screen |
| `services/api.ts` | Modify | Add `getRestaurantProducts(id, token)` function |
| `components/MenuItemRow.tsx` | Create | Reusable row component for a single menu item |

### Backend / API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/restaurants/:id/products` | Bearer token | Fetch menu items for a restaurant |

> Check the Module 12 API — the endpoint may be `/api/restaurants/:id/products` or
> `/api/products?restaurantId=:id`. Confirm the correct path and note it in `services/api.ts`.

---

## Data Used or Modified

**Read from AsyncStorage:**
- `'token'` — Bearer token for the API request

**Route param:**
- `id` — restaurant id from `useLocalSearchParams`

**Product object shape (from API):**
```
{
  id: number,
  name: string,
  description: string,
  price: number,        // e.g. 9.75
  image_url: string | null  // ignored — we use RestaurantMenu.jpg for all items
}
```

**Restaurant object shape (from API or passed via route):**
```
{
  id: number,
  name: string,
  price_range: string,  // '$' | '$$' | '$$$' or 1 | 2 | 3
  rating: number
}
```

**Local state:**
```
quantities: { [productId: number]: number }   // all start at 0
products: Product[]
restaurant: Restaurant | null
isLoading: boolean
error: string | null
isModalVisible: boolean
```

---

## Tech Constraints (Feature-Level)

- All menu item images use `require('../../images/restaurants/RestaurantMenu.jpg')` — do not use `image_url` from the API for menu items
- Quantity inputs must be display-only `<Text>` components — do not use `<TextInput>` for quantity display
- Use `ScrollView` for the menu list (a `FlatList` is also acceptable if preferred)
- Price must be formatted as `$ X.XX` — use `.toFixed(2)` on the price value
- The CREATE ORDER button placement matches the wireframe: top-right of the restaurant info section, not at the bottom of the screen
- `MenuItemRow.tsx` is a pure presentational component — it receives props for the product, quantity, and `onIncrement`/`onDecrement` handlers
- Do not persist quantities in AsyncStorage — they live in component state only
- Token check: if null, `router.replace('/')` immediately

### Wireframe Layout Reference

```
[  HEADER  ]

RESTAURANT MENU                    ← screen heading

[Restaurant Name]    [CREATE ORDER]  ← name left, button right
Price: $                             ← price range
Rating: ★★★★                         ← star icons

[ RestaurantMenu.jpg ] [Item Name       ] [ − ] [ 0 ] [ + ]
                       [$ 9.75          ]
                       [Description...  ]

[ RestaurantMenu.jpg ] [Item Name       ] [ − ] [ 0 ] [ + ]
                       [$ 20.25         ]
                       [Description...  ]

... (scrollable list)

[  FOOTER TAB BAR  ]

CREATE ORDER button states:
- All quantities 0:   background #851919 or greyed, disabled
- Any quantity > 0:   background #DA583B, white text, enabled
```

---

## Acceptance Criteria

- [ ] Screen reads the `id` param from the route and fetches the correct restaurant's products
- [ ] Restaurant name, price range, and star rating display at the top
- [ ] CREATE ORDER button is in the top-right next to restaurant info
- [ ] All menu items render with `RestaurantMenu.jpg` as the image (not API image URLs)
- [ ] Each item shows name, formatted price (`$ X.XX`), and description
- [ ] Each item has a − / quantity / + stepper
- [ ] All quantities start at 0 on mount
- [ ] `+` button increments the item's quantity
- [ ] `−` button decrements the item's quantity but never below 0
- [ ] Quantity display is a `<Text>` component, not an input field
- [ ] CREATE ORDER is disabled when all quantities are 0
- [ ] CREATE ORDER is enabled (background `#DA583B`) when any quantity > 0
- [ ] Tapping CREATE ORDER opens the modal (or placeholder) with the current selections
- [ ] Quantities reset to 0 every time the screen mounts
- [ ] Token is read from AsyncStorage and sent as Bearer header
- [ ] Missing token redirects to Login
- [ ] Header and footer are visible (inherited from layout)

---

## Notes for the AI

- The quantity state object `{ [productId]: number }` is the right approach here — it's easy to check if all are zero with `Object.values(quantities).every(q => q === 0)`, and easy to build the order payload from in Feature 06.
- The CREATE ORDER button disabled check: `Object.values(quantities).every(q => q === 0)` returns true when all are zero → button disabled. Invert for enabled.
- The restaurant info (name, price, rating) might need to come from a separate API call (`/api/restaurants/:id`) or it might be embedded in the products response. Check the Module 12 API shape and handle either case. Alternatively, the restaurant data can be passed as a route param from the list screen — but confirm with the actual API response before deciding.
- For the modal in this feature, just wire up `isModalVisible` state and a basic `<Modal visible={isModalVisible}>` placeholder. The full modal UI and order submission logic is Feature 06 — don't build it here.
- `MenuItemRow.tsx` should receive: `product`, `quantity`, `onIncrement`, `onDecrement` as props. Keep it purely presentational.
