import React from 'react';
import { cn } from './cn';

const variants = {
  primary:
    'bg-orange-600 text-white hover:bg-orange-700 shadow-sm shadow-orange-600/10',
  secondary:
    'bg-slate-900 text-white hover:bg-slate-800 shadow-sm shadow-slate-900/10',
  outline:
    'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/10',
};

const sizes = {
  sm: 'h-9 px-3 text-sm rounded-lg',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-11 px-5 text-sm rounded-xl',
};

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className,
  ...props
}) {
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    />
  );
}

