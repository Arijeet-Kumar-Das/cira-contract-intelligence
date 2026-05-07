import React from 'react';
import { cn } from './cn';

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-sm font-semibold text-slate-700', className)}
      {...props}
    />
  );
}

export function HelpText({ className, ...props }) {
  return (
    <p className={cn('text-xs text-slate-500', className)} {...props} />
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15 transition resize-none',
        className,
      )}
      {...props}
    />
  );
}

