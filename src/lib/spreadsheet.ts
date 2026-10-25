import * as XLSX from 'xlsx';
import { Family, Citizen, MaritalStatus, GenderType, PeneranganType, MckType, BansosType } from './types';
import { getCitizenMaritalStatus, getFamilyHouseNumber } from './mockData';

export interface ExportRow {
  no_kk: string;
  kepala_keluarga: string;
  nik: string;
  nama_lengkap: string;
  hubungan_keluarga: string;
  jenis_kelamin: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  status_perkawinan: string;
  agama: string;
  pendidikan_terakhir: string;
  pekerjaan: string;
  alamat: string;
  no_rumah: string;
  rt: string;
  rw: string;
  dusun: string;
  status_barcode: string;
  status_update: string;
  penerangan: string;
  fasilitas_mck: string;
  bantuan_sosial: string;
}

// Convert internal data to unified flat rows for spreadsheet
export function prepareSpreadsheetRows(
  citizens: Citizen[],
  families: Family[]
): ExportRow[] {
  const familyMap = new Map<string, Family>();
  families.forEach((f) => familyMap.set(f.id, f));

  return citizens.map((c) => {
    const f = familyMap.get(c.family_id);
    const houseNumber = getFamilyHouseNumber(f);
    const marital = getCitizenMaritalStatus(c);

    return {
      no_kk: f?.no_kk || '',
      kepala_keluarga: f?.kepala_keluarga || '',
      nik: c.nik,
      nama_lengkap: c.nama_lengkap,
      hubungan_keluarga: c.hubungan_keluarga,
      jenis_kelamin: c.jenis_kelamin,
      tempat_lahir: c.tempat_lahir,
      tanggal_lahir: c.tanggal_lahir,
      status_perkawinan: marital,
      agama: c.agama || 'Islam',
      pendidikan_terakhir: c.pendidikan_terakhir,
      pekerjaan: c.pekerjaan,
      alamat: f?.alamat || '',
      no_rumah: houseNumber,
      rt: f?.rt || '',
      rw: f?.rw || '',
      dusun: f?.dusun || '',
      status_barcode: f?.status_barcode ? 'Ya' : 'Tidak',
      status_update: f?.status_update ? 'Ya' : 'Tidak',
      penerangan: f?.penerangan || 'meteran',
      fasilitas_mck: f?.fasilitas_mck || 'sendiri',
      bantuan_sosial: f?.bantuan_sosial || 'none',
    };
  });
}

// Indonesian Header Labels for Excel Table
export const SPREADSHEET_COLUMNS = [
  { key: 'no_kk', label: 'Nomor Kartu Keluarga' },
  { key: 'kepala_keluarga', label: 'Nama Kepala Keluarga' },
  { key: 'nik', label: 'Nomor Induk Kependudukan (NIK)' },
  { key: 'nama_lengkap', label: 'Nama Lengkap Warga' },
  { key: 'hubungan_keluarga', label: 'Hubungan Keluarga' },
  { key: 'jenis_kelamin', label: 'Jenis Kelamin (L/P)' },
  { key: 'tempat_lahir', label: 'Tempat Lahir' },
  { key: 'tanggal_lahir', label: 'Tanggal Lahir' },
  { key: 'status_perkawinan', label: 'Status Perkawinan' },
  { key: 'agama', label: 'Agama' },
  { key: 'pendidikan_terakhir', label: 'Pendidikan Terakhir' },
  { key: 'pekerjaan', label: 'Pekerjaan' },
  { key: 'alamat', label: 'Alamat Lengkap' },
  { key: 'no_rumah', label: 'Nomor Rumah' },
  { key: 'rt', label: 'RT' },
  { key: 'rw', label: 'RW' },
  { key: 'dusun', label: 'Dusun' },
  { key: 'status_barcode', label: 'Status Barcode' },
  { key: 'status_update', label: 'Status Validasi' },
  { key: 'penerangan', label: 'Penerangan Listrik' },
  { key: 'fasilitas_mck', label: 'Fasilitas MCK' },
  { key: 'bantuan_sosial', label: 'Bantuan Sosial' },
] as const;

// Helper to format rows into ordered display dictionary
function mapRowsToOrderedDict(rows: ExportRow[]) {
  return rows.map((r) => {
    const item: Record<string, string> = {};
    SPREADSHEET_COLUMNS.forEach((col) => {
      item[col.label] = (r as any)[col.key] || '';
    });
    return item;
  });
}

