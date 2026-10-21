import React from 'react';

/**
 * Accessible Select Field Component for CampusVerse AI Design System
 * Strictly adheres to the 5 colors: #102A43, #0D9488, #F0FDFA, #FFFFFF, #CCFBF1
 */
export const Select = ({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option...',
  error = '',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectId = id || (name ? `select-${name}` : undefined);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-xs font-bold text-[#102A43] uppercase tracking-wider mb-2">
          {label}
          {required && <span className="text-[#0D9488] ml-1" title="Required field">*</span>}
        </label>
      )}

      <div className="relative rounded-xl shadow-sm">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none rounded-xl border text-sm font-medium text-[#102A43] bg-white px-4 py-2.5 pr-10 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-[#0D9488] disabled:bg-[#F0FDFA] disabled:text-[#102A43]/40 disabled:cursor-not-allowed ${
            error
              ? 'border-[#0D9488] focus:ring-[#0D9488] bg-[#CCFBF1]/20'
              : 'border-[#CCFBF1] hover:border-[#0D9488]/60'
          }`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-[#102A43]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="mt-1.5 text-xs text-[#102A43] font-bold">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="mt-1.5 text-xs text-[#102A43]/70 font-medium">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Select;
