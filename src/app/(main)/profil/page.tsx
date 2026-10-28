'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  UserCheck,
  Shield,
  MapPin,
  CheckCircle2,
  XCircle,
  LogOut,
  RefreshCw,
  Smartphone,
  ChevronRight,
  FileSpreadsheet,
  Cloud,
  Building2,
  Settings,
  Users,
  Phone,
  Mail,
  Home,
} from 'lucide-react';

export default function ProfilPage() {
  const router = useRouter();
  const {
    currentProfile,
    allProfiles,
    villageConfig,
    families,
    stats,
    logout,
    isOnline,
    isSupabaseConnected,
    lastSyncedAt,
    refreshFromSupabase,
    isSyncingWithSupabase,
  } = useApp();

  const isAdmin = currentProfile?.role === 'admin';

  // Compute unique Dusun, RW, RT across the village
  const villageStructure = useMemo(() => {
    const dusunSet = new Set<string>();
    const rwSet = new Set<string>();
    const rtSet = new Set<string>();

    families.forEach((f) => {
      if (f.dusun) dusunSet.add(f.dusun);
      if (f.rw) rwSet.add(f.rw);
      if (f.rt && f.rw) rtSet.add(`${f.rt}/${f.rw}`);
    });
    allProfiles.forEach((p) => {
      if (p.assigned_dusun) dusunSet.add(p.assigned_dusun);
      if (p.assigned_rw) rwSet.add(p.assigned_rw);
      if (p.assigned_rt && p.assigned_rw)
        rtSet.add(`${p.assigned_rt}/${p.assigned_rw}`);
    });

    return {
      dusunCount: dusunSet.size,
      rwCount: rwSet.size,
      rtCount: rtSet.size,
      kadusProfiles: allProfiles.filter((p) => p.role === 'kadus'),
      rwProfiles: allProfiles.filter((p) => p.role === 'rw'),
      rtProfiles: allProfiles.filter((p) => p.role === 'rt'),
    };
  }, [families, allProfiles]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ===================================================================== */}
      {/* FIXED TOP HEAD BAR (Kartu Identitas Profil & Desa - Biru Muda)        */}
      {/* ===================================================================== */}
      <div className="flex-shrink-0 px-3.5 sm:px-5 pt-2.5 pb-2 bg-slate-50 border-b border-slate-200/80 z-10">
        <div className="bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 rounded-xl p-3 text-white shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-white/25 backdrop-blur-sm border border-white/40 flex items-center justify-center font-bold text-lg text-white flex-shrink-0">
              {isAdmin ? (
                <Building2 className="w-6 h-6 text-white" />
              ) : (
                <UserCheck className="w-6 h-6 text-white" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white/25 text-white border border-white/30 mb-0.5 uppercase">
                {isAdmin
                  ? `PROFIL PEMERINTAH ${villageConfig.nama_desa}`
                  : `PERAN AKTIF: ${
                      currentProfile?.role === 'kadus'
                        ? 'KEPALA DUSUN'
                        : currentProfile?.role
                    }`}
              </span>
              <h1 className="text-sm font-extrabold text-white leading-snug break-words">
                {currentProfile?.full_name}
              </h1>
              <p className="text-[11px] text-white/95 flex items-start mt-0.5 leading-snug">
                <MapPin className="w-3 h-3 mr-1 text-amber-200 flex-shrink-0 mt-0.5" />
                <span className="break-words">
                  {isAdmin &&
                    `Kepala Desa: ${villageConfig.kepala_desa} • Seluruh Wilayah`}
                  {currentProfile?.role === 'kadus' &&
                    `${currentProfile.assigned_dusun} • ${villageConfig.nama_desa}`}
                  {currentProfile?.role === 'rw' &&
                    `RW ${currentProfile.assigned_rw} (${currentProfile.assigned_dusun})`}
                  {currentProfile?.role === 'rt' &&
                    `RT ${currentProfile.assigned_rt} / RW ${currentProfile.assigned_rw} (${currentProfile.assigned_dusun})`}
                </span>
              </p>
            </div>
          </div>

          {isAdmin && (
            <Link
              href="/pengaturan"
              className="px-2.5 py-1.5 rounded-xl bg-white/25 hover:bg-white/35 text-white text-[11px] font-bold border border-white/30 inline-flex items-center gap-1 flex-shrink-0"
              title="Buka Pengaturan Desa & Akun PIN"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SCROLLABLE PROFILE CONTENT (Hanya isi halaman yang ikut scrolling)    */}
      {/* ===================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 sm:px-5 py-3 pb-20 space-y-3.5">
        {/* 1. PROFIL RESMI PEMERINTAH DESA (Utama untuk Admin & Informasi Desa) */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-sky-600" />
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                Profil & Identitas Resmi Desa
              </h2>
            </div>
            {isAdmin && (
              <Link
                href="/pengaturan"
                className="text-[10px] font-bold text-sky-600 hover:underline inline-flex items-center gap-0.5"
              >
                <Settings className="w-3 h-3" />
                <span>Ubah Data Desa</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
              <span className="text-[10px] font-bold text-sky-700 uppercase block">
                Nama Pemerintahan Desa
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5 break-words">
                {villageConfig.nama_desa}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Kec. {villageConfig.kecamatan}, Kab. {villageConfig.kabupaten}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
              <span className="text-[10px] font-bold text-sky-700 uppercase block">
                Kepala Desa Menjabat
              </span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5 break-words">
                {villageConfig.kepala_desa}
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Provinsi {villageConfig.provinsi} ({villageConfig.kode_pos})
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Alamat Kantor Kepala Desa:
              </span>
              <p className="font-semibold text-slate-800 break-words mt-0.5">
                {villageConfig.alamat_desa}
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-3 pt-1 border-t border-slate-200/70 text-[11px] text-slate-600">
              {villageConfig.telepon_desa && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-sky-600" />
                  <span>{villageConfig.telepon_desa}</span>
                </span>
              )}
              {villageConfig.email_desa && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="w-3 h-3 text-sky-600" />
                  <span>{villageConfig.email_desa}</span>
                </span>
              )}
            </div>
          </div>

          {/* Rekapitulasi Kewilayahan & Kependudukan Desa */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center pt-1">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">
                Dusun
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                {villageStructure.dusunCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">
                RW
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                {villageStructure.rwCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">
                RT
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                {villageStructure.rtCount}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-sky-50 border border-sky-200">
              <span className="text-[10px] text-sky-700 block font-semibold">
                Rumah
              </span>
              <span className="text-xs font-extrabold text-sky-900">
                {stats.totalRumah}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-sky-50 border border-sky-200">
              <span className="text-[10px] text-sky-700 block font-semibold">
                Total KK
              </span>
              <span className="text-xs font-extrabold text-sky-900">
                {stats.totalKK}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 block font-semibold">
                Penduduk
              </span>
              <span className="text-xs font-extrabold text-emerald-900">
                {stats.totalJiwa}
              </span>
            </div>
          </div>
        </div>

        {/* 2. PINTASAN MENU PENGATURAN ADMIN & MANAJEMEN DATA */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Link
              href="/pengaturan"
              className="bg-white rounded-xl p-3.5 border border-sky-200 shadow-sm hover:border-sky-400 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 group-hover:text-sky-600">
                    Pengaturan Akun, PIN & Profil Desa
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Tambah/Edit/Hapus Akun RT, RW, Dusun, PIN Login & Nama Desa
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 flex-shrink-0" />
            </Link>

            <Link
              href="/data"
              className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm hover:border-sky-400 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 group-hover:text-sky-600">
                    Export, Import & Sinkronisasi Cloud
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Unduh Excel (.xlsx) / CSV per Wilayah & Sinkron Supabase
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 flex-shrink-0" />
            </Link>
          </div>
        )}

        {!isAdmin && (
          <Link
            href="/data"
            className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm hover:border-sky-400 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900 group-hover:text-sky-600">
                  Export Data Wilayah ke Excel (.xlsx) / CSV
                </h2>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Unduh rekapitulasi KK & Warga di wilayah tugas Anda
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 flex-shrink-0" />
          </Link>
        )}

        {/* 3. DAFTAR APARAT / PEJABAT WILAYAH DESA */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Users className="w-4 h-4 text-sky-600" />
              <h2 className="text-xs font-bold text-slate-800">
                Struktur Perangkat & Ketua Wilayah ({allProfiles.length} Akun)
              </h2>
            </div>
            {isAdmin && (
              <Link
                href="/pengaturan"
                className="text-[10px] font-bold text-sky-600 hover:underline"
              >
                Kelola Akun & PIN
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allProfiles.map((p) => (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 break-words">
                    {p.full_name}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {p.role === 'admin' && 'Administrator Desa'}
                    {p.role === 'kadus' && `Kepala ${p.assigned_dusun}`}
                    {p.role === 'rw' &&
                      `Ketua RW ${p.assigned_rw} (${p.assigned_dusun})`}
                    {p.role === 'rt' &&
                      `Ketua RT ${p.assigned_rt}/RW ${p.assigned_rw} (${p.assigned_dusun})`}
                    {p.phone ? ` • ${p.phone}` : ''}
                  </p>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-white text-sky-700 border border-sky-200 uppercase flex-shrink-0">
                  {p.role === 'kadus' ? 'DUSUN' : p.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. MATRIKS HAK AKSES & STATUS CLOUD */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Smartphone className="w-4 h-4 text-sky-600" />
              <h2 className="text-xs font-bold text-slate-800">
                Hak Akses Aktif & Status Database Cloud
              </h2>
            </div>
            {isSupabaseConnected && (
              <button
                onClick={() => refreshFromSupabase()}
                disabled={isSyncingWithSupabase}
                className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 hover:underline"
              >
                <RefreshCw
                  className={`w-3 h-3 ${
                    isSyncingWithSupabase ? 'animate-spin' : ''
                  }`}
                />
                <span>Sinkron Sekarang</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">
                Tambah / Edit / Hapus KK, Warga & Pengaturan:
              </span>
              {isAdmin ? (
                <span className="inline-flex items-center text-emerald-600 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Full Akses Admin
                </span>
              ) : (
                <span className="inline-flex items-center text-slate-400 font-bold">
                  <XCircle className="w-3.5 h-3.5 mr-1" /> Read-Only Wilayah
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  Database Cloud
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center mt-0.5">
                  <Cloud className="w-3.5 h-3.5 mr-1" />
                  {isSupabaseConnected ? 'Supabase Live' : 'Lokal'}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-semibold">
                  Status Jaringan
                </span>
                <span
                  className={`text-xs font-bold flex items-center mt-0.5 ${
                    isOnline ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${
                      isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {isOnline
                    ? `Online${lastSyncedAt ? ` (${lastSyncedAt})` : ''}`
                    : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full py-3 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold text-xs shadow-sm transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun (Kunci PIN)</span>
        </button>
      </div>
    </div>
  );
}
