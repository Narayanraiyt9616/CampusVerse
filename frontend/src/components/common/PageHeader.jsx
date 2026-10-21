import React from 'react';
import Breadcrumbs from './Breadcrumbs';

/**
 * Standard Page Header Component for Dashboards
 * Strictly styled using only the 5 system colors
 */
export const PageHeader = ({
  title,
  subtitle,
  badge = null,
  actions = null,
  breadcrumbs = [],
  className = 'mb-8',
  id,
}) => {
  return (
    <div id={id} className={`space-y-3 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102A43] tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm text-[#102A43]/75 mt-1.5 leading-relaxed font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
