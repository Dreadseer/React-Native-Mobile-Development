# 🤖 AI_SPEC — Rocket Food Delivery Mobile App (Module 14)

> **IMPORTANT:** This is the global AI specification for Module 14.
> This module is a **direct continuation of Module 13** — no new repository.
> All new features are added to the existing Expo codebase.
> Read this file AND the relevant feature spec before implementing anything.
> Feature specification files are in `./ai/features/`.

---

## Project Identity

- **Project Name:** Rocket Food Delivery — Extended Mobile App (Module 14)
- **Short Description:** Extends the Module 13 customer mobile app with a full courier section, role-based navigation, account management for both customer and courier roles, SMS/email notification opt-in on order confirmation, and brand typography (Arial + Oswald).
- **Project Type:** Mobile App (React Native + Expo) — continuation, same repo
- **Module:** Module 14 — Mobile Development 2
- **Role:** Junior Developer at Genesis Solutions

---

## Goal and Scope

### Goal

Extend the existing Rocket Food Delivery mobile app with four new capabilities: a courier-facing experience for managing deliveries, role-based routing after login (customer only / courier only / both), account management screens for both roles, and notification opt-in (SMS and email) on order placement. Apply brand typography (Arial and Oswald) across all screens.

### In Scope (Build Now)

- Account Selection screen for users with both customer and courier accounts
- Role-based login routing: customer-only → customer app, courier-only → courier app, both → selection screen
- Courier Tab navigator with two tabs: Deliveries and Account
- Courier Deliveries screen: table of orders with ORDER ID, ADDRESS, STATUS (colored button), VIEW button
- Order status progression: PENDING → IN PROGRESS → DELIVERED (locked after DELIVERED)
- Delivery Details Modal: shows delivery address, restaurant, date, product line items, total
- Customer Account screen: view/edit customer email and phone (primary email read-only)
- Courier Account screen: view/edit courier email and phone (primary email read-only)
- Account tab added to customer tab bar (now 3 tabs: Restaurants, Order History, Account)
- Order Confirmation Modal updated: SMS and email opt-in checkboxes, `sendSMS` and `sendEmail` in POST payload
- Arial and Oswald fonts applied across all screens and components
- Shared `AccountScreen` component reused for both customer and courier

### Out of Scope (Do NOT Build)

- Any modification to the Spring Boot back-end API
- Push notifications or real background SMS/email sending from the app (the API handles that)
- New repository — everything goes in the existing Module 13 project
- Any screen or feature not listed in the requirement checklist

---

## Users and Use Cases

- **Customer:** All Module 13 features, plus account management (view/edit email and phone) and notification opt-in when placing orders
- **Courier:** Log in, view all PENDING deliveries + their own IN PROGRESS and DELIVERED orders, advance order status, view delivery details, manage account
- **Dual-role user:** After login, sees the Account Selection screen and chooses which experience to enter

---

## Feature Index

- `./ai/features/navigation-structure.feature.md` — updated root stack + courier tab navigator
- `./ai/features/role-based-navigation.feature.md` — login → role check → routing logic
- `./ai/features/courier-delivery.feature.md` — deliveries screen + status progression + detail modal
- `./ai/features/account-details.feature.md` — shared account screen for both roles
- `./ai/features/order-confirmation-modal.feature.md` — SMS/email opt-in additions
- `./ai/features/ui.feature.md` — fonts, scrollable pages, tab structure
- `./ai/features/code-quality.feature.md` — reusability, cleanliness, folder structure

---

## Navigation Map (Updated for Module 14)

```
Root Stack (app/_layout.tsx)
├── Login                          → app/index.tsx
├── Account Selection              → app/selection.tsx  (dual-role users only)
├── Customer Area
│   └── Customer Tabs (app/customer/_layout.tsx)
│       ├── Restaurants Tab
│       │   └── Restaurant Stack (app/customer/restaurant/_layout.tsx)
│       │       ├── Restaurant List   → app/customer/restaurant/index.tsx
│       │       └── Restaurant Menu   → app/customer/restaurant/[id].tsx
│       ├── Order History Tab         → app/customer/order-history/index.tsx
│       └── Account Tab              → app/customer/account/index.tsx  ← NEW
└── Courier Area                   ← NEW
    └── Courier Tabs (app/courier/_layout.tsx)
        ├── Deliveries Tab           → app/courier/deliveries/index.tsx
        └── Account Tab              → app/courier/account/index.tsx
```

