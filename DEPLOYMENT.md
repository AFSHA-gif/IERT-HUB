# IERT HUB — Production Deployment & Operations Guide
**B.Tech Cyber Security — Semester 3 Academic Portal**

This document provides step-by-step instructions for deploying IERT HUB to production using **Vercel** for client hosting and **Supabase** for backend database, authentication, private storage, and Row Level Security (RLS).

---

## 1. System Requirements
- **Node.js**: `v18.x` or `v20.x` LTS
- **Package Manager**: `npm` (v9+)
- **Build Tool**: Vite (v8.2+)
- **Backend Provider**: Supabase Account (Free or Pro Plan)
- **Frontend Host**: Vercel Account

---

## 2. Local Setup
1. Clone the repository to your environment:
   ```bash
   git clone <repository-url>
   cd IERT_HUB
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```

---

## 3. Environment Variables Reference
Only client-safe environment variables with the `VITE_` prefix are accessible in Vite:

| Variable | Description | Security Level |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project API Endpoint (e.g. `https://xyz.supabase.co`) | Public Client |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Public Anonymous API Key | Public Client |
| `VITE_ADMIN_EMAIL` | Default Admin Portal Email (Optional Override) | Public Client |
| `VITE_ADMIN_PASSWORD` | Default Admin Portal Password (Optional Override) | Public Client |

> **CRITICAL SECURITY NOTICE**: NEVER include your `SUPABASE_SERVICE_ROLE_KEY`, database passwords, or JWT secrets in client code or Vite environment variables.

---

## 4. Supabase Project Setup
1. Sign in to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project named `iert-hub-prod`.
2. Select a geographic region closest to your institution.
3. Secure your Database Password and copy your Project API URL & Anonymous Key from **Project Settings → API**.

---

## 5. Database Schema Migration
1. Navigate to **SQL Editor** in your Supabase Dashboard.
2. Open `supabase/schema.sql` from this repository.
3. Run the complete SQL script to create all core tables and indexes:
   - `public.students`
   - `public.resources`
   - `public.subjects`
   - `public.saved_materials`
   - `public.notifications`
   - `public.resource_activity`
   - `public.admin_logs`

---

## 6. Storage Bucket Configuration
1. Go to **Storage → Buckets** in the Supabase Dashboard.
2. Click **Create New Bucket**:
   - **Bucket Name**: `academic-materials`
   - **Public Bucket**: **DISABLED (Toggle OFF)** — Bucket MUST remain **PRIVATE**.
   - **File Size Limit**: `50MB`
   - **Allowed MIME types**: `application/pdf`
3. Verify that direct unauthenticated public access returns HTTP 403 Forbidden.

---

## 7. Row Level Security (RLS) Configuration
Ensure RLS is enabled on all tables and storage objects:
```sql
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
```
All policies included in `supabase/schema.sql` automatically enforce:
- **Private PDFs**: Only accessible via signed temporary URLs generated through `getPDFUrl()`.
- **Student Privacy**: Students can only view and edit their own account profiles and saved items.
- **Admin Audit Trail**: Only authenticated admins can write to `admin_logs` and perform content mutations.

---

## 8. Local Development Server
To launch local development with live hot-reloading:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 9. Production Build & Bundling
To compile and build the production bundle:
```bash
npm run build
```
Vite generates optimized production assets inside the `/dist` directory.

---

## 10. Vercel Production Deployment
1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **Add New → Project** and import your IERT HUB Git repository.
3. Vercel automatically detects Vite:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Deploy the project. The included `vercel.json` ensures client-side SPA routing (`/student/dashboard`, `/notes`, `/admin/*`) functions properly without 404 errors on page refresh.

---

## 11. Configuring Vercel Environment Variables
1. In Vercel, go to **Project Settings → Environment Variables**.
2. Add the following production variables:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
3. Save and trigger a **Redeploy**.

---

## 12. Custom Domain & Branding Setup
1. In Vercel, go to **Settings → Domains**.
2. Add your institutional custom domain (e.g. `hub.iert.ac.in` or `iert-hub.com`).
3. Configure your DNS provider with the requested `CNAME` or `A` records.
4. Vercel automatically issues an SSL certificate for HTTPS.

---

## 13. Post-Deployment Verification
After deployment, complete the following validation checklist:
- [ ] Visit homepage `https://your-domain.com`.
- [ ] Register a new student account (`/register`).
- [ ] Login as student (`/student/login`) and check session persistence on page refresh.
- [ ] Open a protected PDF resource (`/notes` or `/resource/:id`) and verify the viewer opens correctly.
- [ ] Verify PDF download functions properly.
- [ ] Log out and verify direct access to `/student/dashboard` redirects to login.
- [ ] Log in to Admin Control Center (`/admin/login`).
- [ ] Check System Health (`/admin/system-health`) and Audit Logs (`/admin/audit-logs`).

---

## 14. Production Security Checklist
- [x] Storage bucket `academic-materials` is set to **PRIVATE**.
- [x] No `SUPABASE_SERVICE_ROLE_KEY` exists anywhere in frontend source code or build artifacts.
- [x] All PDF view/download requests pass through 1-hour signed URL generation (`getPDFUrl()`).
- [x] All admin routes are protected by `<ProtectedRoute>` and backend RLS policies.
- [x] All forms perform PDF file format and 50MB size validation before upload.
- [x] Input sanitization prevents path traversal and malformed storage key injection.

---

## 15. Data Backup & Maintenance Recommendations
1. **Database Snapshots**: Supabase provides automated daily PostgreSQL backups for 7 days (Free tier) or 14–30 days (Pro tier).
2. **Manual Schema Backup**: Run `pg_dump` or export table schemas periodically via Supabase CLI:
   ```bash
   supabase db dump -f iert_hub_backup.sql
   ```
3. **Storage Backup**: Maintain offline copies of original academic PDFs uploaded by administrators.
