function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="list-pagination">
      <button
        type="button"
        className="list-page-btn"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      <span className="list-page-status">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className="list-page-btn"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </div>
  );
}

export default Pagination;