### Login Routing Logic (Post-Login)

```
Login response contains: { hasCustomer: boolean, hasCourier: boolean }

if hasCustomer && hasCourier  → router.replace('/selection')
if hasCustomer only           → router.replace('/customer')
if hasCourier only            → router.replace('/courier')
```

> The login response shape from `/api/auth` must be checked carefully.
> Store role flags in AsyncStorage alongside token and customer/courier data.

---

## API Endpoints (Module 14 — Confirmed from Postman)

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth` | No | Login — returns JWT token + user/role data |
| GET | `/api/orders/pending` | Bearer | Fetch all PENDING orders (couriers see all) |
| GET | `/api/orders?type=courier&id={courierId}` | Bearer | Fetch courier's IN PROGRESS + DELIVERED orders |
| POST | `/api/order/{id}/status` | Bearer | Update order status — body: `{ "order_status_id": number }` |
| GET | `/api/order-statuses` | Bearer | Fetch status ID mapping (PENDING=1, IN PROGRESS=2, DELIVERED=3) |
| GET | `/api/account/{id}` | Bearer | Fetch account details for user |
| PUT | `/api/account/{id}?type={user_type}` | Bearer | Update account email/phone — type: `customer` or `courier` |

### Module 13 endpoints still in use

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/restaurants` | Bearer | Fetch all restaurants |
| GET | `/api/products?restaurant={id}` | Bearer | Fetch menu items |
| POST | `/api/orders` | Bearer | Create order (now includes `sendSMS` and `sendEmail`) |
| GET | `/api/orders?type=customer&id={customerId}` | Bearer | Customer order history |

### Important API Notes

- **Login endpoint is `/api/auth`** — returns a flat object with `accessToken`, `user_id`, `customer_id`, `courier_id`. No nested customer or courier objects.
- **Token field is `accessToken`** — not `token`. Always read `data.accessToken` from the login response.
- **Role detection uses null check** — `data.customer_id != null` and `data.courier_id != null`. Do not use `!!data.customer`.
- **Order status IDs are numbers** — fetch `/api/order-statuses` on courier screen mount. Do not hardcode IDs.
- **Status update uses POST** not PUT/PATCH — `POST /api/order/{id}/status` with `{ "order_status_id": number }`
- **Account GET** — `GET /api/account/{id}` with no `?type` query param
- **Account PUT** — `PUT /api/account/{id}?type=customer` or `?type=courier`
- **Logo file** — selection screen uses `assets/images/logo2.png`, header uses `assets/images/logo.png`

---

## Data and Models

### Stored in AsyncStorage (confirmed from /api/auth response)

```
'token'       → data.accessToken (JWT string — note: field is accessToken not token)
'user'        → JSON.stringify({ id: data.user_id, email }) — no user object in response, built manually
'customer'    → JSON.stringify({ id: data.customer_id }) | JSON.stringify(null) if customer_id is null
'courier'     → JSON.stringify({ id: data.courier_id }) | JSON.stringify(null) if courier_id is null
'role'        → 'customer' | 'courier' — written at routing time, not at login
```

### Confirmed /api/auth Response Shape

```json
{
  "accessToken": "eyJhbGci...",
  "success": true,
  "user_id": 1,
  "customer_id": 1,
  "courier_id": 23
}
```

**Role detection:**
```ts
const hasCustomer = data.customer_id != null;
const hasCourier = data.courier_id != null;
```

### Order Status Mapping (fetched from API)

```
{ id: 1, name: 'PENDING' }
{ id: 2, name: 'IN PROGRESS' }
{ id: 3, name: 'DELIVERED' }
```

