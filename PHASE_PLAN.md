# PHASE-WISE BUILD PLAN — AI Virtual Training Platform

## Workflow
1. Ek phase ka poora code likha jata hai.
2. GitHub pe push → auto-deploy.
3. Agle phase ke liye is file ko reference maan kar continue kiya jata hai.

---

## PHASE 1 — Project Setup & Base UI ✅ DONE
- [x] Backend Express app skeleton (`app.js`, `server.js`, `config/db.js`)
- [x] Folder structure per spec (config/models/controllers/services/routes/middleware/workers/utils)
- [x] `.env.example` (backend + frontend)
- [x] Centralized error middleware + standard response format
- [x] Helmet, CORS, basic rate limiting wired in
- [x] README with setup/run instructions
- [x] React (Vite) app with routing skeleton
- [x] Navbar, Footer, Loading components
- [x] Public page shells: Home, Courses, Trainings, About, Contact, Login, Register, ForgotPassword, ResetPassword, VerifyEmail, VerifyCertificate, Terms, Privacy, RefundPolicy, NotFound

## PHASE 2 — Authentication (NEXT)
- [ ] User model, register/login/logout/refresh
- [ ] Email verification, forgot/reset password
- [ ] authenticateUser / authorizeAdmin middleware
- [ ] AuthContext + ProtectedRoute + AdminRoute wired to real API

## PHASE 3 — Dashboards & User Management
## PHASE 4 — Course System
## PHASE 5 — Training / Virtual Internship System
## PHASE 6 — Enrollment, Progress, Assignments, Tests
## PHASE 7 — Payments
## PHASE 8 — Certificates
## PHASE 9 — Email System (Queue-based)
## PHASE 10 — Search, Reports, Audit, Hardening
## PHASE 11 — Testing, Seed Data, Deployment

(Full detail of each phase is in the original planning doc shared in chat — this file gets updated with checkboxes as each phase ships.)
