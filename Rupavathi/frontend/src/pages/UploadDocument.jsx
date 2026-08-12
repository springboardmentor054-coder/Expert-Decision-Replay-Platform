import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { decisionAPI, documentAPI, extractErrorMessage } from '../services/api';
import { useToast } from '../context/ToastContext';
import BackButton from '../components/BackButton';
import CustomSelect from '../components/CustomSelect';
import './DocumentsView.css';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.xlsx', '.png', '.jpg', '.jpeg'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getExtension(filename) {
  const dot = filename.lastIndexOf('.');
  return dot === -1 ? '' : filename.slice(dot).toLowerCase();
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadDocument() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { decisionId } = useParams();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const [decisions, setDecisions] = useState([]);
  const [selectedDecisionId, setSelectedDecisionId] = useState('');
  const backTo = decisionId ? `/dashboard/decisions/${decisionId}/documents` : '/dashboard/documents';

  useEffect(() => {
    if (decisionId) return;
    decisionAPI
      .list()
      .then(({ data }) => setDecisions(data))
      .catch(() => setError('Could not load decisions.'));
  }, [decisionId]);

  const handleFileChange = (e) => {
    setError('');
    setFile(e.target.files[0] || null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const targetDecisionId = decisionId || selectedDecisionId;

    if (!targetDecisionId) {
      setError('Please select a decision.');
      return;
    }

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError('Unsupported file type. Allowed types: PDF, DOCX, XLSX, PNG, JPG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(`File is too large. Maximum allowed size is ${MAX_FILE_SIZE / (1024 * 1024)} MB.`);
      return;
    }

    setUploading(true);
    try {
      await documentAPI.upload(targetDecisionId, file);
      showToast('Document uploaded successfully!', 'success');
      navigate(decisionId ? `/dashboard/decisions/${decisionId}/documents` : '/dashboard/documents');
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not upload document. Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="documents-page">
      <div className="documents-page-header">
        <div>
          <h1>Upload Document</h1>
          <p>Attach a supporting file to a decision.</p>
        </div>
      </div>

      <div className="documents-panel">
        {error && <p className="documents-form-error">{error}</p>}

        <form onSubmit={handleSubmit} noValidate>
          {!decisionId && (
            <div className="documents-field" style={{ marginBottom: 20 }}>
              <label htmlFor="document-decision">Decision</label>
              <CustomSelect
                id="document-decision"
                options={decisions.map((d) => ({ value: String(d.id), label: d.title }))}
                value={selectedDecisionId}
                onChange={setSelectedDecisionId}
                placeholder="Select a decision..."
              />
            </div>
          )}

          <div
            className={
              file
                ? 'documents-file-input documents-file-input-filled'
                : isDragging
                ? 'documents-file-input documents-file-input-dragging'
                : 'documents-file-input'
            }
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              id="document-file"
              type="file"
              className="documents-file-input-native"
              accept={ALLOWED_EXTENSIONS.join(',')}
              onChange={handleFileChange}
            />

            {file ? (
              <div className="documents-file-selected">
                <div className="documents-file-selected-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <div className="documents-file-selected-info">
                  <p className="documents-file-selected-name">{file.name}</p>
                  <p className="documents-file-selected-size">{formatFileSize(file.size)}</p>
                </div>
                <label htmlFor="document-file" className="documents-file-change-link">
                  Change
                </label>
                <button
                  type="button"
                  className="documents-file-remove"
                  aria-label="Remove selected file"
                  onClick={handleRemoveFile}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <label htmlFor="document-file" className="documents-dropzone-label">
                <div className="documents-dropzone-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
                    <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
                  </svg>
                </div>
                <p className="documents-dropzone-title">
                  <span className="documents-dropzone-link">Choose a file</span> or drag and drop it here
                </p>
              </label>
            )}

            <p className="documents-file-hint">
              Allowed types: PDF, DOCX, XLSX, PNG, JPG &middot; Max size 10 MB
            </p>
          </div>

          <div className="documents-table-actions" style={{ marginTop: 20 }}>
            <button type="submit" className="documents-btn documents-btn-primary" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
            <button
              type="button"
              className="documents-btn documents-btn-secondary"
              onClick={() => navigate(backTo)}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <BackButton to={backTo}>Back to Documents</BackButton>
    </div>
  );
}

export default UploadDocument;
