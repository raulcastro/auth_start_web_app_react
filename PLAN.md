# AuthStartWebApp Improvement Plan

## Context
AuthStartWebApp is the React frontend for the AuthStart ecosystem. It currently works as a single-page switcher but needs to mature into a real multi-route app that fully consumes the Laravel API we just extended (admin users CRUD, profile, avatar, password reset, email verification).

## Goals
1. Replace the manual `currentPage` state with real React Router routes.
2. Centralize API calls in an Axios client with automatic bearer token handling and 401 logout.
3. Make Firebase initialization robust and reusable.
4. Fix existing bugs in `Settings.jsx` and `AppConfigContext`.
5. Connect the dashboard to real backend data.
6. Add avatar upload to the user menu.
7. Move API URLs to environment variables.
8. Improve form error handling using backend validation responses.

## Proposed Implementation

### 1. React Router Integration
- Wrap the app in `BrowserRouter` in `main.jsx`.
- Create a `src/routes/AppRoutes.jsx` component with:
  - `/login` → `Login`
  - `/register` → `Register`
  - `/dashboard` → `Dashboard`
  - `/settings` → `Settings`
  - `/admin/users` → new `AdminUsers` page (initially a simple list)
  - `*` → redirect based on auth state.
- Add a `ProtectedRoute` component that redirects to `/login` when not authenticated.
- Add a `GuestRoute` component that redirects authenticated users away from `/login` and `/register`.
- Update `App.jsx` to render `AppRoutes` inside `AppConfigProvider`, removing the local page switcher.
- Update `Layout.jsx` to use `useNavigate` and `NavLink`/`Link` instead of `onNavigate`/`currentPage` props.

### 2. Axios API Client
- Create `src/services/apiClient.js` using `axios.create`.
- Configure:
  - `baseURL` from `import.meta.env.VITE_API_BASE_URL`.
  - Request interceptor to attach `Authorization: Bearer <token>` from `localStorage`.
  - Response interceptor for global 401 handling: clear storage and redirect to `/login`.
- Keep `src/services/api.js` as the public API (config, logos, web-config) and auth helpers, but migrate authenticated calls to use `apiClient`.
- Add a `logout()` helper in `apiClient.js` or reuse the existing one.

### 3. Firebase Initialization Fix
- In `src/services/firebase.js`, change `initFirebase` so it returns and caches the initialized app/auth in module-level variables, and accepts the API config object.
- Remove the separate `firebaseConfig` module variable confusion; use the argument directly.
- Export a `getFirebaseAuth()` helper that returns the cached auth instance.
- Update `Login.jsx` and `Register.jsx` to call `initFirebase(config)` once and reuse the returned `auth`.

### 4. Bug Fixes
- In `Settings.jsx`, move `canChangeTheme`, `canChangeFontSize`, and `canChangeDenseLayout` declarations above `handleSave`.
- In `AppConfigContext.jsx`, fix `useMemo` dependency array to use `webAppConfig` and `userPreferences` correctly, or remove the helper functions from dependencies by deriving values directly inside `useMemo`.
- Clean up linter warnings: unused `PeopleIcon`, `Paper`, `faviconsLoaded`, unused catch variables.
- Fix the `configLoading` vs `loading` mismatch in `Login.jsx` destructuring.

### 5. Dashboard Real Data
- Extend `src/services/api.js` with `fetchAdminUsers()` using `apiClient`.
- Update `Dashboard.jsx` to fetch real user counts (total, by role, recent signups) via `/api/admin/users`.
- Replace hardcoded stats with backend-driven values and add a loading state.
- Keep the charts with either real aggregated data or clearly labeled sample data until the backend provides analytics.

### 6. Avatar Upload
- Add `uploadAvatar(file)` to `src/services/api.js` using `apiClient` with `multipart/form-data`.
- In `Layout.jsx`, add an avatar button/menu item that opens a file picker.
- On file selection, validate image type/size and call `uploadAvatar`.
- Refresh `user` state in context after a successful upload so the new avatar appears immediately.

### 7. Environment Variables
- Add `.env.example` with:
  - `VITE_API_BASE_URL=http://127.0.0.1:8000/api`
  - `VITE_STORAGE_BASE_URL=http://127.0.0.1:8000`
- Replace hardcoded URLs in `src/services/api.js` and `src/services/firebase.js` with `import.meta.env` values.
- Update `README.md` installation steps.

### 8. Form Error Handling
- Update `Login.jsx` and `Register.jsx` to display field-level errors from the backend `errors` object when available, falling back to the top-level `message`.
- Preserve the existing top-level `Alert` for generic errors.

## Files to Modify / Create
- Modify:
  - `src/main.jsx`
  - `src/App.jsx`
  - `src/components/Layout.jsx`
  - `src/pages/Login.jsx`
  - `src/pages/Register.jsx`
  - `src/pages/Settings.jsx`
  - `src/pages/Dashboard.jsx`
  - `src/services/api.js`
  - `src/services/firebase.js`
  - `src/context/AppConfigContext.jsx`
  - `src/components/Favicons.jsx`
  - `README.md`
- Create:
  - `src/services/apiClient.js`
  - `src/routes/AppRoutes.jsx`
  - `src/routes/ProtectedRoute.jsx`
  - `src/routes/GuestRoute.jsx`
  - `src/pages/AdminUsers.jsx`
  - `.env.example`

## Out of Scope (for this pass)
- Password reset and email verification UI (can be added next).
- Full role/permission management UI.
- Advanced analytics endpoints in the backend.
- Unit/E2E tests for the frontend.

## Risks / Compatibility Notes
- The existing iOS/macOS clients are unaffected because this is purely frontend web.
- We must keep the `/api/*` contract intact; this plan only consumes existing endpoints.
- `react-router-dom` is already installed, so no new dependency is needed.
- `axios` is already installed, so the apiClient can use it immediately.

## Verification
- `npm run lint` passes without warnings.
- `npm run build` completes successfully.
- `npm run dev` starts the app.
- Manual smoke tests:
  - Login with Sanctum redirects to `/dashboard`.
  - Refreshing `/settings` while logged in keeps the user on settings.
  - Logging out redirects to `/login`.
  - Avatar upload updates the user image.
