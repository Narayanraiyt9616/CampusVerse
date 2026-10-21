import React from 'react';

/**
 * Loading Spinner Component for CampusVerse AI
 * Strictly adhering to 5 colors: #102A43, #0D9488, #F0FDFA, #FFFFFF, #CCFBF1
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
    teal: 'border-[#CCFBF1] border-t-[#0D9488]',
    navy: 'border-[#CCFBF1] border-t-[#102A43]',
    white: 'border-white/30 border-t-white',
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center gap-2 ${className}`}>
      <div
        className={`rounded-full animate-spin ${sizeClasses[size] || sizeClasses.md} ${colorClasses[variant] || colorClasses.teal}`}
        role="status"
        aria-label="Loading"
      />
      {text && <span className="text-xs text-[#102A43] font-bold">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
