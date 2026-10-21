import React from 'react';

/**
 * Responsive Data Table Component for CampusVerse AI
 * Strictly styled using only the 5 system colors:
 * Sidebar/Text: #102A43, Action: #0D9488, Background: #F0FDFA, Card: #FFFFFF, Highlight: #CCFBF1
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
    <div id={id} className={`w-full overflow-hidden border border-[#CCFBF1] rounded-2xl bg-white shadow-subtle ${className}`}>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left text-sm text-[#102A43] border-collapse">
          <thead className="bg-[#F0FDFA] text-xs uppercase font-bold text-[#102A43] tracking-wider border-b border-[#CCFBF1]">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key || index}
                  scope="col"
                  className={`px-5 py-4 whitespace-nowrap text-[#102A43] ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.headerClassName || ''}`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CCFBF1]/60">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-12 text-center text-[#102A43]">
                  <div className="inline-flex items-center gap-2.5 font-bold">
                    <svg className="animate-spin h-5 w-5 text-[#0D9488]" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Loading data records...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-5 py-10 text-center text-[#102A43]/70 text-sm font-semibold">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row[keyField] || rowIndex}
                  className={`transition-colors ${hoverable ? 'hover:bg-[#CCFBF1]/30' : ''} ${rowIndex % 2 === 1 ? 'bg-[#F0FDFA]/40' : 'bg-white'}`}
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
                        className={`px-5 py-4 whitespace-nowrap text-[#102A43] font-medium ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.cellClassName || ''}`}
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