> IDs may differ in your database — always fetch from `/api/order-statuses` rather than hardcoding.

### Order (Courier view)

```
{
  id: number,
  status: string,           // 'PENDING' | 'IN PROGRESS' | 'DELIVERED'
  status_id: number,
  address: string,
  restaurant_name: string,
  created_at: string,
  products: [{ name, quantity, unit_price }]
}
```

### Account Details (from /api/account/{id})

```
{
  user_email: string,        // read-only — primary login email
  type_email: string,        // customer or courier email — editable
  type_phone: string         // customer or courier phone — editable
}
```

---

## Tech Stack and Tools

### Mobile Framework
- React Native, Expo SDK ~55, expo-router

### New in Module 14
- `@expo-google-fonts/oswald` — Oswald font family
- `expo-font` — font loading (already a dependency, used to load Oswald)
- Arial — React Native's default system font on iOS/Android, no additional install needed

### Unchanged from Module 13
- TypeScript (.tsx)
- AsyncStorage
- React Bootstrap, FontAwesome
- Fetch API with Bearer token auth
- `process.env.EXPO_PUBLIC_NGROK_URL` for base URL
- Ngrok for physical device testing

---

## Updated Repository Structure

```
/
├── app/
│   ├── _layout.tsx                    ← Updated: handles courier route + selection route
│   ├── index.tsx                      ← Updated: new login routing logic
│   ├── selection.tsx                  ← NEW: Account Selection screen
│   ├── customer/
│   │   ├── _layout.tsx                ← Updated: adds Account tab (3 tabs now)
│   │   ├── restaurant/
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   └── [id].tsx               ← Updated: sendSMS/sendEmail in modal
│   │   ├── order-history/
│   │   │   └── index.tsx
│   │   └── account/
│   │       └── index.tsx              ← NEW: Customer Account screen
│   └── courier/                       ← NEW folder
│       ├── _layout.tsx                ← NEW: Courier Tab navigator
│       ├── deliveries/
│       │   └── index.tsx              ← NEW: Courier Deliveries screen
│       └── account/
│           └── index.tsx              ← NEW: Courier Account screen
├── components/
│   ├── Header.tsx                     ← Unchanged
│   ├── RestaurantCard.tsx             ← Unchanged
│   ├── MenuItemRow.tsx                ← Unchanged
│   ├── OrderConfirmationModal.tsx     ← Updated: SMS/email checkboxes
│   ├── OrderHistoryModal.tsx          ← Unchanged
│   ├── AccountScreen.tsx              ← NEW: Shared component for both account screens
│   └── DeliveryDetailsModal.tsx       ← NEW: Courier delivery detail modal
├── services/
│   └── api.ts                         ← Updated: new endpoints, login endpoint change
├── constants/
│   ├── colors.ts                      ← Unchanged
│   ├── restaurantImages.ts            ← Unchanged
│   └── fonts.ts                       ← NEW: font constants
└── ai/
    ├── ai-spec.md                     ← THIS FILE
    └── features/                      ← 7 feature specs
```

---

## Color Scheme (Unchanged from Module 13)

| Name | HEX |
|---|---|
| Orange Red (primary CTA) | `#DA583B` |
| Dark Charcoal (backgrounds) | `#222126` |
| Dark Red | `#851919` |
| Muted Green (success) | `#609475` |
| Warm Yellow | `#F0CB67` |
| White | `#FFFFFF` |

### Status Button Colors (New)

| Status | Color | HEX |
|---|---|---|
| PENDING | Red | `#851919` |
| IN PROGRESS | Orange | `#DA583B` |
| DELIVERED | Green | `#609475` |

---

## Typography (New in Module 14)

- **Arial** — body text, labels, descriptions. React Native's system default — no install needed. Apply via `fontFamily: 'Arial'` in StyleSheet.
- **Oswald** — headings, section titles, button text. Install via `@expo-google-fonts/oswald`.

### Font Setup

```bash
npx expo install @expo-google-fonts/oswald expo-font
```