/**
 * 1. NATIVE EXCEL (.xlsx) EXPORTER
 * Menghasilkan file Excel asli (.xlsx) dengan kolom rapi terpisah,
 * NIK & KK bertipe teks (tidak terpotong jadi notasi ilmiah 3.21608E+15),
 * dan lebar kolom otomatis disesuaikan.
 */
export function exportToExcel(rows: ExportRow[], fileName: string) {
  const formattedData = mapRowsToOrderedDict(rows);
  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Auto calculate column widths
  const colWidths = SPREADSHEET_COLUMNS.map((col) => {
    let maxLen = col.label.length;
    rows.forEach((r) => {
      const val = String((r as any)[col.key] || '');
      if (val.length > maxLen) maxLen = val.length;
    });
    return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
  });
  worksheet['!cols'] = colWidths;

  // Set explicit string type for NIK & KK cells so Excel doesn't parse them as numbers
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    // Column 0: Nomor Kartu Keluarga, Column 2: NIK
    const cellKk = worksheet[XLSX.utils.encode_cell({ r: R, c: 0 })];
    if (cellKk) {
      cellKk.t = 's';
      cellKk.z = '@';
    }
    const cellNik = worksheet[XLSX.utils.encode_cell({ r: R, c: 2 })];
    if (cellNik) {
      cellNik.t = 's';
      cellNik.z = '@';
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kependudukan');

  // Trigger download as .xlsx
  XLSX.writeFile(workbook, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
}

/**
 * 2. INDONESIAN REGIONAL CSV EXPORTER
 * Menggunakan separator titik-koma (;) dan instruksi `sep=;`
 * agar saat dibuka di Microsoft Excel versi Indonesia langsung terbagi per kolom!
 */
export function generateCsvIndonesia(rows: ExportRow[]): string {
  const delimiter = ';';
  const headers = SPREADSHEET_COLUMNS.map((col) => col.label);

  const lines: string[] = [];
  // sep=; explicitly informs Excel to split columns using semicolon
  lines.push(`sep=${delimiter}`);
  lines.push(headers.map((h) => `"${h}"`).join(delimiter));

  rows.forEach((row) => {
    const line = SPREADSHEET_COLUMNS.map((col) => {
      const val = String((row as any)[col.key] || '');
      // Format 16-digit numbers with ="..." so Excel preserves full text
      if (col.key === 'no_kk' || col.key === 'nik') {
        return `="${val}"`;
      }
      return `"${val.replace(/"/g, '""')}"`;
    });
    lines.push(line.join(delimiter));
  });

  // UTF-8 BOM (\uFEFF)
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * 3. STANDARD CSV EXPORTER (COMMA)
 */
export function generateCsv(rows: ExportRow[]): string {
  return generateCsvIndonesia(rows);
}

// Download file trigger helper
export function downloadFile(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 4. UNIVERSAL SPREADSHEET PARSER (.xlsx, .xls, .csv)
 * Mampu membaca baik berkas Excel binary maupun file CSV dengan separator apapun.
 */
export async function parseSpreadsheetFile(file: File): Promise<Record<string, string>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) return [];

  const worksheet = workbook.Sheets[firstSheetName];
  // Parse rows as raw objects with header
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    raw: false, // get formatted string values
    defval: '',
  });

  // Normalize header keys into snake_case
  return rawRows.map((raw) => {
    const normalized: Record<string, string> = {};
    Object.keys(raw).forEach((origKey) => {
      // Map standard Indonesian labels to clean internal keys
      const cleanKey = origKey
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/^_+|_+$/g, '');

      // Also provide standard aliases
      let mappedKey = cleanKey;
      if (cleanKey.includes('kartu_keluarga') || cleanKey === 'no_kk') mappedKey = 'no_kk';
      else if (cleanKey.includes('kepala_keluarga')) mappedKey = 'kepala_keluarga';
      else if (cleanKey.includes('nik') || cleanKey.includes('ktp')) mappedKey = 'nik';
      else if (cleanKey.includes('nama_lengkap') || cleanKey === 'nama') mappedKey = 'nama_lengkap';
      else if (cleanKey.includes('hubungan')) mappedKey = 'hubungan_keluarga';
      else if (cleanKey.includes('jenis_kelamin')) mappedKey = 'jenis_kelamin';
      else if (cleanKey.includes('perkawinan') || cleanKey.includes('nikah')) mappedKey = 'status_perkawinan';
      else if (cleanKey.includes('rumah')) mappedKey = 'no_rumah';
      else if (cleanKey.includes('alamat')) mappedKey = 'alamat';

      normalized[mappedKey] = String(raw[origKey] || '').trim();
      normalized[cleanKey] = String(raw[origKey] || '').trim();
    });
    return normalized;
  });
}

