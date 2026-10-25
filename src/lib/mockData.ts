import { Profile, Family, Citizen, Note, VillageStats, MaritalStatus } from './types';

export function getCitizenMaritalStatus(citizen: Citizen): MaritalStatus {
  if (citizen.status_perkawinan) return citizen.status_perkawinan;
  if (citizen.hubungan_keluarga === 'Anak') return 'Belum Kawin';
  if (citizen.id === 'cit-13') return 'Cerai Hidup';
  if (citizen.id === 'cit-17') return 'Cerai Mati';
  return 'Kawin';
}

export function getFamilyHouseNumber(family?: Family | null): string {
  if (!family) return '-';
  if (family.no_rumah) return family.no_rumah;
  const match = family.alamat.match(/No\.?\s*(\d+)/i);
  return match ? match[1] : '01';
}

// =========================================================================
// DATA RESMI DESA KARANGHAUR (TERVERIFIKASI)
// =========================================================================
export const OFFICIAL_VILLAGE_STATS: Record<string, VillageStats> = {
  all: {
    totalRumah: 1217,
    totalKK: 1480,
    totalJiwa: 4531,
    lakiLaki: 2319,
    perempuan: 2212,
    wajibKtp: 3322,
    lansia: 486,
    bpjsKis: 3557,
    bpjsMandiri: 521,
    bpjsNone: 453,
    bansosBpnt: 211,
    bansosPkh: 198,
    bansosKip: 62,
    bansosBlt: 44,
    disabilitas: 24,
    tki: 23,
    pendingNotes: 8,
  },
  'Dusun I': {
    totalRumah: 515,
    totalKK: 636,
    totalJiwa: 2008,
    lakiLaki: 1046,
    perempuan: 962,
    wajibKtp: 1472,
    lansia: 215,
    bpjsKis: 1580,
    bpjsMandiri: 230,
    bpjsNone: 198,
    bansosBpnt: 94,
    bansosPkh: 88,
    bansosKip: 28,
    bansosBlt: 20,
    disabilitas: 11,
    tki: 10,
    pendingNotes: 3,
  },
  'Dusun II': {
    totalRumah: 392,
    totalKK: 440,
    totalJiwa: 1314,
    lakiLaki: 650,
    perempuan: 664,
    wajibKtp: 964,
    lansia: 142,
    bpjsKis: 1032,
    bpjsMandiri: 151,
    bpjsNone: 131,
    bansosBpnt: 61,
    bansosPkh: 57,
    bansosKip: 18,
    bansosBlt: 13,
    disabilitas: 7,
    tki: 7,
    pendingNotes: 3,
  },
  'Dusun III': {
    totalRumah: 310,
    totalKK: 404,
    totalJiwa: 1209,
    lakiLaki: 623,
    perempuan: 586,
    wajibKtp: 886,
    lansia: 129,
    bpjsKis: 945,
    bpjsMandiri: 140,
    bpjsNone: 124,
    bansosBpnt: 56,
    bansosPkh: 53,
    bansosKip: 16,
    bansosBlt: 11,
    disabilitas: 6,
    tki: 6,
    pendingNotes: 2,
  },
};

// =========================================================================
// DEMO PROFILES (AKUN CONTOH LOGIN CEPAT)
// =========================================================================
export const DEMO_PROFILES: Profile[] = [
  {
    id: 'user-admin-01',
    full_name: 'H. Sulaeman, S.IP',
    role: 'admin',
    assigned_dusun: null,
    assigned_rw: null,
    assigned_rt: null,
    phone: '0812-3456-7890',
  },
  {
    id: 'user-kadus-01',
    full_name: 'Bambang Suherman',
    role: 'kadus',
    assigned_dusun: 'Dusun I',
    assigned_rw: null,
    assigned_rt: null,
    phone: '0813-9876-5432',
  },
  {
    id: 'user-rw-01',
    full_name: 'Kusnadi',
    role: 'rw',
    assigned_dusun: 'Dusun I',
    assigned_rw: '001',
    assigned_rt: null,
    phone: '0857-1234-5678',
  },
  {
    id: 'user-rt-01',
    full_name: 'Joko Purwanto',
    role: 'rt',
    assigned_dusun: 'Dusun I',
    assigned_rw: '001',
    assigned_rt: '001',
    phone: '0878-8765-4321',
  },
  {
    id: 'user-rt-02',
    full_name: 'Mulyono',
    role: 'rt',
    assigned_dusun: 'Dusun II',
    assigned_rw: '002',
    assigned_rt: '001',
    phone: '0821-4321-8765',
  },
];

