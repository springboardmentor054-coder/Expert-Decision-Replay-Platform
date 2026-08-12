import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { documentAPI, extractErrorMessage } from '../services/api';
import BackButton from '../components/BackButton';
import Pagination from '../components/Pagination';
import './GlobalList.css';

const PAGE_SIZE = 10;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function GlobalDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    documentAPI
      .listAll()
      .then(({ data }) => setDocuments(data))
      .catch((err) => setError(extractErrorMessage(err, 'Could not load documents.')))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return documents;
    return documents.filter(
      (doc) =>
        doc.file_name.toLowerCase().includes(term) ||
        doc.decision.title.toLowerCase().includes(term)
    );
  }, [documents, search]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pagedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="global-list-page">
      <BackButton to="/dashboard">Back to Dashboard</BackButton>

      <div className="global-list-header global-list-header-with-action">
        <div>
          <h1>Documents</h1>
          <p>Every document uploaded across all decisions, in one place.</p>
        </div>
        <Link to="/dashboard/documents/upload" className="global-list-upload-btn">
          Upload Document
        </Link>
      </div>

      <div className="global-list-toolbar">
        <input
          type="text"
          className="global-list-search"
          placeholder="Search by file name or decision title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="global-list-panel">
        {error && <p className="global-list-error">{error}</p>}

        {loading ? (
          <div className="global-list-empty">Loading documents...</div>
        ) : rows.length === 0 ? (
          <div className="global-list-empty">No documents match these filters.</div>
        ) : (
          <>
            <table className="global-list-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Decision</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded By</th>
                  <th>Uploaded</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagedRows.map((doc) => (
                  <tr key={doc.id}>
                    <td>{doc.file_name}</td>
                    <td>
                      <Link
                        to={`/dashboard/decisions/${doc.decision_id}`}
                        className="global-list-decision-link"
                      >
                        {doc.decision.title}
                      </Link>
                    </td>
                    <td>{doc.file_type.toUpperCase()}</td>
                    <td>{formatFileSize(doc.file_size)}</td>
                    <td>{doc.uploader.full_name}</td>
                    <td>{formatDate(doc.uploaded_at)}</td>
                    <td>
                      <a
                        href={documentAPI.downloadUrl(doc.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="global-list-action-btn"
                        aria-label="Download document"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                          <path d="M7 10l5 5 5-5" />
                          <path d="M12 15V3" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

export default GlobalDocuments;
