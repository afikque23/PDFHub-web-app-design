# PDFHub - All-in-One PDF Ecosystem (Vercel Serverless)

PDFHub is a modern, fast, and secure web application for processing PDF files. It features a Next.js App Router frontend, In-Browser Client Engine (pdf-lib), CloudConvert API integration, and Supabase.

## Architecture

The system utilizes a 100% Serverless architecture optimized for Vercel:
1. **Frontend & Serverless API**: Next.js 15 (React 19), TailwindCSS, Shadcn/UI, deployed on Vercel.
2. **In-Browser Processing Engine**: `pdf-lib` for client-side processing (Merge, Split, Rotate, Watermark, JPG to PDF) with instant execution and unlimited quota.
3. **Cloud Document Conversion**: CloudConvert API via Next.js Serverless Route (`/api/convert`) for Word to PDF, PDF to Word, and PDF Compression.
4. **Storage & Auth**: Supabase PostgreSQL and Supabase Storage for secure authentication and file holding.

### Features
- **PDF Tools**: 
  - Merge PDF, Split PDF, Rotate PDF, Watermark PDF, JPG to PDF (Client-side)
  - Word to PDF, PDF to Word, Compress PDF, PDF to JPG (Cloud API)
- **Enterprise Ready**: Full Admin Dashboard with live charts via Recharts.
- **PWA (Progressive Web App)**: Installable on Mobile & Desktop.
- **Security First**: File type validation, secure serverless execution, Content Security Policy headers.

## Installation & Local Setup

### 1. Install dependencies:
```bash
npm install
```

### 2. Set up environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
CLOUDCONVERT_API_KEY="your_cloudconvert_api_key"
```

### 3. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

1. Connect your GitHub repository to [Vercel](https://vercel.com).
2. Add your Environment Variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CLOUDCONVERT_API_KEY`
3. Deploy! Next.js will automatically build and deploy the application.

## License
Proprietary / Private. Do not distribute without permission.