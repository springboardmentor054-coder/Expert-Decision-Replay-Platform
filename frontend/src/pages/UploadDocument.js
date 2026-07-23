import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./UploadDocument.css";

function UploadDocument() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [file, setFile] = useState(null);

  const [isUploading, setIsUploading] = useState(false);


  const uploadDocument = async () => {

    if (!file) {

      alert("Please select a file");

      return;

    }


    const token = localStorage.getItem("token");

    if (!token) {

      alert("Please login first");

      navigate("/login");

      return;

    }


    const formData = new FormData();

    formData.append("decision_id", id);

    formData.append("uploaded_by", 1);

    formData.append("file", file);


    setIsUploading(true);


    try {

      const response = await fetch(
        "http://127.0.0.1:8000/documents/upload",
        {
          method: "POST",

          headers: {
            "Authorization": `Bearer ${token}`
          },

          body: formData
        }
      );


      if (response.ok) {

        alert("Document uploaded successfully");

        navigate(`/documents/${id}`);

      } else {

        const errorData = await response.json();

        alert(
          errorData.detail ||
          "Upload failed"
        );

      }

    } catch (error) {

      console.log(error);

      alert(
        "Something went wrong while uploading"
      );

    } finally {

      setIsUploading(false);

    }

  };


  return (

    <div className="upload-page">


      {/* ================================= */}
      {/* TOP NAVBAR */}
      {/* ================================= */}

      <nav className="upload-navbar">

        <div className="upload-brand">

          <div className="upload-logo">
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


        <div className="upload-nav-actions">

          <button
            onClick={() => navigate("/decisions")}
            className="upload-nav-button"
          >
            ← Decisions
          </button>

          <button
            onClick={() => navigate(`/decision/${id}`)}
            className="upload-nav-button"
          >
            Decision Details
          </button>

        </div>

      </nav>


      {/* ================================= */}
      {/* MAIN CONTENT */}
      {/* ================================= */}

      <main className="upload-main">


        {/* Page Header */}

        <div className="upload-header">

          <span className="upload-eyebrow">
            SUPPORTING EVIDENCE
          </span>

          <h1>
            Upload Document
          </h1>

          <p>
            Attach supporting evidence and files to this decision.
          </p>

        </div>


        {/* ================================= */}
        {/* UPLOAD CARD */}
        {/* ================================= */}

        <div className="upload-card">


          <div className="upload-card-header">

            <div className="upload-file-icon">
              📄
            </div>

            <div>

              <h2>
                Add Supporting Document
              </h2>

              <p>
                Decision #{id}
              </p>

            </div>

          </div>


          {/* File Upload Area */}

          <label className="file-upload-area">

            <div className="upload-cloud-icon">
              ⬆
            </div>

            <strong>
              {file
                ? file.name
                : "Choose a document to upload"}
            </strong>

            <span>

              {file
                ? `${(file.size / 1024).toFixed(1)} KB selected`
                : "Click here to browse files from your computer"}

            </span>


            <input

              type="file"

              onChange={(e) =>
                setFile(
                  e.target.files[0]
                )
              }

            />

          </label>


          {/* Selected File */}

          {file && (

            <div className="selected-file">

              <div className="selected-file-icon">
                📎
              </div>

              <div className="selected-file-info">

                <strong>
                  {file.name}
                </strong>

                <span>
                  {(file.size / 1024).toFixed(1)} KB
                </span>

              </div>

              <button
                type="button"
                onClick={() => setFile(null)}
                className="remove-file-button"
              >
                Remove
              </button>

            </div>

          )}


          {/* Upload Actions */}

          <div className="upload-actions">

            <button

              onClick={() =>
                navigate(`/documents/${id}`)
              }

              className="cancel-upload-button"

            >
              Cancel
            </button>


            <button

              onClick={uploadDocument}

              className="confirm-upload-button"

              disabled={isUploading}

            >

              {isUploading
                ? "Uploading..."
                : "Upload Document"}

            </button>

          </div>


        </div>


        {/* Info */}

        <div className="upload-info">

          <span>
            💡
          </span>

          <p>
            Supporting documents help teams understand the evidence,
            research, and context behind a decision.
          </p>

        </div>


      </main>

    </div>

  );

}


export default UploadDocument;