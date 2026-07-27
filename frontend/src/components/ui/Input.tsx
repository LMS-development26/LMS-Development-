import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';
import { classNames } from '@/utils/helpers';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div>
      {label && <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={inputId}
        className={classNames(
          'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
          className,
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const textareaId = id || props.name;
  return (
    <div>
      {label && <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>}
      <textarea
        id={textareaId}
        className={classNames(
          'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
          className,
        )}
        {...props}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id || props.name;
  return (
    <div>
      {label && <label htmlFor={selectId} className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>}
      <select
        id={selectId}
        className={classNames(
          'block w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
