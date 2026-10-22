import React from 'react';

/**
 * Reusable Badge Component for CampusVerse AI Design System
 * CampusVerse Gold & Yellow Theme (#D99A00, #FFC107, #FFF8E6, #FFFDF5, #FFFEFA, #F1E7CF)
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
  const baseClasses = 'inline-flex items-center font-bold rounded-full tracking-wide select-none';

  const sizeClasses = {
    sm: 'text-[11px] px-2.5 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const variantClasses = {
    success: 'bg-[#DCFCE7] text-[#16A34A] border border-[#86EFAC]',
    teal: 'bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF]',
    gold: 'bg-[#D99A00] text-white border border-[#D99A00]',
    yellow: 'bg-[#FFC107] text-[#111827] border border-[#FFC107]',
    warning: 'bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] font-bold',
    danger: 'bg-[#FEF2F2] text-[#EF4444] border border-[#FECACA]',
    info: 'bg-[#FFF8E6] text-[#B45309] border border-[#F1E7CF]',
    navy: 'bg-[#111827] text-white border border-[#111827]',
    neutral: 'bg-[#FFFDF5] text-[#4B5563] border border-[#F1E7CF]',
    demo: 'bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] font-bold uppercase',
  };

  const dotClasses = {
    success: 'bg-[#16A34A]',
    teal: 'bg-[#D99A00]',
    gold: 'bg-white',
    yellow: 'bg-[#111827]',
    warning: 'bg-[#D99A00]',
    danger: 'bg-[#EF4444]',
    info: 'bg-[#D99A00]',
    navy: 'bg-[#FFC107]',
    neutral: 'bg-[#D99A00]',
    demo: 'bg-[#D99A00]',
  };

  return (
    <span
      id={id}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.neutral} ${className}`}
    >
      {hasDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant] || 'bg-[#D99A00]'} shrink-0`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
