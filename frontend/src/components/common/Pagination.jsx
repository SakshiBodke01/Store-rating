import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({
  currentPage = 1,
  totalPages = 1,
  totalCount,
  limit = 10,
  onPageChange,
  onLimitChange,
}) {
  if (totalPages <= 1 && totalCount === undefined) return null;

  const startRecord = (currentPage - 1) * limit + 1;
  const endRecord = totalCount ? Math.min(currentPage * limit, totalCount) : null;

  return (
    <div className="pagination-container">
      <div className="pagination-text">
        {totalCount !== undefined ? (
          <>
            Showing <strong>{startRecord}</strong>–<strong>{endRecord}</strong> of <strong>{totalCount}</strong> entries
          </>
        ) : (
          <>
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </>
        )}
      </div>

      <div className="pagination-actions">
        {onLimitChange && (
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="form-select"
            style={{ width: 'auto', height: '32px', fontSize: '0.8125rem', padding: '0 0.5rem' }}
            aria-label="Items per page"
          >
            <option value={5}>5 / page</option>
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
          </select>
        )}

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft size={14} /> Previous
        </Button>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
