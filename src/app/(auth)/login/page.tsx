'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Profile } from '@/lib/types';
import {
  Shield,
  UserCheck,
  MapPin,
  KeyRound,
  ArrowRight,
  Sparkles,
  Building2,
  Eye,
  EyeOff,
  CheckCircle2,
  Info,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { allProfiles, loginWithPin, villageConfig, families, citizens } = useApp();

  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(
    allProfiles[0] || null
  );
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [showDemoPinHint, setShowDemoPinHint] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const activeProfile =
    selectedProfile && allProfiles.find((p) => p.id === selectedProfile.id)
      ? allProfiles.find((p) => p.id === selectedProfile.id)!
      : allProfiles[0] || null;

  const handlePinLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!activeProfile) {
      setErrorNotice('Silakan pilih akun petugas terlebih dahulu.');
      return;
    }
    if (!pinInput.trim()) {
      setErrorNotice('Harap masukkan PIN akses akun Anda.');
      return;
    }

    const res = loginWithPin(activeProfile.id, pinInput);
    if (!res.success) {
      setErrorNotice(res.error || 'PIN tidak sesuai!');
      return;
    }

    router.replace('/dashboard');
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-slate-900 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="w-full max-w-md bg-slate-50 h-full sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/60">
        {/* Top Hero Banner - Biru Muda (Sky Blue) */}
        <div className="bg-gradient-to-br from-sky-500 via-sky-400 to-cyan-500 px-5 py-4 text-white text-center relative overflow-hidden flex-shrink-0">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/15 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-cyan-200/20 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg mb-2">
              <Building2 className="w-6 h-6 text-white" />
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold text-white border border-white/30 mb-1">
              <Sparkles className="w-3 h-3 text-amber-200" />
              Sistem Informasi Kependudukan Berbasis Wilayah
            </div>

            <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white uppercase drop-shadow-sm break-words">
              {villageConfig.nama_desa}
            </h1>
            <p className="text-[11px] text-white/95 font-medium mt-0.5 break-words">
              Kepala Desa: <strong>{villageConfig.kepala_desa}</strong>
            </p>
            <p className="text-[10px] text-sky-50 mt-0.5 break-words">
              Kec. {villageConfig.kecamatan}, Kab. {villageConfig.kabupaten} •{' '}
              {families.length} KK / {citizens.length} Jiwa
            </p>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="px-4 py-3.5 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-3">
          {errorNotice && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
              {errorNotice}
            </div>
          )}

          {/* PIN Login Box */}
          <form
            onSubmit={handlePinLogin}
            className="bg-white p-3.5 rounded-2xl border border-sky-200 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-extrabold text-slate-800">
                  Masuk Aplikasi (Wajib PIN)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoPinHint(!showDemoPinHint)}
                className="text-[10px] font-bold text-sky-600 hover:underline inline-flex items-center gap-0.5"
              >
                <Info className="w-3 h-3" />
                <span>{showDemoPinHint ? 'Tutup Info PIN' : 'Lihat Daftar PIN'}</span>
              </button>
            </div>

            {showDemoPinHint && (
              <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-[10px] text-slate-700 space-y-1">
                <p className="font-extrabold text-sky-800">
                  Daftar PIN Akun Aktif (Dapat diubah Admin di menu Pengaturan):
                </p>
                <div className="grid grid-cols-1 gap-1 pt-0.5">
                  {allProfiles.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between bg-white px-2 py-1 rounded border border-sky-100"
                    >
                      <span className="font-semibold text-slate-800 break-words pr-2">
                        {p.full_name}
                      </span>
                      <span className="font-mono font-extrabold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 flex-shrink-0">
                        PIN: {p.pin || '123456'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Account Display */}
            {activeProfile && (
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-200 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-sky-700 uppercase block">
                    Akun Dipilih:
                  </span>
                  <p className="text-xs font-extrabold text-slate-900 break-words">
                    {activeProfile.full_name}
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {activeProfile.role === 'admin' &&
                      `Administrator • Seluruh ${villageConfig.nama_desa}`}
                    {activeProfile.role === 'kadus' &&
                      `Kepala Dusun • ${activeProfile.assigned_dusun}`}
                    {activeProfile.role === 'rw' &&
                      `Ketua RW ${activeProfile.assigned_rw} • ${activeProfile.assigned_dusun}`}
                    {activeProfile.role === 'rt' &&
                      `Ketua RT ${activeProfile.assigned_rt} / RW ${activeProfile.assigned_rw}`}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-sky-500 text-white flex-shrink-0">
                  {activeProfile.role === 'kadus' ? 'DUSUN' : activeProfile.role}
                </span>
              </div>
            )}

            {/* PIN Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Masukkan PIN Akun <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setErrorNotice(null);
                  }}
                  placeholder="Ketik PIN Akses..."
                  className="w-full pl-9 pr-9 py-2.5 text-sm font-mono font-extrabold tracking-widest bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
                <KeyRound className="w-4 h-4 text-sky-500 absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-400 hover:text-slate-700 absolute right-3 top-3"
                  title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                >
                  {showPin ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5"
            >
              <span>Verifikasi PIN & Masuk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Account Selector List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs px-1">
              <span className="font-bold text-slate-700">
                1. Pilih Akun Petugas ({allProfiles.length}):
              </span>
              <span className="text-[10px] text-sky-600 font-semibold">
                Klik akun lalu isi PIN di atas
              </span>
            </div>

            <div className="space-y-1.5">
              {allProfiles.map((profile) => {
                const isSelected = activeProfile?.id === profile.id;
                let badge = 'bg-sky-100 text-sky-800 border-sky-200';
                let scope = '';
                let icon = <UserCheck className="w-4 h-4 text-sky-600" />;

                if (profile.role === 'admin') {
                  badge = 'bg-purple-100 text-purple-800 border-purple-200';
                  scope = `Seluruh ${villageConfig.nama_desa} (${families.length} KK / ${citizens.length} Jiwa)`;
                  icon = <Shield className="w-4 h-4 text-purple-600" />;
                } else if (profile.role === 'kadus') {
                  badge = 'bg-sky-100 text-sky-800 border-sky-200';
                  scope = `Wilayah: ${profile.assigned_dusun}`;
                } else if (profile.role === 'rw') {
                  badge = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  scope = `Wilayah: RW ${profile.assigned_rw} (${profile.assigned_dusun})`;
                } else if (profile.role === 'rt') {
                  scope = `Wilayah: RT ${profile.assigned_rt} / RW ${profile.assigned_rw} (${profile.assigned_dusun})`;
                }

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => {
                      setSelectedProfile(profile);
                      setErrorNotice(null);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-400/25'
                        : 'bg-white border-slate-200 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-xs font-bold text-slate-900 break-words">
                            {profile.full_name}
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${badge}`}
                          >
                            {profile.role === 'kadus'
                              ? 'DUSUN'
                              : profile.role.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 flex items-start mt-0.5">
                          <MapPin className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0 mt-0.5" />
                          <span className="break-words">{scope}</span>
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 flex-shrink-0">
                        Pilih
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500 flex-shrink-0 break-words">
          {villageConfig.alamat_desa}
        </div>
      </div>
    </div>
  );
}
