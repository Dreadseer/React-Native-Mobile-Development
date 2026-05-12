# 🤖 AI_FEATURE — Login Page

> **IMPORTANT:** Always read `./ai/ai-spec.md` before implementing this feature.
> Features 01 (Navigation Structure) and 02 (Header & Footer) must be complete before starting this one.
> This document describes only the Login Page feature.

---

## Feature Identity

- **Feature Name:** Login Page
- **Related Area:** Mobile — Authentication / UI

---

## Feature Goal

Replace the Login screen placeholder with a fully functional login page that authenticates the customer against the Spring Boot API using email and password. On success, the JWT token and customer data are stored in AsyncStorage and the user is navigated into the customer area. On failure, a clear error message is shown above the Login button. The page must match the wireframe layout and color scheme exactly.

---

## Feature Scope

### In Scope (Included)

- Full Login screen UI matching the wireframe (logo, welcome text, email input, password input, LOG IN button)
- Form state management with `useState` for email, password, error message, and loading state
- POST request to `/api/customers/login` with email and password
- Storing the JWT token in AsyncStorage under the key `'token'`
- Storing the customer object in AsyncStorage under the key `'customer'`
- Navigation to the customer area on successful login using `router.replace('/customer')`
- Error message displayed above the LOG IN button when credentials are invalid
- Loading state: LOG IN button is disabled and shows "Logging in…" while the request is pending
- Input validation: both fields must be non-empty before the request is sent

### Out of Scope (Excluded)

- User registration or sign-up flow
- Password reset or forgot password
- Biometric or social login
- Remember me / auto-login on app relaunch (token persistence check belongs in a future auth guard feature)
- Any modification to the Spring Boot API

---

## Sub-Requirements (Feature Breakdown)

- **R1 — Screen Layout:** Replace the Login placeholder in `app/index.tsx` with the full UI. White card centered on a white background, Rocket Food Delivery logo at the top, "Welcome Back / Login to begin" heading, email input, password input, LOG IN button. Must match the wireframe.
- **R2 — Form State:** Use `useState` to track `email`, `password`, `errorMessage`, and `isLoading`. No external state management library.
- **R3 — Input Validation:** Before sending the API request, check that both `email` and `password` are non-empty strings. If either is empty, set an error message and do not send the request.
- **R4 — API Call:** Send a POST to `/api/customers/login` with body `{ email, password }` and `Content-Type: application/json`. Use the Fetch API. The base URL comes from the environment variable `API_BASE_URL` via `react-native-dotenv`.
- **R5 — Success Handling:** On a successful response (HTTP 200), extract the JWT token and customer object from the response. Store `token` and `customer` in AsyncStorage. Navigate to `/customer` using `router.replace('/customer')`.
- **R6 — Error Handling:** On a failed response (any non-200 status) or a network error, display the message "Invalid email or password. Please try again." above the LOG IN button. The button must re-enable so the user can try again.
- **R7 — Loading State:** While the request is in flight, disable the LOG IN button and change its label to "Logging in…" so the user knows something is happening.
- **R8 — No Header / No Footer:** The Login screen must not show the Header or the tab bar. This is already guaranteed by the folder structure (Login lives in the root Stack, outside `customer/`) — verify it is still correct after replacing the placeholder.

---

## User Flow / Logic (High Level)

1. App launches → Login screen renders with empty inputs and no error message
2. User enters email and password
3. User taps LOG IN
4. Client validates inputs are non-empty — if empty, shows error and stops
5. Button disables and shows "Logging in…"
6. POST `/api/customers/login` is sent with `{ email, password }`
7a. **Success (200):** Token and customer saved to AsyncStorage → `router.replace('/customer')` → customer area loads with Header and footer visible
7b. **Failure (non-200 or network error):** Error message shown above button → button re-enables → user can try again

---

## Interfaces (Pages, Endpoints, Screens)

### Files to Create or Modify

| File | Action | Purpose |
|---|---|---|
| `app/index.tsx` | Modify | Replace placeholder with full Login UI and logic |
| `services/api.ts` | Create (if not exists) / Modify | Add `loginCustomer(email, password)` function |

### Backend / API

| Method | Endpoint | Body | Success Response |
|---|---|---|---|
| POST | `/api/customers/login` | `{ email: string, password: string }` | `{ token: string, customer: { id, email, ... } }` |

> The exact shape of the success response depends on the Module 12 API implementation.
> At minimum, expect a `token` field. Store the full response body as `'customer'` in AsyncStorage.

---

## Data Used or Modified

**AsyncStorage keys written on login:**
- `'token'` — the JWT string, used as Bearer token on all subsequent API calls
- `'customer'` — the full customer object as a JSON string (`JSON.stringify(customer)`)

**Form data (local state only, never persisted):**
- `email` — string
- `password` — string

---

## Tech Constraints (Feature-Level)

- Use the Fetch API only — no Axios
- Base URL must come from `API_BASE_URL` environment variable via `react-native-dotenv` — do not hardcode any URLs
- Use `router.replace('/customer')` on success — not `router.push` (prevents back-navigation to Login)
- Password input must use `secureTextEntry={true}` to mask characters
- Do not use any form library (no Formik, no React Hook Form)
- All API call logic lives in `services/api.ts` — the screen component calls the service function, it does not contain raw fetch calls

### Wireframe Layout Reference

```
Background: white (#FFFFFF)

[  ROCKET FOOD DELIVERY logo (centered, top)  ]

[ Card / white box ]
  "Welcome Back"        ← bold heading
  "Login to begin"      ← subtext

  Email                 ← label
  [ Enter your primary email here ]  ← TextInput

  Password              ← label
  [ ••••••••••••• ]     ← TextInput, secureTextEntry

  [ error message here if any — shown in red above button ]

  [         LOG IN         ]  ← TouchableOpacity, bg #DA583B, white text
[ /Card ]
```

---

## Acceptance Criteria

- [ ] Login screen renders with logo, welcome text, email input, password input, and LOG IN button
- [ ] Layout matches the wireframe (white card, centered content)
- [ ] LOG IN button background is `#DA583B` with white text
- [ ] Password field masks input with `secureTextEntry`
- [ ] Submitting empty fields shows an error message and does not call the API
- [ ] LOG IN button disables and shows "Logging in…" while the request is pending
- [ ] Successful login stores `token` and `customer` in AsyncStorage
- [ ] Successful login navigates to `/customer` with no way to go back
- [ ] Failed login shows "Invalid email or password. Please try again." above the button
- [ ] Failed login re-enables the LOG IN button
- [ ] No Header or footer tab bar is visible on the Login screen
- [ ] `API_BASE_URL` is used from the environment — no hardcoded URLs
- [ ] All API logic is in `services/api.ts`, not inline in the screen

---

## Notes for the AI

- The exact shape of the login API response from Module 12 may vary. Write the success handler to read `response.token` for the token. Store the entire response object as the `'customer'` value in AsyncStorage using `JSON.stringify`. If the token lives at a different path (e.g. `response.data.token`), leave a `// TODO: adjust token path if needed` comment.
- `react-native-dotenv` requires a Babel config entry to work. If `API_BASE_URL` is not resolving, check that `babel.config.js` includes the `react-native-dotenv` plugin pointing to the `.env` file.
- Keep the Login screen's styles clean and self-contained — define a `StyleSheet` at the bottom of the file.
- Do not add any auto-login / token check logic here. If a returning user already has a token in AsyncStorage, that will be handled separately. This screen just handles the manual login flow.
