# 🤖 AI_FEATURE — Navigation Structure (Module 14)

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> This module is a continuation of Module 13 — do not rewrite existing navigation files unless specifically noted.
> This document describes only the Navigation Structure changes for Module 14.

---

## Feature Identity

- **Feature Name:** Navigation Structure (Module 14 Extension)
- **Related Area:** Mobile — Expo Router / Navigation

---

## Feature Goal

Extend the existing Module 13 navigation structure to support two new top-level areas: the Account Selection screen and the full Courier section. The root Stack gains two new routes. The Customer Tab navigator gains a third tab (Account). A brand new Courier Tab navigator is created with two tabs (Deliveries and Account). Font loading is also initialized here so Oswald is available across the entire app before any screen renders.

---

## Feature Scope

### In Scope (Included)

- Update `app/_layout.tsx` — add `selection` and `courier` routes to the root Stack, initialize Oswald font loading with `useFonts`, prevent splash screen hiding until fonts are loaded
- Update `app/customer/_layout.tsx` — add the Account tab as the third tab
- Create `app/selection.tsx` — placeholder screen for the Account Selection screen (real UI in Feature 02)
- Create `app/courier/_layout.tsx` — new Courier Tab navigator with Deliveries and Account tabs
- Create `app/courier/deliveries/index.tsx` — placeholder
- Create `app/courier/account/index.tsx` — placeholder
- Create `app/customer/account/index.tsx` — placeholder
- Create `constants/fonts.ts` — font name constants used across all components

### Out of Scope (Excluded)

- Real screen UI content (each screen is a placeholder — real content in later features)
- Role-based routing logic after login (Feature 02)
- Font application to individual screens (done progressively in Features 05 and 06)
- Any changes to existing Module 13 screens beyond the customer tab bar update

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Root Stack Update:** `app/_layout.tsx` adds `selection` and `courier` as named routes. All screens still have `headerShown: false`. Font loading via `useFonts` from `@expo-google-fonts/oswald` — app renders nothing (`return null`) until fonts are loaded, then `SplashScreen.hideAsync()` is called.
- **R2 — Customer Tab Update:** `app/customer/_layout.tsx` adds a third tab — Account — using FontAwesome `faPerson` or `faUser` icon. Tab order: Restaurants | Order History | Account. Tab bar colors unchanged from Module 13.
- **R3 — Courier Tab Navigator:** `app/courier/_layout.tsx` is a new Tab navigator with two tabs: Deliveries (FontAwesome `faTruck`) and Account (FontAwesome `faUser`). Same tab bar styling as customer: background `#222126`, active tint `#DA583B`, inactive tint `#FFFFFF`.
- **R4 — New Placeholder Screens:** `app/selection.tsx`, `app/courier/deliveries/index.tsx`, `app/courier/account/index.tsx`, `app/customer/account/index.tsx` — each renders a minimal `<View><Text>Screen Name</Text></View>`.
- **R5 — Font Constants:** `constants/fonts.ts` exports a `Fonts` object with `heading`, `subheading`, and `body` keys pointing to the correct font family strings.
- **R6 — Splash Screen:** Install and configure `expo-splash-screen` to prevent the app flashing unstyled content before Oswald loads.

---

## User Flow / Logic (High Level)

1. App launches → `app/_layout.tsx` starts loading Oswald fonts → Splash screen held
2. Fonts loaded → Splash screen dismissed → Root Stack renders
3. Login screen renders (unchanged from Module 13)
4. Post-login routing (handled in Feature 02) sends user to `/customer`, `/courier`, or `/selection`
5. Customer area: three-tab bottom bar — Restaurants | Order History | Account
6. Courier area: two-tab bottom bar — Deliveries | Account
7. Selection screen: placeholder for now, real UI in Feature 02

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create

| File | Purpose |
|---|---|
| `app/selection.tsx` | Account Selection placeholder |
| `app/courier/_layout.tsx` | Courier Tab Navigator |
| `app/courier/deliveries/index.tsx` | Courier Deliveries placeholder |
| `app/courier/account/index.tsx` | Courier Account placeholder |
| `app/customer/account/index.tsx` | Customer Account placeholder |
| `constants/fonts.ts` | Font name constants |

### Files to Modify

| File | Change |
|---|---|
| `app/_layout.tsx` | Add selection + courier routes, add font loading |
| `app/customer/_layout.tsx` | Add Account as third tab |

### Backend / API

None — this feature is structural scaffolding only.

---

## Data Used or Modified

None. No API calls, no AsyncStorage reads in this feature.

---

## Tech Constraints (Feature-Level)

- Install: `npx expo install @expo-google-fonts/oswald expo-font expo-splash-screen`
- Font loading must happen in `app/_layout.tsx` — not in individual screen files
- Use `useFonts` from `@expo-google-fonts/oswald` — not manual font asset registration
- `SplashScreen.preventAutoHideAsync()` must be called before the component renders (outside the component function, at module level)
- Courier tab bar uses identical styling to customer tab bar: `#222126` bg, `#DA583B` active, `#FFFFFF` inactive
- `constants/fonts.ts` must use the exact font family strings that `useFonts` registers

### Font Constants Reference

```ts
// constants/fonts.ts
export const Fonts = {
  heading: 'Oswald_700Bold',
  subheading: 'Oswald_400Regular',
  body: 'Arial',
};
```

### Root Layout Font Loading Pattern

```tsx
import { useFonts, Oswald_400Regular, Oswald_700Bold } from '@expo-google-fonts/oswald';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Oswald_400Regular, Oswald_700Bold });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
```

---

## Acceptance Criteria

- [ ] App launches without errors after font dependency install
- [ ] Splash screen is held until Oswald fonts are loaded
- [ ] Root Stack includes routes for `index`, `selection`, `customer`, and `courier`
- [ ] All native headers are hidden across all navigators
- [ ] Customer tab bar has three tabs: Restaurants, Order History, Account
- [ ] Courier tab bar has two tabs: Deliveries, Account
- [ ] Both tab bars use `#222126` background, `#DA583B` active, `#FFFFFF` inactive
- [ ] All new placeholder screens render without errors
- [ ] `constants/fonts.ts` exports `Fonts.heading`, `Fonts.subheading`, `Fonts.body`
- [ ] Navigating to `/courier` shows the courier tab bar with delivery and account placeholders
- [ ] Navigating to `/selection` shows the selection placeholder

---

## Notes for the AI

- Do not remove or rename any existing Module 13 routes in `app/_layout.tsx` — only add to them.
- The `app/customer/_layout.tsx` change is minimal — just add one more `<Tabs.Screen>` entry for Account. Do not touch the existing Restaurants or Order History tab config.
- `SplashScreen.preventAutoHideAsync()` must be called at module level (outside the component) — placing it inside the component function causes it to run too late.
- If `expo-splash-screen` is already installed from Module 13, skip that part of the install command.
- The courier `_layout.tsx` is nearly identical to the customer `_layout.tsx` in structure — just different tab count, icons, and route names. Note the similarity in a comment to reinforce reusability awareness.
