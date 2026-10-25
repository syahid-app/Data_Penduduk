'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/lib/context';
import { NoteModal } from '@/components/NoteModal';
import { AddKKModal } from '@/components/AddKKModal';
import { Citizen, GenderType, BpjsType, MaritalStatus } from '@/lib/types';
import { getCitizenMaritalStatus } from '@/lib/mockData';
import {
  ArrowLeft,
  FileSpreadsheet,
  QrCode,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Users,
  Zap,
  Droplet,
  HeartHandshake,
  MessageSquarePlus,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Edit3,
  Calendar,
  Briefcase,
  GraduationCap,
  Save,
  X,
  Trash2,
} from 'lucide-react';

export default function KKDetailPage() {
  const params = useParams();
  const router = useRouter();
  const {
    getFamilyById,
    getCitizensByFamilyId,
    visibleFamilies,
    currentProfile,
    addCitizen,
    deleteCitizen,
  } = useApp();

  const familyId = params.id as string;
  const family = getFamilyById(familyId);
  const members = getCitizensByFamilyId(familyId);

  // Security check: is this family in user's permitted boundary?
  const isPermitted = visibleFamilies.some((f) => f.id === familyId);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isEditKKOpen, setIsEditKKOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Add Member State
  const [nik, setNik] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [hubungan, setHubungan] = useState('Anak');
  const [statusPerkawinan, setStatusPerkawinan] = useState<MaritalStatus>('Belum Kawin');
  const [gender, setGender] = useState<GenderType>('L');
  const [tempatLahir, setTempatLahir] = useState('Bekasi');
  const [tanggalLahir, setTanggalLahir] = useState('2000-01-01');
  const [agama, setAgama] = useState('Islam');
  const [pendidikan, setPendidikan] = useState('SMA / Sederajat');
  const [pekerjaan, setPekerjaan] = useState('Belum / Tidak Bekerja');
  const [bpjs, setBpjs] = useState<BpjsType>('kis');
  const [disabilitas, setDisabilitas] = useState('tidak');
  const [isTki, setIsTki] = useState(false);
  const [aktaLahir, setAktaLahir] = useState(true);
  const [aktaNikah, setAktaNikah] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);

  const isAdmin = currentProfile?.role === 'admin';

  if (!family || !isPermitted) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center border border-slate-200 mt-4 shadow-sm">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-base font-bold text-slate-800">
          Akses Data Dibatasi (Batas Wilayah)
        </h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
          Kartu Keluarga ini tidak berada di dalam wilayah penugasan Anda. Berdasarkan aturan RBAC ketat Desa Karanghaur, data hanya dapat diakses oleh petugas wilayah bersangkutan.
        </p>
        <button
          onClick={() => router.push('/kk')}
          className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          Kembali ke Daftar KK Anda
        </button>
      </div>
    );
  }

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nik || nik.length !== 16) {
      setMemberError('NIK harus tepat 16 digit angka.');
      return;
    }
    if (!namaLengkap.trim()) {
      setMemberError('Nama lengkap warga wajib diisi.');
      return;
    }

    const res = await addCitizen({
      family_id: family.id,
      nik,
      nama_lengkap: namaLengkap.toUpperCase(),
      hubungan_keluarga: hubungan,
      status_perkawinan: statusPerkawinan,
      jenis_kelamin: gender,
      tempat_lahir: tempatLahir,
      tanggal_lahir: tanggalLahir,
      agama,
      pendidikan_terakhir: pendidikan,
      pekerjaan,
      bpjs_kesehatan: bpjs,
      disabilitas,
      status_tki: isTki,
      akta_kelahiran: aktaLahir,
      akta_nikah: aktaNikah,
    });

    if (res.success) {
      setIsAddMemberOpen(false);
      setNik('');
      setNamaLengkap('');
      setMemberError(null);
    } else {
      setMemberError(res.error || 'Gagal menambahkan anggota keluarga.');
    }
  };

  const calculateAge = (dateString: string) => {
    const birth = new Date(dateString);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/kk"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Kembali ke KK
        </Link>

        <div className="flex items-center space-x-1.5">
          {isAdmin ? (
            <button
              onClick={() => setIsEditKKOpen(true)}
              className="inline-flex items-center text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1.5 rounded-xl shadow-xs transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Edit KK
            </button>
          ) : (
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="inline-flex items-center text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 rounded-xl shadow-xs transition-all"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 mr-1" />
              Kirim Catatan
            </button>
          )}
        </div>
      </div>

      {/* Main Family Card Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
              KARTU KELUARGA DESA KARANGHAUR
            </span>
            <h1 className="text-base font-extrabold text-slate-900 mt-0.5 uppercase">
              {family.kepala_keluarga}
            </h1>
            <p className="font-mono text-xs font-bold text-slate-600 mt-0.5">
              NO KK: {family.no_kk}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            {family.status_barcode ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <QrCode className="w-3 h-3 mr-1" />
                Barcode Resmi
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Belum Barcode
              </span>
            )}

            {family.status_update ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Data Terverifikasi
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Perlu Update
              </span>
            )}
          </div>
        </div>

        {/* Info Grid: Alamat, Listrik, MCK, Bansos */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] text-slate-400 block font-semibold">Wilayah & Alamat</span>
            <div className="flex items-center text-slate-800 font-bold mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-orange-600 mr-1 flex-shrink-0" />
              <span>RT {family.rt} / RW {family.rw} • Rumah No. {family.no_rumah || (family.alamat.match(/No\.?\s*(\d+)/i)?.[1]) || '01'}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5 truncate">{family.dusun}</p>
            <p className="text-[11px] text-slate-600 italic mt-0.5">{family.alamat}</p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 block font-semibold">Fasilitas Rumah & Bansos</span>
            <div className="flex items-center text-slate-700 text-[11px]">
              <Zap className="w-3 h-3 text-amber-500 mr-1" />
              <span>PLN: {family.penerangan}</span>
            </div>
            <div className="flex items-center text-slate-700 text-[11px]">
              <Droplet className="w-3 h-3 text-sky-500 mr-1" />
              <span>MCK: {family.fasilitas_mck}</span>
            </div>
            <div className="flex items-center text-slate-700 text-[11px] font-bold">
              <HeartHandshake className="w-3 h-3 text-emerald-600 mr-1" />
              <span>Bansos: {family.bantuan_sosial.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member List Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-orange-600" />
            Daftar Anggota Keluarga ({members.length} Jiwa)
          </h2>
          <p className="text-[10px] text-slate-400">
            {isAdmin ? 'Otoritas Admin: Dapat menambah/menghapus anggota' : 'Otoritas Petugas: Read-only + Pengajuan Catatan'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="inline-flex items-center text-[11px] font-bold bg-orange-600 hover:bg-orange-700 text-white px-2 py-1 rounded-lg transition-colors"
          >
            <UserPlus className="w-3 h-3 mr-1" />
            Tambah Anggota
          </button>
        )}
      </div>

      {/* Members Cards / Detailed List */}
      <div className="space-y-2.5">
        {members.map((member, idx) => {
          const age = calculateAge(member.tanggal_lahir);
          const isKtp = age >= 17;
          const isLansia = age >= 60;
          const marital = getCitizenMaritalStatus(member);

          return (
            <div
              key={member.id}
              className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900">
                      {member.nama_lengkap}
                    </h3>
                    <span className="text-[10px] font-semibold text-slate-500">
                      ({member.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                    </span>
                  </div>

                  <p className="font-mono text-xs text-slate-600 mt-1 ml-6.5 font-bold">
                    NIK: {member.nik}
                  </p>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {member.hubungan_keluarga}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {marital}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        if (confirm(`Hapus anggota ${member.nama_lengkap} dari KK?`)) {
                          deleteCitizen(member.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                      title="Hapus Anggota"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Citizen Details Row */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
                <div className="space-y-0.5">
                  <div className="flex items-center text-slate-500">
                    <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                    <span>Lahir: {member.tempat_lahir}, {member.tanggal_lahir}</span>
                  </div>
                  <div className="text-slate-700 font-medium">
                    Usia: <strong className="text-slate-900">{age} Tahun</strong> {isKtp && <span className="text-emerald-600 font-bold">(Wajib KTP)</span>} {isLansia && <span className="text-amber-600 font-bold">(Lansia)</span>}
                  </div>
                  <div>Agama: {member.agama}</div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center text-slate-500">
                    <GraduationCap className="w-3 h-3 mr-1 text-slate-400" />
                    <span className="truncate">Pendidikan: {member.pendidikan_terakhir}</span>
                  </div>
                  <div className="flex items-center text-slate-500">
                    <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
                    <span className="truncate">Pekerjaan: {member.pekerjaan}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                      member.bpjs_kesehatan === 'kis'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : member.bpjs_kesehatan === 'mandiri'
                        ? 'bg-blue-100 text-blue-800 border-blue-200'
                        : 'bg-rose-100 text-rose-700 border-rose-200'
                    }`}>
                      BPJS {member.bpjs_kesehatan.toUpperCase()}
                    </span>
                    {member.status_tki && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        TKI Aktif
                      </span>
                    )}
                    {member.disabilitas !== 'tidak' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-200">
                        Disabilitas
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Member Modal (Admin Only) */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Tambah Anggota Keluarga
                  </h3>
                  <p className="text-xs text-slate-500">KK: {family.no_kk}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {memberError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {memberError}
              </div>
            )}

            <form onSubmit={handleAddMemberSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Induk Kependudukan (NIK 16 Digit)
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={nik}
                  onChange={(e) => setNik(e.target.value.replace(/\D/g, ''))}
                  placeholder="321608..."
                  className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="NAMA LENGKAP WARGA"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hubungan</label>
                  <select
                    value={hubungan}
                    onChange={(e) => setHubungan(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  >
                    <option value="Kepala Keluarga">Kepala Keluarga</option>
                    <option value="Istri">Istri</option>
                    <option value="Anak">Anak</option>
                    <option value="Orang Tua">Orang Tua</option>
                    <option value="Mertua">Mertua</option>
                    <option value="Famili Lain">Famili Lain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jenis Kelamin</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as GenderType)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  >
                    <option value="L">Laki-Laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status Perkawinan</label>
                <select
                  value={statusPerkawinan}
                  onChange={(e) => setStatusPerkawinan(e.target.value as MaritalStatus)}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                >
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={tempatLahir}
                    onChange={(e) => setTempatLahir(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={tanggalLahir}
                    onChange={(e) => setTanggalLahir(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pendidikan</label>
                  <select
                    value={pendidikan}
                    onChange={(e) => setPendidikan(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  >
                    <option value="Belum / Tidak Sekolah">Belum / Tidak Sekolah</option>
                    <option value="SD / Sederajat">SD / Sederajat</option>
                    <option value="SMP / Sederajat">SMP / Sederajat</option>
                    <option value="SMA / Sederajat">SMA / Sederajat</option>
                    <option value="Diploma (D1-D3)">Diploma (D1-D3)</option>
                    <option value="Sarjana (S1)">Sarjana (S1)</option>
                    <option value="Magister (S2)">Magister (S2)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pekerjaan</label>
                  <input
                    type="text"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">BPJS Kesehatan</label>
                  <select
                    value={bpjs}
                    onChange={(e) => setBpjs(e.target.value as BpjsType)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  >
                    <option value="kis">BPJS KIS / PBI</option>
                    <option value="mandiri">BPJS Mandiri</option>
                    <option value="tidak">Tidak Memiliki BPJS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status TKI</label>
                  <select
                    value={isTki ? 'true' : 'false'}
                    onChange={(e) => setIsTki(e.target.value === 'true')}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 outline-none"
                  >
                    <option value="false">Bukan TKI</option>
                    <option value="true">TKI di Luar Negeri</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-orange-600 text-white text-xs font-bold flex items-center justify-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Warga</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Modal for RT/RW/Kadus */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        initialFamily={family}
      />

      {/* Edit KK Modal (Admin) */}
      {isAdmin && (
        <AddKKModal
          isOpen={isEditKKOpen}
          onClose={() => setIsEditKKOpen(false)}
          editFamily={family}
        />
      )}
    </div>
  );
}
