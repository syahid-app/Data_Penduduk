'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Profile } from '@/lib/types';
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
  KeyRound,
  LogOut,
} from 'lucide-react';

export const Header: React.FC = () => {
  const router = useRouter();
  const {
    currentProfile,
    allProfiles,
    switchProfile,
    logout,
    villageConfig,
    visibleNotes,
    isOnline,
    isSupabaseConnected,
    isSyncingWithSupabase,
    lastSyncedAt,
    refreshFromSupabase,
  } = useApp();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedTargetProfile, setSelectedTargetProfile] = useState<Profile | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

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
    if (currentProfile.role === 'admin') return `Seluruh ${villageConfig.nama_desa}`;
    if (currentProfile.role === 'kadus') return currentProfile.assigned_dusun || '';
    if (currentProfile.role === 'rw') return `RW ${currentProfile.assigned_rw} • ${currentProfile.assigned_dusun}`;
    return `${currentProfile.assigned_dusun || 'Dusun I'}`;
  };

  const handleSelectProfile = (p: Profile) => {
    if (p.id === currentProfile?.id) {
      setShowRoleModal(false);
      return;
    }
    setSelectedTargetProfile(p);
    setPinInput('');
    setPinError(null);
  };

  const handleVerifyPinSwitch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetProfile) return;
    const res = switchProfile(selectedTargetProfile.id, pinInput);
    if (!res.success) {
      setPinError(res.error || 'PIN salah!');
      return;
    }
    setSelectedTargetProfile(null);
    setPinInput('');
    setShowRoleModal(false);
  };

  return (
    <>
      <header className="w-full bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-500 text-white shadow-sm select-none">
        {/* Top bar with user role & notifications */}
        <div className="px-3 sm:px-5 pt-2.5 pb-2">
          <div className="flex items-start justify-between gap-2">
            {/* Left: User Avatar & Role Badge */}
            <div className="flex items-start space-x-2.5 min-w-0 flex-1">
              <button
                onClick={() => {
                  setSelectedTargetProfile(null);
                  setShowRoleModal(true);
                }}
                className="relative flex-shrink-0 group focus:outline-none mt-0.5"
                title="Ganti Akun (Wajib PIN)"
              >
                <div className="w-9 h-9 rounded-full bg-white/25 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center text-white font-bold text-sm shadow-inner group-hover:scale-105 transition-transform">
                  {currentProfile?.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-amber-200" />
                  ) : (
                    <UserCheck className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 text-[8px] font-extrabold px-1 rounded-full border border-white shadow">
                  PIN
                </span>
              </button>

              <div className="min-w-0 flex-1">
                <button
                  onClick={() => {
                    setSelectedTargetProfile(null);
                    setShowRoleModal(true);
                  }}
                  className="flex items-center gap-1 text-left focus:outline-none group w-full"
                >
                  <span className="font-extrabold text-xs sm:text-sm leading-snug break-words text-white drop-shadow-sm group-hover:underline">
                    {currentProfile?.full_name || villageConfig.nama_desa}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/90 flex-shrink-0 group-hover:translate-y-0.5 transition-transform" />
                </button>

                <div className="flex items-center flex-wrap gap-1 mt-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-white/25 text-white border border-white/30">
                    <MapPin className="w-2.5 h-2.5 mr-0.5 text-amber-200 flex-shrink-0" />
                    <span>{getRoleLabel()}</span>
                  </span>
                  <span className="text-[10px] text-white/95 font-semibold leading-tight">
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
                  className="flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold bg-white/20 hover:bg-white/30 border border-white/30 text-white active:scale-95 transition-all"
                  title={
                    lastSyncedAt
                      ? `Supabase Cloud Terhubung (Sinkron: ${lastSyncedAt})`
                      : 'Klik untuk sinkronisasi Supabase Cloud'
                  }
                >
                  <Cloud className="w-3 h-3 text-white" />
                  <RefreshCw
                    className={`w-2.5 h-2.5 ${
                      isSyncingWithSupabase ? 'animate-spin text-amber-200' : 'text-emerald-200'
                    }`}
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
                    ? 'bg-emerald-500/25 text-emerald-100 border-emerald-200/50'
                    : 'bg-rose-500/25 text-rose-100 border-rose-200/50'
                }`}
                title={isOnline ? 'Jaringan Online' : 'Offline - Mode Lokal'}
              >
                {isOnline ? (
                  <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                ) : (
                  <WifiOff className="w-3 h-3 text-rose-200" />
                )}
              </div>

              {/* Notification Bell */}
              <Link
                href="/catatan"
                className="relative p-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all text-white border border-white/30"
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

        {/* Sub-strip banner with Village Name & Supabase sync time */}
        <div className="bg-sky-600/60 px-3 sm:px-5 py-1 flex items-center justify-between gap-2 text-[10px] text-white border-t border-white/20">
          <span className="flex items-center gap-1 font-semibold leading-tight break-words">
            <Sparkles className="w-3 h-3 text-amber-200 flex-shrink-0" />
            <span>
              {villageConfig.nama_desa} • {isSupabaseConnected ? 'Supabase Live' : 'Mode Lokal'}
              {lastSyncedAt ? ` (${lastSyncedAt})` : ''}
            </span>
          </span>
          <button
            onClick={() => {
              setSelectedTargetProfile(null);
              setShowRoleModal(true);
            }}
            className="text-amber-100 hover:text-white font-bold underline text-[10px] flex-shrink-0"
          >
            Ganti Akun
          </button>
        </div>
      </header>

      {/* Role Switcher Modal with Mandatory PIN Verification */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 max-h-[85dvh] flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white flex-shrink-0">
              <div>
                <h3 className="text-sm font-extrabold">
                  {selectedTargetProfile
                    ? 'Masukkan PIN Akses Akun'
                    : 'Pilih Akun Petugas (Wajib PIN)'}
                </h3>
                <p className="text-[11px] text-sky-100">
                  {selectedTargetProfile
                    ? selectedTargetProfile.full_name
                    : 'Setiap pergantian akun wajib menggunakan PIN resmi'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedTargetProfile(null);
                  setShowRoleModal(false);
                }}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {selectedTargetProfile ? (
              <form onSubmit={handleVerifyPinSwitch} className="p-4 space-y-3 text-xs">
                {pinError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                    {pinError}
                  </div>
                )}

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200">
                  <span className="text-[10px] text-sky-700 font-bold uppercase block">
                    Akun Tujuan:
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {selectedTargetProfile.full_name}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Role: {selectedTargetProfile.role.toUpperCase()}
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Masukkan PIN Login:
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      inputMode="numeric"
                      autoFocus
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      placeholder="Masukkan PIN..."
                      className="w-full pl-9 pr-3 py-2.5 text-sm font-mono font-extrabold tracking-widest bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-sky-600 absolute left-3 top-3" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTargetProfile(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-sm"
                  >
                    Verifikasi & Masuk
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2">
                  {allProfiles.map((p) => {
                    const isSelected = currentProfile?.id === p.id;
                    let badgeColor = 'bg-sky-100 text-sky-800 border-sky-200';
                    if (p.role === 'admin')
                      badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                    if (p.role === 'rw')
                      badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';

                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProfile(p)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-400/20'
                            : 'border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span className="font-bold text-xs text-slate-900 break-words">
                              {p.full_name}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeColor}`}
                            >
                              {p.role === 'kadus' ? 'DUSUN' : p.role.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                            {p.role === 'admin' && 'Akses penuh seluruh data desa & pengaturan'}
                            {p.role === 'kadus' &&
                              `Wilayah tugas: ${p.assigned_dusun}`}
                            {p.role === 'rw' &&
                              `Wilayah tugas: RW ${p.assigned_rw} - ${p.assigned_dusun}`}
                            {p.role === 'rt' &&
                              `Wilayah tugas: RT ${p.assigned_rt} / RW ${p.assigned_rw}`}
                          </p>
                        </div>

                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200 flex-shrink-0">
                            <KeyRound className="w-3 h-3" />
                            PIN
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-shrink-0 bg-slate-50">
                  <button
                    onClick={() => {
                      setShowRoleModal(false);
                      logout();
                      router.push('/login');
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs inline-flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Logout)</span>
                  </button>
                  <button
                    onClick={() => setShowRoleModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Tutup
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
