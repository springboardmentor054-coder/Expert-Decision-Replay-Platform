import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function UploadDocument() {

  const navigate = useNavigate();

  const [decisionId, setDecisionId] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [file, setFile] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!file) {
      setError("Please select a file");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("decision_id", decisionId);
    formData.append("uploaded_by", uploadedBy);

    try {

      const response = await api.post(
        "/documents/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Document uploaded successfully");

      console.log(response.data);

      setTimeout(() => {
        navigate("/documents");
      }, 1000);

    } catch (err) {

      console.log(err);

      if (err.response) {
        setError(
          err.response.data.detail ||
          "Upload failed"
        );
      } else {
        setError("Server not reachable");
      }
    }
  };


  return (
    <div>

      <h2>Upload Document</h2>

      <form onSubmit={handleUpload}>

        <div>
          <label>
            Decision ID:
          </label>

          <input
            type="number"
            value={decisionId}
            onChange={(e) =>
              setDecisionId(e.target.value)
            }
            required
          />
        </div>


        <br />


        <div>
          <label>
            Uploaded By ID:
          </label>

          <input
            type="number"
            value={uploadedBy}
            onChange={(e) =>
              setUploadedBy(e.target.value)
            }
            required
          />
        </div>


        <br />


        <div>
          <label>
            Select Document:
          </label>

          <input
            type="file"
            onChange={(e) =>
              setFile(e.target.files[0])
            }
            required
          />

        </div>


        <br />


        <button type="submit">
          Upload
        </button>


      </form>


      <br />


      {
        message &&
        <p style={{ color: "green" }}>
          {message}
        </p>
      }


      {
        error &&
        <p style={{ color: "red" }}>
          {error}
        </p>
      }


    </div>
  );
}


export default UploadDocument;