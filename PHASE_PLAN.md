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

## PHASE 6 — Enrollment, Progress, Assignments, Tests ✅ DONE
- [x] Enrollment model + free-enroll flow (`Enroll Now` blocked for paid items with a clear
      "Payment integration coming in Phase 7" message; works immediately for free items)
- [x] Progress tracking: mark lesson/task complete, live progress % on course/training pages
      and My Courses / My Trainings, auto-marks item **completed** once the completion-rule
      threshold is hit (configurable per course/training, defaults to 100%)
- [x] Assignment submission (text and/or file-link) for ASSIGNMENT-type lessons/tasks —
      inline submission form appears right in the course/training content
- [x] Admin: review submissions (Pass/Fail + score + feedback) from `/admin/assignments`
- [x] Test/Quiz system: admin creates tests tied to a course or training, adds
      single/multi-choice questions with correct answers, publish/unpublish
- [x] Server-side scoring only (correct answers never sent to the client before submission)
- [x] Student: take test from course/training page, see score + pass/fail immediately,
      full attempt history at `/dashboard/tests`
- [x] Admin stats now report real enrollment counts

**Deferred to later phases as originally planned:** a full drag/drop completion-rule
builder UI (the engine itself is server-validated and working, just simple threshold-based
for now), and payment-gated enrollment (Phase 7).

## PHASE 7 — Payments ✅ DONE
- [x] Order model + Razorpay integration (order creation, checkout, signature verification)
- [x] Webhook endpoint (`/api/payments/webhook`) with HMAC signature verification and
      idempotent handling (mounted before the JSON body-parser so the raw bytes are
      available for verification)
- [x] Paid-course/training enroll flow: Buy Now → Razorpay order → checkout popup →
      signature verified server-side → Enrollment created automatically
- [x] Refund handling (admin-triggered via Razorpay refund API) + full transaction history
- [x] Student: Payments page showing all orders and their status
- [x] Admin: Payments list (search/filter by status/pagination) + revenue summary cards
- [x] Admin stats now report real payment counts and total revenue

**Setup required before payments work live:** the admin needs to add real Razorpay
credentials to Render's environment variables — `PAYMENT_KEY_ID`, `PAYMENT_KEY_SECRET`
(from the Razorpay dashboard), and `PAYMENT_WEBHOOK_SECRET` (set when creating a webhook
in Razorpay pointing to `<backend-url>/api/payments/webhook`, subscribed to the
`payment.captured` and `payment.failed` events). Until then, `Buy Now` returns a clear
"payments not configured yet" error instead of crashing — free items are unaffected.

## PHASE 8 — Certificates ✅ DONE
- [x] CertificateTemplate model (singleton) + admin template editor (org name, title, body
      text with `{{studentName}}`/`{{itemTitle}}` placeholders, signature block, accent color)
- [x] Certificate model with unique, non-predictable ID (`CERT-XXXXXXXXXXXX`)
- [x] Auto-issued the moment an enrollment's progress hits its completion threshold
      (hooked into the Phase 6 completion engine) - idempotent, no duplicates
- [x] Server-side PDF generation (pdfkit) with embedded QR code linking to the verify page
- [x] Public verification: `/verify-certificate/:certificateId` page +
      `GET /api/certificates/verify/:certificateId` (no auth needed)
- [x] Student: Certificates page with PDF download (auth-protected, blob download so the
      JWT header is included)
- [x] Admin: Certificates list (search/filter/pagination), revoke/reinstate
- [x] Admin stats now report real issued-certificate counts

**Deferred:** certificate background-image upload (needs the cloud storage that's part of
the broader file-upload polish pass) - the template currently supports text/color
branding, which covers the core "certificate looks professional and is verifiable"
requirement from the spec.

## PHASE 9 — Email System (Queue-based) ✅ DONE
- [x] Redis connection (lazy - app boots fine without `REDIS_URL`, falls back to the
      dev-mode console-log behaviour used since Phase 2)
- [x] BullMQ email queue with retry + exponential backoff (5 attempts: 5s/10s/20s/40s/80s)
- [x] EmailJob model + in-process worker (`src/workers/email.worker.js`) that sends via
      Nodemailer/SMTP and updates job status
- [x] Moved every email (welcome, verify, reset, payment confirmation, submission
      reviewed, certificate ready) from direct/console send to the queue
- [x] Failed jobs keep their error message; BullMQ's built-in stalled-job recovery
      handles workers that crash mid-job
- [x] Admin: Email Logs page (`/admin/email-logs`) - search by status, see attempts and
      error messages, manually retry any failed email

**Setup required for real emails:** without `REDIS_URL` set, everything still works
exactly as before (console-log fallback, marked "Sent" in the logs). To get real email
delivery: add `REDIS_URL` (e.g. a free Upstash or Render Redis instance) and the SMTP
variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`) to Render's
environment variables - most reliably a transactional provider like Brevo, SendGrid, or
Gmail with an App Password.

## PHASE 10 — Search, Reports, Audit, Hardening (NEXT)
## PHASE 11 — Testing, Seed Data, Deployment

(Full detail of each phase is in the original planning doc shared in chat — this file gets updated with checkboxes as each phase ships.)
