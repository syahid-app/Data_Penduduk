'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context';
import { Citizen, MaritalStatus } from '@/lib/types';
import { getCitizenMaritalStatus, getFamilyHouseNumber } from '@/lib/mockData';
import { NoteModal } from '@/components/NoteModal';
import {
  Users,
  Search,
  Calendar,
  Briefcase,
  MapPin,
  MessageSquarePlus,
  FileText,
  Home,
  Heart,
  Filter,
  X,
  RotateCcw,
  Building,
} from 'lucide-react';

function WargaListContent() {
  const searchParams = useSearchParams();

  const { visibleCitizens, visibleFamilies, getFamilyById, currentProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  
  // 3 Primary Filters requested by user:
  // 1. Status Perkawinan
  const [maritalFilter, setMaritalFilter] = useState<'all' | MaritalStatus>('all');
  // 2. Kartu Keluarga
  const [familyFilter, setFamilyFilter] = useState<string>('all');
  // 3. Nomor Rumah
  const [houseFilter, setHouseFilter] = useState<string>('all');

  const [selectedCitizen, setSelectedCitizen] = useState<Citizen | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);

  // Available unique house numbers within visible scope
  const availableHouseNumbers = useMemo(() => {
    const set = new Set<string>();
    visibleFamilies.forEach((f) => {
      const num = getFamilyHouseNumber(f);
      if (num && num !== '-') set.add(num);
    });
    return Array.from(set).sort((a, b) => {
      const numA = parseInt(a, 10);
      const numB = parseInt(b, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [visibleFamilies]);

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

  // Filter logic
  const filteredCitizens = useMemo(() => {
    return visibleCitizens.filter((c) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        c.nik.toLowerCase().includes(q) ||
        c.nama_lengkap.toLowerCase().includes(q) ||
        c.pekerjaan.toLowerCase().includes(q);

      if (!matchSearch) return false;

      const family = getFamilyById(c.family_id);
      const maritalStatus = getCitizenMaritalStatus(c);
      const houseNumber = getFamilyHouseNumber(family);

      // 2. Filter Status Perkawinan
      if (maritalFilter !== 'all' && maritalStatus !== maritalFilter) {
        return false;
      }

      // 3. Filter Kartu Keluarga
      if (familyFilter !== 'all' && c.family_id !== familyFilter) {
        return false;
      }

      // 4. Filter Nomor Rumah
      if (houseFilter !== 'all' && houseNumber !== houseFilter) {
        return false;
      }

      return true;
    });
  }, [visibleCitizens, searchQuery, maritalFilter, familyFilter, houseFilter, getFamilyById]);

  // Counts for marital status tabs
  const maritalCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Belum Kawin': 0,
      'Kawin': 0,
      'Cerai Hidup': 0,
      'Cerai Mati': 0,
    };
    visibleCitizens.forEach((c) => {
      const s = getCitizenMaritalStatus(c);
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [visibleCitizens]);

  const isAnyFilterActive =
    maritalFilter !== 'all' || familyFilter !== 'all' || houseFilter !== 'all' || searchQuery !== '';

  const handleResetFilters = () => {
    setMaritalFilter('all');
    setFamilyFilter('all');
    setHouseFilter('all');
    setSearchQuery('');
  };

  const getMaritalBadgeStyle = (status: MaritalStatus) => {
    switch (status) {
      case 'Kawin':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Belum Kawin':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Cerai Hidup':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Cerai Mati':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Title Header */}
      <div>
        <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
          <Users className="w-5 h-5 text-orange-600" />
          Data Warga & NIK Terdaftar
        </h1>
        <p className="text-[11px] text-slate-500">
          {visibleCitizens.length} Jiwa penduduk di wilayah penugasan{' '}
          <strong className="text-slate-800">
            {currentProfile?.role === 'admin'
              ? 'Seluruh Desa Karanghaur'
              : currentProfile?.role === 'kadus'
              ? currentProfile.assigned_dusun
              : currentProfile?.role === 'rw'
              ? `RW ${currentProfile.assigned_rw}`
              : `RT ${currentProfile?.assigned_rt} / RW ${currentProfile?.assigned_rw}`}
          </strong>
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari NIK 16 digit, Nama Warga, atau Pekerjaan..."
          className="w-full pl-9 pr-8 py-2.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="w-4 h-4 text-slate-400 hover:text-slate-600 absolute right-3 top-3 text-xs font-bold"
          >
            ✕
          </button>
        )}
      </div>

      {/* FILTER 1: STATUS PERKAWINAN PILLS */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            Filter Status Perkawinan:
          </span>
          {isAnyFilterActive && (
            <button
              onClick={handleResetFilters}
              className="text-[10px] text-orange-600 font-bold hover:underline flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" />
              Reset Filter
            </button>
          )}
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setMaritalFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              maritalFilter === 'all'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            Semua Status ({visibleCitizens.length})
          </button>

          <button
            onClick={() => setMaritalFilter('Belum Kawin')}
            className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              maritalFilter === 'Belum Kawin'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300'
            }`}
          >
            Belum Kawin ({maritalCounts['Belum Kawin']})
          </button>

          <button
            onClick={() => setMaritalFilter('Kawin')}
            className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              maritalFilter === 'Kawin'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            Kawin ({maritalCounts['Kawin']})
          </button>

          <button
            onClick={() => setMaritalFilter('Cerai Hidup')}
            className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              maritalFilter === 'Cerai Hidup'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300'
            }`}
          >
            Cerai Hidup ({maritalCounts['Cerai Hidup']})
          </button>

          <button
            onClick={() => setMaritalFilter('Cerai Mati')}
            className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              maritalFilter === 'Cerai Mati'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            Cerai Mati ({maritalCounts['Cerai Mati']})
          </button>
        </div>
      </div>

      {/* FILTER 2 & 3: KARTU KELUARGA & NOMOR RUMAH DROPDOWNS */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-2.5 rounded-xl border border-slate-200/80">
        {/* Filter Kartu Keluarga */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <FileText className="w-3 h-3 text-orange-600" />
            Kartu Keluarga (KK):
          </label>
          <select
            value={familyFilter}
            onChange={(e) => setFamilyFilter(e.target.value)}
            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-1 focus:ring-orange-500 font-medium"
          >
            <option value="all">Semua KK ({visibleFamilies.length})</option>
            {visibleFamilies.map((f) => (
              <option key={f.id} value={f.id}>
                {f.kepala_keluarga} ({f.no_kk.slice(-4)})
              </option>
            ))}
          </select>
        </div>

        {/* Filter Nomor Rumah */}
        <div>
          <label className="block text-[10px] font-bold text-slate-700 mb-1 flex items-center gap-1">
            <Home className="w-3 h-3 text-blue-600" />
            Nomor Rumah:
          </label>
          <select
            value={houseFilter}
            onChange={(e) => setHouseFilter(e.target.value)}
            className="w-full p-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 outline-none focus:ring-1 focus:ring-orange-500 font-medium"
          >
            <option value="all">Semua Rumah ({availableHouseNumbers.length})</option>
            {availableHouseNumbers.map((no) => (
              <option key={no} value={no}>
                Rumah No. {no}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result stats summary */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
        <span>
          Menampilkan <strong className="text-slate-800">{filteredCitizens.length}</strong> warga
        </span>
        {isAnyFilterActive && (
          <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">
            Filter Terpasang
          </span>
        )}
      </div>

      {/* Citizen Cards Stream */}
      <div className="space-y-2.5 pt-0.5">
        {filteredCitizens.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Warga tidak ditemukan</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Tidak ada data warga yang cocok dengan kombinasi filter Kartu Keluarga, Nomor Rumah, atau Status Perkawinan yang dipilih.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-3 px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-orange-700"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          filteredCitizens.map((citizen) => {
            const family = getFamilyById(citizen.family_id);
            const age = calculateAge(citizen.tanggal_lahir);
            const maritalStatus = getCitizenMaritalStatus(citizen);
            const houseNumber = getFamilyHouseNumber(family);

            return (
              <div
                key={citizen.id}
                className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-xs font-bold text-slate-900 uppercase">
                          {citizen.nama_lengkap}
                        </h3>
                        <span className="text-[10px] font-semibold text-slate-500">
                          ({citizen.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'})
                        </span>
                      </div>
                      <p className="font-mono text-xs font-bold text-slate-700 mt-0.5">
                        NIK: {citizen.nik}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                        {citizen.hubungan_keluarga}
                      </span>
                      {/* Status Perkawinan Badge */}
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getMaritalBadgeStyle(
                          maritalStatus
                        )}`}
                      >
                        {maritalStatus}
                      </span>
                    </div>
                  </div>

                  {/* Citizen Address, Nomor Rumah & KK Details */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="flex items-center text-slate-700 font-semibold truncate">
                      <Home className="w-3.5 h-3.5 mr-1 text-blue-600 flex-shrink-0" />
                      <span>Rumah No. {houseNumber}</span>
                    </div>

                    <div className="flex items-center text-slate-600 truncate">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 flex-shrink-0" />
                      <span className="truncate">
                        RT {family?.rt || '-'}/RW {family?.rw || '-'} • {family?.dusun || '-'}
                      </span>
                    </div>

                    <div className="flex items-center text-slate-600 col-span-2 truncate">
                      <FileText className="w-3.5 h-3.5 mr-1 text-orange-600 flex-shrink-0" />
                      <span className="truncate font-mono">
                        KK: {family?.no_kk || '-'} ({family?.kepala_keluarga || '-'})
                      </span>
                    </div>
                  </div>

                  {/* Citizen Meta Info */}
                  <div className="flex items-center flex-wrap gap-1.5 mt-2 text-[11px] text-slate-500">
                    <span className="flex items-center text-slate-700 font-medium">
                      <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                      {age} Tahun ({citizen.tanggal_lahir})
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[130px]">{citizen.pekerjaan}</span>
                    <span>•</span>
                    <span>{citizen.agama}</span>
                  </div>
                </div>

                {/* Bottom Row with Actions */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    <span>Lahir: {citizen.tempat_lahir}</span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {family && (
                      <Link
                        href={`/kk/${family.id}`}
                        className="text-[11px] font-semibold text-slate-600 hover:text-orange-600 bg-slate-100 hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                        title="Buka Kartu Keluarga"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Lihat KK</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        setSelectedCitizen(citizen);
                        setIsNoteModalOpen(true);
                      }}
                      className="text-[11px] font-semibold text-orange-600 hover:text-white bg-orange-50 hover:bg-orange-600 px-2 py-1 rounded-lg transition-all flex items-center gap-1 border border-orange-200 hover:border-orange-600"
                      title="Laporkan Catatan Perubahan Warga"
                    >
                      <MessageSquarePlus className="w-3 h-3" />
                      <span>Catat</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Note Modal */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => {
          setIsNoteModalOpen(false);
          setSelectedCitizen(null);
        }}
        initialCitizen={selectedCitizen}
        initialFamily={selectedCitizen ? getFamilyById(selectedCitizen.family_id) : null}
      />
    </div>
  );
}

export default function WargaListPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Memuat data warga...
        </div>
      }
    >
      <WargaListContent />
    </Suspense>
  );
}
