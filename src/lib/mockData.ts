import { Profile, Family, Citizen, Note, VillageStats, MaritalStatus, VillageConfig } from './types';

export const DEFAULT_VILLAGE_CONFIG: VillageConfig = {
  nama_desa: 'Desa Karanghaur',
  kepala_desa: 'H. Sulaeman, S.IP',
  alamat_desa: 'Jl. Raya Karanghaur No. 01, Kec. Pebayuran, Kab. Bekasi',
  kecamatan: 'Pebayuran',
  kabupaten: 'Bekasi',
  provinsi: 'Jawa Barat',
  kode_pos: '17710',
  telepon_desa: '021-89150001',
  email_desa: 'pemdes@karanghaur.desa.id',
};

export function getCitizenMaritalStatus(citizen: Citizen): MaritalStatus {
  if (citizen.status_perkawinan) return citizen.status_perkawinan;
  if (citizen.hubungan_keluarga === 'Anak') return 'Belum Kawin';
  if (citizen.id === 'cit-13') return 'Cerai Hidup';
  if (citizen.id === 'cit-17') return 'Cerai Mati';
  return 'Kawin';
}

const DEFAULT_CITIZEN_EXTRAS_BY_NIK: Record<
  string,
  { golongan_darah: string; tanggal_perkawinan: string; nama_ayah: string; nama_ibu: string }
> = {
  '3216081205720001': { golongan_darah: 'O', tanggal_perkawinan: '1999-06-15', nama_ayah: 'H. ABDUL KARIM', nama_ibu: 'HJ. MAEMUNAH' },
  '3216085508760002': { golongan_darah: 'A', tanggal_perkawinan: '1999-06-15', nama_ayah: 'SANUSI', nama_ibu: 'ROKAYA' },
  '3216081404020003': { golongan_darah: 'O', tanggal_perkawinan: '-', nama_ayah: 'SAMSUDIN', nama_ibu: 'ROHAYATI' },
  '3216086209120004': { golongan_darah: 'A', tanggal_perkawinan: '-', nama_ayah: 'SAMSUDIN', nama_ibu: 'ROHAYATI' },
  '3216082407750001': { golongan_darah: 'B', tanggal_perkawinan: '2001-09-10', nama_ayah: 'SUHANDI', nama_ibu: 'MARYAM' },
  '3216086011780002': { golongan_darah: 'AB', tanggal_perkawinan: '2001-09-10', nama_ayah: 'SUTOPO', nama_ibu: 'SRI WAHYUNI' },
  '3216080503030003': { golongan_darah: 'B', tanggal_perkawinan: '-', nama_ayah: 'ACHMAD SUHANDI', nama_ibu: 'ENDAH RETNOWATI' },
  '3216081002680001': { golongan_darah: 'O', tanggal_perkawinan: '1995-04-20', nama_ayah: 'SUTISNA', nama_ibu: 'SAODAH' },
  '3216085106720002': { golongan_darah: 'O', tanggal_perkawinan: '1995-04-20', nama_ayah: 'MADROJI', nama_ibu: 'NENGSIH' },
  '3216081909060003': { golongan_darah: 'O', tanggal_perkawinan: '-', nama_ayah: 'DEDE SUTISNA', nama_ibu: 'KARSINAH' },
  '3216080101600001': { golongan_darah: 'A', tanggal_perkawinan: '1988-11-12', nama_ayah: 'H. WIJAYA', nama_ibu: 'HJ. FATIMAH' },
  '3216084803650002': { golongan_darah: 'B', tanggal_perkawinan: '1988-11-12', nama_ayah: 'H. HASAN', nama_ibu: 'HJ. AMINAH' },
  '3216081808800001': { golongan_darah: 'O', tanggal_perkawinan: '2005-07-17', nama_ayah: 'KASMURI', nama_ibu: 'SUMIATI' },
  '3216082212080002': { golongan_darah: 'O', tanggal_perkawinan: '-', nama_ayah: 'WARSONO', nama_ibu: 'SULASTRI' },
  '3216080709840001': { golongan_darah: 'A', tanggal_perkawinan: '2010-02-14', nama_ayah: 'SARMAN', nama_ibu: 'JUBAEDAH' },
  '3216084405880002': { golongan_darah: 'O', tanggal_perkawinan: '2010-02-14', nama_ayah: 'MISBAH', nama_ibu: 'HALIMAH' },
  '3216081103790001': { golongan_darah: 'AB', tanggal_perkawinan: '2004-08-22', nama_ayah: 'SUNANDAR', nama_ibu: 'EUIS KOMARIAH' },
  '3216080404550001': { golongan_darah: 'O', tanggal_perkawinan: '1980-05-01', nama_ayah: 'H. USMAN', nama_ibu: 'HJ. SALAMAH' },
  '3216081505630001': { golongan_darah: 'B', tanggal_perkawinan: '1990-10-05', nama_ayah: 'H. SYARIF', nama_ibu: 'HJ. ZAINAB' },
  '3216081910810001': { golongan_darah: 'O', tanggal_perkawinan: '2006-12-09', nama_ayah: 'PAIMIN', nama_ibu: 'PONIRAH' },
};

