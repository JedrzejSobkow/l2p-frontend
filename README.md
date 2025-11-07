# L2P Frontend

## Tech Stack
- React 19 with TypeScript and React Router 7.
- Vite 7 build tooling plus SWC-powered React plugin.
- Tailwind-esque utility classes coexisting with custom styles from `src/index.css`.

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create an environment file**
   ```bash
   cp .env.example .env        # create if it does not exist
   ```
   Fill:
   ```bash
   VITE_API_BASE_URL=https://api.your-backend.com
   VITE_SOCKET_IO_URL=https://api.your-backend.com
   ```
   The value must point to the backend domain that serves `/auth`, `/users`, `/chat` etc. Cookies are sent automatically (`credentials: 'include'`), so the backend must share the same top-level domain or set proper CORS headers.
3. **Run the dev server**
   ```bash
   npm run dev
   ```
   Vite starts on http://localhost:5173 by default and supports hot module replacement.