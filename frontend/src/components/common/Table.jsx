import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export function Table({
  columns = [],
  data = [],
  sortBy,
  sortOrder,
  onSort,
  isLoading = false,
  loading = false,
  emptyMessage = 'No records found',
}) {
  const isBusy = isLoading || loading;

  const handleSortClick = (key, isSortable) => {
    if (!onSort || isSortable === false) return;
    if (sortBy === key) {
      onSort(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  return (
    <div className="table-card-wrapper">
      <table className="storesphere-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const headerText = col.header || col.title;
              const isSortable = col.sortable !== false && !!onSort;
              const isCurrentSort = sortBy === col.key;

              return (
                <th
                  key={col.key || headerText}
                  style={{ cursor: isSortable ? 'pointer' : 'default' }}
                  onClick={() => handleSortClick(col.key, isSortable)}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{headerText}</span>
                    {isSortable && (
                      <span style={{ display: 'inline-flex', color: isCurrentSort ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {isCurrentSort ? (
                          sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} style={{ opacity: 0.4 }} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {isBusy ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                Loading records...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((col) => (
                  <td key={col.key || col.header || col.title}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
