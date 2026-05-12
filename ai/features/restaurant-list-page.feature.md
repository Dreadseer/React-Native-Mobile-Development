# 🤖 AI_FEATURE — Restaurant List Page

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01, 02, and 03 must be complete before starting this one.
> This document describes only the Restaurant List Page feature.

---

## Feature Identity

- **Feature Name:** Restaurant List Page
- **Related Area:** Mobile — UI / API Integration

---

## Feature Goal

Replace the Restaurant List placeholder with a fully functional screen that fetches all restaurants from the API and displays them in a two-column card grid. The user can filter the list by Rating, Price, or both using dropdown selectors. Tapping a restaurant card navigates to that restaurant's Menu page. The screen must match the wireframe layout and color scheme exactly.

---

## Feature Scope

### In Scope (Included)

- Fetch all restaurants from the API on screen load using the stored JWT token
- Display restaurants in a two-column grid of clickable cards
- Each card shows the restaurant image, name, price range, and star rating
- Rating filter dropdown (values: 1★ through 5★, plus a default "-- Select --" option)
- Price filter dropdown (values: $, $$, $$$, plus a default "-- Select --" option)
- Filters can be applied individually or together — list updates reactively
- When no filter is selected, all restaurants are displayed
- Tapping a restaurant card navigates to `app/customer/restaurant/[id].tsx` passing the restaurant `id`
- Loading state while the API call is in progress
- Error state if the API call fails

### Out of Scope (Excluded)

- Search by restaurant name or keyword
- Sorting (beyond what filtering provides)
- Pagination or infinite scroll
- Favourite / saved restaurants
- Any modification to the Spring Boot API

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Data Fetch on Load:** On screen mount, call `getRestaurants()` from `services/api.ts` with the bearer token from AsyncStorage. Store the full list in state. Show a loading indicator while fetching.
- **R2 — Two-Column Card Grid:** Render the restaurant list using `FlatList` with `numColumns={2}`. Each card is a `TouchableOpacity` wrapping the restaurant image, name, price range, and star rating.
- **R3 — Restaurant Card Layout:** Each card shows:
  - Restaurant image (from the API image URL or a fallback if null)
  - Restaurant name
  - Price range displayed as `$`, `$$`, or `$$$`
  - Star rating displayed as filled star icons using FontAwesome `faStar`
- **R4 — Rating Filter:** A dropdown/picker showing "-- Select --" by default and star values 1–5. Selecting a value filters the displayed list to restaurants with that rating or above.
- **R5 — Price Filter:** A dropdown/picker showing "-- Select --" by default and values `$`, `$$`, `$$$`. Selecting a value filters the displayed list to restaurants matching that exact price range.
- **R6 — Combined Filtering:** When both filters are active, only restaurants matching both conditions are shown. Clearing either filter back to "-- Select --" removes that filter from the condition.
- **R7 — Tap to Navigate:** Tapping a restaurant card calls `router.push` to `app/customer/restaurant/[id]` passing the restaurant's `id` as the dynamic segment.
- **R8 — Section Header:** The screen shows a "NEARBY RESTAURANTS" heading above the filter row, and a "RESTAURANTS" heading above the card grid, matching the wireframe.
- **R9 — Token from AsyncStorage:** The GET request includes `Authorization: Bearer <token>` using the token retrieved from AsyncStorage. If the token is missing, redirect to Login.

---

## User Flow / Logic (High Level)

1. Screen mounts → token retrieved from AsyncStorage → `getRestaurants()` called
2. Loading indicator shown while fetching
3. Full restaurant list stored in state, displayed in two-column grid with no filters applied
4. User selects a Rating filter → list filters reactively, no extra API call needed
5. User selects a Price filter → list filters further if Rating is also active
6. User clears a filter back to "-- Select --" → that condition is removed
7. User taps a restaurant card → `router.push('/customer/restaurant/[id]')` with the restaurant id
8. Restaurant Menu screen loads for that restaurant

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create or Modify

| File | Action | Purpose |
|---|---|---|
| `app/customer/restaurant/index.tsx` | Modify | Replace placeholder with full Restaurant List UI |
| `services/api.ts` | Modify | Add `getRestaurants(token)` function |
| `components/RestaurantCard.tsx` | Create | Reusable card component for a single restaurant |

