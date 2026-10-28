'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context';
import { KKCard } from '@/components/KKCard';
import { NoteModal } from '@/components/NoteModal';
import { AddKKModal } from '@/components/AddKKModal';
import { Family } from '@/lib/types';
import {
  Search,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  QrCode,
  HeartHandshake,
  MapPin,
} from 'lucide-react';

function KKListContent() {
  const searchParams = useSearchParams();
  const { visibleFamilies, currentProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'barcode' | 'non-barcode' | 'update' | 'bansos'>('all');
  const [rtFilter, setRtFilter] = useState<string>('all');
  const [selectedFamilyForNote, setSelectedFamilyForNote] = useState<Family | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAddKKModalOpen, setIsAddKKModalOpen] = useState(false);

  const isAdmin = currentProfile?.role === 'admin';

  // Sync URL query params (?filter=bansos, etc.)
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (
      filterParam === 'bansos' ||
      filterParam === 'barcode' ||
      filterParam === 'non-barcode' ||
      filterParam === 'update'
    ) {
      setActiveFilter(filterParam);
    }
  }, [searchParams]);

  // Available RTs within visible scope
  const availableRts = useMemo(() => {
    const set = new Set<string>();
    visibleFamilies.forEach((f) => set.add(f.rt));
    return Array.from(set).sort();
  }, [visibleFamilies]);

  // Filtered families based on search, status filter, and RT filter
  const filteredFamilies = useMemo(() => {
    return visibleFamilies.filter((fam) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        fam.no_kk.toLowerCase().includes(q) ||
        fam.kepala_keluarga.toLowerCase().includes(q) ||
        fam.alamat.toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (activeFilter === 'barcode' && !fam.status_barcode) return false;
      if (activeFilter === 'non-barcode' && fam.status_barcode) return false;
      if (activeFilter === 'update' && fam.status_update) return false;
      if (activeFilter === 'bansos' && fam.bantuan_sosial === 'none') return false;

      if (rtFilter !== 'all' && fam.rt !== rtFilter) return false;

      return true;
    });
  }, [visibleFamilies, searchQuery, activeFilter, rtFilter]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ===================================================================== */}
      {/* FIXED TOP HEAD BAR (Judul, Pencarian, & Filter - Tidak ikut scroll)   */}
      {/* ===================================================================== */}
      <div className="flex-shrink-0 px-3.5 sm:px-5 pt-2.5 pb-2.5 bg-slate-50 border-b border-slate-200/80 z-10 space-y-2">
        {/* Title & Add KK */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-orange-600" />
              <span>Data Kartu Keluarga ({filteredFamilies.length}/{visibleFamilies.length})</span>
            </h1>
            <p className="text-[10px] text-slate-500">
              Wilayah:{' '}
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

          {isAdmin && (
            <button
              onClick={() => setIsAddKKModalOpen(true)}
              className="inline-flex items-center text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 rounded-xl shadow-sm transition-all active:scale-95 flex-shrink-0"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Tambah KK
            </button>
          )}
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari No. KK, Nama Kepala Keluarga, Alamat..."
            className="w-full pl-8 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none shadow-sm"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="w-4 h-4 text-slate-400 hover:text-slate-600 absolute right-2.5 top-2 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills + RT Sub-filter */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
              activeFilter === 'all'
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
            }`}
          >
            Semua ({visibleFamilies.length})
          </button>

          <button
            onClick={() => setActiveFilter('barcode')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeFilter === 'barcode'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
            }`}
          >
            <QrCode className="w-3 h-3" />
            Barcode
          </button>

          <button
            onClick={() => setActiveFilter('non-barcode')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeFilter === 'non-barcode'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-300'
            }`}
          >
            <AlertCircle className="w-3 h-3" />
            Non-Barcode
          </button>

          <button
            onClick={() => setActiveFilter('update')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeFilter === 'update'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300'
            }`}
          >
            Perlu Update
          </button>

          <button
            onClick={() => setActiveFilter('bansos')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              activeFilter === 'bansos'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            <HeartHandshake className="w-3 h-3" />
            KPM Bansos
          </button>

          {availableRts.length > 1 && (
            <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
              <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <select
                value={rtFilter}
                onChange={(e) => setRtFilter(e.target.value)}
                className="py-1 px-2 rounded-full text-[11px] font-bold bg-white border border-slate-200 text-slate-700 outline-none"
              >
                <option value="all">Semua RT</option>
                {availableRts.map((rt) => (
                  <option key={rt} value={rt}>
                    RT {rt}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SCROLLABLE KK LIST AREA (Hanya daftar KK yang ikut scrolling)         */}
      {/* ===================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 sm:px-5 py-3 pb-20 space-y-2.5">
        {filteredFamilies.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">Tidak ada KK yang cocok</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Cobalah ubah kata kunci pencarian atau sesuaikan filter wilayah di atas.
            </p>
          </div>
        ) : (
          filteredFamilies.map((family) => (
            <KKCard
              key={family.id}
              family={family}
              onOpenNoteModal={(fam) => {
                setSelectedFamilyForNote(fam);
                setIsNoteModalOpen(true);
              }}
            />
          ))
        )}
      </div>

      {/* Modals */}
      <NoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        initialFamily={selectedFamilyForNote}
      />

      {isAdmin && (
        <AddKKModal
          isOpen={isAddKKModalOpen}
          onClose={() => setIsAddKKModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function KKListPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-400">
          Memuat data Kartu Keluarga...
        </div>
      }
    >
      <KKListContent />
    </Suspense>
  );
}
