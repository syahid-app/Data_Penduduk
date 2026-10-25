'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/context';
import {
  Home,
  FolderTree,
  Users,
  MessageSquareText,
  UserCheck,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { visibleNotes } = useApp();

  const pendingNotesCount = visibleNotes.filter((n) => n.status === 'pending').length;

  const navItems = [
    {
      label: 'Beranda',
      href: '/dashboard',
      icon: Home,
      exact: true,
    },
    {
      label: 'Data KK',
      href: '/kk',
      icon: FolderTree,
      exact: false,
    },
    {
      label: 'Warga NIK',
      href: '/warga',
      icon: Users,
      exact: false,
    },
    {
      label: 'Catatan',
      href: '/catatan',
      icon: MessageSquareText,
      exact: false,
      badge: pendingNotesCount > 0 ? pendingNotesCount : undefined,
    },
    {
      label: 'Profil',
      href: '/profil',
      icon: UserCheck,
      exact: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 transition-all group relative ${
                isActive
                  ? 'text-orange-600 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <div
                  className={`p-1 rounded-xl transition-all ${
                    isActive ? 'scale-110' : 'group-hover:scale-105'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-orange-600 stroke-[2.4]' : 'text-slate-500'
                    }`}
                  />
                </div>

                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full min-w-[15px] text-center border-2 border-white shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-all ${
                  isActive ? 'text-orange-600 font-bold' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>

              {/* Active Pill Indicator */}
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
