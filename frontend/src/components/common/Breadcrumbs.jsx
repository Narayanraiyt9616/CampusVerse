import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

/**
 * Breadcrumbs Component for hierarchical navigation
 */
export const Breadcrumbs = ({ items = [], className = '' }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs text-slate-500 font-medium ${className}`}>
      <ol className="flex items-center space-x-1.5 flex-wrap">
        <li>
          <Link
            to="/"
            className="hover:text-teal-700 transition-colors flex items-center gap-1 text-slate-400 hover:text-slate-600"
            title="Landing Home"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label || index} className="flex items-center space-x-1.5">
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" aria-hidden="true" />
              {isLast || !item.to ? (
                <span className="text-slate-800 font-semibold" aria-current={isLast ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.to}
                  className="hover:text-teal-700 text-slate-500 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
