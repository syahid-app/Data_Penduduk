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
  IdCard,
  MessageSquareWarning,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Building,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { currentProfile, visibleFamilies, visibleCitizens, visibleNotes, stats } = useApp();

  const [selectedFamilyForNote, setSelectedFamilyForNote] = useState<Family | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAddKKModalOpen, setIsAddKKModalOpen] = useState(false);

  const isAdmin = currentProfile?.role === 'admin';

  const handleOpenNote = (family?: Family) => {
    setSelectedFamilyForNote(family || null);
    setIsNoteModalOpen(true);
  };

  const pendingNotes = visibleNotes.filter((n) => n.status === 'pending');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Wilayah Banner Info */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-3.5 text-white shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1.5 text-orange-100 text-[11px] font-semibold">
            <Building className="w-3.5 h-3.5" />
            <span>Wilayah Otoritas Anda:</span>
          </div>
          <h2 className="text-sm font-extrabold text-white mt-0.5">
            {currentProfile?.role === 'admin' && 'Pemerintah Desa Karanghaur'}
            {currentProfile?.role === 'kadus' && `Wilayah ${currentProfile.assigned_dusun}`}
            {currentProfile?.role === 'rw' && `Wilayah RW ${currentProfile.assigned_rw} - ${currentProfile.assigned_dusun}`}
            {currentProfile?.role === 'rt' && `Wilayah RT ${currentProfile.assigned_rt} / RW ${currentProfile.assigned_rw}`}
          </h2>
          <p className="text-[11px] text-orange-100/90 mt-0.5">
            {currentProfile?.role === 'admin'
              ? 'Menampilkan rekapitulasi data 3 Dusun & seluruh RW/RT'
              : `Menampilkan hanya KK dan Warga terdaftar di wilayah penugasan`}
          </p>
        </div>

        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0 text-white font-black text-sm border border-white/30">
          {currentProfile?.role?.toUpperCase()}
        </div>
      </div>

      {/* 2. DASHBOARD CARDS (GRID 2x2 ALA TOKO SHOPEE) */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
            Ringkasan Statistik Wilayah
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Real-time DB</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Kartu 1: Total KK */}
          <StatCard
            title="Total KK"
            value={stats.totalKK}
            subtitle={`${stats.totalRumah} Bangunan Fisik`}
            icon={FileSpreadsheet}
            colorScheme="orange"
            onClick={() => router.push('/kk')}
            badge="Dukcapil"
          />

          {/* Kartu 2: Total Penduduk (L / P) */}
          <StatCard
            title="Total Penduduk"
            value={stats.totalJiwa}
            subtitle={`${stats.lakiLaki.toLocaleString('id-ID')} L • ${stats.perempuan.toLocaleString('id-ID')} P`}
            icon={Users}
            colorScheme="blue"
            onClick={() => router.push('/warga')}
          />

          {/* Kartu 3: Wajib KTP (17+) / Lansia */}
          <StatCard
            title="Wajib KTP (17+)"
            value={stats.wajibKtp}
            subtitle={`${stats.lansia} Jiwa Lansia (60+)`}
            icon={IdCard}
            colorScheme="emerald"
            onClick={() => router.push('/warga')}
          />

          {/* Kartu 4: Laporan Catatan (pending verifikasi) */}
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

      {/* 3. QUICK ACTION BAR */}
      <QuickActionBar
        onOpenNoteModal={() => handleOpenNote()}
        isAdmin={isAdmin}
        onOpenAddKKModal={() => setIsAddKKModalOpen(true)}
      />

      {/* 4. METRIK SOSIAL & KESEJAHTERAAN (Official Karanghaur Verified Breakdown) */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center space-x-1.5">
            <HeartHandshake className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-bold text-slate-800">
              Jaminan Kesehatan & Bansos Wilayah
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">SIP-KPM</span>
        </div>

        {/* BPJS metrics */}
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
            <span className="block text-[10px] font-semibold text-slate-600">Disabilitas & TKI</span>
            <span className="text-sm font-extrabold text-slate-700">
              {stats.disabilitas} / {stats.tki}
            </span>
          </div>
        </div>

        {/* Bansos KPM Pills */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-600">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px]">
              BPNT: {stats.bansosBpnt}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              PKH: {stats.bansosPkh}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
              KIP: {stats.bansosKip}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-500">
            BLT: {stats.bansosBlt}
          </span>
        </div>
      </div>

      {/* 5. DAFTAR KARTU KELUARGA TERBARU (Sesuai Batas Wilayah) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold text-slate-800">
              Daftar Kartu Keluarga ({visibleFamilies.length})
            </h3>
            <p className="text-[10px] text-slate-400">
              Hanya menampilkan KK di wilayah Anda
            </p>
          </div>
          <Link
            href="/kk"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
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

      {/* 6. CATATAN & LAPORAN TERAKHIR */}
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
                    {n.citizen_name ? `Warga: ${n.citizen_name}` : `KK: ${n.family_no_kk}`}
                  </span>
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                    RT {n.rt} / RW {n.rw}
                  </span>
                </div>
                <p className="text-slate-700 text-xs line-clamp-1">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

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
