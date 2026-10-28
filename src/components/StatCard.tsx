'use client';

import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme?: 'orange' | 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  onClick?: () => void;
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'orange',
  onClick,
  badge,
}) => {
  const schemeStyles = {
    orange: {
      bg: 'bg-blue-50/80',
      iconBg: 'bg-blue-500 text-white',
      border: 'border-blue-100 hover:border-blue-300',
      text: 'text-sky-600',
    },
    blue: {
      bg: 'bg-blue-50/80',
      iconBg: 'bg-sky-500 text-white',
      border: 'border-blue-100 hover:border-blue-300',
      text: 'text-sky-600',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      iconBg: 'bg-emerald-600 text-white',
      border: 'border-emerald-100 hover:border-emerald-300',
      text: 'text-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50/80',
      iconBg: 'bg-amber-500 text-white',
      border: 'border-amber-100 hover:border-amber-300',
      text: 'text-amber-600',
    },
    purple: {
      bg: 'bg-purple-50/80',
      iconBg: 'bg-purple-600 text-white',
      border: 'border-purple-100 hover:border-purple-300',
      text: 'text-purple-600',
    },
    rose: {
      bg: 'bg-rose-50/80',
      iconBg: 'bg-rose-500 text-white',
      border: 'border-rose-100 hover:border-rose-300',
      text: 'text-rose-600',
    },
  };

  const currentScheme = schemeStyles[colorScheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl p-3 border ${currentScheme.border} shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center space-x-1.5 min-w-0">
          <div className={`w-7 h-7 rounded-lg ${currentScheme.iconBg} flex items-center justify-center shadow-sm flex-shrink-0`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-slate-700 tracking-tight leading-snug break-words">
            {title}
          </span>
        </div>
        {badge && (
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap flex-shrink-0">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2">
        <div className="flex items-baseline justify-between">
          <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </span>
          {onClick && (
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 flex-shrink-0" />
          )}
        </div>

        {subtitle && (
          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 leading-snug break-words">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
