'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context';

export default function HomePage() {
  const router = useRouter();
  const { currentProfile, isLoading } = useApp();

  useEffect(() => {
    if (!isLoading) {
      if (currentProfile) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [currentProfile, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-300">Memuat Sistem SIP Karanghaur...</p>
      </div>
    </div>
  );
}
