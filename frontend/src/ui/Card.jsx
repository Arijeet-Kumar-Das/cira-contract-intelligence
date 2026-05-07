import React from 'react';
import { cn } from './cn';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white border border-slate-200 shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return (
    <div className={cn('px-6 py-5 border-b border-slate-200', className)} {...props} />
  );
}

export function CardBody({ className, ...props }) {
  return <div className={cn('px-6 py-5', className)} {...props} />;
}