### Backend / API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/api/restaurants` | Bearer token | Fetch all restaurants |

> Filtering is done client-side — no query params are sent to the API.
> The full list is fetched once on load and filtered in state.

---

## Data Used or Modified

**Read from AsyncStorage:**
- `'token'` — used as Bearer token in the Authorization header

**Restaurant object shape (from API):**
```
{
  id: number,
  name: string,
  rating: number,        // 1–5
  price_range: string,   // '$' | '$$' | '$$$'
  image_url: string | null
}
```

**Local state:**
- `restaurants` — full list from API (never mutated)
- `filteredRestaurants` — derived from `restaurants` based on active filters
- `selectedRating` — number | null
- `selectedPrice` — string | null
- `isLoading` — boolean
- `error` — string | null

---

## Tech Constraints (Feature-Level)

- Use `FlatList` for the restaurant grid — do not use `ScrollView` with `map()`
- Filtering is client-side only — do not make additional API calls when filters change
- Use `router.push` for card navigation (not `router.replace`) — the user should be able to go back to the list from the menu
- Star rating display uses FontAwesome `faStar` icons — render the correct number of filled stars based on the `rating` value
- Do not use any third-party picker/dropdown library — use React Native's built-in `Picker` from `@react-native-picker/picker` or a custom `TouchableOpacity` dropdown if Picker is unavailable
- Keep `RestaurantCard.tsx` as a pure presentational component — it receives props and renders UI only, no API calls or state inside it
- Token check: if AsyncStorage returns null for `'token'`, call `router.replace('/')` immediately

### Wireframe Layout Reference

```
[  HEADER (from Feature 02)  ]

NEARBY RESTAURANTS            ← section heading

Rating          Price
[ -- Select -- ▼ ] [ -- Select -- ▼ ]   ← filter dropdowns
                                          active filter: bg #DA583B, white text

RESTAURANTS                   ← section heading

[ Card ]  [ Card ]
[ Card ]  [ Card ]
[ Card ]  [ Card ]
...

[  FOOTER TAB BAR  ]

Card layout:
┌─────────────────┐
│   [image]       │
│ Restaurant Name │
│ ($$)            │
│ ★★★★            │
└─────────────────┘
Background: white, subtle border or shadow
```

---

## Acceptance Criteria

- [ ] Screen fetches all restaurants on mount using the bearer token
- [ ] Restaurants display in a two-column `FlatList` grid
- [ ] Each card shows image, name, price range, and star rating
- [ ] Star rating renders the correct number of FontAwesome star icons
- [ ] Rating filter shows "-- Select --" by default with options 1★–5★
- [ ] Price filter shows "-- Select --" by default with options $, $$, $$$
- [ ] Selecting a Rating filter updates the displayed list reactively
- [ ] Selecting a Price filter updates the displayed list reactively
- [ ] Both filters can be active simultaneously
- [ ] Clearing a filter back to default restores the unfiltered condition
- [ ] Tapping a restaurant card navigates to the correct Restaurant Menu screen
- [ ] Token is read from AsyncStorage and sent as a Bearer header
- [ ] Missing token redirects to the Login screen
- [ ] Loading indicator is shown while the API call is in progress
- [ ] Error state is shown if the API call fails
- [ ] Header and footer are visible (inherited from layout — verify still working)

---

## Notes for the AI

- The `filteredRestaurants` list should be derived using `useMemo` or a `useEffect` that watches `selectedRating` and `selectedPrice`. Do not mutate the original `restaurants` array.
- `FlatList` with `numColumns={2}` requires each item to have `flex: 1` and a consistent width — use `width: '48%'` or `flex: 1` with a small margin to get the two-column layout right without items stretching.
- If the API returns `image_url` as null for some restaurants, render a grey placeholder `View` at the same dimensions so the card layout doesn't break.
- The price range from the API might come back as a number (1, 2, 3) or a string ('$', '$$', '$$$') depending on the Module 12 implementation. Handle both cases in `RestaurantCard.tsx` with a helper that maps numbers to dollar signs if needed — leave a comment explaining the mapping.
- Star icons: render `Math.round(rating)` filled stars. Keep it simple — no half-star logic needed.
