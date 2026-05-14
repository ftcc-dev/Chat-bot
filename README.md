# Auto-Registration

Chat UI camouflaging a PhilHealth Konsulta auto-registration engine.

## Stack
- Frontend: React 18 + TS + Vite + Tailwind
- Backend: Node + Express 5 + Puppeteer

## Setup

```bash
# Backend (already installed)
cd backend
npm start          # http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Usage
In the chat, type:
- `/register 050502495531 Member`
- `/register 012521036883 DD`
- `PIN: 050502495531, TYPE: Member`

Anything without a 12-digit PIN + type keyword is treated as a normal chat message.
