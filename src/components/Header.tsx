'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import {
  Bell,
  WifiOff,
  UserCheck,
  ChevronDown,
  Shield,
  MapPin,
  CheckCircle2,
  Sparkles,
  Cloud,
  RefreshCw,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentProfile,
    allProfiles,
    switchProfile,
    visibleNotes,
    isOnline,
    isSupabaseConnected,
    isSyncingWithSupabase,
    lastSyncedAt,
    refreshFromSupabase,
  } = useApp();
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
        return `Ketua RT ${currentProfile.assigned_rt || ''}/RW ${currentProfile.assigned_rw || ''}`;
      default:
        return 'Petugas';
    }
  };

  const getScopeDescription = () => {
    if (!currentProfile) return '';
    if (currentProfile.role === 'admin') return 'Seluruh Desa Karanghaur';
    if (currentProfile.role === 'kadus') return currentProfile.assigned_dusun || '';
    if (currentProfile.role === 'rw') return `RW ${currentProfile.assigned_rw} • ${currentProfile.assigned_dusun}`;
    return `${currentProfile.assigned_dusun || 'Dusun I'}`;
  };

  return (
    <>
      <header className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white shadow-sm select-none">
        {/* Top bar with user role & notifications */}
        <div className="px-3 sm:px-5 pt-2.5 pb-2">
          <div className="flex items-start justify-between gap-2">
            {/* Left: User Avatar & Role Badge (Full readable text without cutoff) */}
            <div className="flex items-start space-x-2.5 min-w-0 flex-1">
              <button
                onClick={() => setShowRoleModal(true)}
                className="relative flex-shrink-0 group focus:outline-none mt-0.5"
                title="Ganti Peran Demo"
              >
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                  {currentProfile?.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-amber-200" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[8px] font-extrabold px-1 rounded-full border border-white shadow">
                  ROLE
                </span>
              </button>

              <div className="min-w-0 flex-1">
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="flex items-center gap-1 text-left focus:outline-none group w-full"
                >
                  <span className="font-bold text-xs sm:text-sm leading-snug break-words text-white drop-shadow-sm group-hover:underline">
                    {currentProfile?.full_name || 'Desa Karanghaur'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/80 flex-shrink-0 group-hover:translate-y-0.5 transition-transform" />
                </button>

                <div className="flex items-center flex-wrap gap-1 mt-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/25 text-white border border-white/20">
                    <MapPin className="w-2.5 h-2.5 mr-0.5 text-amber-200 flex-shrink-0" />
                    <span>{getRoleLabel()}</span>
                  </span>
                  <span className="text-[10px] text-orange-50 font-medium leading-tight">
                    • {getScopeDescription()}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Supabase Sync, Online Status & Bell Notification */}
            <div className="flex items-center space-x-1 flex-shrink-0 pt-0.5">
              {isSupabaseConnected && (
                <button
                  onClick={() => refreshFromSupabase()}
                  disabled={isSyncingWithSupabase}
                  className="flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-semibold bg-white/15 hover:bg-white/25 border border-white/25 text-white active:scale-95 transition-all"
                  title={lastSyncedAt ? `Supabase Cloud Terhubung (Sinkron: ${lastSyncedAt})` : 'Klik untuk sinkronisasi Supabase Cloud'}
                >
                  <Cloud className="w-3 h-3 text-sky-200" />
                  <RefreshCw
                    className={`w-2.5 h-2.5 ${isSyncingWithSupabase ? 'animate-spin text-amber-300' : 'text-emerald-300'}`}
                  />
                  <span className="text-[9px] font-bold">
                    {isSyncingWithSupabase ? '...' : 'Sync'}
                  </span>
                </button>
              )}

              {/* Online/Offline indicator */}
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-medium border ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-100 border-emerald-400/40'
                    : 'bg-rose-500/20 text-rose-100 border-rose-400/40'
                }`}
                title={isOnline ? 'Jaringan Online' : 'Offline - Mode Lokal'}
              >
                {isOnline ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                ) : (
                  <WifiOff className="w-3 h-3 text-rose-200" />
                )}
              </div>

              {/* Notification Bell */}
              <Link
                href="/catatan"
                className="relative p-1.5 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white border border-white/20"
                title="Catatan & Laporan Wilayah"
              >
                <Bell className="w-4 h-4" />
                {pendingNotesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {pendingNotesCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Sub-strip banner with Supabase sync time */}
        <div className="bg-orange-700/60 px-3 sm:px-5 py-1 flex items-center justify-between gap-2 text-[10px] text-orange-100 border-t border-orange-500/30">
          <span className="flex items-center gap-1 font-medium leading-tight">
            <Sparkles className="w-3 h-3 text-amber-300 flex-shrink-0" />
            <span>
              SIP Karanghaur • {isSupabaseConnected ? 'Supabase Live' : 'Mode Lokal'}
              {lastSyncedAt ? ` (${lastSyncedAt})` : ''}
            </span>
          </span>
          <button
            onClick={() => setShowRoleModal(true)}
            className="text-amber-200 hover:text-white font-bold underline text-[10px] flex-shrink-0"
          >
            Ubah Peran
          </button>
        </div>
      </header>

      {/* Role Switcher Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[85dvh] flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 flex-shrink-0">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Ganti Akun Peran (Uji RBAC Wilayah)
                </h3>
                <p className="text-[11px] text-slate-500">
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

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
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
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-400/20'
                        : 'border-slate-200 hover:border-orange-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="font-bold text-xs text-slate-900 break-words">
                          {p.full_name}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeColor}`}>
                          {p.role.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {p.role === 'admin' && 'Akses penuh seluruh data desa (CRUD)'}
                        {p.role === 'kadus' && `Wilayah tugas: ${p.assigned_dusun} (Read-only + Catatan)`}
                        {p.role === 'rw' && `Wilayah tugas: RW ${p.assigned_rw} - ${p.assigned_dusun}`}
                        {p.role === 'rt' && `Wilayah tugas: RT ${p.assigned_rt} / RW ${p.assigned_rw}`}
                      </p>
                    </div>

                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    ) : (
                      <span className="text-[11px] text-slate-400 flex-shrink-0">Pilih</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0 bg-slate-50">
              <button
                onClick={() => setShowRoleModal(false)}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
