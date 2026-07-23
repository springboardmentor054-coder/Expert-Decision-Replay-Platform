import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Documents.css";

function Documents() {

  const [documents, setDocuments] = useState([]);

  const navigate = useNavigate();

  const { id } = useParams();


  useEffect(() => {

    const url = id
      ? `http://127.0.0.1:8000/documents/decision/${id}`
      : "http://127.0.0.1:8000/documents";


    fetch(url)

      .then((response) => {

        if (!response.ok) {
          throw new Error("Failed to fetch documents");
        }

        return response.json();

      })

      .then((data) => {

        setDocuments(data);

      })

      .catch((error) => {

        console.log(error);

        setDocuments([]);

      });

  }, [id]);


  const deleteDocument = async (documentId) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/documents/${documentId}`,
        {
          method: "DELETE",
        }
      );


      if (response.ok) {

        setDocuments(

          documents.filter(

            (document) =>
              document.id !== documentId

          )

        );

      } else {

        alert("Unable to delete document");

      }

    } catch (error) {

      console.log(error);

      alert("Server connection failed");

    }

  };


  const formatFileSize = (bytes) => {

    if (!bytes) {
      return "0 KB";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  };


  const formatDate = (date) => {

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      }
    );

  };


  return (

    <div className="documents-page">


      {/* ================================= */}
      {/* TOP NAVBAR */}
      {/* ================================= */}

      <nav className="documents-navbar">

        <div className="documents-brand">

          <div className="documents-logo">
            ED
          </div>

          <div>

            <h2>
              Expert Decision Replay
            </h2>

            <span>
              Document Management
            </span>

          </div>

        </div>


        <div className="documents-nav-actions">

          <button
            onClick={() => navigate("/decisions")}
            className="nav-secondary-button"
          >
            ← Decisions
          </button>

          <button
            onClick={() => navigate("/alternatives")}
            className="nav-secondary-button"
          >
            Alternatives
          </button>

          {id && (

            <button
              onClick={() => navigate(`/upload-document/${id}`)}
              className="upload-document-button"
            >
              + Upload Document
            </button>

          )}

        </div>

      </nav>


      {/* ================================= */}
      {/* MAIN CONTENT */}
      {/* ================================= */}

      <main className="documents-main">


        {/* Header */}

        <div className="documents-header">

          <div>

            <span className="documents-eyebrow">
              SUPPORTING EVIDENCE
            </span>

            <h1>
              {id
                ? `Documents for Decision ${id}`
                : "All Documents"}
            </h1>

            <p>

              {id
                ? "Review supporting files attached to this decision."
                : "Manage and review all supporting documents across decisions."}

            </p>

          </div>


          {id && (

            <button
              onClick={() => navigate(`/decision/${id}`)}
              className="back-decision-button"
            >
              ← Back to Decision
            </button>

          )}

        </div>


        {/* ================================= */}
        {/* DOCUMENT STAT */}
        {/* ================================= */}

        <div className="document-stat-card">

          <div className="document-stat-icon">
            📄
          </div>

          <div>

            <span>
              TOTAL DOCUMENTS
            </span>

            <strong>
              {documents.length}
            </strong>

          </div>

        </div>


        {/* ================================= */}
        {/* DOCUMENT CONTENT */}
        {/* ================================= */}

        {documents.length === 0 ? (

          <div className="documents-empty-state">

            <div className="empty-document-icon">
              📂
            </div>

            <h2>
              No Documents Found
            </h2>

            <p>

              {id
                ? "No supporting documents have been uploaded for this decision yet."
                : "No documents have been uploaded to the platform yet."}

            </p>


            {id && (

              <button
                onClick={() => navigate(`/upload-document/${id}`)}
                className="upload-empty-button"
              >
                + Upload Supporting Document
              </button>

            )}

          </div>

        ) : (

          <div className="documents-table-card">


            <div className="table-header">

              <div>

                <h2>
                  Supporting Documents
                </h2>

                <p>
                  Files associated with this decision
                </p>

              </div>

            </div>


            <div className="table-wrapper">

              <table className="documents-table">

                <thead>

                  <tr>

                    <th>
                      DOCUMENT
                    </th>

                    {!id && (

                      <th>
                        DECISION
                      </th>

                    )}

                    <th>
                      TYPE
                    </th>

                    <th>
                      SIZE
                    </th>

                    <th>
                      UPLOADED
                    </th>

                    <th>
                      ACTIONS
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {documents.map((document) => (

                    <tr key={document.id}>


                      {/* File Name */}

                      <td>

                        <div className="file-info">

                          <div className="file-icon">
                            📄
                          </div>

                          <div>

                            <strong>
                              {document.file_name}
                            </strong>

                            <span>
                              Document #{document.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* Decision ID */}

                      {!id && (

                        <td>

                          <span className="decision-tag">

                            Decision {document.decision_id}

                          </span>

                        </td>

                      )}


                      {/* File Type */}

                      <td>

                        <span className="file-type">

                          {document.file_type || "Unknown"}

                        </span>

                      </td>


                      {/* File Size */}

                      <td>

                        {formatFileSize(
                          document.file_size
                        )}

                      </td>


                      {/* Uploaded Date */}

                      <td>

                        <span className="uploaded-date">

                          {formatDate(
                            document.uploaded_at
                          )}

                        </span>

                      </td>


                      {/* Actions */}

                      <td>

                        <div className="document-actions">


                          <a
                            href={`http://127.0.0.1:8000/${document.file_path}`}
                            target="_blank"
                            rel="noreferrer"
                          >

                            <button className="view-document-button">
                              View
                            </button>

                          </a>


                          <button

                            className="delete-document-button"

                            onClick={() => {

                              if (

                                window.confirm(

                                  "Are you sure you want to delete this document?"

                                )

                              ) {

                                deleteDocument(
                                  document.id
                                );

                              }

                            }}

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

      </main>

    </div>

  );

}


export default Documents;