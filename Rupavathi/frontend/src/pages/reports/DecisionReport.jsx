import { useEffect, useMemo, useState } from 'react';
import { reportAPI, categoryAPI, extractErrorMessage } from '../../services/api';
import { exportToCSV, exportToPDF } from '../../utils/exportReport';
import { ExportButtons, SummaryPill, Pagination, formatReportDate } from '../../components/ReportWidgets';
import CustomSelect from '../../components/CustomSelect';

const DECISION_STATUSES = ['Draft', 'Under Review', 'Approved', 'Rejected'];
const PAGE_SIZE = 8;

const DECISION_COLUMNS = [
  { key: 'title', label: 'Decision Title' },
  { key: 'category', label: 'Category' },
  { key: 'status', label: 'Status' },
  { key: 'created_by', label: 'Created By' },
  { key: 'created_at', label: 'Created Date' },
];

function DecisionReport() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    categoryAPI
      .list()
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPage(1);

    const filters = {};
    if (search.trim()) filters.search = search.trim();
    if (category) filters.category_id = category;
    if (status) filters.status = status;

    reportAPI
      .decisions(filters)
      .then(({ data }) => {
        if (!cancelled) setData(data);
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load decision report.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, category, status]);

  const rows = useMemo(
    () => (data?.decisions || []).map((d) => ({ ...d, created_at: formatReportDate(d.created_at) })),
    [data]
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <section className="reports-section">
      <div className="reports-section-header">
        <div>
          <h2>Decision Report</h2>
          <p className="reports-section-sub">Every decision, with status and ownership at a glance.</p>
        </div>
        <ExportButtons
          disabled={rows.length === 0}
          onExportPdf={() => exportToPDF('Decision Report', DECISION_COLUMNS, rows)}
          onExportExcel={() => exportToCSV('decision-report.csv', DECISION_COLUMNS, rows)}
        />
      </div>

      <div className="reports-toolbar">
        <input
          type="text"
          className="reports-search"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <CustomSelect
          value={category}
          onChange={setCategory}
          placeholder="All Categories"
          options={[
            { value: '', label: 'All Categories' },
            ...categories.map((c) => ({ value: String(c.id), label: c.name })),
          ]}
        />
        <CustomSelect
          value={status}
          onChange={setStatus}
          placeholder="All Statuses"
          options={[
            { value: '', label: 'All Statuses' },
            ...DECISION_STATUSES.map((s) => ({ value: s, label: s })),
          ]}
        />
      </div>

      {data && (
        <div className="reports-summary-row">
          <SummaryPill label="Total Decisions" value={data.summary.total_decisions} />
          <SummaryPill label="Approved" value={data.summary.approved} tone="approved" />
          <SummaryPill label="Rejected" value={data.summary.rejected} tone="rejected" />
          <SummaryPill label="Pending" value={data.summary.pending} tone="pending" />
        </div>
      )}

      {error && <p className="reports-error">{error}</p>}

      {loading ? (
        <div className="reports-empty">Loading decision report...</div>
      ) : rows.length === 0 ? (
        <div className="reports-empty">No decisions match these filters.</div>
      ) : (
        <>
          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  {DECISION_COLUMNS.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{row.category}</td>
                    <td>{row.status}</td>
                    <td>{row.created_by}</td>
                    <td>{row.created_at}</td>
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

export default DecisionReport;
