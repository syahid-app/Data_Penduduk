import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { INITIAL_FAMILIES, INITIAL_CITIZENS } from '@/lib/mockData';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Family, Citizen } from '@/lib/types';
import {
  prepareSpreadsheetRows,
  SPREADSHEET_COLUMNS,
  generateCsvIndonesia,
} from '@/lib/spreadsheet';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'xlsx';
    const scope = searchParams.get('scope') || 'all';
    const dusun = searchParams.get('dusun');
    const rw = searchParams.get('rw');
    const rt = searchParams.get('rt');

    let sourceFamilies: Family[] = [...INITIAL_FAMILIES];
    let sourceCitizens: Citizen[] = [...INITIAL_CITIZENS];

    // Fetch live data from Supabase if configured
    if (isSupabaseConfigured && supabase) {
      const [famRes, citRes] = await Promise.all([
        supabase.from('families').select('*').order('created_at', { ascending: false }),
        supabase.from('citizens').select('*').order('created_at', { ascending: false }),
      ]);
      if (!famRes.error && famRes.data && famRes.data.length > 0) {
        sourceFamilies = famRes.data;
      }
      if (!citRes.error && citRes.data && citRes.data.length > 0) {
        sourceCitizens = citRes.data;
      }
    }

    // Filter families based on scope
    let families = [...sourceFamilies];
    if (scope === 'dusun' && dusun) {
      families = families.filter((f) => f.dusun === dusun);
    } else if (scope === 'rw' && rw) {
      families = families.filter((f) => f.rw === rw);
    } else if (scope === 'rt' && rt && rw) {
      families = families.filter((f) => f.rt === rt && f.rw === rw);
    }

    const familyIds = new Set(families.map((f) => f.id));
    const citizens = sourceCitizens.filter((c) => familyIds.has(c.family_id));

    // Prepare rows with: 1. Nomor Urut, 2. Nomor Rumah, 3. Nomor Urut KK, full gender Laki-laki / Perempuan
    const rows = prepareSpreadsheetRows(citizens, families);

    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const csvContent = generateCsvIndonesia(rows);
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="Data_Penduduk_Desa_Karanghaur_${timestamp}.csv"`,
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    // Default: Native .xlsx
    const formattedData = rows.map((r) => {
      const item: Record<string, any> = {};
      SPREADSHEET_COLUMNS.forEach((col) => {
        item[col.label] = (r as any)[col.key] ?? '';
      });
      return item;
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // Auto column widths
    const colWidths = SPREADSHEET_COLUMNS.map((col) => {
      let maxLen = col.label.length;
      rows.forEach((r) => {
        const val = String((r as any)[col.key] || '');
        if (val.length > maxLen) maxLen = val.length;
      });
      return { wch: Math.min(Math.max(maxLen + 3, 10), 45) };
    });
    worksheet['!cols'] = colWidths;

    // Explicit text format for NIK, No KK, Nomor Rumah
    const colIndexMap = new Map<string, number>();
    SPREADSHEET_COLUMNS.forEach((col, idx) => colIndexMap.set(col.key, idx));

    const textKeys = ['no_rumah', 'no_kk', 'nik', 'rt', 'rw'];
    const textColIndices = textKeys
      .map((k) => colIndexMap.get(k))
      .filter((idx): idx is number => idx !== undefined);

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      for (const c of textColIndices) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: R, c })];
        if (cell) {
          cell.t = 's';
          cell.z = '@';
        }
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Kependudukan');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Data_Penduduk_Desa_Karanghaur_${timestamp}.xlsx"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
