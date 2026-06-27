# PDFHub Backend Worker (NestJS)

Backend Worker untuk PDFHub yang dioptimalkan berjalan di dalam Docker Container. Didesain untuk di-deploy pada Oracle Cloud Always Free (Ubuntu 24.04).

## Deployment Guide (Oracle Cloud Ubuntu 24.04)

Ikuti panduan berikut langkah demi langkah. Server tidak memerlukan instalasi aplikasi tambahan selain **Docker** karena semua *dependency native* (Ghostscript, Poppler, LibreOffice, OCR) sudah dipaketkan ke dalam *container*.

### 1. Install Docker & Docker Compose
Masuk ke terminal server Oracle Cloud Anda (SSH), dan jalankan:
```bash
sudo apt update && sudo apt upgrade -y
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
# Beri akses non-root ke Docker (Opsional tapi direkomendasikan)
sudo usermod -aG docker $USER
newgrp docker
# Install Docker Compose Plugin
sudo apt-get install docker-compose-plugin
```

### 2. Clone Repository
```bash
git clone <URL_REPO_ANDA> pdfhub-backend
cd pdfhub-backend/backend
```

### 3. Konfigurasi Environment (`.env`)
Salin berkas contoh dan isi variabelnya.
```bash
cp .env.example .env
nano .env
```
Isi kredensial Supabase (`SUPABASE_URL` dan `SUPABASE_SERVICE_ROLE_KEY`) dan koneksi Database (`DATABASE_URL`). Pastikan Anda memiliki dua bucket di Supabase Storage bernama `pdfhub-input` dan `pdfhub-output`.

### 4. Build Docker Image
Membangun image dengan arsitektur multi-stage untuk menghemat ukuran. Ini akan mengunduh dependensi OS dan melakukan kompilasi NestJS.
```bash
docker compose build
```

### 5. Jalankan Container (Background)
Menjalankan *worker* selamanya di *background*. Container akan otomatis di-*restart* apabila sistem VPS mati (*reboot*) berkat *policy* `unless-stopped`.
```bash
docker compose up -d
```

### 6. Cek Status Health
Jika *container* berjalan, periksa ketersediaan sistem:
```bash
curl http://localhost:3000/health
```
Respons akan menampilkan `status: ok` lengkap dengan *uptime* memori VPS Anda.

---

## Maintenance & Monitoring

### Cara Melihat Log Aplikasi
Semua *log* telah dipisah oleh **Winston** secara otomatis ke dalam folder `logs/` (ter-mount ke OS VPS Anda):
```bash
cat logs/app-2023-10-xx.log
cat logs/worker-2023-10-xx.log
```
Atau, jika ingin melihat langsung *log container* secara langsung (*live stream*):
```bash
docker compose logs -f
```

### Cara Update Aplikasi
Jika ada perubahan kode (via `git pull`), jalankan urutan ini untuk me-restart *worker*:
```bash
git pull origin main
docker compose build --no-cache
docker compose up -d
```

### Cara Restart Container
```bash
docker compose restart
```

### Cara Masuk ke Dalam Container
Jika Anda ingin mengecek keberadaan Ghostscript / LibreOffice di dalam kontainer:
```bash
docker exec -it pdfhub-worker bash
# tes ghostscript
gs -v
# tes poppler
pdftocairo -v
```

## Keamanan & Optimasi
- **Non-Root Execution**: NestJS di-*run* oleh *user* `node` murni di dalam kontainer. File `.sh` akan men-*chown* folder `temp/` secara otomatis di proses *startup*.
- **ImageMagick Security Policy Bypass**: Secara standar (`default`), sistem Linux Ubuntu memblokir PDF di ImageMagick. Dockerfile proyek ini menabrak kebijakan keamanan di `policy.xml` via rutin konfigurasi ulang spesifik secara presisi.
- **Auto-Cleanup**: Endpoint dari modul Pemrosesan kita akan terus mengosongkan folder `temp/output` dan `temp/input` seketika proses selesai untuk menjaga disk Always Free Anda (50GB) tidak kepenuhan.

---

## Sistem Antrean (Background Job Queue)

Sistem pemrosesan file PDF kini berjalan 100% di *background* menggunakan sistem **PostgreSQL Job Polling** kustom tanpa memerlukan Redis atau BullMQ. Skema ini sangat tangguh dan dioptimalkan untuk memori mesin Oracle Free Tier.

