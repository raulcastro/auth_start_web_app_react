# AuthWebApp

React frontend for AuthStart - A modern authentication system with role-based access control.

This web application is for end users only (`api_user` via Laravel Sanctum and `firebase_user` via Firebase Authentication). Admin and super-admin management is handled by the separate Laravel Blade admin dashboard.

## 🚀 Technologies

- **React 19** - UI library
- **Vite 8** - Build tool
- **Material-UI (MUI) v9** - Component library
- **React Router v7** - Client-side routing
- **Axios** - HTTP client with bearer-token interceptor

## 📦 Installation

```bash
cd /Users/rcastro/Developer/Root/AuthStart/AuthWebApp
npm install
```

## ⚙️ Environment variables

Copy `.env.example` to `.env` and adjust the URLs for your local API:

```bash
cp .env.example .env
```

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_STORAGE_BASE_URL=http://127.0.0.1:8000
```

- `VITE_API_BASE_URL` — Laravel API base URL (must include `/api`).
- `VITE_STORAGE_BASE_URL` — Laravel public/storage base URL, used for logos, avatars and favicons.

## 🔧 Development

```bash
npm run dev
```

Open http://localhost:5173

## 🏗️ Build

```bash
npm run build
```

## 🧹 Lint

```bash
npx oxlint
```

## 📁 Project Structure

```
AuthWebApp/
├── src/
│   ├── components/     # Reusable components (Layout, Favicons, DocumentTitle)
│   ├── pages/          # Page components (Login, Register, Dashboard, Settings)
│   ├── routes/         # React Router routes, ProtectedRoute, GuestRoute
│   ├── services/       # API services and Axios client
│   │   ├── apiClient.js # Axios instance with auth header and 401 redirect
│   │   ├── api.js      # API endpoints (auth, profile, preferences)
│   │   └── firebase.js # Firebase dynamic initialization and social login
│   ├── context/        # AppConfigContext and useAppConfig hook
│   ├── theme/          # MUI theme config
│   └── App.jsx
├── public/
└── package.json
```

## 🔗 API Connection

Connects to AuthStart Laravel API at the URL configured in `VITE_API_BASE_URL`.

Authenticated requests automatically include the bearer token stored in `localStorage` under `auth_token`. If the API returns `401`, the user is redirected to `/login`.

## 📝 Features

- [x] Login and registration (Sanctum + Firebase)
- [x] Google, Apple, Facebook and GitHub social login (Firebase only)
- [x] Dashboard with user profile welcome
- [x] Self profile update and avatar upload
- [x] User preferences (theme, font size, dense layout)
- [x] Dark/Light mode
- [x] Dynamic favicons and page titles from API config

## 🚫 Out of scope

This webapp does **not** include admin/super-admin user management. Those features belong to the Laravel Blade admin dashboard and use the `api_admin` guard.

## 👨‍💻 Author

Raúl Castro - [raulcastro](https://github.com/raulcastro)
