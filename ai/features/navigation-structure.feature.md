# 🤖 AI_FEATURE — Navigation Structure

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> This document describes only the Navigation Structure feature.
> Do not implement any screen UI content — only the navigation shell.

---

## Feature Identity

- **Feature Name:** Navigation Structure
- **Related Area:** Mobile — Expo Router / Navigation

---

## Feature Goal

Set up the complete three-level nested navigation structure for the app using expo-router file-based routing. This feature creates the navigation skeleton that all other screens will live inside. No screen content is built here — only the layout files and navigation containers that control how the app moves between screens.

---

## Feature Scope

### In Scope (Included)

- Root-level Stack Navigator (`app/_layout.tsx`) — controls top-level flow between Login and the Customer area
- Customer-level Tab Navigator (`app/customer/_layout.tsx`) — provides the bottom tab bar with two tabs: Restaurants and Order History
- Restaurant-level Stack Navigator (`app/customer/restaurant/_layout.tsx`) — handles navigation between the Restaurant List and the Restaurant Menu screen
- Placeholder screen files so navigation renders without errors
- Bottom tab bar with two tabs: **Restaurants** and **Order History**
- Tab icons using FontAwesome

### Out of Scope (Excluded)

- Any screen content, UI layout, or data fetching (those belong in their own feature specs)
- Header component (covered in `header-footer.feature.md`)
- Authentication guard / redirect logic (covered in `login-page.feature.md`)
- Styling beyond what is needed to confirm navigation renders correctly

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Root Stack Navigator:** `app/_layout.tsx` wraps the entire app in a Stack navigator. It defines two routes: the Login screen (index) and the customer area. The header is hidden at this level (header is a custom component, not a native stack header).
- **R2 — Customer Tab Navigator:** `app/customer/_layout.tsx` renders a bottom Tab navigator with two tabs — Restaurants and Order History. Tabs use FontAwesome icons. Active tab is visually highlighted.
- **R3 — Restaurant Stack Navigator:** `app/customer/restaurant/_layout.tsx` wraps the restaurant section in a nested Stack navigator. It manages navigation from the Restaurant List to the Restaurant Menu screen and back.
- **R4 — Placeholder Screens:** Each required screen file exists and renders a minimal placeholder (e.g., a `<View>` with a `<Text>` label) so the navigation tree works end-to-end before any real UI is built.
- **R5 — Footer Tab Labels:** The two footer tabs are labeled exactly **Restaurants** and **Order History** as shown in the wireframe.
- **R6 — No Native Stack Headers:** All native stack headers must be hidden (`headerShown: false`). The custom Header component (built in a later feature) handles the top bar.

---

## User Flow / Logic (High Level)

1. App launches → Root Stack renders `app/index.tsx` (Login screen placeholder)
2. After login (handled later) → Root Stack navigates to `app/customer/`
3. Customer area loads → Tab Navigator renders with bottom tab bar
4. Default tab is **Restaurants** → loads `app/customer/restaurant/index.tsx` (Restaurant List placeholder)
5. User taps a restaurant (handled later) → Restaurant Stack pushes `app/customer/restaurant/[id].tsx` (Restaurant Menu placeholder)
6. User taps back → Restaurant Stack pops back to Restaurant List
7. User taps **Order History** tab → loads `app/customer/order-history/index.tsx` (Order History placeholder)

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create

| File | Purpose |
|---|---|
| `app/_layout.tsx` | Root Stack Navigator |
| `app/index.tsx` | Login screen (placeholder only for this feature) |
| `app/customer/_layout.tsx` | Customer Tab Navigator with bottom tab bar |
| `app/customer/restaurant/_layout.tsx` | Restaurant Stack Navigator |
| `app/customer/restaurant/index.tsx` | Restaurant List (placeholder only) |
| `app/customer/restaurant/[id].tsx` | Restaurant Menu (placeholder only) |
| `app/customer/order-history/index.tsx` | Order History (placeholder only) |

### Backend / API

None — this feature has no API calls.

---

## Data Used or Modified

None. This feature is purely structural navigation scaffolding.

---

## Tech Constraints (Feature-Level)

- Use **expo-router** file-based routing exclusively. Do not install or use `@react-navigation/native` directly.
- Tab navigator must use `expo-router`'s `Tabs` component (from `expo-router`).
- Stack navigator must use `expo-router`'s `Stack` component.
- Tab icons must use FontAwesome via `@fortawesome/react-native-fontawesome`.
- All native stack headers must be hidden with `headerShown: false`.
- Do not add any authentication redirect logic in this feature — that comes in `login-page.feature.md`.
- Tab bar background color: `#222126` (Dark Charcoal). Active tab tint: `#DA583B` (Orange Red). Inactive tint: `#FFFFFF`.

### Tab Bar Style Reference

```tsx
tabBarStyle: { backgroundColor: '#222126' },
tabBarActiveTintColor: '#DA583B',
tabBarInactiveTintColor: '#FFFFFF',
```

---

## Acceptance Criteria

- [ ] App launches without errors
- [ ] Root Stack renders the Login placeholder screen on launch
- [ ] Navigating to the customer area shows the bottom tab bar
- [ ] Bottom tab bar has exactly two tabs: **Restaurants** and **Order History**
- [ ] Each tab has a FontAwesome icon
- [ ] Tapping the Restaurants tab loads the Restaurant List placeholder
- [ ] Tapping the Order History tab loads the Order History placeholder
- [ ] Tapping a restaurant card (placeholder) navigates to the Restaurant Menu placeholder
- [ ] Back navigation from Restaurant Menu returns to Restaurant List
- [ ] No native stack headers are visible on any screen
- [ ] Tab bar colors match the spec: dark background, orange-red active, white inactive

---

## Notes for the AI

- This feature is **scaffolding only**. Screens should render a simple `<View><Text>Screen Name</Text></View>` placeholder. Do not build real UI here.
- The folder structure is critical — expo-router derives routes directly from file paths. Get the folder/file names exactly right from the start.
- `[id].tsx` uses dynamic routing. The `id` param will be used later to fetch the selected restaurant's menu. For now, just render a placeholder and log the param.
- Do not add a `headerShown` option anywhere that accidentally shows a native header — double-check every `Stack.Screen` and `Tabs.Screen` option.
- Keep all three layout files minimal and well-commented so the student can clearly see the nesting structure.
- Confirm the navigation tree works fully before moving to the next feature.
