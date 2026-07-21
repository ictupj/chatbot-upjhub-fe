# Admisi UPJ Assistant

## Menjalankan secara lokal

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Build produksi untuk Hostinger

```bash
npm ci
npm run build
```

Build menghasilkan folder `out`. Folder ini adalah satu-satunya publish/output
directory yang perlu dilayani oleh Hostinger. Folder tersebut berisi semua HTML,
gambar, serta CSS dan JavaScript dengan hash di dalam `out/_next/static`.

Konfigurasi deployment di hPanel:

- Node.js: `20.x` atau `22.x`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory / publish directory: `out`

Jangan gunakan `.next/server/pages` sebagai publish directory dan jangan hanya
menyalin file HTML-nya. HTML hasil Next.js merujuk ke aset ber-hash di
`/_next/static`; memisahkan keduanya akan membuat seluruh CSS/JS menjadi 404.

Script `postbuild` memeriksa bahwa setiap aset lokal yang dirujuk oleh HTML memang
ada di dalam `out`. Jika ada yang hilang, deployment akan berhenti sebelum versi
rusak dipublikasikan. Jika lingkungan build Hostinger menonaktifkan tahap export
bawaan Next.js, script ini juga menyusun `out` dari hasil build lengkap `.next`
sebelum melakukan pemeriksaan yang sama.

Setelah mengubah pengaturan di hPanel, lakukan **Settings and redeploy** agar
Hostinger membangun ulang dari commit terbaru dan mengganti deployment lama
secara utuh.

`NEXT_PUBLIC_ALLOWED_EMAILS` harus tetap diisi pada environment variables
Hostinger untuk akses halaman admin.