// Fallback CSV text parser
export function parseCsv(csvText: string): Record<string, string>[] {
  const workbook = XLSX.read(csvText, { type: 'string' });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    raw: false,
    defval: '',
  });

  return rawRows.map((raw) => {
    const normalized: Record<string, string> = {};
    Object.keys(raw).forEach((k) => {
      const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/^_+|_+$/g, '');
      normalized[cleanKey] = String(raw[k] || '').trim();
    });
    return normalized;
  });
}

// Generate template Excel file for download
export function generateSampleTemplateWorkbook(): void {
  const sampleRows: ExportRow[] = [
    {
      no_kk: '3216081203000001',
      kepala_keluarga: 'SAMSUDIN',
      nik: '3216081205780001',
      nama_lengkap: 'SAMSUDIN',
      hubungan_keluarga: 'Kepala Keluarga',
      jenis_kelamin: 'L',
      tempat_lahir: 'Bekasi',
      tanggal_lahir: '1978-05-12',
      status_perkawinan: 'Kawin',
      agama: 'Islam',
      pendidikan_terakhir: 'SMA / Sederajat',
      pekerjaan: 'Buruh Harian Lepas',
      alamat: 'Jl. Balai Desa RT 001 / RW 001',
      no_rumah: '01',
      rt: '001',
      rw: '001',
      dusun: 'Dusun I',
      status_barcode: 'Ya',
      status_update: 'Ya',
      penerangan: 'meteran',
      fasilitas_mck: 'sendiri',
      bantuan_sosial: 'pkh',
    },
    {
      no_kk: '3216081203000001',
      kepala_keluarga: 'SAMSUDIN',
      nik: '3216085508820002',
      nama_lengkap: 'SITI AMINAH',
      hubungan_keluarga: 'Istri',
      jenis_kelamin: 'P',
      tempat_lahir: 'Bekasi',
      tanggal_lahir: '1982-08-15',
      status_perkawinan: 'Kawin',
      agama: 'Islam',
      pendidikan_terakhir: 'SMP / Sederajat',
      pekerjaan: 'Mengurus Rumah Tangga',
      alamat: 'Jl. Balai Desa RT 001 / RW 001',
      no_rumah: '01',
      rt: '001',
      rw: '001',
      dusun: 'Dusun I',
      status_barcode: 'Ya',
      status_update: 'Ya',
      penerangan: 'meteran',
      fasilitas_mck: 'sendiri',
      bantuan_sosial: 'pkh',
    },
    {
      no_kk: '3216081203000001',
      kepala_keluarga: 'SAMSUDIN',
      nik: '3216081402050003',
      nama_lengkap: 'RIZKY RAMADHAN',
      hubungan_keluarga: 'Anak',
      jenis_kelamin: 'L',
      tempat_lahir: 'Bekasi',
      tanggal_lahir: '2005-02-14',
      status_perkawinan: 'Belum Kawin',
      agama: 'Islam',
      pendidikan_terakhir: 'SMA / Sederajat',
      pekerjaan: 'Pelajar / Mahasiswa',
      alamat: 'Jl. Balai Desa RT 001 / RW 001',
      no_rumah: '01',
      rt: '001',
      rw: '001',
      dusun: 'Dusun I',
      status_barcode: 'Ya',
      status_update: 'Ya',
      penerangan: 'meteran',
      fasilitas_mck: 'sendiri',
      bantuan_sosial: 'pkh',
    },
  ];

  exportToExcel(sampleRows, 'Template_Format_Data_Kependudukan_Karanghaur.xlsx');
}

export function generateSampleTemplate(): string {
  return generateCsvIndonesia([
    {
      no_kk: '3216081203000001',
      kepala_keluarga: 'SAMSUDIN',
      nik: '3216081205780001',
      nama_lengkap: 'SAMSUDIN',
      hubungan_keluarga: 'Kepala Keluarga',
      jenis_kelamin: 'L',
      tempat_lahir: 'Bekasi',
      tanggal_lahir: '1978-05-12',
      status_perkawinan: 'Kawin',
      agama: 'Islam',
      pendidikan_terakhir: 'SMA / Sederajat',
      pekerjaan: 'Buruh Harian Lepas',
      alamat: 'Jl. Balai Desa RT 001 / RW 001',
      no_rumah: '01',
      rt: '001',
      rw: '001',
      dusun: 'Dusun I',
      status_barcode: 'Ya',
      status_update: 'Ya',
      penerangan: 'meteran',
      fasilitas_mck: 'sendiri',
      bantuan_sosial: 'pkh',
    },
  ]);
}
