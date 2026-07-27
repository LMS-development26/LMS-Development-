import type { ReactNode } from 'react';
import { classNames } from '@/utils/helpers';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'red' | 'gray' | 'violet';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  red: 'bg-red-50 text-red-600',
  gray: 'bg-gray-100 text-gray-600',
  violet: 'bg-violet-50 text-violet-600',
};

export function StatCard({ label, value, icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          {trend && <p className="mt-1 text-xs text-gray-400">{trend}</p>}
        </div>
        <div className={classNames('flex h-12 w-12 items-center justify-center rounded-xl', colorClasses[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}