// =========================================================================
// MOCK DATA FAMILIES (KARTU KELUARGA)
// =========================================================================
export const INITIAL_FAMILIES: Family[] = [
  // --- Dusun I, RW 001, RT 001 (Visible to RT 001, RW 001, Kadus I, Admin) ---
  {
    id: 'fam-01',
    no_kk: '3216081203000001',
    kepala_keluarga: 'SAMSUDIN',
    alamat: 'Jl. Balai Desa RT 001 / RW 001',
    no_rumah: '01',
    dusun: 'Dusun I',
    rw: '001',
    rt: '001',
    status_barcode: true,
    status_update: true,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'pkh',
    created_at: '2024-01-15T08:30:00Z',
  },
  {
    id: 'fam-02',
    no_kk: '3216081203000002',
    kepala_keluarga: 'ACHMAD SUHANDI',
    alamat: 'Gg. Salak No. 14 RT 001 / RW 001',
    no_rumah: '14',
    dusun: 'Dusun I',
    rw: '001',
    rt: '001',
    status_barcode: true,
    status_update: false, // Perlu Update
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'bpnt',
    created_at: '2024-01-20T10:15:00Z',
  },
  {
    id: 'fam-03',
    no_kk: '3216081203000003',
    kepala_keluarga: 'DEDE SUTISNA',
    alamat: 'Jl. Lapangan Bola RT 001 / RW 001',
    no_rumah: '07',
    dusun: 'Dusun I',
    rw: '001',
    rt: '001',
    status_barcode: false, // Belum Barcode
    status_update: false,
    penerangan: 'tetangga',
    fasilitas_mck: 'kelompok',
    bantuan_sosial: 'blt',
    created_at: '2024-02-01T14:00:00Z',
  },
  {
    id: 'fam-04',
    no_kk: '3216081203000004',
    kepala_keluarga: 'H. ENDANG WIJAYA',
    alamat: 'Jl. Pesantren No. 03 RT 001 / RW 001',
    no_rumah: '03',
    dusun: 'Dusun I',
    rw: '001',
    rt: '001',
    status_barcode: true,
    status_update: true,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'none',
    created_at: '2024-02-10T09:20:00Z',
  },

  // --- Dusun I, RW 001, RT 002 (Visible to RW 001, Kadus I, Admin. Hidden from RT 001) ---
  {
    id: 'fam-05',
    no_kk: '3216081203000005',
    kepala_keluarga: 'WARSONO',
    alamat: 'Gg. Kancil RT 002 / RW 001',
    no_rumah: '12',
    dusun: 'Dusun I',
    rw: '001',
    rt: '002',
    status_barcode: true,
    status_update: true,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'pkh',
    created_at: '2024-02-12T11:00:00Z',
  },
  {
    id: 'fam-06',
    no_kk: '3216081203000006',
    kepala_keluarga: 'KOSASIH',
    alamat: 'Jl. Rawa Indah RT 002 / RW 001',
    no_rumah: '25',
    dusun: 'Dusun I',
    rw: '001',
    rt: '002',
    status_barcode: true,
    status_update: false,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'bpnt',
    created_at: '2024-02-15T13:45:00Z',
  },

  // --- Dusun I, RW 001, RT 003 (Visible to RW 001, Kadus I, Admin. Hidden from RT 001) ---
  {
    id: 'fam-07',
    no_kk: '3216081203000007',
    kepala_keluarga: 'UJANG KURNIA',
    alamat: 'Jl. Cisadane RT 003 / RW 001',
    no_rumah: '09',
    dusun: 'Dusun I',
    rw: '001',
    rt: '003',
    status_barcode: true,
    status_update: true,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'kip',
    created_at: '2024-02-22T08:15:00Z',
  },

  // --- Dusun II, RW 002, RT 001 (Visible to RT 001/002, Admin. Hidden from Kadus I & RW 001) ---
  {
    id: 'fam-08',
    no_kk: '3216081203000008',
    kepala_keluarga: 'MULYONO',
    alamat: 'Jl. Irigasi Barat RT 001 / RW 002',
    no_rumah: '18',
    dusun: 'Dusun II',
    rw: '002',
    rt: '001',
    status_barcode: true,
    status_update: true,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'none',
    created_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'fam-09',
    no_kk: '3216081203000009',
    kepala_keluarga: 'DEDI ROHAEDI',
    alamat: 'Gg. Melati RT 001 / RW 002',
    no_rumah: '05',
    dusun: 'Dusun II',
    rw: '002',
    rt: '001',
    status_barcode: true,
    status_update: false,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'blt',
    created_at: '2024-03-05T14:30:00Z',
  },

  // --- Dusun III, RW 003, RT 001 (Visible to Admin only) ---
  {
    id: 'fam-10',
    no_kk: '3216081203000010',
    kepala_keluarga: 'SUWANDI',
    alamat: 'Jl. Lingkar Timur RT 001 / RW 003',
    no_rumah: '31',
    dusun: 'Dusun III',
    rw: '003',
    rt: '001',
    status_barcode: true,
    status_update: true,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'pkh',
    created_at: '2024-03-10T16:00:00Z',
  },
];

