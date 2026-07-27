import { Star } from 'lucide-react';
import { classNames } from '@/utils/helpers';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviewCount?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const sizeMap = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-6 w-6',
};

export function StarRating({ rating, size = 'sm', showValue, reviewCount, interactive, onChange }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            className={classNames(interactive && 'cursor-pointer hover:scale-110 transition-transform', !interactive && 'cursor-default')}
          >
            <Star
              className={classNames(
                sizeMap[size],
                star <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200',
              )}
            />
          </button>
        ))}
      </div>
      {showValue && <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && <span className="text-sm text-gray-400">({reviewCount})</span>}
    </div>
  );
}