```tsx
// app/_layout.tsx
import { useFonts, Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const [fontsLoaded] = useFonts({
  Oswald_400Regular,
  Oswald_700Bold,
});

if (!fontsLoaded) return null;
SplashScreen.hideAsync();
```

### Usage Convention

```ts
// constants/fonts.ts
export const Fonts = {
  heading: 'Oswald_700Bold',
  subheading: 'Oswald_400Regular',
  body: 'Arial',
};
```

Apply `Fonts.heading` to: screen titles ("MY DELIVERIES", "MY ACCOUNT", "NEARBY RESTAURANTS"), table headers, modal headers.
Apply `Fonts.body` to: all body text, labels, descriptions, input placeholders.

---

## Rules for the AI

1. **Read this file and the relevant feature spec before writing any code.**
2. **This is an extension — do not rewrite or refactor Module 13 code** unless a specific feature requires modifying an existing file. Minimal footprint on existing code.
3. **`AccountScreen.tsx` must be a shared component** — used by both `app/customer/account/index.tsx` and `app/courier/account/index.tsx`. Do not build two separate account components.
4. **Do not hardcode order status IDs.** Fetch from `/api/order-statuses` and map by name.
5. **Login endpoint is now `/api/auth`** — update `services/api.ts`. The old `/api/customers/login` is no longer used.
6. **Status update is a POST** — `POST /api/order/{id}/status` with `{ "order_status_id": number }`.
7. **All new screens follow the same white background pattern** established in Module 13.
8. **Oswald font loads in `app/_layout.tsx`** using `useFonts` — not in individual screen files.
9. **All API calls go through `services/api.ts`** — no inline fetch calls in screen components.
10. **`process.env.EXPO_PUBLIC_NGROK_URL`** for all base URLs — never hardcoded.
11. **No dead code, no commented-out code** — code quality is a graded requirement.
12. **Components must be reused** — if two screens need the same UI, it's a shared component.
13. **Do not modify the Spring Boot back-end.** API is consumed as-is.
14. **`router.replace` for all post-login navigation** — prevents back-navigation to Login.

---

## How to Run / Test

### New Dependencies to Install

```bash
npx expo install @expo-google-fonts/oswald expo-font expo-splash-screen
```

### Environment Variables (Unchanged)

```
EXPO_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

### Testing Role-Based Navigation

You need three types of test accounts in your database:
- A user with a customer account only
- A user with a courier account only
- A user with both accounts

Check DBeaver to confirm which test accounts cover each scenario before building the role routing.

---

## Definition of Done (Module 14)

- [ ] All Module 13 features still work correctly after extensions
- [ ] Login routes correctly for customer-only, courier-only, and dual-role users
- [ ] Account Selection screen renders and navigates correctly for dual-role users
- [ ] Courier Deliveries screen loads all PENDING orders + courier's own IN PROGRESS/DELIVERED
- [ ] Status button advances PENDING → IN PROGRESS → DELIVERED
- [ ] Status button is locked (disabled) once DELIVERED
- [ ] Status button colors match: red / orange / green
- [ ] Delivery Details Modal shows correct address, restaurant, date, products, total
- [ ] Customer Account screen loads correct data and UPDATE ACCOUNT saves changes
- [ ] Courier Account screen loads correct data and UPDATE ACCOUNT saves changes
- [ ] Primary email is read-only on both account screens
- [ ] Order Confirmation Modal includes SMS and email checkboxes
- [ ] `sendSMS` and `sendEmail` booleans are included in the order POST payload
- [ ] Oswald font applied to headings and titles across all screens
- [ ] Arial applied to body text across all screens
- [ ] Customer tab bar has 3 tabs: Restaurants, Order History, Account
- [ ] Courier tab bar has 2 tabs: Deliveries, Account
- [ ] `AccountScreen.tsx` is a shared component used by both roles
- [ ] No dead code or commented-out code anywhere
- [ ] All new screens have white backgrounds and match wireframes
- [ ] App runs without errors on both iOS and Android via Expo Go
