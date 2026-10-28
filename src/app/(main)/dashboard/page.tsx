'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';
import { StatCard } from '@/components/StatCard';
import { QuickActionBar } from '@/components/QuickActionBar';
import { KKCard } from '@/components/KKCard';
import { NoteModal } from '@/components/NoteModal';
import { AddKKModal } from '@/components/AddKKModal';
import { Family } from '@/lib/types';
import {
  FileSpreadsheet,
  Users,
  Home,
  MessageSquareWarning,
  ArrowRight,
  TrendingUp,
  Building,
  HeartHandshake,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { currentProfile, visibleFamilies, visibleNotes, stats } = useApp();

  const [selectedFamilyForNote, setSelectedFamilyForNote] = useState<Family | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAddKKModalOpen, setIsAddKKModalOpen] = useState(false);

  const isAdmin = currentProfile?.role === 'admin';

  const handleOpenNote = (family?: Family) => {
    setSelectedFamilyForNote(family || null);
    setIsNoteModalOpen(true);
  };

  const pendingNotes = visibleNotes.filter((n) => n.status === 'pending');
  const kkBarcodeCount = visibleFamilies.filter((f) => f.status_barcode).length;
  const plnMeteranCount = visibleFamilies.filter(
    (f) => f.penerangan === 'meteran'
  ).length;
  const mckSendiriCount = visibleFamilies.filter(
    (f) => f.fasilitas_mck === 'sendiri'
  ).length;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ===================================================================== */}
      {/* FIXED TOP HEAD BAR (Wilayah Otoritas - Tidak ikut scrolling)          */}
      {/* ===================================================================== */}
      <div className="flex-shrink-0 px-3.5 sm:px-5 pt-2.5 pb-2 bg-slate-50 border-b border-slate-200/80 z-10">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 rounded-xl p-3 text-white shadow-sm flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 text-blue-100 text-[10px] font-semibold">
              <Building className="w-3 h-3 flex-shrink-0" />
              <span>Wilayah Otoritas Aktif:</span>
            </div>
            <h2 className="text-xs sm:text-sm font-extrabold text-white mt-0.5 leading-snug break-words">
              {currentProfile?.role === 'admin' && 'Pemerintah Desa Karanghaur (Seluruh Wilayah)'}
              {currentProfile?.role === 'kadus' && `Wilayah ${currentProfile.assigned_dusun}`}
              {currentProfile?.role === 'rw' && `Wilayah RW ${currentProfile.assigned_rw} - ${currentProfile.assigned_dusun}`}
              {currentProfile?.role === 'rt' && `Wilayah RT ${currentProfile.assigned_rt} / RW ${currentProfile.assigned_rw}`}
            </h2>
          </div>

          <div className="px-2.5 py-1.5 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 text-white font-black text-xs border border-white/30">
            {currentProfile?.role?.toUpperCase()}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SCROLLABLE PAGE CONTENT (Hanya isi halaman yang ikut scrolling)       */}
      {/* ===================================================================== */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 sm:px-5 py-3 pb-20 space-y-3.5">
        {/* 1. DASHBOARD CARDS (GRID 2x2 REAL-TIME DATABASE) */}
        <div>
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              Ringkasan Statistik Wilayah
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">● Sinkron Real-time</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <StatCard
              title="Total KK"
              value={stats.totalKK}
              subtitle={`${kkBarcodeCount} Barcode • ${stats.totalKK - kkBarcodeCount} Belum`}
              icon={FileSpreadsheet}
              colorScheme="blue"
              onClick={() => router.push('/kk')}
              badge="Dukcapil"
            />

            <StatCard
              title="Total Penduduk"
              value={stats.totalJiwa}
              subtitle={`${stats.lakiLaki.toLocaleString('id-ID')} L • ${stats.perempuan.toLocaleString('id-ID')} P`}
              icon={Users}
              colorScheme="blue"
              onClick={() => router.push('/warga')}
            />

            <StatCard
              title="Jumlah Rumah"
              value={stats.totalRumah}
              subtitle={`PLN: ${plnMeteranCount} • MCK: ${mckSendiriCount}`}
              icon={Home}
              colorScheme="emerald"
              onClick={() => router.push('/kk')}
            />

            <StatCard
              title="Catatan / Laporan"
              value={stats.pendingNotes}
              subtitle={stats.pendingNotes > 0 ? 'Menunggu Verifikasi' : 'Semua Tervalidasi'}
              icon={MessageSquareWarning}
              colorScheme="amber"
              onClick={() => router.push('/catatan')}
              badge={stats.pendingNotes > 0 ? `${stats.pendingNotes} Baru` : undefined}
            />
          </div>
        </div>

        {/* 2. QUICK ACTION BAR */}
        <QuickActionBar
          onOpenNoteModal={() => handleOpenNote()}
          isAdmin={isAdmin}
          onOpenAddKKModal={() => setIsAddKKModalOpen(true)}
        />

        {/* 3. METRIK SOSIAL & KESEJAHTERAAN (REAL-TIME BREAKDOWN) */}
        <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <HeartHandshake className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-800">
                Jaminan Kesehatan & Bansos Wilayah
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">SIP-KPM</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100">
              <span className="block text-[10px] font-semibold text-emerald-800">BPJS KIS / PBI</span>
              <span className="text-sm font-extrabold text-emerald-700">
                {stats.bpjsKis.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
              <span className="block text-[10px] font-semibold text-blue-800">BPJS Mandiri</span>
              <span className="text-sm font-extrabold text-blue-700">
                {stats.bpjsMandiri.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[10px] font-semibold text-slate-600">Disabilitas / TKI</span>
              <span className="text-sm font-extrabold text-slate-700">
                {stats.disabilitas} / {stats.tki}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600 flex-wrap gap-1">
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                BPNT: {stats.bansosBpnt} KK
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                PKH: {stats.bansosPkh} KK
              </span>
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                KIP: {stats.bansosKip} KK
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                BLT: {stats.bansosBlt} KK
              </span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">
              Tanpa BPJS: {stats.bpjsNone} Jiwa
            </span>
          </div>
        </div>

        {/* 4. DAFTAR KARTU KELUARGA TERBARU */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div>
              <h3 className="text-xs font-bold text-slate-800">
                Daftar Kartu Keluarga ({visibleFamilies.length})
              </h3>
              <p className="text-[10px] text-slate-400">
                Menampilkan KK terdaftar di wilayah Anda
              </p>
            </div>
            <Link
              href="/kk"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
            >
              <span>Semua KK</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {visibleFamilies.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-slate-200 text-xs text-slate-400">
              Tidak ada Kartu Keluarga terdaftar di wilayah penugasan ini.
            </div>
          ) : (
            <div className="space-y-2.5">
              {visibleFamilies.slice(0, 3).map((family) => (
                <KKCard
                  key={family.id}
                  family={family}
                  onOpenNoteModal={handleOpenNote}
                />
              ))}
            </div>
          )}
        </div>

        {/* 5. CATATAN & LAPORAN TERAKHIR */}
        {pendingNotes.length > 0 && (
          <div className="bg-amber-50/90 rounded-xl p-3.5 border border-amber-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-900">
                  Catatan Wilayah Butuh Verifikasi ({pendingNotes.length})
                </span>
              </div>
              <Link
                href="/catatan"
                className="text-[11px] font-bold text-amber-800 hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="space-y-1.5">
              {pendingNotes.slice(0, 2).map((n) => (
                <div
                  key={n.id}
                  className="p-2 rounded-lg bg-white border border-amber-200 text-xs"
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                    <span className="font-bold text-slate-700">
                      {n.citizen_name ? `Warga: ${n.citizen_name}` : `KK: ${n.family_no_kk || '-'}`}
                    </span>
                    <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                      RT {n.rt} / RW {n.rw}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs leading-snug break-words">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
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
