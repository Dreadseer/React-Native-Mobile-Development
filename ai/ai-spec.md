# 🤖 AI_SPEC — Rocket Food Delivery Mobile App (Module 13)

> **IMPORTANT:** This is the global AI specification for this project.
> All AI tools (GitHub Copilot Agent Mode, etc.) must read this file **first** before implementing any feature.
> Feature specification files in `./ai/features/` must always be used **alongside** this document.

---

## Project Identity

- **Project Name:** Rocket Food Delivery — Customer Mobile App
- **Short Description:** A cross-platform mobile application that allows Rocket Food Delivery customers to log in, browse restaurants, place orders, and review order history — connected to the existing Spring Boot REST API from Module 12.
- **Project Type:** Mobile App (React Native + Expo)
- **Module:** Module 13 — Mobile Development 1
- **Role:** Junior Developer at Genesis Solutions

---

## Goal and Scope

### Goal

Build the customer-facing mobile application for Rocket Food Delivery from a bare Expo project. The app must authenticate users via JWT, allow restaurant browsing and filtering, support order creation with confirmation feedback, and display order history with detail views. All screens must match the provided wireframes and color scheme exactly.

### In Scope (Build Now)

- Login screen with email/password authentication (JWT stored in AsyncStorage)
- Restaurant List screen with grid layout and Rating/Price filter controls
- Restaurant Menu screen with quantity steppers and order creation flow
- Order Confirmation modal (processing / success / failure states)
- Order History screen with table layout and detail modal
- Header (with logo and Log Out button) and Footer (tab navigation) visible on all screens except Login
- Three-level nested navigation: Root Stack → Customer Tabs → Restaurant Stack
- Postman collection covering all used API endpoints
- Full wireframe and color scheme compliance

### Out of Scope (Do NOT Build)

- Any back-end modifications — the Spring Boot API from Module 12 is consumed as-is
- User registration or password reset flows
- Admin or courier-facing screens
- Real-time order tracking or push notifications
- Payment processing
- Any screen or feature not listed in the requirement checklist

---

## Users and Use Cases

- **Customer:** Can log in, browse and filter restaurants, view a restaurant's menu, place an order, view order confirmation feedback, and review past order history with full details.

---

## Feature Index

Each feature has its own specification file in `./ai/features/`. Read the relevant feature file alongside this spec before implementing.

- `./ai/features/navigation-structure.feature.md`
- `./ai/features/header-footer.feature.md`
- `./ai/features/login-page.feature.md`
- `./ai/features/restaurant-list-page.feature.md`
- `./ai/features/restaurant-menu-page.feature.md`
- `./ai/features/menu-modal-confirmation.feature.md`
- `./ai/features/order-history-page.feature.md`
- `./ai/features/order-history-modal.feature.md`

---

## Pages / Screens / Routes (Project Map)

### Navigation Structure (Three Levels)

```
Root Stack (app/_layout.tsx)
├── Login Screen          → app/index.tsx  (or app/login.tsx)
└── Customer Area
    └── Customer Tabs (app/customer/_layout.tsx)
        ├── Restaurants Tab
        │   └── Restaurant Stack (app/customer/restaurant/_layout.tsx)
        │       ├── Restaurant List     → app/customer/restaurant/index.tsx
        │       └── Restaurant Menu     → app/customer/restaurant/[id].tsx
        └── Order History Tab           → app/customer/order-history/index.tsx
```

### Screen Summary

| Screen | Route / File | Notes |
|---|---|---|
| Login | `app/index.tsx` | No header or footer |
| Restaurant List | `app/customer/restaurant/index.tsx` | Header + footer visible |
| Restaurant Menu | `app/customer/restaurant/[id].tsx` | Header + footer visible |
| Order History | `app/customer/order-history/index.tsx` | Header + footer visible |

### API Endpoints Consumed (from Module 12 Spring Boot API)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/customers/login` | Authenticate customer, receive JWT |
| GET | `/api/restaurants` | Fetch all restaurants |
| GET | `/api/restaurants?rating=X&price=Y` | Filter restaurants |
| GET | `/api/restaurants/:id/products` | Fetch menu items for a restaurant |
| POST | `/api/orders` | Create a new order |
| GET | `/api/customers/:id/orders` | Fetch customer order history |
| GET | `/api/orders/:id` | Fetch order details |

> All authenticated endpoints require `Authorization: Bearer <token>` header.
> Token is retrieved from AsyncStorage on each request.

