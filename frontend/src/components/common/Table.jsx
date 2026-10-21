import React from 'react';

/**
 * Responsive Data Table Component for CampusVerse AI
 */
export const Table = ({
  columns = [],
  data = [],
  keyField = 'id',
  isLoading = false,
  emptyMessage = 'No records available in this view.',
  hoverable = true,
  className = '',
  id,
}) => {
  return (
    <div id={id} className={`w-full overflow-hidden border border-slate-200 rounded-xl bg-white shadow-subtle ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 border-collapse">
          <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-700 tracking-wider border-b border-slate-200">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  scope="col"
                  className={`px-4 py-3.5 whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.headerClassName || ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Loading data records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-500 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row[keyField] || rowIndex}
                  className={`transition-colors ${hoverable ? 'hover:bg-slate-50/80' : ''} ${rowIndex % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}
                >
                  {columns.map((col, colIndex) => {
                    const value = col.accessor
                      ? typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : row[col.accessor]
                      : row[col.key];

                    return (
                      <td
                        key={col.key || colIndex}
                        className={`px-4 py-3.5 whitespace-nowrap text-slate-700 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.cellClassName || ''}`}
                      >
                        {col.render ? col.render(value, row, rowIndex) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
