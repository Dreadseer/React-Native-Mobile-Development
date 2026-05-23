# 🤖 AI_FEATURE — Code Quality (Module 14)

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01–06 must be complete before starting this one.
> This document describes the Code Quality standards for Module 14.

---

## Feature Identity

- **Feature Name:** Code Quality
- **Related Area:** Mobile — All files

---

## Feature Goal

Perform a final code quality pass across the entire codebase to ensure it meets Module 14's graded requirements: components are reused where possible (no duplication), code is clean and well-commented, no dead or commented-out code exists anywhere, and the folder structure is logical and professional. This is a review and cleanup pass — not a feature build.

---

## Feature Scope

### In Scope (Included)

- Audit all components for unnecessary duplication — consolidate anything that's duplicated
- Remove all dead code: unused imports, unused variables, unused functions, unreachable code
- Remove all commented-out code blocks (not comments that explain logic — only disabled code)
- Add meaningful comments to complex or non-obvious logic
- Verify `services/api.ts` functions are consistently structured
- Verify folder structure matches the spec in `ai-spec.md`
- Remove all temporary debug `console.log` statements added during development
- Confirm `constants/fonts.ts` and `constants/colors.ts` are used consistently — no inline hardcoded values
- Verify `AccountScreen.tsx` is the only account UI implementation (no duplicated account screens)

### Out of Scope (Excluded)

- Adding new features or changing any behavior
- Refactoring working logic into a different pattern
- Performance optimization
- Test coverage

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Remove Debug Logs:** Find and remove all temporary `console.log` statements that were added during development for debugging API responses. These include logs like `=== AUTH RESPONSE ===`, `=== ORDER PAYLOAD ===`, `=== ACCOUNT RESPONSE ===`, `=== ORDERS RESPONSE ===`, `=== CREATE ORDER STATUS ===`, etc. Keep any `console.error` calls in catch blocks — those are legitimate error handling.
- **R2 — Remove Dead Code:** Scan every file for unused imports, unused state variables, unused functions, and unreachable code paths. Remove them all.
- **R3 — Remove Commented-Out Code:** Find any blocks of code that have been commented out with `//` or `/* */` and remove them. Do not remove comments that explain what code does — only disabled code blocks.
- **R4 — Component Reuse Audit:** Confirm that `AccountScreen.tsx` is used by both `app/customer/account/index.tsx` and `app/courier/account/index.tsx` with no UI duplication between them. If any account-related UI was duplicated instead of using the shared component, consolidate it now.
- **R5 — Meaningful Comments:** Add a one-line comment above any logic that is not immediately obvious to a junior developer reading the code for the first time. Targets: the role detection logic in `app/index.tsx`, the order merge/deduplication in `app/courier/deliveries/index.tsx`, the status normalization pattern, the quantities object pattern in `app/customer/restaurant/[id].tsx`, the modulo image assignment in `constants/restaurantImages.ts`.
- **R6 — Constants Usage:** Verify that all color values in StyleSheets reference `colors.ts` constants or the hex values from the spec — no random colors introduced during development. Verify all font family strings reference `Fonts.heading`, `Fonts.subheading`, or `Fonts.body` — no inline hardcoded font strings.
- **R7 — Folder Structure Verification:** Confirm the project folder structure matches what's defined in `ai-spec.md`. No stray files in wrong locations, no empty placeholder files left over from scaffolding.
- **R8 — API Service Consistency:** Verify every function in `services/api.ts` follows the same pattern: takes params including `token`, builds the URL with `BASE_URL`, includes `Authorization: Bearer ${token}` header, throws on non-OK response, returns parsed JSON. Any function that deviates should be brought into alignment.

---

## Files to Audit

Every file in the project should be reviewed. Priority targets:

| File | What to check |
|---|---|
| `services/api.ts` | Remove debug logs, verify consistent function pattern |
| `app/index.tsx` | Remove auth response log, add comment on role detection logic |
| `app/customer/restaurant/[id].tsx` | Remove payload logs, add comment on quantities pattern |
| `app/courier/deliveries/index.tsx` | Remove order response logs, add comment on merge/dedup logic |
| `components/AccountScreen.tsx` | Verify it's the single source of account UI |
| `components/OrderConfirmationModal.tsx` | Remove payload log, verify no dead state |
| `constants/restaurantImages.ts` | Add comment on modulo pattern |
| All screen files | Remove any unused imports or state variables |

---

## Acceptance Criteria

- [ ] No `console.log` debug statements remain in any file
- [ ] `console.error` in catch blocks is preserved
- [ ] No unused imports in any file
- [ ] No unused state variables in any file
- [ ] No commented-out code blocks anywhere
- [ ] `AccountScreen.tsx` is the only account UI implementation — no duplication
- [ ] Complex logic has a brief explanatory comment
- [ ] All font family strings use `Fonts.*` from `constants/fonts.ts`
- [ ] No random or hardcoded hex color values introduced during development
- [ ] `services/api.ts` functions follow a consistent pattern
- [ ] Folder structure matches `ai-spec.md`
- [ ] No stray or empty placeholder files remain
- [ ] App still runs without errors after the cleanup pass

---

## Notes for the AI

- When removing debug logs, be surgical — remove only the `console.log` line itself, not any surrounding logic that was needed.
- Do not remove `console.error` calls — these are intentional error handling that should stay.
- When adding comments, keep them short and in plain English — one line above the relevant code block. Do not over-comment obvious things like `// set loading to true`.
- The goal of this pass is to make the code look like it was written by a careful junior developer who understood what they were building — not a first draft with scaffolding still visible.
- After completing the cleanup, do a final check: run the app and navigate through every screen to confirm nothing broke during the removal of dead code.
