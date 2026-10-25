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
      bg: 'bg-orange-50/80',
      iconBg: 'bg-orange-500 text-white',
      border: 'border-orange-100 hover:border-orange-300',
      text: 'text-orange-600',
    },
    blue: {
      bg: 'bg-blue-50/80',
      iconBg: 'bg-blue-600 text-white',
      border: 'border-blue-100 hover:border-blue-300',
      text: 'text-blue-600',
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
      className={`bg-white rounded-xl p-3.5 border ${currentScheme.border} shadow-xs hover:shadow-md transition-all relative flex flex-col justify-between ${
        onClick ? 'cursor-pointer active:scale-[0.98]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-lg ${currentScheme.iconBg} flex items-center justify-center shadow-xs`}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold text-slate-600 tracking-tight leading-tight line-clamp-1">
            {title}
          </span>
        </div>
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
          </span>
          {onClick && (
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
          )}
        </div>

        {subtitle && (
          <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};