---

## Data and Models (Simple)

### Customer (from login response)
- `id`, `email`, `token` (JWT)

### Restaurant
- `id`, `name`, `rating` (1–5), `price_range` (S / SS / SSS), `image_url`

### Product (Menu Item)
- `id`, `name`, `description`, `price`, `image_url`

### Order
- `id`, `restaurant_name`, `status`, `created_at`, `courier_name`
- `products`: array of `{ name, quantity, unit_price }`

### Order Payload (POST /api/orders)
- `customer_id`, `restaurant_id`, `products`: array of `{ product_id, quantity }`

---

## Tech Stack and Tools

### Frontend / Mobile
- React Native
- Expo SDK ~55
- expo-router (file-based routing, replaces React Navigation directly)
- TypeScript (`.tsx` files)

### State Management
- React `useState` and `useContext` — no Redux or Zustand
- AsyncStorage for persisting JWT token between sessions

### UI Libraries
- React Bootstrap (web-compatible components where applicable)
- FontAwesome (`@fortawesome/react-native-fontawesome`) for icons

### Networking
- Fetch API (built-in) — no Axios
- Bearer token authentication from AsyncStorage on every authenticated request

### Testing & Dev Tools
- **Ngrok** (`@expo/ngrok`) — expose local Spring Boot server to physical mobile device
- **Postman** — test all API endpoints; export collection as `PostmanCollection.json` at project root

### Animation / Transitions
- `react-native-reanimated` (required dependency)

### Environment
- `react-native-dotenv` — manage environment variables (e.g., `API_BASE_URL`)

---

## Repository Structure

```
/                              ← Project root
├── app/                       ← Expo Router screens
│   ├── _layout.tsx            ← Root Stack Navigator
│   ├── index.tsx              ← Login screen
│   └── customer/
│       ├── _layout.tsx        ← Customer Tab Navigator
│       ├── restaurant/
│       │   ├── _layout.tsx    ← Restaurant Stack Navigator
│       │   ├── index.tsx      ← Restaurant List screen
│       │   └── [id].tsx       ← Restaurant Menu screen
│       └── order-history/
│           └── index.tsx      ← Order History screen
├── components/                ← Reusable UI components
│   ├── Header.tsx
│   ├── RestaurantCard.tsx
│   ├── MenuItemRow.tsx
│   ├── OrderConfirmationModal.tsx
│   └── OrderHistoryModal.tsx
├── constants/
│   └── colors.ts              ← Brand color tokens
├── hooks/                     ← Custom hooks (e.g., useAuth, useFetch)
├── services/
│   └── api.ts                 ← All API call functions
├── images/
│   └── restaurants/           ← Restaurant images
│       └── RestaurantMenu.jpg ← Static menu image used by all restaurants
├── ai/
│   ├── ai-spec.md             ← THIS FILE
│   └── features/              ← One file per feature
├── LeetCode-Challenges/       ← LeetCode solution screenshots
├── PostmanCollection.json     ← Postman export
├── RESEARCH.md                ← Required research document
├── CONCEPTS.md                ← 3 challenging concepts write-up
├── README.md                  ← Project setup instructions
└── .env                       ← Environment variables (not committed)
```

---

## Color Scheme (Exact — Must Match Wireframes)

All colors must be applied exactly as specified. No custom or approximate colors.

| Name | HEX | RGBA |
|---|---|---|
| Orange Red (primary CTA) | `#DA583B` | rgba(218, 88, 59, 100%) |
| Dark Charcoal (background) | `#222126` | rgba(33, 33, 38, 100%) |
| Dark Red (accents) | `#851919` | rgba(132, 25, 25, 100%) |
| Muted Green (success) | `#609475` | rgba(96, 148, 116, 100%) |
| Warm Yellow / Mustard | `#F0CB67` | rgba(240, 203, 103, 100%) |
| White | `#FFFFFF` | rgba(255, 255, 255, 100%) |

Store these in `constants/colors.ts` and import from there — never hardcode hex values inline.

---

## Wireframe Reference Summary

