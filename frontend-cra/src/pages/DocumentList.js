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

    <div>

      <h2>Documents List</h2>


      <Link to="/upload-document">
        Upload New Document
      </Link>


      <br />
      <br />


      {
        error &&
        <p style={{ color: "red" }}>
          {error}
        </p>
      }



      {
        documents.length === 0 ?

        (
          <p>No documents found</p>
        )

        :

        (

          <table border="1">

            <thead>

              <tr>
                <th>ID</th>
                <th>Decision ID</th>
                <th>Uploaded By</th>
                <th>File Name</th>
                <th>File Type</th>
                <th>File Size</th>
                <th>Uploaded At</th>
                <th>Action</th>
              </tr>

            </thead>



            <tbody>


              {
                documents.map((doc) => (

                  <tr key={doc.id}>


                    <td>
                      {doc.id}
                    </td>


                    <td>
                      {doc.decision_id}
                    </td>


                    <td>
                      {doc.uploaded_by}
                    </td>


                    <td>
                      {doc.file_name}
                    </td>


                    <td>
                      {doc.file_type}
                    </td>


                    <td>
                      {doc.file_size} bytes
                    </td>


                    <td>
                      {doc.created_at}
                    </td>


                    <td>


                      <a
                        href={`http://127.0.0.1:8000/uploads/${doc.file_name}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>


                      <button
                        onClick={() => deleteDocument(doc.id)}
                        style={{ marginLeft: "10px" }}
                      >
                        Delete
                      </button>


                    </td>


                  </tr>

                ))
              }


            </tbody>


          </table>

        )

      }


    </div>

  );

}


export default DocumentList;