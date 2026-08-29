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

## PHASE 2 — Authentication ✅ DONE
- [x] User model (bcrypt password hashing, roles, verification/reset token fields)
- [x] Register → email verification (dev mode: link logged to server console, real SMTP comes in Phase 9)
- [x] Login → JWT access token + HTTP-only refresh token cookie
- [x] Logout, refresh-token rotation with reuse detection
- [x] Forgot password / reset password (does not reveal if email exists)
- [x] authenticateUser / authorizeAdmin middleware
- [x] AuthContext (silent refresh on load, 401 auto-retry) + ProtectedRoute + AdminRoute
- [x] Login/Register/ForgotPassword/ResetPassword/VerifyEmail pages wired to real API
- [x] Minimal Dashboard + Admin Dashboard placeholders (full versions in Phase 3)

**Note on email:** verification/reset links are currently logged to the Render server logs
instead of being emailed for real — open the Render "Logs" tab after registering/forgot-password
to grab the link. Real SMTP sending gets wired up in Phase 9.

## PHASE 3 — Dashboards & User Management ✅ DONE
- [x] Student Dashboard layout (sidebar + nested routes): Dashboard, My Courses, My
      Trainings, Assignments, Tests, Certificates, Payments, Profile, Change Password
- [x] Admin Dashboard layout (sidebar + nested routes): Dashboard, Students, Courses,
      Trainings, Assignments, Tests, Certificates, Payments, Reports
- [x] Admin stats API (`GET /api/admin/stats`) — student counts live now, course/training/
      payment counts are placeholders until those phases ship
- [x] Admin Students list — search (name/email), filter (status/verified), pagination,
      suspend/activate
- [x] Profile edit (`PUT /api/users/profile`) — fully functional
- [x] Change password (`PUT /api/users/change-password`) — fully functional, logs out
      all sessions after change

## PHASE 4 — Course System ✅ DONE
- [x] Models: Course (with embedded Module/Lesson sub-schemas)
- [x] Admin Course CRUD (create/read/update/delete, search, filter by status, pagination)
- [x] Course Editor: add/delete modules, add/delete lessons (VIDEO/PDF/LINK/TEXT), publish/unpublish
      (publish blocked until at least one module exists)
- [x] Unique slug auto-generation with collision handling
- [x] Public: Courses list (search/filter by level/pagination) + Course Details page
- [x] Home page now shows real published courses instead of placeholders
- [x] Admin stats now report real course/published counts

**Note:** Module/lesson reordering endpoints exist on the backend
(`PUT .../modules/reorder`, `PUT .../modules/:id/lessons/reorder`) but drag-and-drop UI for
reordering, and file-upload-based PDF/video resources (vs. pasted URLs), are deferred —
can be added as a polish pass later. Access-control that restricts lesson content to
enrolled students only happens in Phase 6 (Enrollment) — for now published course content
is publicly viewable, matching what real platforms typically show as a course preview.

## PHASE 5 — Training / Virtual Internship System ✅ DONE
- [x] Models: Training (with embedded TrainingDay/TrainingTask sub-schemas)
- [x] Admin Training CRUD (create/read/update/delete, search, filter by status, pagination)
- [x] Day/Task editor: add/delete days, add/delete tasks (VIDEO/PDF/LINK/TEXT/ASSIGNMENT),
      publish/unpublish (blocked until at least one day exists)
- [x] Configurable duration (7/14/30 days, or any custom number)
- [x] Unique slug auto-generation (shared logic pattern with courses)
- [x] Public: Trainings list (search/filter by level/pagination) + Training Details page
      with full day-wise schedule
- [x] Home page now shows real published trainings instead of placeholders
- [x] Admin stats now report real training/published-training counts

**Note:** Same deferred items as Phase 4 — drag-and-drop day/task reordering UI and
file-upload-based resources are a later polish pass; enrollment-gated content access
comes in Phase 6.

## PHASE 6 — Enrollment, Progress, Assignments, Tests (NEXT)
## PHASE 7 — Payments
## PHASE 8 — Certificates
## PHASE 9 — Email System (Queue-based)
## PHASE 10 — Search, Reports, Audit, Hardening
## PHASE 11 — Testing, Seed Data, Deployment

(Full detail of each phase is in the original planning doc shared in chat — this file gets updated with checkboxes as each phase ships.)
