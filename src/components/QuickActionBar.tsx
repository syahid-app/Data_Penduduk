'use client';

import React from 'react';
import Link from 'next/link';
import {
  Search,
  FolderTree,
  HeartHandshake,
  Users,
  ShieldAlert,
  MessageSquarePlus,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';

interface QuickActionBarProps {
  onOpenNoteModal: () => void;
  isAdmin?: boolean;
  onOpenAddKKModal?: () => void;
}

export const QuickActionBar: React.FC<QuickActionBarProps> = ({
  onOpenNoteModal,
  isAdmin,
  onOpenAddKKModal,
}) => {
  const actions = [
    {
      label: 'Cari NIK',
      icon: Search,
      href: '/warga?focus=search',
      color: 'bg-orange-500 text-white',
    },
    {
      label: 'Daftar KK',
      icon: FolderTree,
      href: '/kk',
      color: 'bg-blue-500 text-white',
    },
    {
      label: 'Bansos KPM',
      icon: HeartHandshake,
      href: '/kk?filter=bansos',
      color: 'bg-emerald-500 text-white',
    },
    {
      label: 'Daftar Warga',
      icon: Users,
      href: '/warga',
      color: 'bg-indigo-500 text-white',
    },
    {
      label: 'Exp / Imp',
      icon: FileSpreadsheet,
      href: '/data',
      color: 'bg-teal-500 text-white',
    },
    {
      label: 'Buat Catatan',
      icon: MessageSquarePlus,
      onClick: onOpenNoteModal,
      color: 'bg-amber-500 text-white',
    },
  ];

  return (
    <div className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-800 tracking-tight">
          Aksi Cepat Menu Wilayah
        </span>
        {isAdmin && onOpenAddKKModal && (
          <button
            onClick={onOpenAddKKModal}
            className="inline-flex items-center text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-full transition-colors"
          >
            <PlusCircle className="w-3 h-3 mr-1" />
            Tambah KK Baru
          </button>
        )}
      </div>

      <div className="flex items-center space-x-3 overflow-x-auto no-scrollbar py-1">
        {actions.map((act, index) => {
          const Icon = act.icon;
          if (act.href) {
            return (
              <Link
                key={index}
                href={act.href}
                className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
              >
                <div
                  className={`w-11 h-11 rounded-2xl ${act.color} flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-all`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] font-semibold text-slate-700 mt-1.5 text-center truncate max-w-[64px]">
                  {act.label}
                </span>
              </Link>
            );
          }

          return (
            <button
              key={index}
              onClick={act.onClick}
              className="flex flex-col items-center flex-shrink-0 group focus:outline-none"
            >
              <div
                className={`w-11 h-11 rounded-2xl ${act.color} flex items-center justify-center shadow-xs group-hover:scale-105 active:scale-95 transition-all`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-[10px] font-semibold text-slate-700 mt-1.5 text-center truncate max-w-[64px]">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