export function getCitizenBloodType(citizen: Citizen): string {
  if (citizen.golongan_darah && citizen.golongan_darah.trim() !== '') {
    return citizen.golongan_darah.trim();
  }
  return DEFAULT_CITIZEN_EXTRAS_BY_NIK[citizen.nik]?.golongan_darah || 'O';
}

export function getCitizenMarriageDate(citizen: Citizen): string {
  const marital = getCitizenMaritalStatus(citizen);
  if (marital === 'Belum Kawin') return '-';
  if (citizen.tanggal_perkawinan && citizen.tanggal_perkawinan.trim() !== '') {
    return citizen.tanggal_perkawinan.trim();
  }
  return DEFAULT_CITIZEN_EXTRAS_BY_NIK[citizen.nik]?.tanggal_perkawinan || '-';
}

export function getCitizenParents(citizen: Citizen): { ayah: string; ibu: string } {
  const ayah =
    citizen.nama_ayah && citizen.nama_ayah.trim() !== ''
      ? citizen.nama_ayah.trim().toUpperCase()
      : DEFAULT_CITIZEN_EXTRAS_BY_NIK[citizen.nik]?.nama_ayah || '-';
  const ibu =
    citizen.nama_ibu && citizen.nama_ibu.trim() !== ''
      ? citizen.nama_ibu.trim().toUpperCase()
      : DEFAULT_CITIZEN_EXTRAS_BY_NIK[citizen.nik]?.nama_ibu || '-';
  return { ayah, ibu };
}

export function getFamilyHouseNumber(family?: Family | null): string {
  if (!family) return '-';
  if (family.no_rumah && family.no_rumah.trim() !== '') return family.no_rumah.trim();
  const match = family.alamat.match(/No\.?\s*(\d+)/i);
  return match ? match[1] : '01';
}

export function calculateCitizenAge(dateString: string): number {
  if (!dateString) return 0;
  const birth = new Date(dateString);
  if (isNaN(birth.getTime())) {
    const yearMatch = String(dateString).match(/^(\d{4})/);
    if (yearMatch) {
      return new Date().getFullYear() - parseInt(yearMatch[1], 10);
    }
    return 0;
  }
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
}

// =========================================================================
// DEMO PROFILES (SINKRON 100% DENGAN SUPABASE SCHEMA.SQL)
// =========================================================================
export const DEMO_PROFILES: Profile[] = [
  {
    id: 'prof-admin',
    full_name: 'Syahid (Administrator Desa)',
    role: 'admin',
    assigned_dusun: null,
    assigned_rw: null,
    assigned_rt: null,
    phone: '0812-9988-7766',
    pin: '123456',
  },
  {
    id: 'prof-kadus-1',
    full_name: 'H. Sulaeman (Kepala Dusun I)',
    role: 'kadus',
    assigned_dusun: 'Dusun I',
    assigned_rw: null,
    assigned_rt: null,
    phone: '0813-1122-3344',
    pin: '111111',
  },
  {
    id: 'prof-kadus-2',
    full_name: 'Bpk. Mastur (Kepala Dusun II)',
    role: 'kadus',
    assigned_dusun: 'Dusun II',
    assigned_rw: null,
    assigned_rt: null,
    phone: '0813-2233-4455',
    pin: '111112',
  },
  {
    id: 'prof-kadus-3',
    full_name: 'Bpk. Jayadi (Kepala Dusun III)',
    role: 'kadus',
    assigned_dusun: 'Dusun III',
    assigned_rw: null,
    assigned_rt: null,
    phone: '0813-3344-5566',
    pin: '111113',
  },
  {
    id: 'prof-rw-01',
    full_name: 'Bpk. Dahlan (Ketua RW 001)',
    role: 'rw',
    assigned_dusun: 'Dusun I',
    assigned_rw: '001',
    assigned_rt: null,
    phone: '0857-4455-6677',
    pin: '222221',
  },
  {
    id: 'prof-rw-02',
    full_name: 'Bpk. Rohmat (Ketua RW 002)',
    role: 'rw',
    assigned_dusun: 'Dusun I',
    assigned_rw: '002',
    assigned_rt: null,
    phone: '0857-5566-7788',
    pin: '222222',
  },
  {
    id: 'prof-rt-01',
    full_name: 'Bpk. Kusnan (Ketua RT 001/001)',
    role: 'rt',
    assigned_dusun: 'Dusun I',
    assigned_rw: '001',
    assigned_rt: '001',
    phone: '0896-1234-5678',
    pin: '333331',
  },
  {
    id: 'prof-rt-02',
    full_name: 'Bpk. Marzuki (Ketua RT 002/001)',
    role: 'rt',
    assigned_dusun: 'Dusun I',
    assigned_rw: '001',
    assigned_rt: '002',
    phone: '0896-2345-6789',
    pin: '333332',
  },
  {
    id: 'prof-rt-03',
    full_name: 'Bpk. Sanwani (Ketua RT 001/002)',
    role: 'rt',
    assigned_dusun: 'Dusun I',
    assigned_rw: '002',
    assigned_rt: '001',
    phone: '0896-3456-7890',
    pin: '333333',
  },
];

