# Store Rating Platform

A full-stack web application platform for discovering stores, submitting ratings, and exploring reviews with strict Role-Based Access Control (RBAC).

---

## 🏗 Project Architecture

```text
store-rating-platform/
├── backend/            # Express.js API server & Prisma ORM with PostgreSQL
│   ├── prisma/         # Prisma schema, migrations, and seed script
│   ├── src/            # Controllers, Services, Middlewares, Routes, Utilities
│   ├── .env.example    # Environment configuration template
│   └── package.json
├── frontend/           # React 18 + Vite frontend single page application
│   ├── src/            # Reusable components, pages, context, & API client
│   ├── .env.example    # Environment configuration template
│   └── package.json
├── package.json        # Root monorepo workspace scripts
└── README.md
```

---

## 🔑 Demo Seed Credentials

After running `npm run db:seed` in the `backend/` directory, use the following pre-configured credentials to log in:

| Role | Email | Password |
|---|---|---|
| **System Admin** | `admin@storerating.com` | `Password123!` |
| **Store Owner** | `owner@storerating.com` | `Password123!` |
| **Normal User** | `user@storerating.com` | `Password123!` |

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: v14.0 or higher (Running locally or via Docker/Supabase/Neon)

---

### Step 1: Clone & Install Dependencies

From the root project directory:

```bash
# Install dependencies for both backend and frontend
npm run setup
```

Or install individually:

```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

---

### Step 2: Configure Environment Variables

#### Backend Configuration (`backend/.env`)
Copy `.env.example` to `.env` inside `backend/`:

```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/storerating_db?schema=public"
JWT_SECRET="super-secret-jwt-key-minimum-32-chars-long-12345!"
JWT_EXPIRES_IN="7d"
```

#### Frontend Configuration (`frontend/.env`)
Copy `.env.example` to `.env` inside `frontend/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

### Step 3: Database Setup & Seed

Navigate to `backend/` and run Prisma client generation, migrations, and seed script:

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Push database schema to PostgreSQL
npm run db:push

# Seed initial users, stores, and sample ratings
npm run db:seed
```

---

### Step 4: Run Development Servers

Run both Backend (Express) and Frontend (Vite) concurrently from the root directory:

```bash
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api/v1`
- **Health Check**: `http://localhost:5000/api/v1/health`

---

## 🧪 Testing & Verification

Run the comprehensive unit test suite in the backend:

```bash
# Run backend test suite
cd backend
npm test
```

Build the frontend production bundle:

```bash
# Build frontend for production
npm run build:frontend
```

---

## 🧹 Linting & Formatting

Validate code quality and ensure zero ESLint errors across the workspace:

```bash
# Lint entire monorepo
npm run lint
```
