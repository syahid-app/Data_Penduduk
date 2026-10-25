-- =========================================================================
-- SISTEM INFORMASI DATA KEPENDUDUKAN DESA KARANGHAUR
-- DATABASE SCHEMA, ROW LEVEL SECURITY (RLS) & SEED DATA
-- =========================================================================

-- 1. ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'kadus', 'rw', 'rt');
CREATE TYPE gender_type AS ENUM ('L', 'P');
CREATE TYPE bpjs_type AS ENUM ('mandiri', 'kis', 'tidak');
CREATE TYPE penerangan_type AS ENUM ('meteran', 'tetangga', 'tanpa_meteran');
CREATE TYPE mck_type AS ENUM ('sendiri', 'kelompok', 'umum', 'tidak_ada');
CREATE TYPE bansos_type AS ENUM ('none', 'blt', 'pkh', 'bpnt', 'kip');
CREATE TYPE note_status AS ENUM ('pending', 'reviewed', 'resolved');

-- 2. PROFILES (ROLE & WILAYAH PENUGASAN)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'rt',
    assigned_dusun TEXT, -- 'Dusun I', 'Dusun II', 'Dusun III'
    assigned_rw TEXT,    -- '001', '002', '003'
    assigned_rt TEXT,    -- '001', '002', '003'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FAMILIES (KARTU KELUARGA)
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_kk VARCHAR(16) UNIQUE NOT NULL,
    kepala_keluarga TEXT NOT NULL,
    alamat TEXT NOT NULL,
    no_rumah TEXT DEFAULT '01',
    dusun TEXT NOT NULL,
    rw VARCHAR(3) NOT NULL,
    rt VARCHAR(3) NOT NULL,
    status_barcode BOOLEAN DEFAULT true,
    status_update BOOLEAN DEFAULT true,
    penerangan penerangan_type DEFAULT 'meteran',
    fasilitas_mck mck_type DEFAULT 'sendiri',
    bantuan_sosial bansos_type DEFAULT 'none',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CITIZENS (ANGGOTA KELUARGA / NIK)
CREATE TABLE IF NOT EXISTS citizens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    nik VARCHAR(16) UNIQUE NOT NULL,
    nama_lengkap TEXT NOT NULL,
    hubungan_keluarga TEXT NOT NULL,
    jenis_kelamin gender_type NOT NULL,
    tempat_lahir TEXT NOT NULL,
    tanggal_lahir DATE NOT NULL,
    agama TEXT DEFAULT 'Islam',
    pendidikan_terakhir TEXT NOT NULL,
    pekerjaan TEXT NOT NULL,
    status_perkawinan TEXT DEFAULT 'Kawin',
    bpjs_kesehatan bpjs_type DEFAULT 'kis',
    disabilitas TEXT DEFAULT 'tidak',
    status_tki BOOLEAN DEFAULT false,
    akta_kelahiran BOOLEAN DEFAULT true,
    akta_nikah BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. NOTES (CATATAN / KOMENTAR WILAYAH OLEH RT/RW/KADUS)
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    citizen_id UUID REFERENCES citizens(id) ON DELETE SET NULL,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status note_status DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE citizens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Helper function: get current profile
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS profiles AS $$
  SELECT * FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES POLICY
CREATE POLICY "Users can read own profile or admin reads all" ON profiles
FOR SELECT USING (
  id = auth.uid() 
  OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admin full manage profiles" ON profiles
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- FAMILIES POLICY
CREATE POLICY "Families policy based on role" ON families
FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR ((SELECT role FROM profiles WHERE id = auth.uid()) = 'kadus' AND dusun = (SELECT assigned_dusun FROM profiles WHERE id = auth.uid()))
  OR ((SELECT role FROM profiles WHERE id = auth.uid()) = 'rw' AND rw = (SELECT assigned_rw FROM profiles WHERE id = auth.uid()))
  OR ((SELECT role FROM profiles WHERE id = auth.uid()) = 'rt' AND rt = (SELECT assigned_rt FROM profiles WHERE id = auth.uid()) AND rw = (SELECT assigned_rw FROM profiles WHERE id = auth.uid()))
);

CREATE POLICY "Admin full access families" ON families
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- CITIZENS POLICY (INHERIT DARI FAMILIES)
CREATE POLICY "Citizens access based on family scope" ON citizens
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM families f 
    WHERE f.id = citizens.family_id
  )
);

CREATE POLICY "Admin full access citizens" ON citizens
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- NOTES POLICY
CREATE POLICY "View notes within role scope" ON notes
FOR SELECT USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR author_id = auth.uid()
);

CREATE POLICY "Create notes for assigned officers" ON notes
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admin manage notes status" ON notes
FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- =========================================================================
-- SEED DATA CONTOH
-- =========================================================================
-- Catatan: Jika menggunakan demo offline, data ini juga tersedia di lib/mockData.ts
