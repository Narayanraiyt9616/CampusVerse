import React from 'react';

/**
 * Reusable Button Component for CampusVerse AI Design System
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
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 select-none';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  const variantClasses = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 shadow-sm border border-navy-800',
    secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm',
    teal: 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm border border-teal-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm border border-rose-700',
    ghost: 'text-slate-600 hover:text-navy-900 hover:bg-slate-100 border border-transparent',
    outline: 'border border-teal-600 text-teal-700 hover:bg-teal-50 bg-transparent',
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
