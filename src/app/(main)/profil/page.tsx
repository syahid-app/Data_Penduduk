'use client';

import React from 'react';
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
  Database,
  Building,
  Info,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';

export default function ProfilPage() {
  const router = useRouter();
  const { currentProfile, allProfiles, switchProfile, logout, isOnline } = useApp();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'kadus':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rw':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rt':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center font-bold text-xl text-white shadow-inner flex-shrink-0">
            {currentProfile?.role === 'admin' ? (
              <Shield className="w-8 h-8 text-amber-200" />
            ) : (
              <UserCheck className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="min-w-0">
            <span className="inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-xs border border-white/20 mb-1">
              PERAN AKTIF: {currentProfile?.role?.toUpperCase()}
            </span>
            <h1 className="text-base font-extrabold text-white truncate">
              {currentProfile?.full_name}
            </h1>
            <p className="text-xs text-orange-100 flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-200 flex-shrink-0" />
              <span>
                {currentProfile?.role === 'admin' && 'Seluruh Desa Karanghaur'}
                {currentProfile?.role === 'kadus' && currentProfile.assigned_dusun}
                {currentProfile?.role === 'rw' && `RW ${currentProfile.assigned_rw} - ${currentProfile.assigned_dusun}`}
                {currentProfile?.role === 'rt' && `RT ${currentProfile.assigned_rt} / RW ${currentProfile.assigned_rw} (${currentProfile.assigned_dusun})`}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* RBAC Rights & Matrix */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-100">
          <Shield className="w-4 h-4 text-orange-600" />
          <h2 className="text-xs font-bold text-slate-800">
            Matriks Hak Akses & Batas Wilayah
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-600 font-medium">Batas Wilayah Data:</span>
            <span className="font-bold text-slate-900">
              {currentProfile?.role === 'admin' && 'Semua Dusun (I, II, III)'}
              {currentProfile?.role === 'kadus' && `Hanya ${currentProfile.assigned_dusun}`}
              {currentProfile?.role === 'rw' && `Hanya RW ${currentProfile.assigned_rw}`}
              {currentProfile?.role === 'rt' && `Hanya RT ${currentProfile.assigned_rt} / RW ${currentProfile.assigned_rw}`}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-600 font-medium">Tambah / Edit Kartu Keluarga:</span>
            {currentProfile?.role === 'admin' ? (
              <span className="inline-flex items-center text-emerald-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Diizinkan (Full CRUD)
              </span>
            ) : (
              <span className="inline-flex items-center text-slate-400 font-bold">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Terkunci (Read-Only)
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-600 font-medium">Kirim Catatan & Usulan Perubahan:</span>
            <span className="inline-flex items-center text-emerald-600 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Diizinkan (Semua Petugas)
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-slate-600 font-medium">Validasi / Verifikasi Catatan:</span>
            {currentProfile?.role === 'admin' ? (
              <span className="inline-flex items-center text-purple-600 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Otoritas Admin Desa
              </span>
            ) : (
              <span className="inline-flex items-center text-slate-400 font-bold">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Menunggu Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Manajemen Data: Export & Import Spreadsheet */}
      <Link
        href="/data"
        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-orange-400 hover:shadow-sm transition-all flex items-center justify-between group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 group-hover:text-orange-600">
              Export & Import Database (Spreadsheet)
            </h2>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Unduh CSV / JSON per RT, RW, Dusun, atau Total & Unggah data
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>

      {/* Switch Demo Role Quick List */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-1.5">
            <RefreshCw className="w-4 h-4 text-orange-600" />
            <h2 className="text-xs font-bold text-slate-800">
              Ganti Akun Demo (Uji RBAC Cepat)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">1-Klik</span>
        </div>

        <div className="space-y-1.5">
          {allProfiles.map((p) => {
            const isSelected = currentProfile?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  switchProfile(p.id);
                  router.push('/dashboard');
                }}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/20'
                    : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-slate-800 truncate">
                      {p.full_name}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${getRoleBadgeStyle(
                        p.role
                      )}`}
                    >
                      {p.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {p.role === 'admin' && 'Seluruh Desa (Akses Penuh)'}
                    {p.role === 'kadus' && `Wilayah tugas: ${p.assigned_dusun}`}
                    {p.role === 'rw' && `Wilayah tugas: RW ${p.assigned_rw}`}
                    {p.role === 'rt' && `Wilayah tugas: RT ${p.assigned_rt} / RW ${p.assigned_rw}`}
                  </p>
                </div>

                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* System & PWA Status Card */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center space-x-1.5 pb-2 border-b border-slate-100">
          <Smartphone className="w-4 h-4 text-orange-600" />
          <h2 className="text-xs font-bold text-slate-800">
            Status Sistem Progressive Web App
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">PWA Install</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Siap (A2HS)
            </span>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Status Jaringan</span>
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
              {isOnline ? 'Online Sync' : 'Offline Storage'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 pt-1">
          SIP Karanghaur v1.0 • Standar PWA Standalone Shopee Seller Experience
        </p>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full py-3 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 font-bold text-xs shadow-xs transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5"
      >
        <LogOut className="w-4 h-4" />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  );
}
