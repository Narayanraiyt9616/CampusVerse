import React from 'react';

/**
 * Metric Stat Card Component for CampusVerse AI Dashboards
 * CampusVerse Gold & Yellow Theme (#D99A00, #FFC107, #FFF8E6, #FFFDF5, #FFFEFA, #F1E7CF)
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
      className="bg-white rounded-2xl border border-[#F1E7CF] p-6 shadow-card hover:shadow-card-hover hover:border-[#D99A00] transition-all duration-200 flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{title}</span>
            {badge}
          </div>
          <div className="text-3xl font-extrabold text-[#111827] tracking-tight">{value}</div>
        </div>

        {icon && (
          <div className="p-3 rounded-xl bg-[#FFF8E6] text-[#D99A00] border border-[#F1E7CF] shrink-0">
            {icon}
          </div>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-4 pt-3.5 border-t border-[#F1E7CF] flex items-center justify-between text-xs text-[#4B5563] font-semibold">
          <span>{subtitle}</span>
          {change && (
            <span
              className={`font-bold inline-flex items-center gap-1 ${
                changeType === 'increase'
                  ? 'text-[#D99A00]'
                  : 'text-[#64748B]'
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
