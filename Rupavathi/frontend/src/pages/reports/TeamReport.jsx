import { useEffect, useMemo, useState } from 'react';
import { reportAPI, extractErrorMessage } from '../../services/api';
import { exportToCSV, exportToPDF } from '../../utils/exportReport';
import { ExportButtons, Pagination } from '../../components/ReportWidgets';

const TEAM_COLUMNS = [
  { key: 'team_name', label: 'Team Name' },
  { key: 'total_users', label: 'Total Users' },
  { key: 'total_decisions', label: 'Total Decisions' },
  { key: 'total_approvals', label: 'Total Approvals' },
];
const PAGE_SIZE = 8;

function TeamReport() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    reportAPI
      .teams()
      .then(({ data }) => setData(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load team report.')))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const teams = data?.teams || [];
    const term = search.trim().toLowerCase();
    if (!term) return teams;
    return teams.filter((t) => t.team_name.toLowerCase().includes(term));
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
          <h2>Team Report</h2>
          <p className="reports-section-sub">Decision activity grouped by department.</p>
        </div>
        <ExportButtons
          disabled={rows.length === 0}
          onExportPdf={() => exportToPDF('Team Report', TEAM_COLUMNS, rows)}
          onExportExcel={() => exportToCSV('team-report.csv', TEAM_COLUMNS, rows)}
        />
      </div>

      <div className="reports-toolbar">
        <input
          type="text"
          className="reports-search"
          placeholder="Search by team name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <p className="reports-error">{error}</p>}

      {loading ? (
        <div className="reports-empty">Loading team report...</div>
      ) : rows.length === 0 ? (
        <div className="reports-empty">No teams match these filters.</div>
      ) : (
        <>
          <div className="reports-table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  {TEAM_COLUMNS.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((row) => (
                  <tr key={row.team_name}>
                    <td>{row.team_name}</td>
                    <td>{row.total_users}</td>
                    <td>{row.total_decisions}</td>
                    <td>{row.total_approvals}</td>
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

export default TeamReport;
