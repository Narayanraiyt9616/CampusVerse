import React from 'react';

/**
 * Standard Structured Card Component for CampusVerse AI
 * Strictly styled with the 5 design system colors
 */
export const Card = ({
  title,
  subtitle,
  badge = null,
  action = null,
  children,
  footer = null,
  hoverable = false,
  className = '',
  bodyClassName = 'p-6',
  headerClassName = 'px-6 py-4.5 border-b border-[#F1E7CF]',
  id,
}) => {
  const hasHeader = Boolean(title || subtitle || badge || action);

  return (
    <div
      id={id}
      className={`bg-white rounded-2xl sm:rounded-3xl border border-[#F1E7CF] shadow-[0_4px_24px_rgba(217,119,6,0.04)] ${
        hoverable ? 'hover:shadow-[0_12px_32px_rgba(217,119,6,0.1)] hover:border-[#FDE68A] hover:-translate-y-0.5 transition-all duration-300' : 'transition-all duration-200'
      } ${className}`}
    >
      {hasHeader && (
        <div className={`flex flex-wrap items-center justify-between gap-3 ${headerClassName}`}>
          <div>
            <div className="flex items-center gap-2.5">
              {title && <h3 className="font-extrabold text-[#0F172A] text-lg tracking-tight">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="text-xs text-[#64748B] font-medium mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}

      <div className={bodyClassName}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-3.5 border-t border-[#F1E7CF] bg-[#FFFDF5] rounded-b-2xl sm:rounded-b-3xl text-xs text-[#0F172A] font-semibold flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