// =========================================================================
// MOCK DATA CITIZENS (ANGGOTA KELUARGA / NIK)
// =========================================================================
export const INITIAL_CITIZENS: Citizen[] = [
  // --- Fam 01 (SAMSUDIN - RT 001 / RW 001) ---
  {
    id: 'cit-01',
    family_id: 'fam-01',
    nik: '3216081205780001',
    nama_lengkap: 'SAMSUDIN',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1978-05-12',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Buruh Harian Lepas',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-01-15T08:30:00Z',
  },
  {
    id: 'cit-02',
    family_id: 'fam-01',
    nik: '3216085508820002',
    nama_lengkap: 'SITI AMINAH',
    hubungan_keluarga: 'Istri',
    jenis_kelamin: 'P',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1982-08-15',
    agama: 'Islam',
    pendidikan_terakhir: 'SMP / Sederajat',
    pekerjaan: 'Mengurus Rumah Tangga',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-01-15T08:30:00Z',
  },
  {
    id: 'cit-03',
    family_id: 'fam-01',
    nik: '3216081402050003',
    nama_lengkap: 'RIZKY RAMADHAN',
    hubungan_keluarga: 'Anak',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '2005-02-14',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Pelajar / Mahasiswa',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: false,
    created_at: '2024-01-15T08:30:00Z',
  },
  {
    id: 'cit-04',
    family_id: 'fam-01',
    nik: '3216086209120004',
    nama_lengkap: 'NUR AISYAH',
    hubungan_keluarga: 'Anak',
    jenis_kelamin: 'P',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '2012-09-22',
    agama: 'Islam',
    pendidikan_terakhir: 'SD / Sederajat',
    pekerjaan: 'Belum / Tidak Bekerja',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: false,
    created_at: '2024-01-15T08:30:00Z',
  },

  // --- Fam 02 (ACHMAD SUHANDI - RT 001 / RW 001) ---
  {
    id: 'cit-05',
    family_id: 'fam-02',
    nik: '3216082407750001',
    nama_lengkap: 'ACHMAD SUHANDI',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Karawang',
    tanggal_lahir: '1975-07-24',
    agama: 'Islam',
    pendidikan_terakhir: 'SMK / Sederajat',
    pekerjaan: 'Karyawan Swasta',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-01-20T10:15:00Z',
  },
  {
    id: 'cit-06',
    family_id: 'fam-02',
    nik: '3216086011780002',
    nama_lengkap: 'ENDAH RETNOWATI',
    hubungan_keluarga: 'Istri',
    jenis_kelamin: 'P',
    tempat_lahir: 'Solo',
    tanggal_lahir: '1978-11-20',
    agama: 'Islam',
    pendidikan_terakhir: 'D3 Kebidanan',
    pekerjaan: 'Tenaga Kesehatan',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-01-20T10:15:00Z',
  },
  {
    id: 'cit-07',
    family_id: 'fam-02',
    nik: '3216080503030003',
    nama_lengkap: 'DIMAS ARYA PRATAMA',
    hubungan_keluarga: 'Anak',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '2003-03-05',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Karyawan Swasta',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: false,
    created_at: '2024-01-20T10:15:00Z',
  },

  // --- Fam 03 (DEDE SUTISNA - RT 001 / RW 001) ---
  {
    id: 'cit-08',
    family_id: 'fam-03',
    nik: '3216081010620001',
    nama_lengkap: 'DEDE SUTISNA',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1962-10-10', // Lansia (64 thn)
    agama: 'Islam',
    pendidikan_terakhir: 'SD / Sederajat',
    pekerjaan: 'Petani / Pekebun',
    bpjs_kesehatan: 'kis',
    disabilitas: 'daksa ringan',
    status_tki: false,
    akta_kelahiran: false,
    akta_nikah: true,
    created_at: '2024-02-01T14:00:00Z',
  },
  {
    id: 'cit-09',
    family_id: 'fam-03',
    nik: '3216085112650002',
    nama_lengkap: 'MAHPUDAH',
    hubungan_keluarga: 'Istri',
    jenis_kelamin: 'P',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1965-12-11', // Lansia (61 thn)
    agama: 'Islam',
    pendidikan_terakhir: 'SD / Sederajat',
    pekerjaan: 'Mengurus Rumah Tangga',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: false,
    akta_nikah: true,
    created_at: '2024-02-01T14:00:00Z',
  },

  // --- Fam 04 (H. ENDANG WIJAYA - RT 001 / RW 001) ---
  {
    id: 'cit-10',
    family_id: 'fam-04',
    nik: '3216081101680001',
    nama_lengkap: 'H. ENDANG WIJAYA',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1968-01-11',
    agama: 'Islam',
    pendidikan_terakhir: 'S1 Hukum',
    pekerjaan: 'Wiraswasta / Pedagang',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-10T09:20:00Z',
  },

  // --- Fam 05 (WARSONO - RT 002 / RW 001) ---
  {
    id: 'cit-11',
    family_id: 'fam-05',
    nik: '3216081804790001',
    nama_lengkap: 'WARSONO',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Cirebon',
    tanggal_lahir: '1979-04-18',
    agama: 'Islam',
    pendidikan_terakhir: 'SMP / Sederajat',
    pekerjaan: 'Buruh Bangunan',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-12T11:00:00Z',
  },
  {
    id: 'cit-12',
    family_id: 'fam-05',
    nik: '3216085906840002',
    nama_lengkap: 'TARSIH',
    hubungan_keluarga: 'Istri',
    jenis_kelamin: 'P',
    tempat_lahir: 'Cirebon',
    tanggal_lahir: '1984-06-19',
    agama: 'Islam',
    pendidikan_terakhir: 'SMP / Sederajat',
    pekerjaan: 'Tenaga Kerja Indonesia (TKI)',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: true, // TKI
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-12T11:00:00Z',
  },

  // --- Fam 06 (KOSASIH - RT 002 / RW 001) ---
  {
    id: 'cit-13',
    family_id: 'fam-06',
    nik: '3216080309830001',
    nama_lengkap: 'KOSASIH',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1983-09-03',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Pedagang Keliling',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-15T13:45:00Z',
  },

  // --- Fam 07 (UJANG KURNIA - RT 003 / RW 001) ---
  {
    id: 'cit-14',
    family_id: 'fam-07',
    nik: '3216081708860001',
    nama_lengkap: 'UJANG KURNIA',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Garut',
    tanggal_lahir: '1986-08-17',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Sopir Angkot',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-22T08:15:00Z',
  },

  // --- Fam 08 (MULYONO - RT 001 / RW 002 / Dusun II) ---
  {
    id: 'cit-15',
    family_id: 'fam-08',
    nik: '3216082202720001',
    nama_lengkap: 'MULYONO',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Kebumen',
    tanggal_lahir: '1972-02-22',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Ketua RT / Toko Kelontong',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-03-01T10:00:00Z',
  },

  // --- Fam 09 (DEDI ROHAEDI - RT 001 / RW 002 / Dusun II) ---
  {
    id: 'cit-16',
    family_id: 'fam-09',
    nik: '3216081912800001',
    nama_lengkap: 'DEDI ROHAEDI',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1980-12-19',
    agama: 'Islam',
    pendidikan_terakhir: 'SMP / Sederajat',
    pekerjaan: 'Buruh Tani',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-03-05T14:30:00Z',
  },

  // --- Fam 10 (SUWANDI - RT 001 / RW 003 / Dusun III) ---
  {
    id: 'cit-17',
    family_id: 'fam-10',
    nik: '3216080101700001',
    nama_lengkap: 'SUWANDI',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Indramayu',
    tanggal_lahir: '1970-01-01',
    agama: 'Islam',
    pendidikan_terakhir: 'SD / Sederajat',
    pekerjaan: 'Nelayan / Tambak',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: false,
    akta_nikah: true,
    created_at: '2024-03-10T16:00:00Z',
  },
];

