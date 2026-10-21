import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Reusable Alert Banner Component
 */
export const AlertBanner = ({
  variant = 'info', // 'info' | 'warning' | 'error' | 'success'
  title = '',
  message,
  dismissible = false,
  onDismiss = null,
  action = null,
  className = '',
  id,
}) => {
  const variantStyles = {
    info: {
      bg: 'bg-sky-50 border-sky-200 text-sky-900',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-900',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    },
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <div
      id={id}
      className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${style.bg} ${className}`}
      role="alert"
    >
      <div className="mt-0.5">{style.icon}</div>
      <div className="flex-1">
        {title && <h5 className="font-semibold text-sm mb-0.5">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{message}</div>
        {action && <div className="mt-2">{action}</div>}
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md opacity-70 hover:opacity-100 hover:bg-black/5 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
