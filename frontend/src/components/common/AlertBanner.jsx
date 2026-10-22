import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Reusable Alert Banner Component
 * Strictly styled using only the 5 system colors:
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
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#D99A00] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-[#D99A00] shrink-0" />;
    }
  };

  const variantStyles = {
    success: 'border-[#86EFAC] bg-[#F0FDF4] text-[#166534]',
    error: 'border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]',
    warning: 'border-[#F1E7CF] bg-[#FFF8E6] text-[#B45309]',
    info: 'border-[#F1E7CF] bg-[#FFF8E6] text-[#111827]',
  };

  return (
    <div
      id={id}
      className={`p-4 rounded-2xl border ${variantStyles[variant] || variantStyles.info} flex items-start gap-3.5 text-sm ${className}`}
      role="alert"
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        {title && <h5 className="font-bold text-sm mb-1">{title}</h5>}
        <div className="text-xs sm:text-sm font-medium leading-relaxed">{message}</div>
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-lg opacity-70 hover:opacity-100 hover:bg-black/5 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