// =========================================================================
// MOCK DATA NOTES (CATATAN DARI RT/RW/KADUS KE ADMIN DESA)
// =========================================================================
export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-01',
    family_id: 'fam-02',
    citizen_id: 'cit-05',
    author_id: 'user-rt-01',
    message: 'Anak sulung (Dimas) sudah wisuda dan bekerja di Cikarang. Mohon update status pekerjaan di KK.',
    status: 'pending',
    created_at: '2024-03-18T10:30:00Z',
    family_no_kk: '3216081203000002',
    citizen_name: 'DIMAS ARYA PRATAMA',
    citizen_nik: '3216080503030003',
    dusun: 'Dusun I',
    rw: '001',
    rt: '001',
  },
  {
    id: 'note-02',
    family_id: 'fam-03',
    citizen_id: 'cit-08',
    author_id: 'user-rt-01',
    message: 'Pak Dede Sutisna membutuhkan bantuan kursi roda / alat bantu jalan serta perbaikan meteran listrik mandiri.',
    status: 'pending',
    created_at: '2024-03-20T14:15:00Z',
    family_no_kk: '3216081203000003',
    citizen_name: 'DEDE SUTISNA',
    citizen_nik: '3216081010620001',
    dusun: 'Dusun I',
    rw: '001',
    rt: '001',
  },
  {
    id: 'note-03',
    family_id: 'fam-05',
    citizen_id: 'cit-12',
    author_id: 'user-rw-01',
    message: 'Ibu Tarsih berstatus TKI di Taiwan, dokumen perpanjangan paspor telah dilaporkan ke pihak desa.',
    status: 'reviewed',
    created_at: '2024-03-21T09:00:00Z',
    family_no_kk: '3216081203000005',
    citizen_name: 'TARSIH',
    citizen_nik: '3216085906840002',
    dusun: 'Dusun I',
    rw: '001',
    rt: '002',
  },
  {
    id: 'note-04',
    family_id: 'fam-01',
    citizen_id: 'cit-03',
    author_id: 'user-kadus-01',
    message: 'Data barcode KK Dusun I sudah dicetak dan didistribusikan ke keluarga Samsudin.',
    status: 'resolved',
    created_at: '2024-03-22T16:45:00Z',
    family_no_kk: '3216081203000001',
    citizen_name: 'SAMSUDIN',
    citizen_nik: '3216081205780001',
    dusun: 'Dusun I',
    rw: '001',
    rt: '001',
  },
];

