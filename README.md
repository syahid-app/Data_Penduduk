# Sistem Informasi Data Kependudukan Desa Karanghaur (SIP-Karanghaur)
### Production-Grade Progressive Web App (Shopee Seller Style Mobile Experience)

Aplikasi PWA Sistem Informasi Kependudukan Desa Karanghaur berbasis batas wilayah penugasan (Role-Based Access Control / RBAC RT/RW/Dusun). Didesain dengan tampilan smartphone mobile-first bergaya Shopee Seller (Gradasi oranye-merah elegan, kartu ringkasan 2x2, Quick Action Bar, dan navigasi 5-tab sticky bottom).

---

## 1. Fitur Utama & Keunggulan

1. **Role-Based Access Control (RBAC) & Data Boundary Ketat**:
   - **Admin Desa (`admin`)**: Hak penuh (CRUD KK & Warga seluruh desa, manajemen status verifikasi catatan, rekap agregat total desa).
   - **Kepala Dusun (`kadus`)**: Read-only seluruh data KK & Warga yang berada di Dusun penugasannya (misal Dusun I). Dapat mengajukan catatan/laporan.
   - **Ketua RW (`rw`)**: Read-only seluruh data KK & Warga yang berada di RW penugasannya (misal RW 001). Dapat mengajukan catatan/laporan.
   - **Ketua RT (`rt`)**: Read-only seluruh data KK & Warga yang berada di RT tugasnya (misal RT 001 / RW 001). Dapat mengajukan catatan/laporan.
   - **Boundary Isolation Enforcement**: Proteksi berlapis via Row-Level Security (RLS) PostgreSQL Supabase serta server & client-side filtering. Pengguna DILARANG KERAS mengekspos warga di luar wilayah penugasannya.

2. **Shopee Seller Mobile Experience**:
   - Header oranye-amber elegan dengan status peran dinamis (contoh: "Ketua RT 001 / RW 001"), indikator online/offline real-time, dan lonceng notifikasi catatan pending.
   - Grid Metrik 2x2 ala Toko Shopee: Total KK, Total Penduduk (L/P), Wajib KTP (17+) & Lansia, serta Laporan Catatan Pending.
   - Quick Action Bar: Shortcut pencarian NIK, daftar KK, KPM Bansos, data BPJS, dan pengajuan catatan data.
   - Bottom Navigation Bar (5 Tab): Beranda, Data KK, Warga NIK, Catatan, Profil.

3. **Data Statistik Resmi Desa Karanghaur (Terverifikasi)**:
   - **Dusun I**: 515 Rumah, 636 KK, 2.008 Jiwa (1.046 L / 962 P) - RT 001, 002, 003 / RW 001.
   - **Dusun II**: 392 Rumah, 440 KK, 1.314 Jiwa (650 L / 664 P) - RT 001, 002 / RW 002.
   - **Dusun III**: 310 Rumah, 404 KK, 1.209 Jiwa (623 L / 586 P) - RT 001, 002 / RW 003.
   - **TOTAL DESA**: 1.217 Rumah, 1.480 KK, 4.531 Jiwa (2.319 L / 2.212 P).
   - Metrik Kesehatan & Bansos: 3.557 KIS, 521 Mandiri; 211 BPNT, 198 PKH, 62 KIP, 44 BLT; 24 Disabilitas; 23 TKI; 3.322 Hak Pilih (17+).

4. **Progressive Web App (PWA) Standalone**:
   - Siap di-install langsung di layar utama smartphone (*Add to Home Screen / A2HS*).
   - `manifest.json`, icon 192x192 & 512x512, serta Service Worker offline caching (`sw.js`).

---

## 2. Struktur Proyek

