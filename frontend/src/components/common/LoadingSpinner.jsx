import React from 'react';

/**
 * Loading Spinner Component for CampusVerse AI
 */
export const LoadingSpinner = ({
  size = 'md', // 'sm' | 'md' | 'lg'
  text = '',
  className = '',
  variant = 'teal', // 'teal' | 'navy' | 'white'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  const colorClasses = {
    teal: 'border-[#F1E7CF] border-t-[#D99A00]',
    gold: 'border-[#F1E7CF] border-t-[#D99A00]',
    yellow: 'border-[#F1E7CF] border-t-[#FFC107]',
    navy: 'border-[#F1E7CF] border-t-[#111827]',
    white: 'border-white/30 border-t-white',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[variant] || colorClasses.gold}`}
        role="status"
        aria-label="Loading"
      />
      {text && <span className="text-xs text-[#111827] font-bold">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