// =========================================================================
// INITIAL FAMILIES (SINKRON 100% DENGAN SUPABASE SCHEMA.SQL)
// =========================================================================
export const INITIAL_FAMILIES: Family[] = [
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
    status_update: false,
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
    status_barcode: false,
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
    bantuan_sosial: 'none',
    created_at: '2024-02-15T13:45:00Z',
  },
  {
    id: 'fam-07',
    no_kk: '3216081203000007',
    kepala_keluarga: 'ASEP SUNANDAR',
    alamat: 'Jl. Kali CBL RT 001 / RW 002',
    no_rumah: '05',
    dusun: 'Dusun I',
    rw: '002',
    rt: '001',
    status_barcode: true,
    status_update: true,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'bpnt',
    created_at: '2024-02-18T08:00:00Z',
  },
  {
    id: 'fam-08',
    no_kk: '3216081203000008',
    kepala_keluarga: 'M. TOHIR',
    alamat: 'Gg. Musholla RT 001 / RW 002',
    no_rumah: '09',
    dusun: 'Dusun I',
    rw: '002',
    rt: '001',
    status_barcode: false,
    status_update: false,
    penerangan: 'tanpa_meteran',
    fasilitas_mck: 'umum',
    bantuan_sosial: 'blt',
    created_at: '2024-02-20T16:30:00Z',
  },
  {
    id: 'fam-09',
    no_kk: '3216081203000009',
    kepala_keluarga: 'H. BADRUDIN',
    alamat: 'Jl. Raya Karanghaur Dusun II',
    no_rumah: '18',
    dusun: 'Dusun II',
    rw: '003',
    rt: '001',
    status_barcode: true,
    status_update: true,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'none',
    created_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'fam-10',
    no_kk: '3216081203000010',
    kepala_keluarga: 'SUKIMAN',
    alamat: 'Kp. Babakan Dusun III RT 001 / RW 005',
    no_rumah: '04',
    dusun: 'Dusun III',
    rw: '005',
    rt: '001',
    status_barcode: true,
    status_update: true,
    penerangan: 'meteran',
    fasilitas_mck: 'sendiri',
    bantuan_sosial: 'kip',
    created_at: '2024-03-05T11:20:00Z',
  },
];

