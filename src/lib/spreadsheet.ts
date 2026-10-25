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

// Generate CSV string with Excel compatibility (UTF-8 BOM and escaped fields)
export function generateCsv(rows: ExportRow[]): string {
  const headers: (keyof ExportRow)[] = [
    'no_kk',
    'kepala_keluarga',
    'nik',
    'nama_lengkap',
    'hubungan_keluarga',
    'jenis_kelamin',
    'tempat_lahir',
    'tanggal_lahir',
    'status_perkawinan',
    'agama',
    'pendidikan_terakhir',
    'pekerjaan',
    'alamat',
    'no_rumah',
    'rt',
    'rw',
    'dusun',
    'status_barcode',
    'status_update',
    'penerangan',
    'fasilitas_mck',
    'bantuan_sosial',
  ];

  const headerLabels = [
    'No KK',
    'Kepala Keluarga',
    'NIK',
    'Nama Lengkap',
    'Hubungan Keluarga',
    'Jenis Kelamin (L/P)',
    'Tempat Lahir',
    'Tanggal Lahir (YYYY-MM-DD)',
    'Status Perkawinan',
    'Agama',
    'Pendidikan Terakhir',
    'Pekerjaan',
    'Alamat Lengkap',
    'Nomor Rumah',
    'RT',
    'RW',
    'Dusun',
    'Status Barcode (Ya/Tidak)',
    'Status Validasi (Ya/Tidak)',
    'Penerangan Listrik',
    'Fasilitas MCK',
    'Bantuan Sosial',
  ];

  const csvRows: string[] = [];
  csvRows.push(headerLabels.map((h) => `"${h}"`).join(','));

  rows.forEach((row) => {
    const line = headers.map((key) => {
      let val = row[key] || '';
      // Format 16-digit numbers with prefix to avoid scientific notation in Excel
      if (key === 'no_kk' || key === 'nik') {
        return `="${val}"`;
      }
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(line.join(','));
  });

  // \uFEFF is UTF-8 Byte Order Mark for Excel compatibility
  return '\uFEFF' + csvRows.join('\r\n');
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

// Parse uploaded CSV content into rows
export function parseCsv(csvText: string): Record<string, string>[] {
  // Remove BOM if present
  let cleanText = csvText.replace(/^\uFEFF/, '').trim();
  const lines = cleanText.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse header line (support comma or semicolon)
  const delimiter = lines[0].includes(';') ? ';' : ',';

  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    // Clean up Excel `="123"` format
    return result.map((item) => {
      if (item.startsWith('="') && item.endsWith('"')) {
        return item.slice(2, -1);
      }
      if (item.startsWith('"') && item.endsWith('"')) {
        return item.slice(1, -1);
      }
      return item;
    });
  };

  const headers = parseLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '_')
  );

  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const row: Record<string, string> = {};

    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });

    results.push(row);
  }

  return results;
}

// Generate template CSV for download
export function generateSampleTemplate(): string {
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

  return generateCsv(sampleRows);
}
