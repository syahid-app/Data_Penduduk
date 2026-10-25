'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  Shield,
  UserCheck,
  MapPin,
  CheckCircle2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Building2,
  Users2,
  HelpCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { allProfiles, switchProfile } = useApp();
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
    }, 300);
  };

  const handleCredentialsLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorNotice('Harap isi email dan kata sandi.');
      return;
    }
    setLoading(true);
    setErrorNotice(null);

    // Fallback or demo credentials match
    setTimeout(() => {
      // Find matching profile by email keyword or default to admin
      const lower = email.toLowerCase();
      let matched = allProfiles[0];
      if (lower.includes('kadus')) matched = allProfiles[1];
      else if (lower.includes('rw')) matched = allProfiles[2];
      else if (lower.includes('rt')) matched = allProfiles[3];

      switchProfile(matched.id);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-2 sm:p-4">
      {/* Mobile container limit */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen sm:min-h-0 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between border border-slate-200/60">
        {/* Top Hero Banner - Shopee Gradient */}
        <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 p-6 text-white text-center relative overflow-hidden">
          {/* Subtle geometric circles */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-amber-400/20 rounded-full blur-lg pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Village Emblem / App Icon */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-lg mb-3">
              <Building2 className="w-9 h-9 text-amber-200" />
            </div>

            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-orange-100 border border-white/25 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Sistem Kependudukan Berbasis Wilayah (RBAC)
            </div>

            <h1 className="text-xl font-extrabold tracking-tight text-white drop-shadow-sm">
              DESA KARANGHAUR
            </h1>
            <p className="text-xs text-orange-100 mt-1 max-w-xs">
              Kecamatan Pebayuran, Kabupaten Bekasi • 4.531 Jiwa / 1.480 KK
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 flex-1 flex flex-col">
          {/* Tabs Selector: Demo 1-Click vs Supabase Auth */}
          <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('demo')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'demo'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo 1-Klik (Uji RBAC)
            </button>
            <button
              onClick={() => setActiveTab('credentials')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'credentials'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Login Kredensial
            </button>
          </div>

          {errorNotice && (
            <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorNotice}
            </div>
          )}

          {/* TAB 1: DEMO ROLE SWITCHER (Recommended for testing strict isolation) */}
          {activeTab === 'demo' && (
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span className="font-semibold text-slate-700">Pilih Peran Pengguna:</span>
                <span className="text-[11px] text-orange-600 font-medium">Otomatis Masuk</span>
              </div>

              <div className="space-y-2">
                {allProfiles.map((profile) => {
                  let badge = 'bg-orange-100 text-orange-800 border-orange-200';
                  let scope = '';
                  let icon = <UserCheck className="w-4 h-4 text-orange-600" />;

                  if (profile.role === 'admin') {
                    badge = 'bg-purple-100 text-purple-800 border-purple-200';
                    scope = 'Seluruh Desa (CRUD Penuh + Rekap Total)';
                    icon = <Shield className="w-4 h-4 text-purple-600" />;
                  } else if (profile.role === 'kadus') {
                    badge = 'bg-blue-100 text-blue-800 border-blue-200';
                    scope = `Wilayah: ${profile.assigned_dusun} (636 KK / 2.008 Jiwa)`;
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
                      className="w-full text-left p-3 rounded-xl bg-white border border-slate-200 hover:border-orange-500 hover:bg-orange-50/50 hover:shadow-xs active:scale-[0.99] transition-all group focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                            {icon}
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-orange-600">
                                {profile.full_name}
                              </span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border ${badge}`}>
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

              {/* RBAC notice info box */}
              <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                <div className="flex items-center font-bold gap-1 text-amber-800">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Prinsip Keamanan Batas Wilayah:
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Pengguna RT hanya dapat melihat warga di RT tugasnya. RW hanya melihat warga di RW tugasnya. Kadus hanya melihat data Dusun tugasnya. Admin memegang akses penuh seluruh desa.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: CREDENTIALS LOGIN */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsLogin} className="space-y-4 flex-1">
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

        {/* Footer info */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500">
          PWA Terintegrasi Desa Karanghaur • Siap Instal di Android / iOS (A2HS)
        </div>
      </div>
    </div>
  );
}
