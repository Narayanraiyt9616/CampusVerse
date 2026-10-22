import React from 'react';

/**
 * Reusable Button Component for CampusVerse AI Design System
 * CampusVerse Gold & Yellow Theme (#D99A00, #FFC107, #FFF8E6, #FFFDF5, #FFFEFA, #F1E7CF)
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  id,
  onClick,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#D99A00] focus:ring-offset-2 select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
    lg: 'text-base px-5 py-3 gap-2.5 rounded-xl',
  };

  const variantClasses = {
    primary: 'bg-[#D99A00] text-white hover:bg-[#E5A900] shadow-sm border border-[#D99A00]',
    secondary: 'bg-white text-[#111827] border border-[#F1E7CF] hover:bg-[#FFF8E6] hover:text-[#111827] shadow-sm',
    teal: 'bg-[#D99A00] text-white hover:bg-[#E5A900] shadow-sm border border-[#D99A00]',
    gold: 'bg-[#D99A00] text-white hover:bg-[#E5A900] shadow-sm border border-[#D99A00]',
    yellow: 'bg-[#FFC107] text-[#111827] hover:bg-[#F5B301] shadow-sm border border-[#FFC107]',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-sm border border-[#EF4444]',
    ghost: 'text-[#4B5563] hover:text-[#111827] hover:bg-[#FFF8E6] border border-transparent',
    outline: 'border border-[#D99A00] text-[#D99A00] hover:bg-[#FFF8E6] hover:text-[#111827] bg-transparent',
  };

  const disabledClasses = (disabled || isLoading) ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer active:scale-[0.99]';

  return (
    <button
      id={id}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${disabledClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      
      <span>{children}</span>

      {!isLoading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;
