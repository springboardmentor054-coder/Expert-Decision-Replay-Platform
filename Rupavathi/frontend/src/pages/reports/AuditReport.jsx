import { useEffect, useMemo, useState } from 'react';
import { reportAPI, extractErrorMessage } from '../../services/api';
import { exportToCSV, exportToPDF } from '../../utils/exportReport';
import { ExportButtons, SummaryPill, Pagination } from '../../components/ReportWidgets';

const AUDIT_COLUMNS = [
  { key: 'action_type', label: 'Action Type' },
  { key: 'count', label: 'Count' },
];
const PAGE_SIZE = 8;

function AuditReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    reportAPI
      .audit()
      .then(({ data }) => setData(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load audit report.')))
      .finally(() => setLoading(false));
  }, []);

  const breakdown = data?.by_action_type || [];
  const totalPages = Math.max(1, Math.ceil(breakdown.length / PAGE_SIZE));
  const pagedBreakdown = useMemo(
    () => breakdown.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [breakdown, page]
  );

  return (
    <section className="reports-section">
      <div className="reports-section-header">
        <div>
          <h2>Audit Report</h2>
          <p className="reports-section-sub">System-wide activity since the platform went live.</p>
        </div>
        <ExportButtons
          disabled={!data || data.by_action_type.length === 0}
          onExportPdf={() => exportToPDF('Audit Report', AUDIT_COLUMNS, data?.by_action_type || [])}
          onExportExcel={() => exportToCSV('audit-report.csv', AUDIT_COLUMNS, data?.by_action_type || [])}
        />
      </div>

      {error && <p className="reports-error">{error}</p>}

      {loading ? (
        <div className="reports-empty">Loading audit report...</div>
      ) : (
        <>
          <div className="reports-summary-row">
            <SummaryPill label="Total Logins" value={data.summary.total_logins} />
            <SummaryPill label="Decisions Created" value={data.summary.decisions_created} />
            <SummaryPill label="Documents Uploaded" value={data.summary.documents_uploaded} />
            <SummaryPill label="Comments Added" value={data.summary.comments_added} />
            <SummaryPill label="Approval Actions" value={data.summary.approval_actions} />
          </div>

          {breakdown.length === 0 ? (
            <div className="reports-empty">No audit activity recorded yet.</div>
          ) : (
            <>
              <div className="reports-table-wrap">
                <table className="reports-table">
                  <thead>
                    <tr>
                      {AUDIT_COLUMNS.map((c) => (
                        <th key={c.key}>{c.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedBreakdown.map((row) => (
                      <tr key={row.action_type}>
                        <td>{row.action_type}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </section>
  );
}

export default AuditReport;