// =========================================================================
// INITIAL CITIZENS (SINKRON 100% DENGAN SUPABASE SCHEMA.SQL)
// =========================================================================
export const INITIAL_CITIZENS: Citizen[] = [
  {
    id: 'cit-01',
    family_id: 'fam-01',
    nik: '3216081205720001',
    nama_lengkap: 'SAMSUDIN',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1972-05-12',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'SMP / Sederajat',
    pekerjaan: 'Petani / Pekebun',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '1999-06-15',
    nama_ayah: 'H. ABDUL KARIM',
    nama_ibu: 'HJ. MAEMUNAH',
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
    nik: '3216085508760002',
    nama_lengkap: 'ROHAYATI',
    hubungan_keluarga: 'Istri',
    jenis_kelamin: 'P',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1976-08-15',
    golongan_darah: 'A',
    agama: 'Islam',
    pendidikan_terakhir: 'SD / Sederajat',
    pekerjaan: 'Mengurus Rumah Tangga',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '1999-06-15',
    nama_ayah: 'SANUSI',
    nama_ibu: 'ROKAYA',
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
    nik: '3216081404020003',
    nama_lengkap: 'RIZKY RAMADHAN',
    hubungan_keluarga: 'Anak',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '2002-04-14',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Pelajar / Mahasiswa',
    status_perkawinan: 'Belum Kawin',
    tanggal_perkawinan: '-',
    nama_ayah: 'SAMSUDIN',
    nama_ibu: 'ROHAYATI',
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
    golongan_darah: 'A',
    agama: 'Islam',
    pendidikan_terakhir: 'SD / Sederajat',
    pekerjaan: 'Belum / Tidak Bekerja',
    status_perkawinan: 'Belum Kawin',
    tanggal_perkawinan: '-',
    nama_ayah: 'SAMSUDIN',
    nama_ibu: 'ROHAYATI',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: false,
    created_at: '2024-01-15T08:30:00Z',
  },
  {
    id: 'cit-05',
    family_id: 'fam-02',
    nik: '3216082407750001',
    nama_lengkap: 'ACHMAD SUHANDI',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Karawang',
    tanggal_lahir: '1975-07-24',
    golongan_darah: 'B',
    agama: 'Islam',
    pendidikan_terakhir: 'SMK / Sederajat',
    pekerjaan: 'Karyawan Swasta',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '2001-09-10',
    nama_ayah: 'SUHANDI',
    nama_ibu: 'MARYAM',
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
    golongan_darah: 'AB',
    agama: 'Islam',
    pendidikan_terakhir: 'D3 Kebidanan',
    pekerjaan: 'Tenaga Kesehatan',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '2001-09-10',
    nama_ayah: 'SUTOPO',
    nama_ibu: 'SRI WAHYUNI',
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
    nama_lengkap: 'DIMAS PRASETYO',
    hubungan_keluarga: 'Anak',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '2003-03-05',
    golongan_darah: 'B',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Karyawan Swasta',
    status_perkawinan: 'Belum Kawin',
    tanggal_perkawinan: '-',
    nama_ayah: 'ACHMAD SUHANDI',
    nama_ibu: 'ENDAH RETNOWATI',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: false,
    created_at: '2024-01-20T10:15:00Z',
  },
  {
    id: 'cit-08',
    family_id: 'fam-03',
    nik: '3216081002680001',
    nama_lengkap: 'DEDE SUTISNA',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1968-02-10',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'SD / Sederajat',
    pekerjaan: 'Buruh Harian Lepas',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '1995-04-20',
    nama_ayah: 'SUTISNA',
    nama_ibu: 'SAODAH',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-01T14:00:00Z',
  },
  {
    id: 'cit-09',
    family_id: 'fam-03',
    nik: '3216085106720002',
    nama_lengkap: 'KARSINAH',
    hubungan_keluarga: 'Istri',
    jenis_kelamin: 'P',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1972-06-11',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'Tidak / Belum Sekolah',
    pekerjaan: 'Mengurus Rumah Tangga',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '1995-04-20',
    nama_ayah: 'MADROJI',
    nama_ibu: 'NENGSIH',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: false,
    akta_nikah: true,
    created_at: '2024-02-01T14:00:00Z',
  },
  {
    id: 'cit-10',
    family_id: 'fam-03',
    nik: '3216081909060003',
    nama_lengkap: 'AGUS KURNIAWAN',
    hubungan_keluarga: 'Anak',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '2006-09-19',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'SMP / Sederajat',
    pekerjaan: 'Buruh Harian Lepas',
    status_perkawinan: 'Belum Kawin',
    tanggal_perkawinan: '-',
    nama_ayah: 'DEDE SUTISNA',
    nama_ibu: 'KARSINAH',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: false,
    created_at: '2024-02-01T14:00:00Z',
  },
  {
    id: 'cit-11',
    family_id: 'fam-04',
    nik: '3216080101600001',
    nama_lengkap: 'H. ENDANG WIJAYA',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1960-01-01',
    golongan_darah: 'A',
    agama: 'Islam',
    pendidikan_terakhir: 'S1 Ekonomi',
    pekerjaan: 'Wiraswasta / Pedagang',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '1988-11-12',
    nama_ayah: 'H. WIJAYA',
    nama_ibu: 'HJ. FATIMAH',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-10T09:20:00Z',
  },
  {
    id: 'cit-12',
    family_id: 'fam-04',
    nik: '3216084803650002',
    nama_lengkap: 'HJ. SITI KHADIJAH',
    hubungan_keluarga: 'Istri',
    jenis_kelamin: 'P',
    tempat_lahir: 'Cirebon',
    tanggal_lahir: '1965-03-08',
    golongan_darah: 'B',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Wiraswasta / Pedagang',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '1988-11-12',
    nama_ayah: 'H. HASAN',
    nama_ibu: 'HJ. AMINAH',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-10T09:20:00Z',
  },
  {
    id: 'cit-13',
    family_id: 'fam-05',
    nik: '3216081808800001',
    nama_lengkap: 'WARSONO',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Brebes',
    tanggal_lahir: '1980-08-18',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'SMP / Sederajat',
    pekerjaan: 'Sopir / Angkutan',
    status_perkawinan: 'Cerai Hidup',
    tanggal_perkawinan: '2005-07-17',
    nama_ayah: 'KASMURI',
    nama_ibu: 'SUMIATI',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: false,
    created_at: '2024-02-12T11:00:00Z',
  },
  {
    id: 'cit-14',
    family_id: 'fam-05',
    nik: '3216082212080002',
    nama_lengkap: 'BAYU PAMUNGKAS',
    hubungan_keluarga: 'Anak',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '2008-12-22',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'SD / Sederajat',
    pekerjaan: 'Pelajar / Mahasiswa',
    status_perkawinan: 'Belum Kawin',
    tanggal_perkawinan: '-',
    nama_ayah: 'WARSONO',
    nama_ibu: 'SULASTRI',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: false,
    created_at: '2024-02-12T11:00:00Z',
  },
  {
    id: 'cit-15',
    family_id: 'fam-06',
    nik: '3216080709840001',
    nama_lengkap: 'KOSASIH',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1984-09-07',
    golongan_darah: 'A',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Tukang Kayu / Bangunan',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '2010-02-14',
    nama_ayah: 'SARMAN',
    nama_ibu: 'JUBAEDAH',
    bpjs_kesehatan: 'tidak',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-15T13:45:00Z',
  },
  {
    id: 'cit-16',
    family_id: 'fam-06',
    nik: '3216084405880002',
    nama_lengkap: 'MIMI AMINAH',
    hubungan_keluarga: 'Istri',
    jenis_kelamin: 'P',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1988-05-04',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'SMP / Sederajat',
    pekerjaan: 'Mengurus Rumah Tangga',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '2010-02-14',
    nama_ayah: 'MISBAH',
    nama_ibu: 'HALIMAH',
    bpjs_kesehatan: 'tidak',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-15T13:45:00Z',
  },
  {
    id: 'cit-17',
    family_id: 'fam-07',
    nik: '3216081103790001',
    nama_lengkap: 'ASEP SUNANDAR',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bandung',
    tanggal_lahir: '1979-03-11',
    golongan_darah: 'AB',
    agama: 'Islam',
    pendidikan_terakhir: 'SMK / Sederajat',
    pekerjaan: 'Karyawan Swasta',
    status_perkawinan: 'Cerai Mati',
    tanggal_perkawinan: '2004-08-22',
    nama_ayah: 'SUNANDAR',
    nama_ibu: 'EUIS KOMARIAH',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: false,
    created_at: '2024-02-18T08:00:00Z',
  },
  {
    id: 'cit-18',
    family_id: 'fam-08',
    nik: '3216080404550001',
    nama_lengkap: 'M. TOHIR',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1955-04-04',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'SD / Sederajat',
    pekerjaan: 'Pensiunan / Tidak Bekerja',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '1980-05-01',
    nama_ayah: 'H. USMAN',
    nama_ibu: 'HJ. SALAMAH',
    bpjs_kesehatan: 'kis',
    disabilitas: 'daksa',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-02-20T16:30:00Z',
  },
  {
    id: 'cit-19',
    family_id: 'fam-09',
    nik: '3216081505630001',
    nama_lengkap: 'H. BADRUDIN',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Bekasi',
    tanggal_lahir: '1963-05-15',
    golongan_darah: 'B',
    agama: 'Islam',
    pendidikan_terakhir: 'SMA / Sederajat',
    pekerjaan: 'Wiraswasta / Pedagang',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '1990-10-05',
    nama_ayah: 'H. SYARIF',
    nama_ibu: 'HJ. ZAINAB',
    bpjs_kesehatan: 'mandiri',
    disabilitas: 'tidak',
    status_tki: false,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-03-01T10:00:00Z',
  },
  {
    id: 'cit-20',
    family_id: 'fam-10',
    nik: '3216081910810001',
    nama_lengkap: 'SUKIMAN',
    hubungan_keluarga: 'Kepala Keluarga',
    jenis_kelamin: 'L',
    tempat_lahir: 'Kebumen',
    tanggal_lahir: '1981-10-19',
    golongan_darah: 'O',
    agama: 'Islam',
    pendidikan_terakhir: 'SMP / Sederajat',
    pekerjaan: 'Buruh Tani',
    status_perkawinan: 'Kawin',
    tanggal_perkawinan: '2006-12-09',
    nama_ayah: 'PAIMIN',
    nama_ibu: 'PONIRAH',
    bpjs_kesehatan: 'kis',
    disabilitas: 'tidak',
    status_tki: true,
    akta_kelahiran: true,
    akta_nikah: true,
    created_at: '2024-03-05T11:20:00Z',
  },
];