| Screen | Key UI Elements |
|---|---|
| Login | Logo centered, email + password inputs, LOG IN button (#DA583B), white card on dark background |
| Restaurant List | Header with logo + LOG OUT, Rating/Price dropdowns, 2-column restaurant card grid, bottom tab footer |
| Restaurant Menu | Restaurant name + price + rating, list of menu items with image / name / price / description / stepper (−, qty, +), CREATE ORDER button (disabled at 0), bottom tab footer |
| Order Confirmation Modal | Dark header bar, order summary table (item / qty / price), TOTAL, CONFIRM ORDER button (#DA583B) |
| Order Confirmation (processing) | Button shows "PROCESSING ORDER…", disabled |
| Order Confirmation (success) | Green checkmark icon, "Thank you! Your order has been received." message, button hidden |
| Order Confirmation (failure) | Red X icon, "Your order was not processed successfully. Please try again.", CONFIRM ORDER button reappears |
| Order History | Table with ORDER / STATUS / VIEW columns, magnifier icon in VIEW column |
| Order History Modal | Dark header with restaurant name, order date + status + courier, item list with qty + price, TOTAL |

> All restaurant menus use the same static image: `images/restaurants/RestaurantMenu.jpg`

---

## Rules for the AI

1. **Read this file and the relevant feature spec before writing any code.**
2. **Use junior-friendly code** — prefer clarity over cleverness. Avoid patterns not yet covered in the program.
3. **Do not add features not listed in this spec or the requirement checklist.** No extra screens, no extra API calls.
4. **Reuse existing components and files.** Check `components/` and `services/api.ts` before creating new files.
5. **Colors must match exactly.** Always reference `constants/colors.ts`. Do not approximate.
6. **Navigation must use expo-router file-based routing.** Do not use `react-navigation` directly.
7. **All API calls go through `services/api.ts`.** Do not write fetch calls directly inside screen components.
8. **Token must be read from AsyncStorage** before every authenticated API call.
9. **Item quantities cannot go below 0.** The − button must be disabled or ignored at 0.
10. **Create Order button must be disabled when all quantities are 0.**
11. **Quantities must reset to 0 when navigating to a different restaurant.**
12. **All menus use `RestaurantMenu.jpg`** as the menu image — no per-restaurant images.
13. **Explain changes briefly** with a comment if a non-obvious decision is made.
14. **Do not modify the Spring Boot back-end.** This module is front-end only.

---

## How to Run / Test the Project

### Install Dependencies
```bash
npx create-expo-app rocket-food-delivery
cd rocket-food-delivery
npx expo install expo-router react-native-reanimated react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npm install react-bootstrap bootstrap
npm install @fortawesome/react-native-fontawesome @fortawesome/free-solid-svg-icons
npm install react-native-dotenv
npx expo install @expo/ngrok
```

### Environment Variables (`.env`)
```
API_BASE_URL=https://your-ngrok-url.ngrok.io
```

### Start the App
```bash
npx expo start
```

### Test on Physical Device
1. Start the Spring Boot API locally (from Module 12).
2. Run `ngrok http 8080` to expose it publicly.
3. Update `API_BASE_URL` in `.env` to the Ngrok HTTPS URL.
4. Scan the Expo QR code with Expo Go on your device.

### Test API Endpoints
- Open `PostmanCollection.json` in Postman.
- All parameters are pre-filled. Run without modification.

---

## Definition of Done

- [ ] App runs without errors on both iOS and Android via Expo Go
- [ ] Login screen authenticates with the API and stores the JWT
- [ ] Header and footer are visible on all screens except Login
- [ ] Log Out button clears the token and redirects to Login
- [ ] Restaurant list loads all restaurants on page arrival
- [ ] Rating and Price filters work individually and in combination
- [ ] Clicking a restaurant card navigates to its menu
- [ ] Menu items display with stepper buttons (no typing allowed)
- [ ] Quantities cannot go negative; CREATE ORDER is disabled at all-zero
- [ ] Order Confirmation modal shows processing / success / failure states correctly
- [ ] Quantities reset when switching restaurants
- [ ] Order History table displays with correct columns and data
- [ ] Order History detail modal shows all correct order information
- [ ] All colors match the provided color scheme exactly
- [ ] All screen layouts match the provided wireframes
- [ ] All API calls use bearer token authentication from AsyncStorage
- [ ] `PostmanCollection.json` is at the project root and works without modification
- [ ] `RESEARCH.md` includes native vs cross-platform and React vs React Native comparisons
- [ ] `CONCEPTS.md` lists 3 challenging concepts with file/line references
- [ ] `README.md` covers all required sections
- [ ] Git history shows `feature/* → dev → main` workflow
- [ ] No direct commits to `main`