```plaintext
src/
├── app/
│   ├── layout.tsx             # Root layout + PWA manifest & meta tags
│   ├── page.tsx               # Redirect cerdas ke /dashboard atau /login
│   ├── globals.css            # Styling tema Shopee Seller Mobile
│   ├── (auth)/
│   │   └── login/page.tsx     # Mobile Login + Selector 1-Klik Akun Demo RBAC
│   ├── (main)/
│   │   ├── layout.tsx         # Mobile Frame Wrapper (max-w-md) + Header + BottomNav + Floating FAB
│   │   ├── dashboard/page.tsx # Shopee Seller dashboard view (2x2 cards, quick actions)
│   │   ├── kk/
│   │   │   ├── page.tsx       # Filtered KK list by assigned RT/RW/Dusun + filter pills
│   │   │   └── [id]/page.tsx  # KK details & members view + akses proteksi
│   │   ├── warga/page.tsx     # Filtered list warga by NIK & search
│   │   ├── catatan/page.tsx   # RT/RW comment & note submission hub (pending/reviewed/resolved)
│   │   └── profil/page.tsx    # User role info, RBAC matrix, akun demo switcher & logout
├── components/
│   ├── AddKKModal.tsx         # Modal input & edit Kartu Keluarga (Admin CRUD)
│   ├── BottomNav.tsx          # 5-tabs mobile bottom navigation
│   ├── Header.tsx             # Mobile header dengan dynamic role badge & online indicator
│   ├── KKCard.tsx             # KK list item card dengan status barcode, validasi & accordion
│   ├── NoteModal.tsx          # Modal input catatan RT/RW/Kadus ke Admin Desa
│   ├── QuickActionBar.tsx     # Horizontal scroll quick action menu
│   └── StatCard.tsx           # Shopee-style metric card
├── lib/
│   ├── context.tsx            # Central state & data store with localStorage persistence
│   ├── mockData.ts            # Official seed data Desa Karanghaur & demo profiles
│   ├── supabase.ts            # Supabase client initialization & fallback handler
│   └── types.ts               # TypeScript schemas & definitions
├── public/
│   ├── manifest.json          # PWA Manifest (standalone mobile view)
│   ├── sw.js                  # PWA Service Worker caching
│   └── icons/                 # PWA icons (192x192, 512x512, touch icon)
└── supabase/
    └── schema.sql             # SQL Schema, Enums, Tables, RLS Policies & Helper Functions
```

---

## 3. Akun Demo untuk Pengujian RBAC

Pada halaman Login (`/login`) atau menu Ubah Peran di Header & Profil, tersedia tombol 1-klik untuk berganti peran seketika:

| Peran | Nama Pejabat | Wilayah Penugasan | Hak Akses Data |
|---|---|---|---|
| **Admin Desa** | H. Sulaeman, S.IP | Seluruh Desa | Full CRUD seluruh KK & Warga, verifikasi catatan |
| **Kepala Dusun I** | Bambang Suherman | Dusun I | Read-only Dusun I (636 KK / 2.008 Jiwa), submit catatan |
| **Ketua RW 001** | Kusnadi | RW 001 (Dusun I) | Read-only RW 001 (RT 001, 002, 003), submit catatan |
| **Ketua RT 001** | Joko Purwanto | RT 001 / RW 001 | Read-only hanya RT 001 (Samsudin dkk), submit catatan |
| **Ketua RT 001 / RW 002** | Mulyono | RT 001 / RW 002 (Dusun II) | Terisolasi di Dusun II; RT 001/001 tidak terlihat |

---

## 4. Cara Menjalankan Aplikasi

1. **Jalankan Server**:
   ```bash
   npm run start
   # atau untuk mode pengembangan:
   npm run dev
   ```
2. **Akses di Browser**:
   Buka `http://localhost:3000` (disarankan menggunakan mode Responsive Smartphone di Chrome DevTools atau buka langsung di browser HP).

3. **Koneksi Supabase (Opsional)**:
   Aplikasi telah siap dijalankan langsung secara mandiri (*standalone demo mode*) dengan sinkronisasi penyimpanan lokal. Untuk menghubungkan ke database live PostgreSQL Supabase:
   - Salin `.env.local.example` menjadi `.env.local`
   - Masukkan `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Jalankan skrip `supabase/schema.sql` di Supabase SQL Editor.
