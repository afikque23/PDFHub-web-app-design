# PDFHub - All-in-One PDF Ecosystem

PDFHub is a modern, fast, and secure platform for processing PDF files. It features an advanced Next.js App Router frontend, a robust NestJS backend worker system, and Supabase integration.

## Architecture

The system utilizes a modern decoupled architecture:
1. **Frontend**: Next.js 15 (React), TailwindCSS, Shadcn/UI, deployed on Vercel.
2. **Backend Worker**: NestJS processing engine, queued via Prisma PostgreSQL, deployed via Docker on Oracle Cloud Always Free tier.
3. **Storage & Database**: Supabase PostgreSQL and Supabase Storage for secure authentication and file holding.

### Features
- **PDF Tools**: Merge, Split, Compress, Rotate, Watermark, Convert to/from Images/Word, OCR.
- **Enterprise Ready**: Full RBAC (Role-Based Access Control) Admin Dashboard with live analytics.
- **Security First**: 
  - File Validation (Mime type, size, checksums)
  - Anti-Path Traversal protection
  - CSP Headers, Helmet, CORS, and Throttler.
- **Performance**: 
  - Dynamic chunking & lazy loaded charts via Recharts.
  - Server Sent Events (SSE) for Real-Time progress tracking without polling.
  - Full PWA (Progressive Web App) support.

## Installation

### Prerequisites
- Node.js LTS (v20+)
- Supabase Project (Database & Storage)
- Docker & Docker Compose (For backend deployment)
- Ghostscript, LibreOffice, Tesseract OCR, Poppler (if running backend locally without Docker)

### Frontend Setup (Next.js)

1. Clone and navigate to the project root.
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Set up environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

### Backend Worker Setup (NestJS)

1. Navigate to `/backend`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `backend/.env`:
   ```env
   DATABASE_URL="your_supabase_postgres_url"
   SUPABASE_URL="your_supabase_url"
   SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role"
   PORT=3001
   WORKER_ID="local-worker-01"
   ```
4. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Start the backend:
   ```bash
   npm run start:dev
   ```

## Deployment

### Deploying Frontend to Vercel
1. Connect your GitHub repository to Vercel.
2. Add your `NEXT_PUBLIC_*` environment variables in Vercel settings.
3. Deploy! Next.js will automatically optimize the app.

### Deploying Backend to Oracle Cloud (Docker)
1. Provision an Oracle Cloud Always Free ARM/x86 instance.
2. Install Docker and Docker Compose.
3. Copy the `backend` folder to the server.
4. Run `docker-compose up -d --build`.
   *(Ghostscript, LibreOffice, and Poppler are bundled inside the provided Dockerfile)*
5. Configure Nginx Reverse Proxy (Use `nginx.conf.example`).
6. Secure with Let's Encrypt / Certbot for HTTPS Server-Sent Events.

## CI/CD & Testing
PDFHub uses GitHub Actions (`.github/workflows/main.yml`) for automated CI/CD.
- **Linting & Formatting**: Husky, lint-staged, Prettier, ESLint, Commitlint.
- **Unit Testing**: Vitest (Frontend), Jest (Backend). Minimum 80% coverage on core services.

To run tests locally:
```bash
# Frontend
npm run test

# Backend
cd backend && npm run test
```

## Security & Backup
- **Sentry**: Monitored on both Next.js and NestJS.
- **Logging**: Advanced log rotation via Winston (`app.log`, `error.log`, `worker.log`).
- **Backup Strategy**: Check `backup.sh` for an example cron-job script targeting pg_dump and bucket syncing.

## License
Proprietary / Private. Do not distribute without permission.