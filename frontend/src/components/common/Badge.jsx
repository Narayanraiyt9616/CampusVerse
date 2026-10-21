import React from 'react';

/**
 * Reusable Badge Component for CampusVerse AI Design System
 * Strictly adheres to the 5 colors: #102A43, #0D9488, #F0FDFA, #FFFFFF, #CCFBF1
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
    success: 'bg-[#0D9488] text-white border border-[#0D9488]',
    teal: 'bg-[#0D9488] text-white border border-[#0D9488]',
    warning: 'bg-[#CCFBF1] text-[#102A43] border border-[#0D9488]/30 font-bold',
    danger: 'bg-[#102A43] text-white border border-[#102A43]',
    info: 'bg-[#CCFBF1] text-[#102A43] border border-[#CCFBF1]',
    navy: 'bg-[#102A43] text-white border border-[#102A43]',
    neutral: 'bg-[#CCFBF1] text-[#102A43] border border-[#CCFBF1]',
    demo: 'bg-[#CCFBF1] text-[#102A43] border border-[#0D9488] font-bold uppercase',
  };

  const dotClasses = {
    success: 'bg-white',
    teal: 'bg-white',
    warning: 'bg-[#0D9488]',
    danger: 'bg-[#CCFBF1]',
    info: 'bg-[#0D9488]',
    navy: 'bg-[#CCFBF1]',
    neutral: 'bg-[#0D9488]',
    demo: 'bg-[#0D9488]',
  };

  return (
    <span
      id={id}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.neutral} ${className}`}
    >
      {hasDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant] || 'bg-[#0D9488]'} shrink-0`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
