# Rocket Food Delivery — Customer Mobile App

**A cross-platform mobile application built with React Native and Expo that allows Rocket Food Delivery customers to browse restaurants, place orders, and review their order history. Connects to an existing Spring Boot REST API.**

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

Rocket Food Delivery is a customer-facing mobile application that lets users log in, browse a list of local restaurants, view menus with item pricing, place orders with a quantity stepper interface, and review their full order history. The app connects to the Rocket Food Delivery Spring Boot REST API built in Module 12, communicating over HTTPS via a Ngrok tunnel during development. It runs on both iOS and Android through the Expo Go app, with no separate builds required.

---

## Tech Stack

- **Mobile Framework:** React Native, Expo SDK ~54
- **Routing:** expo-router ~6.0.23 (file-based navigation)
- **Language:** TypeScript ~5.9.2
- **State Management:** React Hooks (useState, useEffect) — no Redux or Zustand
- **Storage:** @react-native-async-storage/async-storage 2.2.0 (JWT persistence)
- **UI Libraries:** @fortawesome/react-native-fontawesome ^1.0.0, @fortawesome/free-solid-svg-icons ^7.2.0
- **API Communication:** Fetch API with Bearer token authentication
- **Dev Tools:** @expo/ngrok ^4.1.3 (local API tunneling), Postman (API testing)
- **Back-end (consumed):** Spring Boot REST API (Module 12 — not included in this repo)

---

## Project Structure

```
/                                   ← Project root
├── client/                         ← Expo mobile app
│   ├── app/                        ← Expo Router screens (file-based routing)
│   │   ├── _layout.tsx             ← Root Stack Navigator
│   │   ├── index.tsx               ← Login screen
│   │   └── customer/
│   │       ├── _layout.tsx         ← Customer Tab Navigator (Header + bottom tabs)
│   │       ├── restaurant/
│   │       │   ├── _layout.tsx     ← Restaurant Stack Navigator
│   │       │   ├── index.tsx       ← Restaurant List screen
│   │       │   └── [id].tsx        ← Restaurant Menu screen
│   │       └── order-history/
│   │           ├── _layout.tsx     ← Order History Stack Navigator
│   │           └── index.tsx       ← Order History screen
│   ├── components/                 ← Reusable UI components
│   │   ├── Header.tsx              ← App header with logo and Log Out button
│   │   ├── RestaurantCard.tsx      ← Restaurant grid card
│   │   ├── MenuItemRow.tsx         ← Menu item row with quantity stepper
│   │   ├── OrderConfirmationModal.tsx  ← Order summary and confirmation modal
│   │   └── OrderHistoryModal.tsx   ← Order history detail modal
│   ├── services/
│   │   └── api.ts                  ← All API call functions
│   ├── constants/
│   │   └── restaurantImages.ts     ← Cuisine image mapping by restaurant ID
│   ├── assets/                     ← Images and fonts
│   ├── package.json
│   ├── tsconfig.json
│   ├── babel.config.js
│   └── .env                        ← Environment variables (not committed)
├── ai/                             ← AI specification documents
│   ├── ai-spec.md                  ← Global project specification
│   └── features/                   ← Per-feature specification files
├── serverJAVA/                     ← Spring Boot API (Module 12)
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

4. Create a `.env` file in the `client/` directory and add your Ngrok URL (see [Environment Variables](#environment-variables)):
   ```bash
   EXPO_PUBLIC_NGROK_URL=https://your-ngrok-url.ngrok-free.app
   ```

5. Start the Spring Boot API from Module 12 (runs on `http://localhost:8080` by default).

6. In a separate terminal, start a Ngrok tunnel to expose the local API:
   ```bash
   ngrok http 8080
   ```

7. Copy the HTTPS forwarding URL from the Ngrok output (e.g. `https://abc123.ngrok-free.app`) and update `EXPO_PUBLIC_NGROK_URL` in your `.env` file.

8. Start the Metro bundler with tunnel mode:
   ```bash
   npx expo start --tunnel
   ```

9. Scan the QR code displayed in the terminal with the Expo Go app on your device.

> **Important:** Every time Ngrok is restarted, a new URL is generated. Update `EXPO_PUBLIC_NGROK_URL` in `.env` and restart the Metro bundler (`npx expo start --tunnel`) each time this happens.

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

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth` | No | Authenticate customer with email and password. Returns JWT access token and customer ID. |
| GET | `/api/restaurants` | Yes | Fetch all restaurants. |
| GET | `/api/restaurants/:id` | Yes | Fetch details for a single restaurant (name, rating, price range). |
| GET | `/api/products?restaurant=:id` | Yes | Fetch all menu items for a restaurant. |
| GET | `/api/orders?type=customer&id=:customerId` | Yes | Fetch all past orders for the logged-in customer. |
| POST | `/api/orders` | Yes | Create a new order with customer ID, restaurant ID, and product list. |

All authenticated endpoints require the following request header:

```
Authorization: Bearer <token>
```

The token is received from the login endpoint and stored in AsyncStorage for the duration of the session.

---

## Author

**[Christopher Clarke]**
- GitHub: [https://github.com/Dreadseer]
- LinkedIn: [https://www.linkedin.com/in/christopher-clarke-11172310b/]

*Built as part of the CodeBoxx Academy Full-Stack Development Program — Module 13: Mobile Development 1*
