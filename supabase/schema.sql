-- =========================================================================
-- SISTEM INFORMASI DATA KEPENDUDUKAN DESA KARANGHAUR
-- DATABASE SCHEMA, ROW LEVEL SECURITY (RLS) & SEED DATA
-- Supabase Project: https://qwhcsrhupveubtiiuiln.supabase.co
-- =========================================================================

-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. DROP EXISTING TABLES (Safe Re-run)
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS citizens CASCADE;
DROP TABLE IF EXISTS families CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 2. CREATE PROFILES TABLE (Role & Wilayah Penugasan)
CREATE TABLE profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'rt' CHECK (role IN ('admin', 'kadus', 'rw', 'rt')),
    assigned_dusun TEXT, -- 'Dusun I', 'Dusun II', 'Dusun III'
    assigned_rw TEXT,    -- '001', '002', '003'
    assigned_rt TEXT,    -- '001', '002', '003'
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE FAMILIES TABLE (Kartu Keluarga)
CREATE TABLE families (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    no_kk VARCHAR(16) UNIQUE NOT NULL,
    kepala_keluarga TEXT NOT NULL,
    alamat TEXT NOT NULL,
    no_rumah TEXT DEFAULT '01',
    dusun TEXT NOT NULL,
    rw VARCHAR(3) NOT NULL,
    rt VARCHAR(3) NOT NULL,
    status_barcode BOOLEAN DEFAULT true,
    status_update BOOLEAN DEFAULT true,
    penerangan TEXT DEFAULT 'meteran' CHECK (penerangan IN ('meteran', 'tetangga', 'tanpa_meteran')),
    fasilitas_mck TEXT DEFAULT 'sendiri' CHECK (fasilitas_mck IN ('sendiri', 'kelompok', 'umum', 'tidak_ada')),
    bantuan_sosial TEXT DEFAULT 'none' CHECK (bantuan_sosial IN ('none', 'blt', 'pkh', 'bpnt', 'kip')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CREATE CITIZENS TABLE (Anggota Keluarga / NIK)
CREATE TABLE citizens (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    nik VARCHAR(16) UNIQUE NOT NULL,
    nama_lengkap TEXT NOT NULL,
    hubungan_keluarga TEXT NOT NULL,
    jenis_kelamin VARCHAR(1) NOT NULL CHECK (jenis_kelamin IN ('L', 'P')),
    tempat_lahir TEXT NOT NULL,
    tanggal_lahir DATE NOT NULL,
    golongan_darah TEXT DEFAULT 'O',
    agama TEXT DEFAULT 'Islam',
    pendidikan_terakhir TEXT NOT NULL,
    pekerjaan TEXT NOT NULL,
    status_perkawinan TEXT DEFAULT 'Kawin' CHECK (status_perkawinan IN ('Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati')),
    tanggal_perkawinan TEXT DEFAULT '-',
    nama_ayah TEXT DEFAULT '-',
    nama_ibu TEXT DEFAULT '-',
    bpjs_kesehatan TEXT DEFAULT 'kis' CHECK (bpjs_kesehatan IN ('mandiri', 'kis', 'tidak')),
    disabilitas TEXT DEFAULT 'tidak',
    status_tki BOOLEAN DEFAULT false,
    akta_kelahiran BOOLEAN DEFAULT true,
    akta_nikah BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe ALTER TABLE statements if updating existing database:
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS golongan_darah TEXT DEFAULT 'O';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS tanggal_perkawinan TEXT DEFAULT '-';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS nama_ayah TEXT DEFAULT '-';
ALTER TABLE citizens ADD COLUMN IF NOT EXISTS nama_ibu TEXT DEFAULT '-';

-- 5. CREATE NOTES TABLE (Catatan Wilayah RT/RW/Kadus)
CREATE TABLE notes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    family_id TEXT REFERENCES families(id) ON DELETE SET NULL,
    citizen_id TEXT REFERENCES citizens(id) ON DELETE SET NULL,
    author_id TEXT NOT NULL,
    family_no_kk TEXT,
    citizen_name TEXT,
    citizen_nik TEXT,
    dusun TEXT,
    rw TEXT,
    rt TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Allow anon (public client API key) and authenticated users full access for PWA Client operations
CREATE POLICY "Allow public all profiles" ON profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all families" ON families FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all citizens" ON citizens FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all notes" ON notes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 7. SEED DATA PROFILES
INSERT INTO profiles (id, full_name, role, assigned_dusun, assigned_rw, assigned_rt, phone) VALUES
('prof-admin', 'Syahid (Administrator Desa)', 'admin', NULL, NULL, NULL, '0812-9988-7766'),
('prof-kadus-1', 'H. Sulaeman (Kepala Dusun I)', 'kadus', 'Dusun I', NULL, NULL, '0813-1122-3344'),
('prof-kadus-2', 'Bpk. Mastur (Kepala Dusun II)', 'kadus', 'Dusun II', NULL, NULL, '0813-2233-4455'),
('prof-kadus-3', 'Bpk. Jayadi (Kepala Dusun III)', 'kadus', 'Dusun III', NULL, NULL, '0813-3344-5566'),
('prof-rw-01', 'Bpk. Dahlan (Ketua RW 001)', 'rw', 'Dusun I', '001', NULL, '0857-4455-6677'),
('prof-rw-02', 'Bpk. Rohmat (Ketua RW 002)', 'rw', 'Dusun I', '002', NULL, '0857-5566-7788'),
('prof-rt-01', 'Bpk. Kusnan (Ketua RT 001/001)', 'rt', 'Dusun I', '001', '001', '0896-1234-5678'),
('prof-rt-02', 'Bpk. Marzuki (Ketua RT 002/001)', 'rt', 'Dusun I', '001', '002', '0896-2345-6789'),
('prof-rt-03', 'Bpk. Sanwani (Ketua RT 001/002)', 'rt', 'Dusun I', '002', '001', '0896-3456-7890')
ON CONFLICT (id) DO NOTHING;

-- 8. SEED DATA FAMILIES
INSERT INTO families (id, no_kk, kepala_keluarga, alamat, no_rumah, dusun, rw, rt, status_barcode, status_update, penerangan, fasilitas_mck, bantuan_sosial, created_at) VALUES
('fam-01', '3216081203000001', 'SAMSUDIN', 'Jl. Balai Desa RT 001 / RW 001', '01', 'Dusun I', '001', '001', true, true, 'meteran', 'sendiri', 'pkh', '2024-01-15 08:30:00+00'),
('fam-02', '3216081203000002', 'ACHMAD SUHANDI', 'Gg. Salak No. 14 RT 001 / RW 001', '14', 'Dusun I', '001', '001', true, false, 'meteran', 'sendiri', 'bpnt', '2024-01-20 10:15:00+00'),
('fam-03', '3216081203000003', 'DEDE SUTISNA', 'Jl. Lapangan Bola RT 001 / RW 001', '07', 'Dusun I', '001', '001', false, false, 'tetangga', 'kelompok', 'blt', '2024-02-01 14:00:00+00'),
('fam-04', '3216081203000004', 'H. ENDANG WIJAYA', 'Jl. Pesantren No. 03 RT 001 / RW 001', '03', 'Dusun I', '001', '001', true, true, 'meteran', 'sendiri', 'none', '2024-02-10 09:20:00+00'),
('fam-05', '3216081203000005', 'WARSONO', 'Gg. Kancil RT 002 / RW 001', '12', 'Dusun I', '001', '002', true, true, 'meteran', 'sendiri', 'pkh', '2024-02-12 11:00:00+00'),
('fam-06', '3216081203000006', 'KOSASIH', 'Jl. Rawa Indah RT 002 / RW 001', '25', 'Dusun I', '001', '002', true, false, 'meteran', 'sendiri', 'none', '2024-02-15 13:45:00+00'),
('fam-07', '3216081203000007', 'ASEP SUNANDAR', 'Jl. Kali CBL RT 001 / RW 002', '05', 'Dusun I', '002', '001', true, true, 'meteran', 'sendiri', 'bpnt', '2024-02-18 08:00:00+00'),
('fam-08', '3216081203000008', 'M. TOHIR', 'Gg. Musholla RT 001 / RW 002', '09', 'Dusun I', '002', '001', false, false, 'tanpa_meteran', 'umum', 'blt', '2024-02-20 16:30:00+00'),
('fam-09', '3216081203000009', 'H. BADRUDIN', 'Jl. Raya Karanghaur Dusun II', '18', 'Dusun II', '003', '001', true, true, 'meteran', 'sendiri', 'none', '2024-03-01 10:00:00+00'),
('fam-10', '3216081203000010', 'SUKIMAN', 'Kp. Babakan Dusun III RT 001 / RW 005', '04', 'Dusun III', '005', '001', true, true, 'meteran', 'sendiri', 'kip', '2024-03-05 11:20:00+00')
ON CONFLICT (no_kk) DO NOTHING;

-- 9. SEED DATA CITIZENS
INSERT INTO citizens (id, family_id, nik, nama_lengkap, hubungan_keluarga, jenis_kelamin, tempat_lahir, tanggal_lahir, golongan_darah, agama, pendidikan_terakhir, pekerjaan, status_perkawinan, tanggal_perkawinan, nama_ayah, nama_ibu, bpjs_kesehatan, disabilitas, status_tki, akta_kelahiran, akta_nikah, created_at) VALUES
('cit-01', 'fam-01', '3216081205720001', 'SAMSUDIN', 'Kepala Keluarga', 'L', 'Bekasi', '1972-05-12', 'O', 'Islam', 'SMP / Sederajat', 'Petani / Pekebun', 'Kawin', '1999-06-15', 'H. ABDUL KARIM', 'HJ. MAEMUNAH', 'kis', 'tidak', false, true, true, '2024-01-15 08:30:00+00'),
('cit-02', 'fam-01', '3216085508760002', 'ROHAYATI', 'Istri', 'P', 'Bekasi', '1976-08-15', 'A', 'Islam', 'SD / Sederajat', 'Mengurus Rumah Tangga', 'Kawin', '1999-06-15', 'SANUSI', 'ROKAYA', 'kis', 'tidak', false, true, true, '2024-01-15 08:30:00+00'),
('cit-03', 'fam-01', '3216081404020003', 'RIZKY RAMADHAN', 'Anak', 'L', 'Bekasi', '2002-04-14', 'O', 'Islam', 'SMA / Sederajat', 'Pelajar / Mahasiswa', 'Belum Kawin', '-', 'SAMSUDIN', 'ROHAYATI', 'kis', 'tidak', false, true, false, '2024-01-15 08:30:00+00'),
('cit-04', 'fam-01', '3216086209120004', 'NUR AISYAH', 'Anak', 'P', 'Bekasi', '2012-09-22', 'A', 'Islam', 'SD / Sederajat', 'Belum / Tidak Bekerja', 'Belum Kawin', '-', 'SAMSUDIN', 'ROHAYATI', 'kis', 'tidak', false, true, false, '2024-01-15 08:30:00+00'),
('cit-05', 'fam-02', '3216082407750001', 'ACHMAD SUHANDI', 'Kepala Keluarga', 'L', 'Karawang', '1975-07-24', 'B', 'Islam', 'SMK / Sederajat', 'Karyawan Swasta', 'Kawin', '2001-09-10', 'SUHANDI', 'MARYAM', 'mandiri', 'tidak', false, true, true, '2024-01-20 10:15:00+00'),
('cit-06', 'fam-02', '3216086011780002', 'ENDAH RETNOWATI', 'Istri', 'P', 'Solo', '1978-11-20', 'AB', 'Islam', 'D3 Kebidanan', 'Tenaga Kesehatan', 'Kawin', '2001-09-10', 'SUTOPO', 'SRI WAHYUNI', 'mandiri', 'tidak', false, true, true, '2024-01-20 10:15:00+00'),
('cit-07', 'fam-02', '3216080503030003', 'DIMAS PRASETYO', 'Anak', 'L', 'Bekasi', '2003-03-05', 'B', 'Islam', 'SMA / Sederajat', 'Karyawan Swasta', 'Belum Kawin', '-', 'ACHMAD SUHANDI', 'ENDAH RETNOWATI', 'mandiri', 'tidak', false, true, false, '2024-01-20 10:15:00+00'),
('cit-08', 'fam-03', '3216081002680001', 'DEDE SUTISNA', 'Kepala Keluarga', 'L', 'Bekasi', '1968-02-10', 'O', 'Islam', 'SD / Sederajat', 'Buruh Harian Lepas', 'Kawin', '1995-04-20', 'SUTISNA', 'SAODAH', 'kis', 'tidak', false, true, true, '2024-02-01 14:00:00+00'),
('cit-09', 'fam-03', '3216085106720002', 'KARSINAH', 'Istri', 'P', 'Bekasi', '1972-06-11', 'O', 'Islam', 'Tidak / Belum Sekolah', 'Mengurus Rumah Tangga', 'Kawin', '1995-04-20', 'MADROJI', 'NENGSIH', 'kis', 'tidak', false, false, true, '2024-02-01 14:00:00+00'),
('cit-10', 'fam-03', '3216081909060003', 'AGUS KURNIAWAN', 'Anak', 'L', 'Bekasi', '2006-09-19', 'O', 'Islam', 'SMP / Sederajat', 'Buruh Harian Lepas', 'Belum Kawin', '-', 'DEDE SUTISNA', 'KARSINAH', 'kis', 'tidak', false, true, false, '2024-02-01 14:00:00+00'),
('cit-11', 'fam-04', '3216080101600001', 'H. ENDANG WIJAYA', 'Kepala Keluarga', 'L', 'Bekasi', '1960-01-01', 'A', 'Islam', 'S1 Ekonomi', 'Wiraswasta / Pedagang', 'Kawin', '1988-11-12', 'H. WIJAYA', 'HJ. FATIMAH', 'mandiri', 'tidak', false, true, true, '2024-02-10 09:20:00+00'),
('cit-12', 'fam-04', '3216084803650002', 'HJ. SITI KHADIJAH', 'Istri', 'P', 'Cirebon', '1965-03-08', 'B', 'Islam', 'SMA / Sederajat', 'Wiraswasta / Pedagang', 'Kawin', '1988-11-12', 'H. HASAN', 'HJ. AMINAH', 'mandiri', 'tidak', false, true, true, '2024-02-10 09:20:00+00'),
('cit-13', 'fam-05', '3216081808800001', 'WARSONO', 'Kepala Keluarga', 'L', 'Brebes', '1980-08-18', 'O', 'Islam', 'SMP / Sederajat', 'Sopir / Angkutan', 'Cerai Hidup', '2005-07-17', 'KASMURI', 'SUMIATI', 'kis', 'tidak', false, true, false, '2024-02-12 11:00:00+00'),
('cit-14', 'fam-05', '3216082212080002', 'BAYU PAMUNGKAS', 'Anak', 'L', 'Bekasi', '2008-12-22', 'O', 'Islam', 'SD / Sederajat', 'Pelajar / Mahasiswa', 'Belum Kawin', '-', 'WARSONO', 'SULASTRI', 'kis', 'tidak', false, true, false, '2024-02-12 11:00:00+00'),
('cit-15', 'fam-06', '3216080709840001', 'KOSASIH', 'Kepala Keluarga', 'L', 'Bekasi', '1984-09-07', 'A', 'Islam', 'SMA / Sederajat', 'Tukang Kayu / Bangunan', 'Kawin', '2010-02-14', 'SARMAN', 'JUBAEDAH', 'tidak', 'tidak', false, true, true, '2024-02-15 13:45:00+00'),
('cit-16', 'fam-06', '3216084405880002', 'MIMI AMINAH', 'Istri', 'P', 'Bekasi', '1988-05-04', 'O', 'Islam', 'SMP / Sederajat', 'Mengurus Rumah Tangga', 'Kawin', '2010-02-14', 'MISBAH', 'HALIMAH', 'tidak', 'tidak', false, true, true, '2024-02-15 13:45:00+00'),
('cit-17', 'fam-07', '3216081103790001', 'ASEP SUNANDAR', 'Kepala Keluarga', 'L', 'Bandung', '1979-03-11', 'AB', 'Islam', 'SMK / Sederajat', 'Karyawan Swasta', 'Cerai Mati', '2004-08-22', 'SUNANDAR', 'EUIS KOMARIAH', 'kis', 'tidak', false, true, false, '2024-02-18 08:00:00+00'),
('cit-18', 'fam-08', '3216080404550001', 'M. TOHIR', 'Kepala Keluarga', 'L', 'Bekasi', '1955-04-04', 'O', 'Islam', 'SD / Sederajat', 'Pensiunan / Tidak Bekerja', 'Kawin', '1980-05-01', 'H. USMAN', 'HJ. SALAMAH', 'kis', 'daksa', false, true, true, '2024-02-20 16:30:00+00'),
('cit-19', 'fam-09', '3216081505630001', 'H. BADRUDIN', 'Kepala Keluarga', 'L', 'Bekasi', '1963-05-15', 'B', 'Islam', 'SMA / Sederajat', 'Wiraswasta / Pedagang', 'Kawin', '1990-10-05', 'H. SYARIF', 'HJ. ZAINAB', 'mandiri', 'tidak', false, true, true, '2024-03-01 10:00:00+00'),
('cit-20', 'fam-10', '3216081910810001', 'SUKIMAN', 'Kepala Keluarga', 'L', 'Kebumen', '1981-10-19', 'O', 'Islam', 'SMP / Sederajat', 'Buruh Tani', 'Kawin', '2006-12-09', 'PAIMIN', 'PONIRAH', 'kis', 'tidak', true, true, true, '2024-03-05 11:20:00+00')
ON CONFLICT (nik) DO NOTHING;

-- 10. SEED DATA NOTES
INSERT INTO notes (id, family_id, citizen_id, author_id, family_no_kk, citizen_name, citizen_nik, dusun, rw, rt, message, status, created_at) VALUES
('note-01', 'fam-02', 'cit-05', 'prof-rt-01', '3216081203000002', 'ACHMAD SUHANDI', '3216082407750001', 'Dusun I', '001', '001', 'Keluarga baru saja memperbarui data kepindahan anak tertua, mohon cetak KK barcode terbaru.', 'pending', '2024-03-10 09:00:00+00'),
('note-02', 'fam-03', NULL, 'prof-rt-01', '3216081203000003', NULL, NULL, 'Dusun I', '001', '001', 'Keluarga Dede Sutisna memerlukan bantuan renovasi sanitasi MCK dan pemasangan meteran listrik mandiri.', 'pending', '2024-03-12 14:30:00+00'),
('note-03', 'fam-08', 'cit-18', 'prof-rw-02', '3216081203000008', 'M. TOHIR', '3216080404550001', 'Dusun I', '002', '001', 'Lansia disabilitas daksa, mohon didaftarkan program bantuan kursi roda dari Dinas Sosial.', 'reviewed', '2024-03-15 11:15:00+00')
ON CONFLICT (id) DO NOTHING;