### Cara Kerja Worker
1. **Frontend** mengunggah file PDF secara mandiri langsung ke Supabase Storage (`pdfhub-input`).
2. Frontend kemudian memanggil `POST /jobs` dengan memberikan referensi path (`inputFileIds`) dan opsi alat (`tool`). Backend akan mencatat pekerjaan tersebut ke *database* dengan status `WAITING` dan mengembalikan respons `jobId` segera mungkin.
3. **Worker Service** (berjalan terus menerus) akan berburu mencari pekerjaan `WAITING` setiap 2 detik. 
4. Jika ditemukan, Worker akan me-*lock* *job* secara transaksional (`QUEUED`), lalu mulai mengunduh, mengeksekusi *tool* yang dipilih (menuju status `PROCESSING`), dan pada akhirnya mengunggah hasil final (`UPLOADING` & `COMPLETED`).
5. Jika ada *job* yang macet selama lebih dari 10 menit, sistem Watchdog akan menyingkirkannya dengan status `FAILED`.
6. Ada pula pembersih otomatis (*Cleanup Service*) setiap 1 jam untuk menghapus *job* lawas (> 30 Hari).

### Cara Menggunakan API Antrean (Queue)
Semua rute wajib diautentikasi (Bearer Token JWT).

1. **Membuat Job Baru**
   ```http
   POST /jobs
   Content-Type: application/json

   {
     "tool": "COMPRESS",
     "inputFileIds": ["user-123/my-file.pdf"],
     "priority": "NORMAL",
     "options": {
       "compressionLevel": "HIGH"
     }
   }
   ```

2. **Memantau / Menampilkan Seluruh Job Anda**
   ```http
   GET /jobs
   ```

3. **Melihat Detail Job & Mengambil URL Hasil**
   ```http
   GET /jobs/:id
   ```
   *Jika `status` adalah `COMPLETED`, properti `downloadUrl` akan berisi tautan Signed URL 1 Jam menuju Supabase Storage `pdfhub-output`.*

4. **Membatalkan Job**
   *(Hanya bekerja untuk status `WAITING` atau `QUEUED`)*
   ```http
   POST /jobs/:id/cancel
   ```

5. **Mengulangi Job yang Gagal (Retry)**
   *(Hanya bekerja jika status saat ini adalah `FAILED`)*
   ```http
   POST /jobs/:id/retry
   ```

## Pemantauan Realtime (Server-Sent Events)

Frontend **TIDAK PERLU** melakukan *polling* berkali-kali untuk mengecek status. PDFHub mendukung koneksi SSE (*Realtime Stream*) ringan.

### Cara Berlangganan (Subscribe)
Buka koneksi `EventSource` di Frontend (misal: React / Next.js) dengan menyematkan token JWT ke dalam *query parameter*:

```javascript
import { useEffect, useState } from 'react';

export function JobProgress({ jobId, token }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('WAITING');
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    // 1. Inisiasi Koneksi SSE
    const sse = new EventSource(`http://localhost:3000/events/jobs/${jobId}?token=${token}`);

    // 2. Dengarkan Pesan Masuk
    sse.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Abaikan tipe heartbeat (Keep-Alive)
      if (data.type === 'heartbeat') return;

      setStatus(data.status);
      setProgress(data.progress);

      // Jika Selesai, ambil URL unduhan dan tutup koneksi
      if (data.status === 'COMPLETED') {
        setDownloadUrl(data.downloadUrl);
        sse.close();
      }

      // Jika Gagal/Batal, tutup koneksi
      if (data.status === 'FAILED' || data.status === 'CANCELLED') {
        alert("Proses Gagal: " + data.errorMessage);
        sse.close();
      }
    };

    sse.onerror = (error) => {
      console.error("SSE Error (terputus)", error);
      sse.close(); // Akan auto-reconnect bawaan browser jika tidak ditutup manual
    };

    return () => sse.close(); // Cleanup
  }, [jobId, token]);

  return (
    <div>
      <p>Status: {status}</p>
      <progress value={progress} max="100"></progress>
      {downloadUrl && <a href={downloadUrl}>Download PDF</a>}
    </div>
  );
}
```

### Format Payload SSE
Setiap ada perubahan, backend akan menembak *event*:
```json
{
  "id": "cm4abc...",
  "status": "PROCESSING",
  "progress": 40,
  "updatedAt": "2026-06-26T18:00:00.000Z"
}
```
Saat `COMPLETED`, backend otomatis menyuntikkan tambahan `"downloadUrl": "https://..."`.
