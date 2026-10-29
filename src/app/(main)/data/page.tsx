'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import {
  prepareSpreadsheetRows,
  exportToExcel,
  generateCsvIndonesia,
  downloadFile,
  parseSpreadsheetFile,
  generateSampleTemplateWorkbook,
} from '@/lib/spreadsheet';
import { Family, Citizen, PeneranganType, MckType, BansosType, MaritalStatus } from '@/lib/types';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Info,
  Database,
  RefreshCw,
  Cloud,
  Copy,
  ExternalLink,
  GitBranch,
} from 'lucide-react';

export default function ExportImportDataPage() {
  const {
    currentProfile,
    visibleFamilies,
    visibleCitizens,
    families,
    citizens,
    notes,
    importBulkData,
    syncToSupabase,
    fetchFromSupabase,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'cloud'>('export');

  // --- SUPABASE & GIT CLOUD STATE ---
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // --- EXPORT STATE ---
  const [scopeType, setScopeType] = useState<'all' | 'dusun' | 'rw' | 'rt'>('all');
  const [selectedDusun, setSelectedDusun] = useState<string>('Dusun I');
  const [selectedRw, setSelectedRw] = useState<string>('001');
  const [selectedRt, setSelectedRt] = useState<string>('001');

  // --- IMPORT STATE ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importedRows, setImportedRows] = useState<Record<string, string>[]>([]);
  const [importFileName, setImportFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const isAdmin = currentProfile?.role === 'admin';

  // Base dataset accessible by active user
  const baseFamilies = isAdmin ? families : visibleFamilies;
  const baseCitizens = isAdmin ? citizens : visibleCitizens;

  // Filtered dataset for export based on selected scope
  const { exportFamilies, exportCitizens, scopeDescription } = useMemo(() => {
    let fList = baseFamilies;

    if (scopeType === 'dusun') {
      fList = baseFamilies.filter((f) => f.dusun === selectedDusun);
    } else if (scopeType === 'rw') {
      fList = baseFamilies.filter((f) => f.rw === selectedRw);
    } else if (scopeType === 'rt') {
      fList = baseFamilies.filter((f) => f.rt === selectedRt && f.rw === selectedRw);
    }

    const familyIds = new Set(fList.map((f) => f.id));
    const cList = baseCitizens.filter((c) => familyIds.has(c.family_id));

    let desc = 'Seluruh Desa Karanghaur (Total)';
    if (scopeType === 'dusun') desc = `Wilayah ${selectedDusun}`;
    else if (scopeType === 'rw') desc = `Wilayah RW ${selectedRw}`;
    else if (scopeType === 'rt') desc = `Wilayah RT ${selectedRt} / RW ${selectedRw}`;

    return { exportFamilies: fList, exportCitizens: cList, scopeDescription: desc };
  }, [baseFamilies, baseCitizens, scopeType, selectedDusun, selectedRw, selectedRt]);

  const handleExportExcel = () => {
    const rows = prepareSpreadsheetRows(exportCitizens, exportFamilies);
    const timeStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `Data_Penduduk_Karanghaur_Terbaru_NoUrut_NoRumah_NoKK_${timeStr}.xlsx`;
    exportToExcel(rows, fileName);
  };

  const handleExportCsv = () => {
    const rows = prepareSpreadsheetRows(exportCitizens, exportFamilies);
    const csvContent = generateCsvIndonesia(rows);
    const timeStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = `Data_Penduduk_Karanghaur_Terbaru_NoUrut_NoRumah_NoKK_${timeStr}.csv`;
    downloadFile(csvContent, fileName, 'text/csv;charset=utf-8;');
  };

  const handleExportJson = () => {
    const backupData = {
      village: 'Desa Karanghaur',
      export_date: new Date().toISOString(),
      scope: scopeDescription,
      exported_by: currentProfile?.full_name,
      families_count: exportFamilies.length,
      citizens_count: exportCitizens.length,
      families: exportFamilies,
      citizens: exportCitizens,
    };
    const jsonContent = JSON.stringify(backupData, null, 2);
    const timestamp = new Date().toISOString().slice(0, 10);
    const safeScope = scopeDescription.replace(/[^a-zA-Z0-9]/g, '_');
    const fileName = `Backup_Database_Karanghaur_${safeScope}_${timestamp}.json`;
    downloadFile(jsonContent, fileName, 'application/json;charset=utf-8;');
  };

  const handleDownloadTemplate = () => {
    generateSampleTemplateWorkbook();
  };

  const handleSyncSupabase = async () => {
    setIsSyncing(true);
    setCloudSyncStatus(null);
    const res = await syncToSupabase();
    setIsSyncing(false);
    setCloudSyncStatus({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
  };

  const handleFetchSupabase = async () => {
    setIsFetching(true);
    setCloudSyncStatus(null);
    const res = await fetchFromSupabase();
    setIsFetching(false);
    setCloudSyncStatus({
      type: res.success ? 'success' : 'error',
      message: res.message,
    });
  };

  const handleCopySql = async () => {
    try {
      const res = await fetch('/api/sql');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      alert('Gagal menyalin SQL schema');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportSuccess(null);
    setImportError(null);

    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setIsProcessing(true);

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsedJson = JSON.parse(text);
        if (Array.isArray(parsedJson.families) && Array.isArray(parsedJson.citizens)) {
          await processJsonImport(parsedJson.families, parsedJson.citizens);
        } else {
          setImportError('Format berkas JSON tidak sesuai struktur backup database SIP Karanghaur.');
        }
      } else {
        const rows = await parseSpreadsheetFile(file);
        if (rows.length === 0) {
          setImportError('Berkas kosong atau tidak memiliki baris data.');
          setIsProcessing(false);
          return;
        }
        setImportedRows(rows);
      }
    } catch {
      setImportError('Gagal membaca berkas: Pastikan file .xlsx, .xls, atau .csv Anda valid.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processJsonImport = async (incomingFamilies: Family[], incomingCitizens: Citizen[]) => {
    setIsProcessing(true);
    const res = await importBulkData(incomingFamilies, incomingCitizens);
    setIsProcessing(false);

    if (res.success) {
      setImportSuccess(
        `Berhasil mengimpor ${res.familiesCount} Kartu Keluarga dan ${res.citizensCount} data Warga ke database & Supabase Cloud!`
      );
      setImportedRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setImportError(res.error || 'Gagal menyimpan data import');
    }
  };

  const handleConfirmCsvImport = async () => {
    if (importedRows.length === 0) return;

    setIsProcessing(true);
    setImportError(null);

    try {
      const familyMap = new Map<string, Family>();
      const citizenList: Citizen[] = [];

      importedRows.forEach((row, idx) => {
        const noKk = (row.no_kk || row.no_kartu_keluarga || row['no kk'] || '').replace(/\D/g, '');
        const kepalaKeluarga = (row.kepala_keluarga || row.nama_kepala_keluarga || 'KEPALA KELUARGA').toUpperCase();
        const nik = (row.nik || row.no_ktp || '').replace(/\D/g, '');
        const nama = (row.nama_lengkap || row.nama || `WARGA ${idx + 1}`).toUpperCase();

        if (!noKk || noKk.length < 10) return;

        if (!familyMap.has(noKk)) {
          familyMap.set(noKk, {
            id: 'fam-import-' + noKk,
            no_kk: noKk,
            kepala_keluarga: kepalaKeluarga,
            alamat: row.alamat_lengkap || row.alamat || 'Jl. Desa Karanghaur',
            no_rumah: row.nomor_rumah || row.no_rumah || '01',
            dusun: row.dusun || 'Dusun I',
            rw: (row.rw || '001').padStart(3, '0'),
            rt: (row.rt || '001').padStart(3, '0'),
            status_barcode: (row.status_barcode || '').toLowerCase().includes('ya') || true,
            status_update: true,
            penerangan: (row.penerangan_listrik || row.penerangan || 'meteran') as PeneranganType,
            fasilitas_mck: (row.fasilitas_mck || 'sendiri') as MckType,
            bantuan_sosial: (row.bantuan_sosial || 'none') as BansosType,
            created_at: new Date().toISOString(),
          });
        }

        if (nik && nik.length >= 10) {
          citizenList.push({
            id: 'cit-import-' + nik,
            family_id: 'fam-import-' + noKk,
            nik: nik,
            nama_lengkap: nama,
            hubungan_keluarga: row.hubungan_keluarga || 'Anggota Keluarga',
            jenis_kelamin: (row.jenis_kelamin || row.jk || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
            tempat_lahir: row.tempat_lahir || 'Bekasi',
            tanggal_lahir: row.tanggal_lahir || '2000-01-01',
            golongan_darah: row.golongan_darah || 'O',
            status_perkawinan: (row.status_perkawinan || 'Kawin') as MaritalStatus,
            tanggal_perkawinan: row.tanggal_perkawinan || '-',
            nama_ayah: (row.nama_ayah || '-').toUpperCase(),
            nama_ibu: (row.nama_ibu || '-').toUpperCase(),
            agama: row.agama || 'Islam',
            pendidikan_terakhir: row.pendidikan_terakhir || 'SMA / Sederajat',
            pekerjaan: row.pekerjaan || 'Wiraswasta',
            bpjs_kesehatan: 'kis',
            disabilitas: 'tidak',
            status_tki: false,
            akta_kelahiran: true,
            akta_nikah: true,
            created_at: new Date().toISOString(),
          });
        }
      });

      const incomingFamilies = Array.from(familyMap.values());

      if (incomingFamilies.length === 0 && citizenList.length === 0) {
        setImportError('Tidak ditemukan baris data No KK atau NIK yang valid pada berkas spreadsheet.');
        setIsProcessing(false);
        return;
      }

      const res = await importBulkData(incomingFamilies, citizenList);
      setIsProcessing(false);

      if (res.success) {
        setImportSuccess(
          `Sukses! Berhasil mengimpor ${incomingFamilies.length} KK dan ${citizenList.length} Jiwa Warga ke Database & Supabase Cloud!`
        );
        setImportedRows([]);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setImportError(res.error || 'Gagal menyimpan data import.');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setImportError('Terjadi kesalahan saat memproses data: ' + (err?.message || 'Error'));
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ===================================================================== */}
      {/* FIXED TOP HEAD BAR (Navigasi & Tab Menu - Tidak ikut scrolling)       */}
      {/* ===================================================================== */}
      <div className="flex-shrink-0 px-3.5 sm:px-5 pt-2.5 pb-2.5 bg-slate-50 border-b border-slate-200/80 z-10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-sm transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Beranda
            </Link>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                Export, Import & Supabase Cloud
              </h1>
            </div>
          </div>

          <span className="inline-flex items-center text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex-shrink-0">
            <Database className="w-3 h-3 mr-1" />
            Supabase DB
          </span>
        </div>

        {/* Navigation Tabs: Export vs Import vs Supabase/Git */}
        <div className="grid grid-cols-3 p-1 bg-slate-200/80 rounded-xl text-xs font-bold gap-1">
          <button
            onClick={() => setActiveTab('export')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'export'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'import'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          <button
            onClick={() => setActiveTab('cloud')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'cloud'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Supabase & Git</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SCROLLABLE BODY CONTENT (Hanya isi halaman yang ikut scrolling)       */}
      {/* ===================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 sm:px-5 py-3 pb-20">
        {/* TAB 1: EXPORT DATABASE SPREADSHEET */}
        {activeTab === 'export' && (
          <div className="space-y-3.5">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-100">
                <Filter className="w-4 h-4 text-sky-600" />
                <h2 className="text-xs font-bold text-slate-800">
                  Pilih Cakupan Wilayah Export
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {isAdmin && (
                  <button
                    onClick={() => setScopeType('all')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      scopeType === 'all'
                        ? 'bg-sky-500 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Total Desa (Semua)
                  </button>
                )}

                {(isAdmin || currentProfile?.role === 'kadus') && (
                  <button
                    onClick={() => setScopeType('dusun')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      scopeType === 'dusun'
                        ? 'bg-sky-500 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Berdasarkan Dusun
                  </button>
                )}

                {(isAdmin || currentProfile?.role === 'kadus' || currentProfile?.role === 'rw') && (
                  <button
                    onClick={() => setScopeType('rw')}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      scopeType === 'rw'
                        ? 'bg-sky-500 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Berdasarkan RW
                  </button>
                )}

                <button
                  onClick={() => setScopeType('rt')}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    scopeType === 'rt'
                      ? 'bg-sky-500 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Berdasarkan RT
                </button>
              </div>

              {scopeType === 'dusun' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Wilayah Dusun:
                  </label>
                  <select
                    value={selectedDusun}
                    onChange={(e) => setSelectedDusun(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none font-semibold"
                  >
                    <option value="Dusun I">Dusun I (RW 001, RW 002)</option>
                    <option value="Dusun II">Dusun II (RW 003)</option>
                    <option value="Dusun III">Dusun III (RW 005)</option>
                  </select>
                </div>
              )}

              {scopeType === 'rw' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pilih Wilayah RW:
                  </label>
                  <select
                    value={selectedRw}
                    onChange={(e) => setSelectedRw(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none font-semibold"
                  >
                    <option value="001">RW 001 (Dusun I)</option>
                    <option value="002">RW 002 (Dusun I)</option>
                    <option value="003">RW 003 (Dusun II)</option>
                    <option value="005">RW 005 (Dusun III)</option>
                  </select>
                </div>
              )}

              {scopeType === 'rt' && (
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pilih RW:</label>
                    <select
                      value={selectedRw}
                      onChange={(e) => setSelectedRw(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none font-semibold"
                    >
                      <option value="001">RW 001</option>
                      <option value="002">RW 002</option>
                      <option value="003">RW 003</option>
                      <option value="005">RW 005</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pilih RT:</label>
                    <select
                      value={selectedRt}
                      onChange={(e) => setSelectedRt(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none font-semibold"
                    >
                      <option value="001">RT 001</option>
                      <option value="002">RT 002</option>
                      <option value="003">RT 003</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-100 rounded-xl p-4 border border-slate-200/90 space-y-2.5">
              <span className="text-xs font-bold text-slate-800 block">
                Ringkasan Data Real-time Siap Export
              </span>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">TOTAL KK</span>
                  <span className="text-lg font-extrabold text-sky-600">
                    {exportFamilies.length}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block">TOTAL JIWA</span>
                  <span className="text-lg font-extrabold text-sky-600">
                    {exportCitizens.length}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                Cakupan: <strong>{scopeDescription}</strong>
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-300/80 rounded-xl p-3 text-[11px] text-emerald-950 space-y-1.5 shadow-sm">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Format Kolom Terverifikasi:</span>
              </div>
              <div className="bg-white/80 rounded-lg p-2 border border-emerald-200/80 text-[10px] space-y-1 font-mono text-slate-800">
                <div className="flex items-center text-emerald-800 font-bold">
                  <span>Kolom 1: Nomor Urut</span>
                  <span className="mx-1 text-slate-300">•</span>
                  <span>Kolom 2: Nomor Rumah</span>
                  <span className="mx-1 text-slate-300">•</span>
                  <span>Kolom 3: Nomor Urut KK</span>
                </div>
                <p className="text-[10px] text-slate-600 font-sans">
                  • <strong>Jenis Kelamin:</strong> Tertulis lengkap <em>Laki-laki</em> dan <em>Perempuan</em>
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleExportExcel}
                disabled={exportCitizens.length === 0}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex flex-col items-center justify-center space-y-1 disabled:opacity-50"
              >
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
                  <span className="text-sm">Unduh File Excel Asli (.xlsx)</span>
                  <span className="bg-emerald-800 text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase tracking-wide">
                    Rapi Per Kolom
                  </span>
                </div>
                <span className="text-[10px] text-emerald-100/90 font-normal">
                  1. No Urut | 2. No Rumah | 3. No Urut KK | NIK Teks Utuh
                </span>
              </button>

              <a
                href={`/api/export?format=xlsx&scope=${scopeType}&dusun=${encodeURIComponent(selectedDusun)}&rw=${selectedRw}&rt=${selectedRt}`}
                download
                className="w-full py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Unduh Langsung dari Server Supabase (.xlsx)</span>
              </a>

              <button
                onClick={handleExportCsv}
                disabled={exportCitizens.length === 0}
                className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-300 transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh Format CSV Excel Indonesia (.csv)</span>
              </button>

              <button
                onClick={handleExportJson}
                disabled={exportCitizens.length === 0}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Unduh Backup Database (.json)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT DATABASE SPREADSHEET */}
        {activeTab === 'import' && (
          <div className="space-y-3.5">
            {!isAdmin && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Fitur Import Database hanya dapat dijalankan oleh <strong>Admin Desa</strong> untuk menjaga keutuhan data kependudukan.
                </span>
              </div>
            )}

            {importSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{importSuccess}</span>
              </div>
            )}

            {importError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  1. Unduh Template Standar
                </span>
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition-colors border border-emerald-200"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Unduh Template Excel (.xlsx)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Gunakan format kolom template ini saat menginput data warga di Microsoft Excel atau Google Sheets agar proses impor berjalan sempurna.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                2. Unggah File Spreadsheet (.xlsx / .csv / .json)
              </span>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-sky-500 bg-blue-50/40 rounded-xl p-6 text-center cursor-pointer transition-all group"
              >
                <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">
                  {importFileName ? importFileName : 'Klik atau Pilih Berkas Spreadsheet'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Mendukung file .xlsx (Excel Asli), .csv (Spreadsheet), atau .json (Backup)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv,application/json,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {importedRows.length > 0 && (
              <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      3. Pratinjau Data ({importedRows.length} Baris Terbaca)
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Periksa sampel data sebelum disimpan ke database & Supabase
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    Siap Diimpor
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-100 rounded-lg p-2 bg-slate-50">
                  {importedRows.slice(0, 5).map((row, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-white rounded border border-slate-200 text-[11px] flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-800">
                          {row.nama_lengkap || row.nama || `Warga #${idx + 1}`}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1.5 font-mono">
                          NIK: {row.nik || '-'} • KK: {row.no_kk || '-'}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold flex-shrink-0">
                        RT {row.rt || '001'}/RW {row.rw || '001'}
                      </span>
                    </div>
                  ))}
                  {importedRows.length > 5 && (
                    <p className="text-[10px] text-slate-400 text-center py-1">
                      ... dan {importedRows.length - 5} baris lainnya
                    </p>
                  )}
                </div>

                <button
                  onClick={handleConfirmCsvImport}
                  disabled={isProcessing || !isAdmin}
                  className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan ke Database & Supabase...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Konfirmasi & Simpan ke Database</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SUPABASE CLOUD & GITHUB REPOSITORY */}
        {activeTab === 'cloud' && (
          <div className="space-y-3.5">
            {cloudSyncStatus && (
              <div
                className={`p-3 rounded-xl border flex items-start space-x-2 text-xs ${
                  cloudSyncStatus.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {cloudSyncStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-bold block">
                    {cloudSyncStatus.type === 'success' ? 'Sukses!' : 'Perhatian:'}
                  </span>
                  <span>{cloudSyncStatus.message}</span>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-800">
                      Supabase PostgreSQL Cloud
                    </h2>
                    <p className="text-[10px] text-slate-400">
                      Database cloud terpusat Desa Karanghaur
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Terkoneksi
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono space-y-1">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-400 flex-shrink-0">Project URL:</span>
                  <span className="text-slate-700 break-all text-right">
                    https://qwhcsrhupveubtiiuiln.supabase.co
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total KK Aktif:</span>
                  <span className="text-slate-900 font-bold">{families.length} KK</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Warga Aktif:</span>
                  <span className="text-slate-900 font-bold">{citizens.length} Jiwa</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Catatan:</span>
                  <span className="text-slate-900 font-bold">{notes.length} Laporan</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleSyncSupabase}
                  disabled={isSyncing || !isAdmin}
                  className="py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Upload...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload ke Cloud</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleFetchSupabase}
                  disabled={isFetching}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isFetching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Unduh...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Tarik dari Cloud</span>
                    </>
                  )}
                </button>
              </div>
              {!isAdmin && (
                <p className="text-[10px] text-slate-400 text-center">
                  *Hanya akun Administrator Desa yang memiliki wewenang upload data ke database cloud.
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sky-600">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Setup Tabel & RLS (Supabase SQL Editor)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Jalankan skrip skema di Supabase Console jika tabel belum dibuat
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600">
                <p className="text-[11px] leading-relaxed">
                  Supabase membutuhkan tabel <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-sky-600">families</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-sky-600">citizens</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-sky-600">notes</code>, dan <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-sky-600">profiles</code>.
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={handleCopySql}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center space-x-1.5"
                  >
                    {copiedSql ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>SQL Berhasil Disalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Schema & Seed SQL Lengkap</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://supabase.com/dashboard/project/qwhcsrhupveubtiiuiln/sql"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs border border-blue-200 transition-all flex items-center justify-center space-x-1.5"
                  >
                    <span>Buka Supabase SQL Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">
                      GitHub Source Repository
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Version control & continuous deployment
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  main branch
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-mono space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Repository:</span>
                  <span className="text-slate-800 font-bold">syahid-app/Data_Penduduk</span>
                </div>
              </div>

              <a
                href="https://github.com/syahid-app/Data_Penduduk"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition-all flex items-center justify-center space-x-1.5"
              >
                <span>Buka Repository GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-amber-700" />
                  Petunjuk Push ke GitHub:
                </span>
                <pre className="p-1.5 bg-white/80 rounded border border-amber-300 font-mono text-[10px] overflow-x-auto text-slate-800 select-all">
                  git push -u origin main
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
