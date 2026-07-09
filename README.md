# AuthWebApp

React frontend for AuthStart - A modern authentication system with role-based access control.

This web application is for end users only (`api_user` via Laravel Sanctum and `firebase_user` via Firebase Authentication). Admin and super-admin management is handled by the separate Laravel Blade admin dashboard.

## Technologies

- **React 19** - UI library
- **Vite 8** - Build tool and development server
- **Material-UI (MUI) v9** - Component library
- **React Router v7** - Client-side routing
- **Axios** - HTTP client with bearer-token interceptor
- **Firebase Authentication** - Social login and passwordless registration
- **MUI X Charts / MUI X Data Grid** - Data visualization and grid components
- **Recharts** - Additional charting support
- **Oxlint** - Fast JavaScript linter

## Installation

```bash
cd /Users/rcastro/Developer/Root/AuthStart/AuthWebApp
npm install
```

## Environment variables

Copy `.env.example` to `.env` and adjust the URLs for your local API:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_STORAGE_BASE_URL=http://127.0.0.1:8000
```

- `VITE_API_BASE_URL` - Laravel API base URL (must include `/api`).
- `VITE_STORAGE_BASE_URL` - Laravel public/storage base URL, used for logos, avatars and favicons.
- `VITE_APP_TITLE` - Optional application title override.

Both values are consumed through `import.meta.env` at build time.

## Development

```bash
npm run dev
```

Open http://localhost:5174

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

This runs `oxlint` against the source files.

## Project Structure

```
AuthWebApp/
├── src/
│   ├── components/      # Reusable components
│   │   ├── DocumentTitle.jsx
│   │   ├── Favicons.jsx
│   │   ├── Layout.jsx
│   │   └── PageLoader.jsx
│   ├── context/       # Global app configuration and auth state
│   │   ├── AppConfigContext.jsx
│   │   └── useAppConfig.js
│   ├── pages/         # Route-level page components
│   │   ├── Dashboard.jsx
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── Register.jsx
│   │   └── Settings.jsx
│   ├── routes/        # Routing guards and route definitions
│   │   ├── AppRoutes.jsx
│   │   ├── GuestRoute.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── SignupGuard.jsx
│   ├── services/      # API services and clients
│   │   ├── api.js
│   │   ├── apiClient.js
│   │   └── firebase.js
│   ├── theme/         # MUI theme defaults
│   │   └── theme.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/            # Static assets and fallback favicons
├── index.html
├── package.json
├── vite.config.js
└── .env.example
```

## API Connection

Connects to the AuthStart Laravel API at the URL configured in `VITE_API_BASE_URL`.

Authenticated requests automatically include the bearer token stored in `localStorage` under `auth_token`. If the API returns `401`, the token and user data are cleared and the user is redirected to `/login`.

## Features

- **Login and registration** with Laravel Sanctum or Firebase Authentication, gated by backend `app.signup_enabled`.
- **Social login** via Firebase (Google, Apple, Facebook and GitHub) when enabled in the API config.
- **Route guards**:
  - `ProtectedRoute` redirects unauthenticated users to `/login`.
  - `GuestRoute` redirects authenticated users away from `/login` and `/register`.
  - `SignupGuard` blocks `/register` when sign-up is disabled.
- **Dashboard** with a real-time profile welcome card, account status metrics and sample analytics charts.
- **Profile page** showing account details, roles, verification status and avatar upload.
- **Settings page** for user preferences: theme mode (light/dark/auto), base font size and dense layout, saved to the API and persisted locally.
- **Theme-aware navigation** with light/dark toggle, dynamic logo selection and automatic page reload after preference changes.
- **Dynamic favicons and page titles** loaded from API config, with cache busting when logos change.
- **Avatar upload** from both the user menu in the top bar and the profile page.
- **Route-level code splitting** with `React.lazy()` for Dashboard, Settings, Register and Profile.

## Out of scope

This webapp does **not** include admin/super-admin user management. Those features belong to the Laravel Blade admin dashboard and use the `api_admin` guard.

Password reset and email verification UI are not yet implemented.

## Related Projects

- [AuthStart API](../../AuthStartAPI) - Laravel 13 backend
- [AuthStart iOS](../../AuthStartIOS) - SwiftUI iOS client
- [AuthStart macOS](../../AuthStartMacOS) - SwiftUI macOS client

## Author

Raúl Castro - [raulcastro](https://github.com/raulcastro)