// =========================================================================
// INITIAL NOTES (SINKRON 100% DENGAN SUPABASE SCHEMA.SQL)
// =========================================================================
export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-01',
    family_id: 'fam-02',
    citizen_id: 'cit-05',
    author_id: 'prof-rt-01',
    message: 'Keluarga baru saja memperbarui data kepindahan anak tertua, mohon cetak KK barcode terbaru.',
    status: 'pending',
    created_at: '2024-03-10T09:00:00Z',
    family_no_kk: '3216081203000002',
    citizen_name: 'ACHMAD SUHANDI',
    citizen_nik: '3216082407750001',
    dusun: 'Dusun I',
    rw: '001',
    rt: '001',
  },
  {
    id: 'note-02',
    family_id: 'fam-03',
    citizen_id: null,
    author_id: 'prof-rt-01',
    message: 'Keluarga Dede Sutisna memerlukan bantuan renovasi sanitasi MCK dan pemasangan meteran listrik mandiri.',
    status: 'pending',
    created_at: '2024-03-12T14:30:00Z',
    family_no_kk: '3216081203000003',
    citizen_name: undefined,
    citizen_nik: undefined,
    dusun: 'Dusun I',
    rw: '001',
    rt: '001',
  },
  {
    id: 'note-03',
    family_id: 'fam-08',
    citizen_id: 'cit-18',
    author_id: 'prof-rw-02',
    message: 'Lansia disabilitas daksa, mohon didaftarkan program bantuan kursi roda dari Dinas Sosial.',
    status: 'reviewed',
    created_at: '2024-03-15T11:15:00Z',
    family_no_kk: '3216081203000008',
    citizen_name: 'M. TOHIR',
    citizen_nik: '3216080404550001',
    dusun: 'Dusun I',
    rw: '002',
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

// =========================================================================
// REAL DYNAMIC STATISTICS FOR ALL ROLES (100% SINKRON DENGAN DATABASE)
// =========================================================================
export function computeStatsForProfile(
  families: Family[],
  citizens: Citizen[],
  notes: Note[],
  profile: Profile | null
): VillageStats {
  const visibleFamilies = filterFamiliesByRole(families, profile);
  const visibleCitizens = filterCitizensByRole(citizens, families, profile);
  const visibleNotes = filterNotesByRole(notes, profile);

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
    else if (c.jenis_kelamin === 'P') perempuan++;

    const age = calculateCitizenAge(c.tanggal_lahir);
    if (age >= 17) wajibKtp++;
    if (age >= 60) lansia++;

    if (c.bpjs_kesehatan === 'kis') bpjsKis++;
    else if (c.bpjs_kesehatan === 'mandiri') bpjsMandiri++;
    else bpjsNone++;

    if (c.disabilitas && c.disabilitas.toLowerCase() !== 'tidak') disabilitas++;
    if (c.status_tki) tki++;
  }

  const uniqueHouses = new Set<string>();
  for (const f of visibleFamilies) {
    const houseNo = getFamilyHouseNumber(f);
    uniqueHouses.add(`${f.dusun}|${f.rw}|${f.rt}|${houseNo}`);

    if (f.bantuan_sosial === 'bpnt') bansosBpnt++;
    else if (f.bantuan_sosial === 'pkh') bansosPkh++;
    else if (f.bantuan_sosial === 'kip') bansosKip++;
    else if (f.bantuan_sosial === 'blt') bansosBlt++;
  }

  return {
    totalRumah: uniqueHouses.size,
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
