import React from 'react';
import Breadcrumbs from './Breadcrumbs';

/**
 * Standard Page Header Component for Dashboards
 */
export const PageHeader = ({
  title,
  subtitle,
  badge = null,
  actions = null,
  breadcrumbs = [],
  className = 'mb-6',
  id,
}) => {
  return (
    <div id={id} className={`space-y-3 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
