import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { documentAPI, decisionAPI, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import BackButton from '../components/BackButton';
import './DocumentsView.css';

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

function DocumentsView() {
  const { showToast } = useToast();
  const { decisionId } = useParams();
  const [decision, setDecision] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDocuments = () => {
    setLoading(true);
    Promise.all([decisionAPI.get(decisionId), documentAPI.listForDecision(decisionId)])
      .then(([decisionRes, documentsRes]) => {
        setDecision(decisionRes.data);
        setDocuments(documentsRes.data);
      })
      .catch((err) => setError(extractErrorMessage(err, 'Could not load documents.')))
      .finally(() => setLoading(false));
  };

  useEffect(loadDocuments, [decisionId]);

  const handleDelete = async (documentId) => {
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    try {
      await documentAPI.remove(documentId);
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
      showToast('Document deleted successfully!', 'success');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not delete document.'));
    }
  };

  return (
    <div className="documents-page">
      <BackButton to={`/dashboard/decisions/${decisionId}`}>Back to Decision</BackButton>

      <div className="documents-page-header">
        <div>
          <h1>Documents{decision ? ` for "${decision.title}"` : ''}</h1>
          <p>Every document uploaded here is attached to this decision.</p>
        </div>
        <Link to={`/dashboard/decisions/${decisionId}/documents/upload`} className="documents-btn documents-btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Upload Document
        </Link>
      </div>

      <div className="documents-panel">
        {error && <p className="documents-form-error">{error}</p>}

        {loading ? (
          <div className="documents-loading">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="documents-empty">No documents uploaded yet for this decision.</div>
        ) : (
          <table className="documents-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>File Type</th>
                <th>File Size</th>
                <th>Uploaded Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td className="documents-table-name">{doc.file_name}</td>
                  <td>{doc.file_type.toUpperCase()}</td>
                  <td>{formatFileSize(doc.file_size)}</td>
                  <td>{formatDate(doc.uploaded_at)}</td>
                  <td>
                    <div className="documents-table-actions">
                      <a
                        href={documentAPI.downloadUrl(doc.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="documents-table-download-link"
                      >
                        Download / View
                      </a>
                      <button
                        type="button"
                        className="documents-btn documents-btn-danger"
                        onClick={() => handleDelete(doc.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DocumentsView;
