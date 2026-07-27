import type { ReactNode } from 'react';
import { classNames } from '@/utils/helpers';

type BadgeVariant =
  | 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-blue-100 text-blue-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-700',
  neutral: 'bg-gray-100 text-gray-700',
  purple: 'bg-violet-100 text-violet-700',
};

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={classNames(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variantClasses[variant],
      className,
    )}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    PUBLISHED: 'success',
    DRAFT: 'neutral',
    ARCHIVED: 'warning',
    UNPUBLISHED: 'danger',
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'danger',
    SUBMITTED: 'info',
    GRADED: 'success',
    NOT_SUBMITTED: 'neutral',
    LATE: 'danger',
    SCHEDULED: 'info',
    COMPLETED: 'success',
    CANCELLED: 'danger',
    IN_PROGRESS: 'warning',
    ABANDONED: 'neutral',
    NOT_ELIGIBLE: 'neutral',
    ELIGIBLE: 'warning',
    ISSUED: 'success',
  };
  return <Badge variant={map[status] || 'default'}>{status.replace(/_/g, ' ')}</Badge>;
}
