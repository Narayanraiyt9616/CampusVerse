import React from 'react';

/**
 * Accessible Select Field Component for CampusVerse AI Design System
 * CampusVerse Gold & Yellow Theme (#D99A00, #FFC107, #FFF8E6, #FFFDF5, #FFFEFA, #F1E7CF)
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
        <label htmlFor={selectId} className="block text-xs font-bold text-[#111827] uppercase tracking-wider mb-2">
          {label}
          {required && <span className="text-[#D99A00] ml-1" title="Required field">*</span>}
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
          className={`w-full appearance-none rounded-xl border text-sm font-medium text-[#111827] bg-white px-4 py-2.5 pr-10 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#D99A00] focus:border-[#D99A00] disabled:bg-[#FFFDF5] disabled:text-[#64748B]/50 disabled:cursor-not-allowed ${
            error
              ? 'border-[#EF4444] focus:ring-[#EF4444] bg-[#FEF2F2]/40'
              : 'border-[#F1E7CF] hover:border-[#D99A00]'
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

        <div className="absolute inset-y-0 right-0 flex items-center px-3.5 pointer-events-none text-[#64748B]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="mt-1.5 text-xs text-[#EF4444] font-bold">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="mt-1.5 text-xs text-[#64748B] font-medium">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Select;