// =========================================================================
// RBAC STRICT DATA BOUNDARY FILTERING LOGIC
// =========================================================================
export function filterFamiliesByRole(families: Family[], profile: Profile | null): Family[] {
  if (!profile) return [];
  if (profile.role === 'admin') {
    return families;
  }
  if (profile.role === 'kadus') {
    return families.filter((f) => f.dusun === profile.assigned_dusun);
  }
  if (profile.role === 'rw') {
    return families.filter((f) => f.rw === profile.assigned_rw);
  }
  if (profile.role === 'rt') {
    return families.filter(
      (f) => f.rt === profile.assigned_rt && f.rw === profile.assigned_rw
    );
  }
  return [];
}

export function filterCitizensByRole(
  citizens: Citizen[],
  families: Family[],
  profile: Profile | null
): Citizen[] {
  const allowedFamilyIds = new Set(
    filterFamiliesByRole(families, profile).map((f) => f.id)
  );
  return citizens.filter((c) => allowedFamilyIds.has(c.family_id));
}

export function filterNotesByRole(notes: Note[], profile: Profile | null): Note[] {
  if (!profile) return [];
  if (profile.role === 'admin') {
    return notes;
  }
  // Petugas melihat catatan yang dibuatnya sendiri atau dalam wilayah penugasannya
  return notes.filter((n) => {
    if (n.author_id === profile.id) return true;
    if (profile.role === 'kadus') {
      return n.dusun === profile.assigned_dusun;
    }
    if (profile.role === 'rw') {
      return n.rw === profile.assigned_rw;
    }
    if (profile.role === 'rt') {
      return n.rt === profile.assigned_rt && n.rw === profile.assigned_rw;
    }
    return false;
  });
}

