# SafeRoad – Road Accident Prediction & Risk Analysis System

SafeRoad is an advanced full-stack Road Accident Prediction & Risk Analysis System built with React 19, TypeScript, Express, ensemble Machine Learning, and AI safety intelligence.

---

## Screenshots
![alt text](<Screenshot 2026-08-19 001334.png>) ![alt text](<Screenshot 2026-08-18 183003.png>) ![alt text](<Screenshot 2026-08-18 182957.png>) ![alt text](<Screenshot 2026-08-18 182946.png>) ![alt text](<Screenshot 2026-08-18 182933.png>) ![alt text](<Screenshot 2026-08-18 182920.png>)


## Local Development Setup (VS Code)

Follow these steps to run the application locally on your machine and local network via Visual Studio Code:

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (comes with Node.js)
* **Visual Studio Code** (recommended editor)

### Step 1: Open Project in VS Code
Open your terminal or VS Code in the project repository root directory:
```bash
code .
```

### Step 2: Install Dependencies
Install all required npm packages for both frontend and backend:
```bash
npm install
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env` if you wish to configure optional API keys (such as `GEMINI_API_KEY` for AI safety advisories):
```bash
cp .env.example .env
```
*(Note: The application includes robust mock fallbacks and local ensemble ML models so it runs fully out-of-the-box even without external API keys).*

### Step 4: Run Development Server
Start the local full-stack development server:
```bash
npm run dev
```

The server will start and bind to `0.0.0.0:3000`, making it accessible on:
* **Localhost**: [http://localhost:3000](http://localhost:3000)
* **Local Network IP**: `http://<your-local-ip>:3000` (accessible from other devices on the same Wi-Fi/LAN)

---

## Available Scripts

In `package.json`, the following scripts are available:
* `npm run dev` — Starts the Express + Vite development server with hot reloading / middleware.
* `npm run build` — Bundles the client and compiles the Express backend server into `dist/server.cjs` for production.
* `npm start` — Runs the compiled production server (`node dist/server.cjs`).
* `npm run lint` — Runs TypeScript type-checking (`tsc --noEmit`).

---

## Production Deployment

The project is fully compatible with Vercel, Cloud Run, and standard Node.js hosting environments.

To build and test production locally:
```bash
npm run build
npm start
```
