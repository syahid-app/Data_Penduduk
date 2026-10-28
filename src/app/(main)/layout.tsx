'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { NoteModal } from '@/components/NoteModal';
import { AddKKModal } from '@/components/AddKKModal';
import { useApp } from '@/lib/context';
import { MessageSquarePlus, Plus } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentProfile } = useApp();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAddKKModalOpen, setIsAddKKModalOpen] = useState(false);

  const isAdmin = currentProfile?.role === 'admin';
  // Hide global FAB on /warga and /data so it never blocks table pagination or action buttons
  const hideFab = pathname.startsWith('/warga') || pathname.startsWith('/data');

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-slate-900 flex justify-center overflow-hidden">
      {/* Smartphone & Responsive Frame Container */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl bg-slate-50 h-full flex flex-col relative shadow-2xl overflow-hidden border-x border-slate-200/50">
        {/* Top App Header - Locked at Top (Never scrolls) */}
        <div className="flex-shrink-0 z-30">
          <Header />
        </div>

        {/* Main Workspace - Flex Column so each tab can lock its own top head and scroll only its inner content */}
        <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {children}
        </main>

        {/* Global Floating Action Button for RT/RW/Kadus (Catatan) or Admin (Tambah KK) */}
        {!hideFab && (
          <div className="absolute bottom-20 right-4 z-30 flex flex-col items-end gap-2 pointer-events-none">
            <div className="pointer-events-auto">
              {isAdmin ? (
                <button
                  onClick={() => setIsAddKKModalOpen(true)}
                  className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:shadow-orange-500/40 active:scale-90 transition-all flex items-center justify-center group"
                  title="Tambah Kartu Keluarga Baru"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pl-0 group-hover:pl-1.5">
                    Tambah KK
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setIsNoteModalOpen(true)}
                  className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:shadow-orange-500/40 active:scale-90 transition-all flex items-center justify-center group"
                  title="Kirim Catatan Data Wilayah"
                >
                  <MessageSquarePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pl-0 group-hover:pl-1.5">
                    Catat Data
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Navigation - Locked at Bottom (Never scrolls) */}
        <div className="flex-shrink-0 z-30 w-full">
          <BottomNav />
        </div>

        {/* Global Note Modal */}
        <NoteModal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
        />

        {/* Global Add KK Modal for Admin */}
        {isAdmin && (
          <AddKKModal
            isOpen={isAddKKModalOpen}
            onClose={() => setIsAddKKModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
