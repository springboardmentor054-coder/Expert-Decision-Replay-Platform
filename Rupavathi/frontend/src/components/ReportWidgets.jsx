export function ExportButtons({ onExportPdf, onExportExcel, disabled }) {
  return (
    <div className="reports-export-group">
      <button type="button" className="reports-export-btn" onClick={onExportPdf} disabled={disabled}>
        Export PDF
      </button>
      <button type="button" className="reports-export-btn" onClick={onExportExcel} disabled={disabled}>
        Export Excel
      </button>
    </div>
  );
}

export function SummaryPill({ label, value, tone }) {
  return (
    <div className={`reports-summary-pill ${tone ? `reports-summary-pill-${tone}` : ''}`}>
      <span className="reports-summary-value">{value}</span>
      <span className="reports-summary-label">{label}</span>
    </div>
  );
}

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="reports-pagination">
      <button
        type="button"
        className="reports-page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      <span className="reports-page-status">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="reports-page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}

export function formatReportDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
