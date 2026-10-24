import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

/**
 * Accessible Modal Dialog Component for CampusVerse AI
 * Strictly styled with the 5 design system colors
 */
export const Modal = ({
  isOpen = false,
  onClose,
  title,
  description,
  children,
  footer = null,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  maxWidth = null,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  closeOnNavigate = true,
  id,
}) => {
  let location;
  try {
    location = useLocation();
  } catch {
    location = null;
  }

  const currentPath = location ? location.pathname + location.search : '';
  const initialPathRef = useRef(currentPath);

  useEffect(() => {
    if (isOpen) {
      initialPathRef.current = currentPath;
    }
  }, [isOpen, currentPath]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose && closeOnEsc) {
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
  }, [isOpen, onClose, closeOnEsc]);

  // Handle route change: automatically dismiss non-critical modals on navigation
  useEffect(() => {
    if (isOpen && onClose && closeOnNavigate) {
      if (initialPathRef.current && initialPathRef.current !== currentPath) {
        onClose();
      }
    }
  }, [currentPath, isOpen, onClose, closeOnNavigate]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const dialogWidthClass = maxWidth || sizeClasses[size] || sizeClasses.md;

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
        className="fixed inset-0 bg-[#111827]/70 backdrop-blur-sm transition-opacity"
        onClick={closeOnBackdropClick && onClose ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-elevation transition-all sm:my-8 w-full ${dialogWidthClass} border border-[#F1E7CF]`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#F1E7CF]">
            <div>
              {title && (
                <h3 id={`${id}-title`} className="text-xl font-bold text-[#111827]">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-xs sm:text-sm text-[#4B5563] font-medium">
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-[#111827] hover:bg-[#FFF8E6] transition-colors focus:outline-none focus:ring-2 focus:ring-[#D99A00]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-5 text-[#4B5563]">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 bg-[#FFFDF5] border-t border-[#F1E7CF] flex items-center justify-end gap-3 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
