import React from 'react';

/**
 * Accessible Select Field Component for CampusVerse AI Design System
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
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
          {required && <span className="text-rose-500 ml-1" title="Required field">*</span>}
        </label>
      )}

      <div className="relative rounded-lg shadow-sm">
        <select
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full appearance-none rounded-lg border text-sm text-slate-900 bg-white px-3.5 py-2.5 pr-10 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500 bg-rose-50/20'
              : 'border-slate-300 hover:border-slate-400'
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

        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="mt-1.5 text-xs text-rose-600 font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${selectId}-helper`} className="mt-1.5 text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};

export default Select;
