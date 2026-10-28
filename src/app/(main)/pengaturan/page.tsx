'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Profile, UserRole } from '@/lib/types';
import {
  Settings,
  Users,
  Building2,
  PlusCircle,
  Edit3,
  Trash2,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  ShieldAlert,
  Search,
  MapPin,
  Phone,
  X,
  Copy,
  Check,
} from 'lucide-react';

export default function PengaturanPage() {
  const router = useRouter();
  const {
    currentProfile,
    allProfiles,
    addProfile,
    updateProfile,
    deleteProfile,
    villageConfig,
    updateVillageConfig,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'accounts' | 'village'>('accounts');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPins, setShowPins] = useState<Record<string, boolean>>({});
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);

  // Account Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Profile | null>(null);
  const [accFullName, setAccFullName] = useState('');
  const [accRole, setAccRole] = useState<UserRole>('rt');
  const [accDusun, setAccDusun] = useState('Dusun I');
  const [accRw, setAccRw] = useState('001');
  const [accRt, setAccRt] = useState('001');
  const [accPhone, setAccPhone] = useState('');
  const [accPin, setAccPin] = useState('');
  const [accError, setAccError] = useState<string | null>(null);
  const [accSubmitting, setAccSubmitting] = useState(false);

  // Village Form State
  const [namaDesa, setNamaDesa] = useState(villageConfig.nama_desa);
  const [kepalaDesa, setKepalaDesa] = useState(villageConfig.kepala_desa);
  const [alamatDesa, setAlamatDesa] = useState(villageConfig.alamat_desa);
  const [kecamatan, setKecamatan] = useState(villageConfig.kecamatan);
  const [kabupaten, setKabupaten] = useState(villageConfig.kabupaten);
  const [provinsi, setProvinsi] = useState(villageConfig.provinsi);
  const [kodePos, setKodePos] = useState(villageConfig.kode_pos);
  const [teleponDesa, setTeleponDesa] = useState(villageConfig.telepon_desa || '');
  const [emailDesa, setEmailDesa] = useState(villageConfig.email_desa || '');
  const [villageSavedNotice, setVillageSavedNotice] = useState<string | null>(null);
  const [villageSaving, setVillageSaving] = useState(false);

  useEffect(() => {
    setNamaDesa(villageConfig.nama_desa);
    setKepalaDesa(villageConfig.kepala_desa);
    setAlamatDesa(villageConfig.alamat_desa);
    setKecamatan(villageConfig.kecamatan);
    setKabupaten(villageConfig.kabupaten);
    setProvinsi(villageConfig.provinsi);
    setKodePos(villageConfig.kode_pos);
    setTeleponDesa(villageConfig.telepon_desa || '');
    setEmailDesa(villageConfig.email_desa || '');
  }, [villageConfig]);

  if (currentProfile?.role !== 'admin') {
    return (
      <div className="p-5">
        <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-sm">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-base font-bold text-slate-800">
            Khusus Administrator Desa
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Halaman Pengaturan Akun RT/RW/Dusun, PIN Login, dan Identitas Desa hanya dapat diakses oleh Admin Desa.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const openAddAccountModal = () => {
    setEditingAccount(null);
    setAccFullName('');
    setAccRole('rt');
    setAccDusun('Dusun I');
    setAccRw('001');
    setAccRt('001');
    setAccPhone('');
    setAccPin('123456');
    setAccError(null);
    setIsAccountModalOpen(true);
  };

  const openEditAccountModal = (prof: Profile) => {
    setEditingAccount(prof);
    setAccFullName(prof.full_name);
    setAccRole(prof.role);
    setAccDusun(prof.assigned_dusun || 'Dusun I');
    setAccRw(prof.assigned_rw || '001');
    setAccRt(prof.assigned_rt || '001');
    setAccPhone(prof.phone || '');
    setAccPin(prof.pin || '123456');
    setAccError(null);
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccError(null);

    if (!accFullName.trim()) {
      setAccError('Nama pejabat / pengguna wajib diisi.');
      return;
    }
    if (!accPin.trim() || accPin.trim().length < 4) {
      setAccError('PIN Login wajib diisi minimal 4 digit/karakter.');
      return;
    }

    setAccSubmitting(true);
    const payload: Omit<Profile, 'id' | 'created_at'> = {
      full_name: accFullName.trim(),
      role: accRole,
      assigned_dusun: accRole === 'admin' ? null : accDusun.trim(),
      assigned_rw:
        accRole === 'admin' || accRole === 'kadus'
          ? null
          : accRw.trim().padStart(3, '0'),
      assigned_rt:
        accRole === 'rt' ? accRt.trim().padStart(3, '0') : null,
      phone: accPhone.trim(),
      pin: accPin.trim(),
    };

    const res = editingAccount
      ? await updateProfile(editingAccount.id, payload)
      : await addProfile(payload);

    setAccSubmitting(false);
    if (!res.success) {
      setAccError(res.error || 'Gagal menyimpan akun.');
      return;
    }
    setIsAccountModalOpen(false);
  };

  const handleDeleteAccount = async (prof: Profile) => {
    if (prof.id === currentProfile.id) {
      alert('Anda tidak dapat menghapus akun Admin yang sedang aktif digunakan.');
      return;
    }
    if (
      confirm(
        `Hapus akun "${prof.full_name}" (${prof.role.toUpperCase()})? Pengguna ini tidak akan bisa login lagi.`
      )
    ) {
      const res = await deleteProfile(prof.id);
      if (!res.success) {
        alert(res.error || 'Gagal menghapus akun.');
      }
    }
  };

  const handleSaveVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaDesa.trim() || !kepalaDesa.trim() || !alamatDesa.trim()) {
      alert('Nama Desa, Nama Kepala Desa, dan Alamat Desa wajib diisi!');
      return;
    }

    setVillageSaving(true);
    setVillageSavedNotice(null);
    const res = await updateVillageConfig({
      nama_desa: namaDesa.trim(),
      kepala_desa: kepalaDesa.trim(),
      alamat_desa: alamatDesa.trim(),
      kecamatan: kecamatan.trim(),
      kabupaten: kabupaten.trim(),
      provinsi: provinsi.trim(),
      kode_pos: kodePos.trim(),
      telepon_desa: teleponDesa.trim(),
      email_desa: emailDesa.trim(),
    });
    setVillageSaving(false);

    if (res.success) {
      setVillageSavedNotice(
        'Identitas & Profil Desa berhasil disimpan dan disinkronkan ke Supabase Cloud!'
      );
      setTimeout(() => setVillageSavedNotice(null), 4000);
    } else {
      alert(res.error || 'Gagal menyimpan pengaturan desa.');
    }
  };

  const filteredProfiles = allProfiles.filter((p) => {
    if (roleFilter !== 'all' && p.role !== roleFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.role.toLowerCase().includes(q) ||
      (p.assigned_dusun || '').toLowerCase().includes(q) ||
      (p.assigned_rw || '').toLowerCase().includes(q) ||
      (p.assigned_rt || '').toLowerCase().includes(q)
    );
  });

  const handleCopyPin = (id: string, pin: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopiedPinId(id);
      setTimeout(() => setCopiedPinId(null), 1800);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'kadus':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'rw':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rt':
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ===================================================================== */}
      {/* FIXED TOP HEAD BAR (Judul & Sub-Tab Pengaturan - Tidak ikut scroll)   */}
      {/* ===================================================================== */}
      <div className="flex-shrink-0 px-3.5 sm:px-5 pt-2.5 pb-2 bg-slate-50 border-b border-slate-200/80 z-10 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-sky-600" />
              <span>Pengaturan Sistem & Desa</span>
            </h1>
            <p className="text-[10px] text-slate-500">
              Kelola Akun RT/RW/Dusun, PIN Login Wajib, dan Profil Identitas Desa
            </p>
          </div>

          {activeTab === 'accounts' && (
            <button
              onClick={openAddAccountModal}
              className="inline-flex items-center text-[11px] font-bold bg-sky-500 hover:bg-sky-600 text-white px-2.5 py-1.5 rounded-xl shadow-sm transition-all active:scale-95 flex-shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              <span>+ Tambah Akun</span>
            </button>
          )}
        </div>

        {/* Sub-tab Selector */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'accounts'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Akun & PIN ({allProfiles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('village')}
            className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'village'
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Identitas Desa</span>
          </button>
        </div>

        {/* Search & Role Filter when in Accounts tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-1.5 pt-0.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari Nama Pejabat, RT, RW, atau Dusun..."
                className="w-full pl-7 pr-6 py-1.5 text-[11px] bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-1 focus:ring-sky-500 outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-600 absolute right-2 top-1.5 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-1.5">
              {(
                [
                  { id: 'all', label: `Semua (${allProfiles.length})` },
                  {
                    id: 'admin',
                    label: `Admin (${allProfiles.filter((p) => p.role === 'admin').length})`,
                  },
                  {
                    id: 'kadus',
                    label: `Dusun (${allProfiles.filter((p) => p.role === 'kadus').length})`,
                  },
                  {
                    id: 'rw',
                    label: `RW (${allProfiles.filter((p) => p.role === 'rw').length})`,
                  },
                  {
                    id: 'rt',
                    label: `RT (${allProfiles.filter((p) => p.role === 'rt').length})`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                    roleFilter === tab.id
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* SCROLLABLE INNER CONTENT AREA                                         */}
      {/* ===================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 sm:px-5 py-3 pb-20 space-y-3">
        {activeTab === 'accounts' ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2.5 text-center w-9">No</th>
                    <th className="py-2 px-2.5">Nama Pejabat / Akun</th>
                    <th className="py-2 px-2.5 text-center">Role</th>
                    <th className="py-2 px-2.5">Wilayah Tugas</th>
                    <th className="py-2 px-2.5">PIN Login</th>
                    <th className="py-2 px-2.5">No. HP</th>
                    <th className="py-2 px-2.5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-xs text-slate-400">
                        Tidak ada akun yang cocok dengan filter pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredProfiles.map((prof, idx) => {
                      const pinValue = prof.pin || '123456';
                      const isPinVisible = showPins[prof.id] ?? true;

                      return (
                        <tr
                          key={prof.id}
                          className="even:bg-slate-50/50 hover:bg-sky-50/50 transition-colors"
                        >
                          <td className="py-2 px-2.5 text-center font-mono text-[10px] text-slate-400">
                            {idx + 1}
                          </td>

                          <td className="py-2 px-2.5 font-bold text-slate-900 break-words">
                            {prof.full_name}
                          </td>

                          <td className="py-2 px-2.5 text-center whitespace-nowrap">
                            <span
                              className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase ${getRoleBadge(
                                prof.role
                              )}`}
                            >
                              {prof.role === 'kadus' ? 'DUSUN' : prof.role}
                            </span>
                          </td>

                          <td className="py-2 px-2.5 whitespace-nowrap text-slate-700">
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <MapPin className="w-3 h-3 text-sky-500 flex-shrink-0" />
                              {prof.role === 'admin' && 'Seluruh Desa'}
                              {prof.role === 'kadus' && (prof.assigned_dusun || '-')}
                              {prof.role === 'rw' &&
                                `RW ${prof.assigned_rw} (${prof.assigned_dusun})`}
                              {prof.role === 'rt' &&
                                `RT ${prof.assigned_rt} / RW ${prof.assigned_rw} (${prof.assigned_dusun})`}
                            </span>
                          </td>

                          <td className="py-2 px-2.5 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                              <KeyRound className="w-3 h-3 text-sky-600" />
                              <span className="font-mono font-extrabold text-slate-900 tracking-wider">
                                {isPinVisible ? pinValue : '••••••'}
                              </span>
                              <button
                                onClick={() =>
                                  setShowPins((prev) => ({
                                    ...prev,
                                    [prof.id]: !isPinVisible,
                                  }))
                                }
                                className="p-0.5 text-slate-400 hover:text-slate-700"
                                title={isPinVisible ? 'Sembunyikan PIN' : 'Lihat PIN'}
                              >
                                {isPinVisible ? (
                                  <EyeOff className="w-3 h-3" />
                                ) : (
                                  <Eye className="w-3 h-3" />
                                )}
                              </button>
                              <button
                                onClick={() => handleCopyPin(prof.id, pinValue)}
                                className="p-0.5 text-slate-400 hover:text-sky-600"
                                title="Salin PIN"
                              >
                                {copiedPinId === prof.id ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-2 px-2.5 whitespace-nowrap text-slate-600">
                            {prof.phone || '-'}
                          </td>

                          <td className="py-1.5 px-2.5 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => openEditAccountModal(prof)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-sky-50 hover:bg-sky-500 text-sky-700 hover:text-white border border-sky-200 transition-colors"
                                title="Edit Akun & PIN"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit / PIN</span>
                              </button>

                              {prof.id !== currentProfile.id && (
                                <button
                                  onClick={() => handleDeleteAccount(prof)}
                                  className="p-1 rounded bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 transition-colors"
                                  title="Hapus Akun"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ================================================================= */
          /* FORM IDENTITAS & PROFIL DESA                                      */
          /* ================================================================= */
          <form
            onSubmit={handleSaveVillage}
            className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm space-y-3.5"
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-extrabold text-slate-900">
                    Pengaturan Identitas & Profil Desa
                  </h2>
                  <p className="text-[10px] text-slate-500">
                    Perubahan otomatis tampil di Beranda, Header, Login, dan Profil
                  </p>
                </div>
              </div>
            </div>

            {villageSavedNotice && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{villageSavedNotice}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Desa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={namaDesa}
                  onChange={(e) => setNamaDesa(e.target.value)}
                  placeholder="Contoh: Desa Karanghaur"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kepala Desa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={kepalaDesa}
                  onChange={(e) => setKepalaDesa(e.target.value)}
                  placeholder="Contoh: H. Sulaeman, S.IP"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat Lengkap Kantor Desa <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={alamatDesa}
                onChange={(e) => setAlamatDesa(e.target.value)}
                placeholder="Contoh: Jl. Raya Karanghaur No. 01, Kec. Pebayuran, Kab. Bekasi"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Kabupaten / Kota
                </label>
                <input
                  type="text"
                  value={kabupaten}
                  onChange={(e) => setKabupaten(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Provinsi
                </label>
                <input
                  type="text"
                  value={provinsi}
                  onChange={(e) => setProvinsi(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Kode Pos
                </label>
                <input
                  type="text"
                  value={kodePos}
                  onChange={(e) => setKodePos(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Telepon Pelayanan Desa
                </label>
                <input
                  type="text"
                  value={teleponDesa}
                  onChange={(e) => setTeleponDesa(e.target.value)}
                  placeholder="021-89150001"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Resmi Desa
                </label>
                <input
                  type="email"
                  value={emailDesa}
                  onChange={(e) => setEmailDesa(e.target.value)}
                  placeholder="pemdes@karanghaur.desa.id"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={villageSaving}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>
                  {villageSaving
                    ? 'Menyimpan ke Supabase...'
                    : 'Simpan Profil & Identitas Desa'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ===================================================================== */}
      {/* MODAL TAMBAH / EDIT AKUN & PIN LOGIN                                  */}
      {/* ===================================================================== */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3.5 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 max-h-[90dvh] flex flex-col overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-3.5 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-sm font-extrabold">
                  {editingAccount
                    ? 'Edit Akun & PIN Login'
                    : 'Tambah Akun RT / RW / Dusun'}
                </h3>
                <p className="text-[10px] text-sky-100">
                  PIN digunakan wajib saat masuk ke aplikasi
                </p>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-bold"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={handleSaveAccount}
              className="p-4 flex-1 min-h-0 overflow-y-auto space-y-3 text-xs"
            >
              {accError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
                  {accError}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Jabatan / Role Akses <span className="text-rose-500">*</span>
                </label>
                <select
                  value={accRole}
                  onChange={(e) => setAccRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  <option value="rt">Ketua RT (Akses Spesifik RT)</option>
                  <option value="rw">Ketua RW (Akses Spesifik RW)</option>
                  <option value="kadus">Kepala Dusun (Akses Spesifik Dusun)</option>
                  <option value="admin">Administrator Desa (Akses Penuh)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama Lengkap Pejabat / Petugas <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={accFullName}
                  onChange={(e) => setAccFullName(e.target.value)}
                  placeholder="Contoh: Bpk. Kusnan (Ketua RT 001/001)"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-sky-500 outline-none"
                  required
                />
              </div>

              {accRole !== 'admin' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Batas Wilayah Tugas (RBAC)
                  </span>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Wilayah Dusun
                    </label>
                    <select
                      value={accDusun}
                      onChange={(e) => setAccDusun(e.target.value)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold outline-none"
                    >
                      <option value="Dusun I">Dusun I</option>
                      <option value="Dusun II">Dusun II</option>
                      <option value="Dusun III">Dusun III</option>
                      <option value="Dusun IV">Dusun IV</option>
                    </select>
                  </div>

                  {(accRole === 'rw' || accRole === 'rt') && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Nomor RW (3 Digit)
                        </label>
                        <input
                          type="text"
                          maxLength={3}
                          value={accRw}
                          onChange={(e) => setAccRw(e.target.value)}
                          placeholder="001"
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 outline-none"
                          required
                        />
                      </div>

                      {accRole === 'rt' && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Nomor RT (3 Digit)
                          </label>
                          <input
                            type="text"
                            maxLength={3}
                            value={accRt}
                            onChange={(e) => setAccRt(e.target.value)}
                            placeholder="001"
                            className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-slate-900 outline-none"
                            required
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    PIN Login Wajib <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={10}
                      value={accPin}
                      onChange={(e) => setAccPin(e.target.value)}
                      placeholder="Contoh: 123456"
                      className="w-full pl-8 pr-3 py-2 bg-sky-50 border border-sky-300 rounded-xl font-mono font-extrabold text-slate-900 tracking-wider focus:ring-2 focus:ring-sky-500 outline-none"
                      required
                    />
                    <KeyRound className="w-3.5 h-3.5 text-sky-600 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor HP / WhatsApp
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={accPhone}
                      onChange={(e) => setAccPhone(e.target.value)}
                      placeholder="0812-xxxx-xxxx"
                      className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={accSubmitting}
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-sm"
                >
                  {accSubmitting ? 'Menyimpan...' : 'Simpan Akun & PIN'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
