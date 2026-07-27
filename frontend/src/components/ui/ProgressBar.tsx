import { classNames } from '@/utils/helpers';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'amber' | 'red';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-3.5',
};

const colorClasses = {
  blue: 'bg-blue-600',
  green: 'bg-emerald-600',
  amber: 'bg-amber-500',
  red: 'bg-red-600',
};

export function ProgressBar({ value, className, size = 'md', color = 'blue', showLabel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={classNames('flex items-center gap-2', className)}>
      <div className={classNames('w-full rounded-full bg-gray-200', sizeClasses[size])}>
        <div
          className={classNames('rounded-full transition-all duration-500', colorClasses[color])}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && <span className="text-sm font-medium text-gray-600 tabular-nums">{Math.round(clamped)}%</span>}
    </div>
  );
}
