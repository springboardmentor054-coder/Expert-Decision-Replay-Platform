import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

function DocumentList() {

  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);


  const fetchDocuments = async () => {

    try {

      const response = await api.get("/documents");

      setDocuments(response.data);

    } catch (err) {

      console.log(err);

      setError("Failed to load documents");

    }

  };


  const deleteDocument = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this document?"
    );

    if (!confirmDelete) {
      return;
    }


    try {

      await api.delete(`/documents/${id}`);

      fetchDocuments();

    } catch (err) {

      console.log(err);

      setError("Failed to delete document");

    }

  };


  return (
  <div className="container">
    <div className="page-header">
      <div>
        <h1>Documents</h1>
        <p className="page-subtitle">
          Manage documents associated with organizational decisions
        </p>
      </div>

      <Link to="/upload-document" className="primary-link">
        + Upload Document
      </Link>
    </div>

    {error && (
      <div className="error">
        {error}
      </div>
    )}

    {documents.length === 0 ? (
      <div className="card empty-state">
        <h3>No documents found</h3>
        <p>Upload a document to get started.</p>

        <Link to="/upload-document" className="primary-link">
          Upload Document
        </Link>
      </div>
    ) : (
      <div className="card table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Decision ID</th>
                <th>Uploaded By</th>
                <th>File Name</th>
                <th>File Type</th>
                <th>File Size</th>
                <th>Uploaded At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.id}</td>

                  <td>{doc.decision_id}</td>

                  <td>{doc.uploaded_by}</td>

                  <td className="file-name">
                    {doc.file_name}
                  </td>

                  <td>{doc.file_type}</td>

                  <td>{doc.file_size} bytes</td>

                  <td>{doc.created_at}</td>

                  <td>
                    <div className="action-buttons">
                      <a
                        href={`http://127.0.0.1:8000/uploads/${doc.file_name}`}
                        target="_blank"
                        rel="noreferrer"
                        className="view-btn"
                      >
                        View
                      </a>

                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
);

}


export default DocumentList;