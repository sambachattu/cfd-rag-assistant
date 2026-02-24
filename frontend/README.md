# Frontend — React + Vite

## Prerequisites

- Node.js 18+
- npm 9+

## Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open **http://localhost:5173**

## Build for Production

```bash
npm run build
# Output is in ./dist/
npm run preview  # Preview production build locally
```

## Environment

The frontend proxies `/api` requests to `http://localhost:8000` via Vite's dev server proxy (configured in `vite.config.js`). No `.env` needed for development.

For production deployment, configure your web server (nginx, etc.) to proxy `/api` to the backend, or update `vite.config.js` proxy target.

## Components

| Component          | Description                                    |
|--------------------|------------------------------------------------|
| `App.jsx`          | Root layout — sidebar + chat split view        |
| `FilePanel.jsx`    | Upload files, view indexed files, delete files |
| `ChatWindow.jsx`   | Chat interface with message history            |
| `hooks/useChat.js` | State management for chat sessions             |
| `services/api.js`  | Axios API client for backend communication     |

## Keyboard Shortcuts

- `Enter` — Send message
- `Shift + Enter` — New line in message input
