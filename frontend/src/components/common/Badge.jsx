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
    success: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
    teal: 'bg-[#FFF8E6] text-[#B45309] border border-[#FDE68A]',
    gold: 'bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-white border border-[#D97706] shadow-xs',
    yellow: 'bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]',
    warning: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] font-bold',
    danger: 'bg-[#FEF2F2] text-[#E11D48] border border-[#FECDD3]',
    info: 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]',
    navy: 'bg-[#0B132B] text-white border border-[#1E293B]',
    neutral: 'bg-[#FFFDF5] text-[#4B5563] border border-[#F1E7CF]',
    demo: 'bg-[#FFF8E6] text-[#B45309] border border-[#FDE68A] font-bold uppercase',
  };

  const dotClasses = {
    success: 'bg-[#059669]',
    teal: 'bg-[#D97706]',
    gold: 'bg-white',
    yellow: 'bg-[#CA8A04]',
    warning: 'bg-[#D97706]',
    danger: 'bg-[#E11D48]',
    info: 'bg-[#2563EB]',
    navy: 'bg-[#FACC15]',
    neutral: 'bg-[#64748B]',
    demo: 'bg-[#D97706]',
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