// Calculate dynamic stats for the active profile
export function computeStatsForProfile(
  families: Family[],
  citizens: Citizen[],
  notes: Note[],
  profile: Profile | null
): VillageStats {
  if (!profile) return OFFICIAL_VILLAGE_STATS.all;

  // For Admin or whole Dusun view, we can also integrate official high-level metrics
  if (profile.role === 'admin') {
    const pendingNotes = notes.filter((n) => n.status === 'pending').length;
    return {
      ...OFFICIAL_VILLAGE_STATS.all,
      pendingNotes,
    };
  }

  if (profile.role === 'kadus' && profile.assigned_dusun && OFFICIAL_VILLAGE_STATS[profile.assigned_dusun]) {
    const base = OFFICIAL_VILLAGE_STATS[profile.assigned_dusun];
    const pendingNotes = notes.filter(
      (n) => n.status === 'pending' && n.dusun === profile.assigned_dusun
    ).length;
    return {
      ...base,
      pendingNotes,
    };
  }

  // For RW and RT, calculate directly based on their filtered data boundary
  const visibleFamilies = filterFamiliesByRole(families, profile);
  const visibleCitizens = filterCitizensByRole(citizens, families, profile);
  const visibleNotes = filterNotesByRole(notes, profile);

  const nowYear = new Date().getFullYear();
  let lakiLaki = 0;
  let perempuan = 0;
  let wajibKtp = 0;
  let lansia = 0;
  let bpjsKis = 0;
  let bpjsMandiri = 0;
  let bpjsNone = 0;
  let bansosBpnt = 0;
  let bansosPkh = 0;
  let bansosKip = 0;
  let bansosBlt = 0;
  let disabilitas = 0;
  let tki = 0;

  for (const c of visibleCitizens) {
    if (c.jenis_kelamin === 'L') lakiLaki++;
    if (c.jenis_kelamin === 'P') perempuan++;

    const birthYear = parseInt(c.tanggal_lahir.split('-')[0], 10);
    const age = nowYear - birthYear;
    if (age >= 17) wajibKtp++;
    if (age >= 60) lansia++;

    if (c.bpjs_kesehatan === 'kis') bpjsKis++;
    else if (c.bpjs_kesehatan === 'mandiri') bpjsMandiri++;
    else bpjsNone++;

    if (c.disabilitas && c.disabilitas !== 'tidak') disabilitas++;
    if (c.status_tki) tki++;
  }

  for (const f of visibleFamilies) {
    if (f.bantuan_sosial === 'bpnt') bansosBpnt++;
    if (f.bantuan_sosial === 'pkh') bansosPkh++;
    if (f.bantuan_sosial === 'kip') bansosKip++;
    if (f.bantuan_sosial === 'blt') bansosBlt++;
  }

  return {
    totalRumah: Math.round(visibleFamilies.length * 0.85) || visibleFamilies.length,
    totalKK: visibleFamilies.length,
    totalJiwa: visibleCitizens.length,
    lakiLaki,
    perempuan,
    wajibKtp,
    lansia,
    bpjsKis,
    bpjsMandiri,
    bpjsNone,
    bansosBpnt,
    bansosPkh,
    bansosKip,
    bansosBlt,
    disabilitas,
    tki,
    pendingNotes: visibleNotes.filter((n) => n.status === 'pending').length,
  };
}
