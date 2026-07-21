import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Decision.css";

function Documents() {

  const [documents, setDocuments] = useState([]);

  const navigate = useNavigate();

  // App.js uses /documents/:id
  const { id } = useParams();


  useEffect(() => {

    // If ID exists, fetch documents
    // only for that specific decision.
    // Otherwise, fetch all documents.

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

      }

    } catch (error) {

      console.log(error);

    }

  };


  return (

    <div className="container">


      <h1>

        {id
          ? `Documents for Decision ${id}`
          : "All Documents"}

      </h1>


      {/* Navigation Buttons */}

      <div style={{ marginBottom: "20px" }}>


        <button

          onClick={() => navigate("/decisions")}

        >

          View Decisions

        </button>


        <button

          onClick={() => navigate("/alternatives")}

          style={{ marginLeft: "10px" }}

        >

          View Alternatives

        </button>


      </div>


      {documents.length === 0 ? (

        <p>

          {id

            ? "No documents found for this decision."

            : "No documents uploaded yet."}

        </p>

      ) : (


        <table>


          <thead>

            <tr>

              <th>ID</th>

              <th>File Name</th>

              <th>File Type</th>

              <th>File Size (Bytes)</th>

              <th>Uploaded Date</th>

              <th>Actions</th>

            </tr>

          </thead>


          <tbody>


            {documents.map((document) => (


              <tr key={document.id}>


                <td>

                  {document.id}

                </td>


                <td>

                  {document.file_name}

                </td>


                <td>

                  {document.file_type}

                </td>


                <td>

                  {document.file_size}

                </td>


                <td>

                  {new Date(

                    document.uploaded_at

                  ).toLocaleString(

                    "en-IN",

                    {

                      day: "2-digit",

                      month: "long",

                      year: "numeric",

                      hour: "numeric",

                      minute: "2-digit",

                      hour12: true

                    }

                  )}

                </td>


                <td>


                  <a

                    href={`http://127.0.0.1:8000/${document.file_path}`}

                    target="_blank"

                    rel="noreferrer"

                  >

                    <button>

                      View

                    </button>

                  </a>


                  <button

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

                    style={{ marginLeft: "10px" }}

                  >

                    Delete

                  </button>


                </td>


              </tr>

            ))}


          </tbody>


        </table>

      )}


    </div>

  );

}


export default Documents;