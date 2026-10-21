import React from 'react';

/**
 * Metric Stat Card Component for CampusVerse AI Dashboards
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'increase', // 'increase' | 'decrease' | 'neutral'
  icon = null,
  colorVariant = 'teal', // 'teal' | 'navy' | 'emerald' | 'amber' | 'rose' | 'sky'
  badge = null,
  id,
}) => {
  const iconBgClasses = {
    teal: 'bg-teal-50 text-teal-700 border-teal-100',
    navy: 'bg-slate-100 text-navy-800 border-slate-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    sky: 'bg-sky-50 text-sky-700 border-sky-100',
  };

  return (
    <div
      id={id}
      className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
            {badge}
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
        </div>

        {icon && (
          <div className={`p-2.5 rounded-lg border shrink-0 ${iconBgClasses[colorVariant] || iconBgClasses.teal}`}>
            {icon}
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {change && (
            <span
              className={`font-semibold inline-flex items-center gap-1 ${
                changeType === 'increase'
                  ? 'text-emerald-700'
                  : changeType === 'decrease'
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {changeType === 'increase' ? '↑' : changeType === 'decrease' ? '↓' : '•'} {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
