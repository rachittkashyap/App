# AI Virtual Training & Course Platform

Full-stack MERN platform for online courses and virtual training/internship programs, being built phase-by-phase. See `PHASE_PLAN.md` for the full roadmap and current progress.

## Status: Phase 2 complete — Authentication

## Project Structure

```
backend/    Express + MongoDB API
frontend/   React (Vite) app
```

## Backend Setup

```bash
cd backend
cp .env.example .env
# edit .env with your MongoDB URI etc.
npm install
npm run dev
```

Server runs on `http://localhost:5000`. Health check: `GET /api/health`.

## Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs on `http://localhost:5173`.

## Notes

- This is being built in phases (see `PHASE_PLAN.md`). Later phases add auth, courses, trainings, payments, certificates, email queue, etc.
- No real secrets are committed. Copy `.env.example` to `.env` and fill in your own credentials for MongoDB, SMTP, Redis, payment gateway, and storage provider as those phases are implemented.
- Certificates issued by this platform are course/training completion certificates only — not government, UGC, or university accreditation unless explicitly stated.
