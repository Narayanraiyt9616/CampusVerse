import React from 'react';

/**
 * Reusable Button Component for CampusVerse AI Design System
 * Strictly adheres to the 5 colors: #102A43, #0D9488, #F0FDFA, #FFFFFF, #CCFBF1
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
  const baseClasses = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:ring-offset-2 select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 rounded-lg',
    md: 'text-sm px-4 py-2.5 gap-2 rounded-xl',
    lg: 'text-base px-5 py-3 gap-2.5 rounded-xl',
  };

  const variantClasses = {
    primary: 'bg-[#0D9488] text-white hover:opacity-95 shadow-sm border border-[#0D9488]',
    secondary: 'bg-white text-[#102A43] border border-[#CCFBF1] hover:bg-[#CCFBF1] hover:text-[#102A43] shadow-sm',
    teal: 'bg-[#0D9488] text-white hover:opacity-95 shadow-sm border border-[#0D9488]',
    danger: 'bg-[#102A43] text-white hover:opacity-90 shadow-sm border border-[#102A43]',
    ghost: 'text-[#102A43] hover:text-[#102A43] hover:bg-[#CCFBF1] border border-transparent',
    outline: 'border border-[#0D9488] text-[#0D9488] hover:bg-[#CCFBF1] hover:text-[#102A43] bg-transparent',
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
