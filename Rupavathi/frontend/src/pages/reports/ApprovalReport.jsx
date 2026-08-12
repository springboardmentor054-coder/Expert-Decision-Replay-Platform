import { useEffect, useMemo, useState } from 'react';
import { reportAPI, extractErrorMessage } from '../../services/api';
import { exportToCSV, exportToPDF } from '../../utils/exportReport';
import { ExportButtons, Pagination } from '../../components/ReportWidgets';

const APPROVAL_COLUMNS = [
  { key: 'reviewer_name', label: 'Reviewer Name' },
  { key: 'role', label: 'Role' },
  { key: 'decisions_approved', label: 'Decisions Approved' },
  { key: 'decisions_rejected', label: 'Decisions Rejected' },
  { key: 'pending_reviews', label: 'Pending Reviews' },
];
const PAGE_SIZE = 8;

function ApprovalReport() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    reportAPI
      .approvals()
      .then(({ data }) => setData(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load approval report.')))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const reviewers = data?.reviewers || [];
    const term = search.trim().toLowerCase();
    if (!term) return reviewers;
    return reviewers.filter((r) => r.reviewer_name.toLowerCase().includes(term));
  }, [data, search]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="reports-section">
      <div className="reports-section-header">
        <div>
          <h2>Approval Report</h2>
          <p className="reports-section-sub">Reviewer workload and decision outcomes.</p>
        </div>
        <ExportButtons
          disabled={rows.length === 0}
          onExportPdf={() => exportToPDF('Approval Report', APPROVAL_COLUMNS, rows)}
          onExportExcel={() => exportToCSV('approval-report.csv', APPROVAL_COLUMNS, rows)}
        />
      </div>

      <div className="reports-toolbar">
        <input
          type="text"
          className="reports-search"
          placeholder="Search by reviewer name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="reports-error">{error}</p>}

      {loading ? (
        <div className="reports-empty">Loading approval report...</div>
      ) : rows.length === 0 ? (
        <div className="reports-empty">No reviewers match these filters.</div>
      ) : (
        <>
          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  {APPROVAL_COLUMNS.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.reviewer_id}>
                    <td>{row.reviewer_name}</td>
                    <td>{row.role}</td>
                    <td>{row.decisions_approved}</td>
                    <td>{row.decisions_rejected}</td>
                    <td>{row.pending_reviews}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}

export default ApprovalReport;
