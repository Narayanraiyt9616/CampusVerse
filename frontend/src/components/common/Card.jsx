import React from 'react';

/**
 * Standard Structured Card Component for CampusVerse AI
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
  bodyClassName = 'p-5',
  headerClassName = 'px-5 py-4 border-b border-slate-100',
  id,
}) => {
  const hasHeader = Boolean(title || subtitle || badge || action);

  return (
    <div
      id={id}
      className={`bg-white rounded-xl border border-slate-200/90 shadow-card ${
        hoverable ? 'hover:shadow-card-hover hover:border-slate-300 transition-all duration-200' : ''
      } ${className}`}
    >
      {hasHeader && (
        <div className={`flex flex-wrap items-center justify-between gap-3 ${headerClassName}`}>
          <div>
            <div className="flex items-center gap-2">
              {title && <h3 className="font-semibold text-slate-900 text-base">{title}</h3>}
              {badge}
            </div>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </div>
      )}

      <div className={bodyClassName}>
        {children}
      </div>

      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-xs text-slate-600 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
