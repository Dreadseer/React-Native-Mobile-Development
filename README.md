# Rocket Food Delivery — Mobile App (Modules 13 & 14)

**A cross-platform mobile application built with React Native and Expo that supports both customer and courier experiences for the Rocket Food Delivery platform. Customers can browse restaurants, place orders with SMS/email notification opt-in, and manage their account. Couriers can view and manage deliveries, advance order status, and manage their account. The app routes users based on their role after login and connects to the Rocket Food Delivery Spring Boot REST API.**

---

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation / Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Author](#author)

---

## Project Description

Rocket Food Delivery is a mobile application built across two modules, supporting both the customer and courier sides of the platform.

**Customer experience:** Log in, browse a list of local restaurants with rating and price filters, view menus with item pricing, place orders using a quantity stepper interface, opt in to SMS and/or email order confirmation notifications, and review full order history with line-item details. Customers can also view and update their account email and phone number.

**Courier experience:** Log in, view all pending deliveries alongside their own in-progress and delivered orders, advance order status through the PENDING → IN PROGRESS → DELIVERED workflow, view full delivery details including address, restaurant, date, and product breakdown, and manage their account email and phone number.

**Role-based routing:** After login, the app detects whether the user has a customer account, a courier account, or both. Customer-only users go directly to the customer tab navigator. Courier-only users go directly to the courier tab navigator. Users with both roles are presented with an Account Selection screen to choose which experience to enter.

The app connects to the Rocket Food Delivery Spring Boot REST API built in Module 12, communicating over HTTPS via a Ngrok tunnel during development. It runs on both iOS and Android through the Expo Go app, with no separate builds required.

---

## Tech Stack

- **Mobile Framework:** React Native, Expo SDK ~54
- **Routing:** expo-router ~6.0.23 (file-based navigation)
- **Language:** TypeScript ~5.9.2
- **State Management:** React Hooks (useState, useEffect) — no Redux or Zustand
- **Storage:** @react-native-async-storage/async-storage 2.2.0 (JWT and role data persistence)
- **Typography:** @expo-google-fonts/oswald ^0.4.2 (Oswald headings), Arial (system font for body text)
- **Font Loading:** expo-font ~14.0.11, expo-splash-screen ~31.0.13
- **UI Libraries:** @fortawesome/react-native-fontawesome ^1.0.0, @fortawesome/free-solid-svg-icons ^7.2.0
- **API Communication:** Fetch API with Bearer token authentication
- **Dev Tools:** @expo/ngrok ^4.1.3 (local API tunneling), Postman (API testing)
- **Back-end (consumed):** Spring Boot REST API (Module 12 — not included in this repo)

---

## Project Structure

```
/                                        ← Project root
├── client/                              ← Expo mobile app
│   ├── app/                             ← Expo Router screens (file-based routing)
│   │   ├── _layout.tsx                  ← Root Stack Navigator + font loading
│   │   ├── index.tsx                    ← Login screen + role-based routing
│   │   ├── selection.tsx                ← Account Selection screen (dual-role users)
│   │   ├── customer/
│   │   │   ├── _layout.tsx              ← Customer Tab Navigator (3 tabs)
│   │   │   ├── restaurant/
│   │   │   │   ├── _layout.tsx          ← Restaurant Stack Navigator
│   │   │   │   ├── index.tsx            ← Restaurant List screen
│   │   │   │   └── [id].tsx             ← Restaurant Menu screen
│   │   │   ├── order-history/
│   │   │   │   ├── _layout.tsx          ← Order History Stack Navigator
│   │   │   │   └── index.tsx            ← Order History screen
│   │   │   └── account/
│   │   │       └── index.tsx            ← Customer Account screen (wrapper)
│   │   └── courier/
│   │       ├── _layout.tsx              ← Courier Tab Navigator (2 tabs)
│   │       ├── deliveries/
│   │       │   └── index.tsx            ← Courier Deliveries screen
│   │       └── account/
│   │           └── index.tsx            ← Courier Account screen (wrapper)
│   ├── components/                      ← Reusable UI components
│   │   ├── Header.tsx                   ← App header with logo and Log Out button
│   │   ├── RestaurantCard.tsx           ← Restaurant grid card
│   │   ├── MenuItemRow.tsx              ← Menu item row with quantity stepper
│   │   ├── OrderConfirmationModal.tsx   ← Order summary, notification opt-in, and confirmation
│   │   ├── OrderHistoryModal.tsx        ← Order history detail modal
│   │   ├── AccountScreen.tsx            ← Shared account view/edit screen (customer + courier)
│   │   └── DeliveryDetailsModal.tsx     ← Courier delivery detail modal
│   ├── services/
│   │   └── api.ts                       ← All API call functions
│   ├── constants/
│   │   ├── fonts.ts                     ← Font family constants (Oswald + Arial)
│   │   └── restaurantImages.ts          ← Cuisine image mapping by restaurant ID
│   ├── assets/                          ← Images and fonts
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   └── .env                             ← Environment variables (not committed)
├── ai/                                  ← AI specification documents
│   ├── ai-spec.md                       ← Global project specification
│   └── features/                        ← Per-feature specification files
├── serverJAVA/                          ← Spring Boot API (Module 12)
└── README.md
```

---

## Installation / Setup

### Prerequisites

- Node.js installed
- Expo Go app installed on your mobile device (iOS or Android)
- The Rocket Food Delivery Spring Boot API (Module 12) running locally on port 8080

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the client directory:
   ```bash
   cd "Module 13-14/client"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Install Expo font packages:
   ```bash
   npx expo install @expo-google-fonts/oswald expo-font expo-splash-screen
   ```

5. Create a `.env` file in the `client/` directory and add your Ngrok URL (see [Environment Variables](#environment-variables)):
   ```bash
   EXPO_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
   ```

6. Start the Spring Boot API from Module 12 (runs on `http://localhost:8080` by default).

7. In a separate terminal, start a Ngrok tunnel to expose the local API:
   ```bash
   ngrok http 8080
   ```

8. Copy the HTTPS forwarding URL from the Ngrok output (e.g. `https://abc123.ngrok-free.app`) and update `EXPO_PUBLIC_NGROK_URL` in your `.env` file.

9. Start the Metro bundler with tunnel mode:
   ```bash
   npx expo start --tunnel
   ```

10. Scan the QR code displayed in the terminal with the Expo Go app on your device.

### Login Routing Behaviour

After a successful login the app routes based on the user's roles:

| Scenario | Result |
|---|---|
| Customer account only | Routes directly to the customer tab navigator |
| Courier account only | Routes directly to the courier tab navigator |
| Both customer and courier accounts | Routes to the Account Selection screen to choose a role |

> **Important:** Every time Ngrok is restarted, a new URL is generated. Update `EXPO_PUBLIC_NGROK_URL` in `.env` and restart the Metro bundler (`npx expo start --tunnel`) each time this happens. If you have a fixed Ngrok domain, the URL stays the same and no update is needed.

---

## Environment Variables

Create a `.env` file inside the `client/` directory with the following:

```env
EXPO_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
```

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_NGROK_URL` | The public HTTPS URL generated by Ngrok that tunnels to the local Spring Boot API running on port 8080. The `EXPO_PUBLIC_` prefix is required by Expo to expose the variable to the client bundle. Must be updated every time Ngrok is restarted. |

> `.env` is listed in `.gitignore` and must never be committed to the repository.

All API calls in `services/api.ts` use this variable as the base URL:
```ts
const BASE_URL = process.env.EXPO_PUBLIC_NGROK_URL;
```

---

## API Documentation

All endpoints are consumed from the Rocket Food Delivery Spring Boot REST API (Module 12). The base URL is set via `EXPO_PUBLIC_NGROK_URL`.

All authenticated endpoints require the following request header:

```
Authorization: Bearer <token>
```

The token is received from the login endpoint and stored in AsyncStorage for the duration of the session.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth` | No | Authenticate with email and password. Returns JWT access token, user ID, customer ID, and courier ID. |
| GET | `/api/restaurants` | Bearer | Fetch all restaurants with name, rating, and price range. |
| GET | `/api/restaurants/:id` | Bearer | Fetch details for a single restaurant. |
| GET | `/api/products?restaurant=:id` | Bearer | Fetch all menu items for a restaurant. |
| GET | `/api/orders?type=customer&id=:customerId` | Bearer | Fetch all past orders for a customer. |
| POST | `/api/orders` | Bearer | Create a new order. Body includes customer ID, restaurant ID, product list, and optional `sendSMS` / `sendEmail` booleans for notification opt-in. |
| GET | `/api/orders/pending` | Bearer | Fetch all orders with PENDING status (visible to all couriers). |
| GET | `/api/orders?type=courier&id=:courierId` | Bearer | Fetch all orders assigned to a specific courier. |
| POST | `/api/order/:id/status` | Bearer | Update the status of an order. Body: `{ "status": "in progress" }` (lowercase string). |
| GET | `/api/account/:id` | Bearer | Fetch account details for a user including primary email and role-specific email and phone. |
| PUT | `/api/account/:id?type=:role` | Bearer | Update role-specific email and phone. `type` is either `customer` or `courier`. |

---

## Author

**[Christopher Clarke]**
- GitHub: [https://github.com/Dreadseer]
- LinkedIn: [https://www.linkedin.com/in/christopher-clarke-11172310b/]

*Built as part of the CodeBoxx Academy Full-Stack Development Program — Modules 13 & 14: Mobile Development*
