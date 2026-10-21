import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible Modal Dialog Component for CampusVerse AI
 */
export const Modal = ({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  footer = null,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  id,
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      id={id}
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? `${id}-title` : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-xl bg-white text-left shadow-elevation transition-all sm:my-8 w-full ${
            sizeClasses[size] || sizeClasses.md
          } border border-slate-200`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-slate-100">
            <div>
              {title && (
                <h3 id={`${id}-title`} className="text-lg font-semibold text-slate-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-xs text-slate-500">
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
