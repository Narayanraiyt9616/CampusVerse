import React from 'react';

/**
 * Reusable Badge Component for CampusVerse AI Design System
 */
export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  hasDot = false,
  icon = null,
  className = '',
  id,
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full tracking-wide select-none';

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const variantClasses = {
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    teal: 'bg-teal-50 text-teal-800 border border-teal-200',
    navy: 'bg-slate-100 text-slate-800 border border-slate-200',
    neutral: 'bg-slate-50 text-slate-700 border border-slate-200',
    demo: 'bg-amber-100/80 text-amber-900 border border-amber-300 font-semibold',
  };

  const dotClasses = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    teal: 'bg-teal-500',
    navy: 'bg-slate-600',
    neutral: 'bg-slate-400',
    demo: 'bg-amber-600',
  };

  return (
    <span
      id={id}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.neutral} ${className}`}
    >
      {hasDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant] || 'bg-slate-400'} shrink-0`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
