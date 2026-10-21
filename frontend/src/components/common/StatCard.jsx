import React from 'react';

/**
 * Metric Stat Card Component for CampusVerse AI Dashboards
 * Strictly adheres to the 5 colors: #102A43, #0D9488, #F0FDFA, #FFFFFF, #CCFBF1
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'increase', // 'increase' | 'decrease' | 'neutral'
  icon = null,
  colorVariant = 'teal',
  badge = null,
  id,
}) => {
  return (
    <div
      id={id}
      className="bg-white rounded-2xl border border-[#CCFBF1] p-6 shadow-card hover:shadow-card-hover hover:border-[#0D9488] transition-all duration-200 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#102A43]/75 uppercase tracking-wider">{title}</span>
            {badge}
          </div>
          <div className="text-3xl font-extrabold text-[#102A43] tracking-tight">{value}</div>
        </div>

        {icon && (
          <div className="p-3 rounded-xl bg-[#CCFBF1] text-[#0D9488] border border-[#CCFBF1] shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-4 pt-3.5 border-t border-[#CCFBF1] flex items-center justify-between text-xs text-[#102A43]/75 font-semibold">
          <span>{subtitle}</span>
          {change && (
            <span
              className={`font-bold inline-flex items-center gap-1 ${
                changeType === 'increase'
                  ? 'text-[#0D9488]'
                  : 'text-[#102A43]'
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
