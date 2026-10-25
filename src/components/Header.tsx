'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  Bell,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  Shield,
  MapPin,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const { currentProfile, allProfiles, switchProfile, visibleNotes, isOnline } = useApp();
  const [showRoleModal, setShowRoleModal] = useState(false);

  const pendingNotesCount = visibleNotes.filter((n) => n.status === 'pending').length;

  const getRoleLabel = () => {
    if (!currentProfile) return 'Tamu';
    switch (currentProfile.role) {
      case 'admin':
        return 'Admin Desa';
      case 'kadus':
        return `Kepala ${currentProfile.assigned_dusun || 'Dusun'}`;
      case 'rw':
        return `Ketua RW ${currentProfile.assigned_rw || ''}`;
      case 'rt':
        return `Ketua RT ${currentProfile.assigned_rt || ''} / RW ${currentProfile.assigned_rw || ''}`;
      default:
        return 'Petugas';
    }
  };

  const getScopeDescription = () => {
    if (!currentProfile) return '';
    if (currentProfile.role === 'admin') return 'Seluruh Desa Karanghaur';
    if (currentProfile.role === 'kadus') return currentProfile.assigned_dusun || '';
    if (currentProfile.role === 'rw') return `RW ${currentProfile.assigned_rw} - ${currentProfile.assigned_dusun}`;
    return `RT ${currentProfile.assigned_rt} / RW ${currentProfile.assigned_rw}`;
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-md">
        {/* Top bar with user role & notifications */}
        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between gap-2">
            {/* Left: User Avatar & Role Badge */}
            <div className="flex items-center space-x-2.5 min-w-0">
              <button
                onClick={() => setShowRoleModal(true)}
                className="relative flex-shrink-0 group focus:outline-none"
                title="Ganti Peran Demo"
              >
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                  {currentProfile?.role === 'admin' ? (
                    <Shield className="w-5 h-5 text-amber-200" />
                  ) : (
                    <UserCheck className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[9px] font-extrabold px-1 rounded-full border border-white shadow">
                  DEMO
                </span>
              </button>

              <div className="min-w-0">
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="flex items-center space-x-1 text-left focus:outline-none group"
                >
                  <span className="font-bold text-sm leading-tight truncate text-white drop-shadow-sm group-hover:underline">
                    {currentProfile?.full_name || 'Desa Karanghaur'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80 flex-shrink-0 group-hover:translate-y-0.5 transition-transform" />
                </button>

                <div className="flex items-center space-x-1 mt-0.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/25 text-white backdrop-blur-sm border border-white/20">
                    <MapPin className="w-2.5 h-2.5 mr-1 text-amber-200" />
                    {getRoleLabel()}
                  </span>
                  <span className="text-[10px] text-orange-100 truncate">
                    • {getScopeDescription()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Online Status & Bell Notification */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              {/* Online/Offline indicator */}
              <div
                className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-100 border-rose-400/40'
                }`}
                title={isOnline ? 'Online - Sinkronisasi Aktif' : 'Offline - Mode Lokal Aktif'}
              >
                {isOnline ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span className="hidden xs:inline">Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-rose-200" />
                    <span className="hidden xs:inline">Offline</span>
                  </>
                )}
              </div>

              {/* Notification Bell */}
              <Link
                href="/catatan"
                className="relative p-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20"
                title="Catatan & Laporan Wilayah"
              >
                <Bell className="w-4 h-4" />
                {pendingNotesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                    {pendingNotesCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Shopee Seller Sub-strip banner */}
        <div className="bg-orange-700/60 backdrop-blur-xs px-4 py-1 flex items-center justify-between text-[11px] text-orange-100 border-t border-orange-500/30">
          <span className="flex items-center gap-1 truncate font-medium">
            <Sparkles className="w-3 h-3 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            SIP Karanghaur v1.0 • RBAC Berbasis Wilayah
          </span>
          <button
            onClick={() => setShowRoleModal(true)}
            className="text-amber-200 hover:text-white font-semibold underline text-[10px] flex-shrink-0 ml-2"
          >
            Ubah Peran
          </button>
        </div>
      </header>

      {/* Role Switcher Bottom Sheet / Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Ganti Akun Demo (Uji RBAC)
                </h3>
                <p className="text-xs text-slate-500">
                  Pilih peran untuk menguji pembatasan batas wilayah data
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {allProfiles.map((p) => {
                const isSelected = currentProfile?.id === p.id;
                let badgeColor = 'bg-orange-100 text-orange-800 border-orange-200';
                if (p.role === 'admin') badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                if (p.role === 'kadus') badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                if (p.role === 'rw') badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      switchProfile(p.id);
                      setShowRoleModal(false);
                      router.push('/dashboard');
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/20'
                        : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {p.full_name}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                          {p.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.role === 'admin' && 'Akses penuh seluruh data desa (CRUD)'}
                        {p.role === 'kadus' && `Wilayah tugas: ${p.assigned_dusun} (Read-only + Catatan)`}
                        {p.role === 'rw' && `Wilayah tugas: RW ${p.assigned_rw} - ${p.assigned_dusun}`}
                        {p.role === 'rt' && `Wilayah tugas: RT ${p.assigned_rt} / RW ${p.assigned_rw}`}
                      </p>
                    </div>

                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-orange-600 flex-shrink-0" />
                    ) : (
                      <span className="text-xs text-slate-400 flex-shrink-0">Pilih</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-sm transition-all"
              >
                Tutup & Terapkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
