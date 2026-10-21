import React from 'react';

/**
 * Accessible Input Field Component for CampusVerse AI Design System
 * Strictly adheres to the 5 colors: #102A43, #0D9488, #F0FDFA, #FFFFFF, #CCFBF1
 */
export const Input = ({
  label,
  id,
  name,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  error = '',
  helperText = '',
  leftIcon = null,
  rightIcon = null,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputId = id || (name ? `input-${name}` : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-2">
          {label}
          {required && <span className="text-[#0D9488] ml-1" title="Required field">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#102A43]/60">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full rounded-xl border text-sm font-medium text-[#102A43] placeholder:text-[#102A43]/50 bg-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] disabled:bg-[#F0FDFA] disabled:text-[#102A43]/40 disabled:cursor-not-allowed ${
            leftIcon ? 'pl-10' : 'pl-4'
          } ${rightIcon ? 'pr-10' : 'pr-4'} py-2.5 ${
            error
              ? 'border-[#0D9488] focus:ring-[#0D9488] bg-[#CCFBF1]/20'
              : 'border-[#CCFBF1] hover:border-[#0D9488]/60'
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#102A43]/60">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="mt-1.5 text-xs text-[#102A43] font-bold flex items-center gap-1">
          <svg className="w-3.5 h-3.5 text-[#0D9488]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-[#102A43]/70 font-medium">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Input;
