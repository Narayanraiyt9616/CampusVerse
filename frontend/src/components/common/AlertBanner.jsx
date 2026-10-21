import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Reusable Alert Banner Component
 * Strictly styled using only the 5 system colors:
 * #102A43, #0D9488, #F0FDFA, #FFFFFF, #CCFBF1
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
        return <CheckCircle2 className="w-5 h-5 text-[#0D9488] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#0D9488] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[#102A43] shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-[#0D9488] shrink-0" />;
    }
  };

  return (
    <div
      id={id}
      className={`p-4 rounded-2xl border border-[#0D9488]/40 bg-[#CCFBF1] text-[#102A43] flex items-start gap-3.5 text-sm ${className}`}
      role="alert"
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1">
        {title && <h5 className="font-bold text-sm mb-1 text-[#102A43]">{title}</h5>}
        <div className="text-xs sm:text-sm font-medium leading-relaxed text-[#102A43]">{message}</div>
        {action && <div className="mt-2.5">{action}</div>}
      </div>
      {dismissible && onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1.5 rounded-lg text-[#102A43] hover:bg-[#0D9488]/15 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
