# 🤖 AI_FEATURE — UI (Module 14)

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01–05 must be complete before starting this one.
> This document describes the UI requirements: fonts, scrollable pages, and tab structure.

---

## Feature Identity

- **Feature Name:** UI Standards
- **Related Area:** Mobile — Typography / Layout / Navigation

---

## Feature Goal

Apply Arial and Oswald fonts consistently across all screens and components. Ensure any screen with overflowing content is scrollable. Verify the customer tab bar has three tabs and the courier tab bar has two tabs as specified. This is a cross-cutting polish pass — touching multiple files to bring the full app into visual compliance with the Module 14 UI requirements.

---

## Feature Scope

### In Scope (Included)

- Apply `Fonts.heading` (Oswald 700) to all screen headings and section titles
- Apply `Fonts.subheading` (Oswald 400) to sub-headings and table headers
- Apply `Fonts.body` (Arial) to all body text, labels, descriptions, input placeholders, and button text
- Ensure every screen with content that can overflow has `ScrollView` wrapping the content
- Confirm customer tab bar has exactly 3 tabs: Restaurants, Order History, Account
- Confirm courier tab bar has exactly 2 tabs: Deliveries, Account
- Update `components/Header.tsx` to apply Oswald to the logo text if text-based

### Out of Scope (Excluded)

- Changing any colors, layout, spacing, or component logic
- Adding new screens or features
- Changing tab bar icons or labels

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Font Application — Headings:** Apply `fontFamily: Fonts.heading` to all screen-level headings. Targets: "NEARBY RESTAURANTS", "RESTAURANTS", "RESTAURANT MENU", "MY ORDERS", "MY DELIVERIES", "MY ACCOUNT" — and any other `<Text>` that serves as a page or section title.
- **R2 — Font Application — Table Headers:** Apply `fontFamily: Fonts.subheading` to table header row text (ORDER, STATUS, VIEW, ADDRESS columns in both Order History and Courier Deliveries screens).
- **R3 — Font Application — Body Text:** Apply `fontFamily: Fonts.body` (Arial) to all other text — labels, descriptions, prices, helper text, input values, placeholder text, button labels, modal body text.
- **R4 — Scrollable Pages:** Wrap content in `<ScrollView>` on any screen where content can exceed the viewport. Check: Restaurant Menu (`[id].tsx`), Order History, Courier Deliveries, both Account screens, Order History Modal body, Delivery Details Modal body.
- **R5 — Customer Tab Verification:** Confirm `app/customer/_layout.tsx` has exactly 3 tabs in this order: Restaurants → Order History → Account. Tab labels match exactly.
- **R6 — Courier Tab Verification:** Confirm `app/courier/_layout.tsx` has exactly 2 tabs in this order: Deliveries → Account. Tab labels match exactly.

---

## Files to Update

Apply font changes across all of these — read each file first and only add `fontFamily` to existing `Text` styles. Do not restructure any layouts:

| File | Font changes needed |
|---|---|
| `app/customer/restaurant/index.tsx` | Headings → Oswald, body → Arial |
| `app/customer/restaurant/[id].tsx` | Heading → Oswald, item text → Arial |
| `app/customer/order-history/index.tsx` | Heading → Oswald, table headers → Oswald 400, rows → Arial |
| `app/customer/account/index.tsx` | Heading → Oswald, labels → Arial |
| `app/courier/deliveries/index.tsx` | Heading → Oswald, table headers → Oswald 400, rows → Arial |
| `app/courier/account/index.tsx` | Heading → Oswald, labels → Arial |
| `app/selection.tsx` | "Select Account Type" → Oswald, card labels → Arial |
| `components/Header.tsx` | Logo text (if text-based) → Oswald |
| `components/AccountScreen.tsx` | "MY ACCOUNT" heading → Oswald, all other text → Arial |
| `components/OrderConfirmationModal.tsx` | Modal header → Oswald, body → Arial |
| `components/OrderHistoryModal.tsx` | Modal header → Oswald, body → Arial |
| `components/DeliveryDetailsModal.tsx` | Modal header → Oswald, body → Arial |
| `components/MenuItemRow.tsx` | Item name → Arial, price → Arial |
| `components/RestaurantCard.tsx` | Name → Arial, price/rating → Arial |

---

## Tech Constraints (Feature-Level)

- `Fonts` object is already defined in `constants/fonts.ts` — always import from there, never hardcode font family strings inline
- Oswald is already loaded in `app/_layout.tsx` via `useFonts` — no additional setup needed
- Arial is the system default on iOS and Android — `fontFamily: 'Arial'` is sufficient, no install needed
- Do not change `fontSize`, `fontWeight`, `color`, or any other style property — only add `fontFamily`
- If a `StyleSheet` entry already has `fontFamily`, update it. If not, add it.
- ScrollView additions should preserve existing layout — wrap the outermost content `View` inside `<ScrollView style={{ flex: 1 }}>`, keep the outer container structure intact

---

## Acceptance Criteria

- [ ] All screen-level headings use `Fonts.heading` (Oswald 700)
- [ ] All table header row text uses `Fonts.subheading` (Oswald 400)
- [ ] All body text, labels, descriptions, and button labels use `Fonts.body` (Arial)
- [ ] Restaurant Menu screen scrolls when menu items exceed viewport
- [ ] Order History screen scrolls when orders exceed viewport
- [ ] Courier Deliveries screen scrolls when deliveries exceed viewport
- [ ] Both Account screens scroll if content overflows
- [ ] Modal bodies scroll if product list is long
- [ ] Customer tab bar has exactly 3 tabs: Restaurants, Order History, Account
- [ ] Courier tab bar has exactly 2 tabs: Deliveries, Account
- [ ] No layout, color, or spacing regressions from font changes

---

## Notes for the AI

- This is a polish pass — the goal is additive only. Read each file, identify `<Text>` components in `StyleSheet` entries, add `fontFamily`. Do not rewrite or restructure.
- The fastest approach: search each file for `StyleSheet.create` and add `fontFamily` to the relevant entries. Then check for any inline styles on `<Text>` components and add `fontFamily` there too.
- If a screen already uses a `ScrollView`, verify it has `showsVerticalScrollIndicator={false}` and `contentContainerStyle={{ paddingBottom: 20 }}` for a clean scroll experience.
- For screens that need `ScrollView` added — wrap the inner content `View` (not the outermost container that holds the Header) inside `<ScrollView>`. The Header stays outside the scroll area.
- After making changes, the app should look visually identical except for the font rendering — if anything shifts in layout, a style was accidentally changed.
