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
  headerClassName = 'px-6 py-4 border-b border-[#CCFBF1]',
  id,
}) => {
  const hasHeader = Boolean(title || subtitle || badge || action);

  return (
    <div
      id={id}
      className={`bg-white rounded-2xl border border-[#CCFBF1] shadow-card ${
        hoverable ? 'hover:shadow-card-hover hover:border-[#0D9488] transition-all duration-200' : ''
      } ${className}`}
    >
      {hasHeader && (
        <div className={`flex flex-wrap items-center justify-between gap-3 ${headerClassName}`}>
          <div>
            <div className="flex items-center gap-2.5">
              {title && <h3 className="font-bold text-[#102A43] text-lg tracking-tight">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="text-xs text-[#102A43]/70 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}

      <div className={bodyClassName}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-3.5 border-t border-[#CCFBF1] bg-[#F0FDFA] rounded-b-2xl text-xs text-[#102A43] font-semibold flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
