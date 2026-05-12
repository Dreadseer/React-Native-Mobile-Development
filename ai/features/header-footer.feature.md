# 🤖 AI_FEATURE — Header & Footer

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> The Navigation Structure feature (prompt 01) must be completed before starting this one.
> This document describes only the Header and Footer components.

---

## Feature Identity

- **Feature Name:** Header & Footer
- **Related Area:** Mobile — UI Components

---

## Feature Goal

Build the reusable Header and Footer components that appear on every screen except the Login screen. The Header displays the Rocket Food Delivery logo and a Log Out button. The Footer is the bottom tab bar already wired up by the navigation structure — this feature ensures it is styled correctly and confirms visibility rules. The Header must be integrated into the customer layout so it appears automatically on all customer-facing screens without being added to each screen individually.

---

## Feature Scope

### In Scope (Included)

- `components/Header.tsx` — reusable header component with logo and Log Out button
- Integration of `Header.tsx` into `app/customer/_layout.tsx` so it renders above all customer screens
- Log Out button functionality: clears AsyncStorage token and navigates back to Login (`app/index.tsx`)
- Footer tab bar visual confirmation: correct colors, icons, and labels (already scaffolded in Feature 01 — verify here)
- Header and footer are visible on Restaurant List, Restaurant Menu, and Order History
- Header and footer are NOT visible on the Login screen

### Out of Scope (Excluded)

- Login screen UI (covered in `login-page.feature.md`)
- Any screen content beyond the header/footer shell
- AsyncStorage token write (that happens at login — covered in `login-page.feature.md`)
- Navigation guard / redirect if no token is found (covered in `login-page.feature.md`)

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Header Component:** Create `components/Header.tsx`. It renders the Rocket Food Delivery logo image on the left and a LOG OUT button on the right, matching the wireframe layout exactly.
- **R2 — Header Styling:** Header background is `#222126` (Dark Charcoal). Logo image sourced from project assets. LOG OUT button uses background `#DA583B` (Orange Red) with white text, matching the wireframe.
- **R3 — Log Out Functionality:** Pressing LOG OUT calls `AsyncStorage.removeItem('token')` (and `AsyncStorage.removeItem('customer')` if customer data is stored), then uses `router.replace('/')` to send the user back to the Login screen.
- **R4 — Header Integration:** Import and render `<Header />` inside `app/customer/_layout.tsx` above the `<Tabs>` component so it is present on every customer screen without being imported per-screen.
- **R5 — Login Screen Exclusion:** The Login screen (`app/index.tsx`) must NOT render the Header or the Footer tab bar. Since Login lives in the Root Stack (outside the customer folder), this is handled automatically by the folder structure — verify this is working correctly.
- **R6 — Footer Verification:** Confirm the bottom tab bar from Feature 01 is rendering correctly on all customer screens with the correct labels, icons, and colors.

---

## User Flow / Logic (High Level)

1. User logs in → navigates to customer area
2. Every customer screen renders: `<Header />` at top → screen content in middle → `<Tabs />` footer at bottom
3. User taps LOG OUT in the header
4. AsyncStorage token (and customer data) is cleared
5. `router.replace('/')` sends user to Login screen
6. Login screen renders with no header and no footer tab bar

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create or Modify

| File | Action | Purpose |
|---|---|---|
| `components/Header.tsx` | Create | Reusable header with logo + Log Out button |
| `app/customer/_layout.tsx` | Modify | Import and render `<Header />` above `<Tabs>` |

### Files to Verify (No Changes Expected)

| File | What to Verify |
|---|---|
| `app/index.tsx` | No header or footer renders here |
| `app/customer/restaurant/index.tsx` | Header and footer are both visible |
| `app/customer/order-history/index.tsx` | Header and footer are both visible |

### Backend / API

None — this feature has no API calls.

---

## Data Used or Modified

- **AsyncStorage key `'token'`** — removed on Log Out
- **AsyncStorage key `'customer'`** (if used) — removed on Log Out
- No data is fetched or displayed in this feature

---

## Tech Constraints (Feature-Level)

- Use `@react-native-async-storage/async-storage` for token removal — not `localStorage`
- Use `router.replace('/')` from expo-router for the Log Out redirect — not `router.push`  
  (`replace` prevents the user from pressing back and returning to the customer area)
- Header must be a standalone component in `components/Header.tsx` — do not inline it in layout files
- Logo image: use the provided asset from the project assets folder. Reference it with `require('../assets/images/logo.png')` (adjust path as needed based on actual asset location)
- Do not use a native navigation header — the custom Header component is the only top bar
- Header height should be consistent and not overlap screen content — use `SafeAreaView` or appropriate padding

### Header Layout Reference (from wireframe)

```
|----------------------------------------------|
|  [ROCKET FOOD DELIVERY logo]     [LOG OUT]   |
|----------------------------------------------|
Background: #222126
Logo: left-aligned
LOG OUT button: right-aligned, bg #DA583B, white text, rounded corners
```

---

## Acceptance Criteria

- [ ] `components/Header.tsx` exists and renders without errors
- [ ] Header displays the Rocket Food Delivery logo on the left
- [ ] Header displays a LOG OUT button on the right with correct colors
- [ ] Header background is `#222126`
- [ ] LOG OUT button background is `#DA583B` with white text
- [ ] Pressing LOG OUT clears the AsyncStorage token
- [ ] Pressing LOG OUT navigates the user to the Login screen
- [ ] User cannot press back to return to the customer area after logging out
- [ ] Header is visible on Restaurant List, Restaurant Menu, and Order History screens
- [ ] Header is NOT visible on the Login screen
- [ ] Footer tab bar is visible on all customer screens
- [ ] Footer tab bar is NOT visible on the Login screen
- [ ] Footer labels read exactly **Restaurants** and **Order History**
- [ ] Footer colors match the spec: `#222126` background, `#DA583B` active, `#FFFFFF` inactive

---

## Notes for the AI

- The key architectural decision is placing `<Header />` in `app/customer/_layout.tsx` rather than in each screen. This is the correct approach — do not add it to individual screen files.
- `router.replace('/')` is intentional. Using `router.push('/')` would allow the user to swipe back into the customer area. `replace` removes the customer stack from history entirely.
- If the logo asset path is unknown, add a comment noting where to place the logo file and use a placeholder `<Text>ROCKET FOOD DELIVERY</Text>` styled to match the wireframe, so the feature is otherwise complete.
- Watch out for `SafeAreaView` — on iOS, the header can overlap the status bar without it. Wrap the header content appropriately.
- Do not add any authentication check logic here. That belongs in `login-page.feature.md`.
