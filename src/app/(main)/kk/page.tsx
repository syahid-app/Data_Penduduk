'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { KKCard } from '@/components/KKCard';
import { NoteModal } from '@/components/NoteModal';
import { AddKKModal } from '@/components/AddKKModal';
import { Family } from '@/lib/types';
import {
  Search,
  Filter,
  PlusCircle,
  FileSpreadsheet,
  AlertCircle,
  QrCode,
  HeartHandshake,
  MapPin,
  CheckCircle,
} from 'lucide-react';

export default function KKListPage() {
  const { visibleFamilies, currentProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'barcode' | 'non-barcode' | 'update' | 'bansos'>('all');
  const [rtFilter, setRtFilter] = useState<string>('all');
  const [selectedFamilyForNote, setSelectedFamilyForNote] = useState<Family | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAddKKModalOpen, setIsAddKKModalOpen] = useState(false);

  const isAdmin = currentProfile?.role === 'admin';

  // Available RTs within visible scope
  const availableRts = useMemo(() => {
    const set = new Set<string>();
    visibleFamilies.forEach((f) => set.add(f.rt));
    return Array.from(set).sort();
  }, [visibleFamilies]);

  // Filtered families based on search, status filter, and RT filter
  const filteredFamilies = useMemo(() => {
    return visibleFamilies.filter((fam) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !searchQuery ||
        fam.no_kk.toLowerCase().includes(q) ||
        fam.kepala_keluarga.toLowerCase().includes(q) ||
        fam.alamat.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Status pill filter
      if (activeFilter === 'barcode' && !fam.status_barcode) return false;
      if (activeFilter === 'non-barcode' && fam.status_barcode) return false;
      if (activeFilter === 'update' && fam.status_update) return false;
      if (activeFilter === 'bansos' && fam.bantuan_sosial === 'none') return false;

      // RT filter
      if (rtFilter !== 'all' && fam.rt !== rtFilter) return false;

      return true;
    });
  }, [visibleFamilies, searchQuery, activeFilter, rtFilter]);

  return (
    <div className="space-y-3.5 animate-fade-in">
      {/* Top Header & Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
            <FileSpreadsheet className="w-5 h-5 text-orange-600" />
            Data Kartu Keluarga (KK)
          </h1>
          <p className="text-[11px] text-slate-500">
            {visibleFamilies.length} KK di wilayah{' '}
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
            className="inline-flex items-center text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white px-2.5 py-1.5 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4 mr-1" />
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

      {/* Filter Pills (Shopee Seller Horizontal Scroll) */}
      <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
            activeFilter === 'all'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-orange-300'
          }`}
        >
          Semua ({visibleFamilies.length})
        </button>

        <button
          onClick={() => setActiveFilter('barcode')}
          className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeFilter === 'barcode'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
          }`}
        >
          <QrCode className="w-3 h-3" />
          Barcode
        </button>

        <button
          onClick={() => setActiveFilter('non-barcode')}
          className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeFilter === 'non-barcode'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-rose-300'
          }`}
        >
          <AlertCircle className="w-3 h-3" />
          Non-Barcode
        </button>

        <button
          onClick={() => setActiveFilter('update')}
          className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeFilter === 'update'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300'
          }`}
        >
          Perlu Update
        </button>

        <button
          onClick={() => setActiveFilter('bansos')}
          className={`px-2.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
            activeFilter === 'bansos'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
          }`}
        >
          <HeartHandshake className="w-3 h-3" />
          KPM Bansos
        </button>
      </div>

      {/* RT Sub-filter (for Admin, Kadus, or RW) */}
      {availableRts.length > 1 && (
        <div className="flex items-center space-x-2 text-xs bg-slate-100 p-2 rounded-xl">
          <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          <span className="font-semibold text-slate-700">Filter RT:</span>
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setRtFilter('all')}
              className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                rtFilter === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              Semua RT
            </button>
            {availableRts.map((rt) => (
              <button
                key={rt}
                onClick={() => setRtFilter(rt)}
                className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                  rtFilter === rt
                    ? 'bg-orange-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                RT {rt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* List Kartu Keluarga */}
      <div className="space-y-3 pt-1">
        {filteredFamilies.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-xs">
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
