'use client';

import React, { useState } from 'react';
import { Header } from '@/lib/../components/Header';
import { BottomNav } from '@/lib/../components/BottomNav';
import { NoteModal } from '@/lib/../components/NoteModal';
import { AddKKModal } from '@/lib/../components/AddKKModal';
import { useApp } from '@/lib/context';
import { MessageSquarePlus, Plus } from 'lucide-react';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentProfile } = useApp();
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isAddKKModalOpen, setIsAddKKModalOpen] = useState(false);

  const isAdmin = currentProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center">
      {/* Mobile Smartphone Frame Container */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl flex flex-col pb-20 overflow-x-hidden border-x border-slate-200/50">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 px-3.5 py-4">
          {children}
        </main>

        {/* Global Floating Action Button for RT/RW/Kadus (Catatan) or Admin (Tambah KK) */}
        <div className="fixed bottom-20 right-4 sm:right-auto sm:left-1/2 sm:translate-x-32 z-30 flex flex-col items-end gap-2">
          {isAdmin ? (
            <button
              onClick={() => setIsAddKKModalOpen(true)}
              className="p-3.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:shadow-orange-500/40 active:scale-90 transition-all flex items-center justify-center group"
              title="Tambah Kartu Keluarga Baru"
            >
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pl-0 group-hover:pl-2">
                Tambah KK
              </span>
            </button>
          ) : (
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="p-3.5 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg hover:shadow-orange-500/40 active:scale-90 transition-all flex items-center justify-center group"
              title="Kirim Catatan Data Wilayah"
            >
              <MessageSquarePlus className="w-6 h-6 group-hover:scale-110 transition-transform" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold pl-0 group-hover:pl-2">
                Catat Data
              </span>
            </button>
          )}
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

        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
