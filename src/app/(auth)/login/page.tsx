'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  Shield,
  UserCheck,
  MapPin,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Building2,
  HelpCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { allProfiles, switchProfile, families, citizens } = useApp();
  const [activeTab, setActiveTab] = useState<'demo' | 'credentials'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleSelectDemo = (profileId: string) => {
    setLoading(true);
    switchProfile(profileId);
    setTimeout(() => {
      router.push('/dashboard');
    }, 200);
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorNotice('Harap isi email dan kata sandi.');
      return;
    }
    setLoading(true);
    setErrorNotice(null);

    setTimeout(() => {
      const lower = email.toLowerCase();
      let matched = allProfiles[0];
      if (lower.includes('kadus2')) matched = allProfiles.find((p) => p.id === 'prof-kadus-2') || allProfiles[0];
      else if (lower.includes('kadus3')) matched = allProfiles.find((p) => p.id === 'prof-kadus-3') || allProfiles[0];
      else if (lower.includes('kadus')) matched = allProfiles.find((p) => p.role === 'kadus') || allProfiles[0];
      else if (lower.includes('rw02') || lower.includes('rw2')) matched = allProfiles.find((p) => p.id === 'prof-rw-02') || allProfiles[0];
      else if (lower.includes('rw')) matched = allProfiles.find((p) => p.role === 'rw') || allProfiles[0];
      else if (lower.includes('rt02') || lower.includes('rt2')) matched = allProfiles.find((p) => p.id === 'prof-rt-02') || allProfiles[0];
      else if (lower.includes('rt03') || lower.includes('rt3')) matched = allProfiles.find((p) => p.id === 'prof-rt-03') || allProfiles[0];
      else if (lower.includes('rt')) matched = allProfiles.find((p) => p.role === 'rt') || allProfiles[0];

      switchProfile(matched.id);
      router.push('/dashboard');
    }, 400);
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-slate-900 flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="w-full max-w-md bg-slate-50 h-full sm:h-auto sm:max-h-[92dvh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200/60">
        {/* Top Hero Banner - Fixed at Top */}
        <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 px-5 py-4 text-white text-center relative overflow-hidden flex-shrink-0">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-400/20 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg mb-2">
              <Building2 className="w-7 h-7 text-amber-200" />
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-semibold text-orange-100 border border-white/25 mb-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Sistem Kependudukan Berbasis Wilayah (RBAC)
            </div>

            <h1 className="text-lg font-extrabold tracking-tight text-white drop-shadow-sm">
              DESA KARANGHAUR
            </h1>
            <p className="text-[11px] text-orange-100 mt-0.5">
              Kecamatan Pebayuran, Kabupaten Bekasi • {citizens.length} Jiwa / {families.length} KK Aktif
            </p>
          </div>
        </div>

        {/* Fixed Sub-tab Header */}
        <div className="px-4 pt-3 pb-2 bg-slate-50 border-b border-slate-200/70 flex-shrink-0">
          <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl">
            <button
              onClick={() => setActiveTab('demo')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'demo'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo 1-Klik (Uji RBAC)
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'credentials'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login Kredensial
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="px-4 py-3 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {errorNotice && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorNotice}
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="font-semibold text-slate-700">Pilih Peran Pengguna ({allProfiles.length}):</span>
                <span className="text-[11px] text-orange-600 font-medium">Otomatis Masuk</span>
              </div>

              <div className="space-y-1.5">
                {allProfiles.map((profile) => {
                  let badge = 'bg-orange-100 text-orange-800 border-orange-200';
                  let scope = '';
                  let icon = <UserCheck className="w-4 h-4 text-orange-600" />;

                  if (profile.role === 'admin') {
                    badge = 'bg-purple-100 text-purple-800 border-purple-200';
                    scope = `Seluruh Desa (${families.length} KK / ${citizens.length} Jiwa)`;
                    icon = <Shield className="w-4 h-4 text-purple-600" />;
                  } else if (profile.role === 'kadus') {
                    badge = 'bg-blue-100 text-blue-800 border-blue-200';
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
                      onClick={() => handleSelectDemo(profile.id)}
                      disabled={loading}
                      className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 active:scale-[0.99] transition-all group focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors flex-shrink-0">
                            {icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600 truncate">
                                {profile.full_name}
                              </span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${badge}`}>
                                {profile.role.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 flex items-center mt-0.5">
                              <MapPin className="w-3 h-3 mr-1 text-slate-400 flex-shrink-0" />
                              <span className="truncate">{scope}</span>
                            </p>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center font-bold gap-1 text-amber-800">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Prinsip Keamanan Batas Wilayah:
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Pengguna RT hanya melihat warga di RT tugasnya. RW hanya melihat warga di RW tugasnya. Kadus hanya melihat data Dusun tugasnya. Admin memegang akses penuh seluruh desa.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Akun Petugas
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@karanghaur.desa.id"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-500 space-y-0.5">
                <p className="font-semibold text-slate-700">Contoh Demo Login:</p>
                <p>• Admin: admin@karanghaur.desa.id</p>
                <p>• Kadus: kadus1@karanghaur.desa.id</p>
                <p>• RW: rw01@karanghaur.desa.id</p>
                <p>• RT: rt01@karanghaur.desa.id</p>
                <p className="text-slate-400 italic">Kata sandi apa saja (bebas)</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center space-x-1.5"
              >
                <span>{loading ? 'Memverifikasi...' : 'Masuk Aplikasi'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Fixed Footer */}
        <div className="px-4 py-2.5 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500 flex-shrink-0">
          PWA Terintegrasi Supabase Cloud • Desa Karanghaur
        </div>
      </div>
    </div>
  );
}
