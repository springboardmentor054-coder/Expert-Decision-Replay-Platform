import React, { useEffect, useState } from "react";

import {
  useNavigate,
  useParams
} from "react-router-dom";


function DecisionHistory() {

  const { decisionId } = useParams();

  const navigate = useNavigate();

  const API_URL =
    "http://127.0.0.1:8000";


  // =====================================
  // State
  // =====================================

  const [decision, setDecision] =
    useState(null);

  const [versions, setVersions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [message, setMessage] =
    useState("");


  // =====================================
  // Load Decision + Version History
  // =====================================

  useEffect(() => {

    const loadHistory = async () => {

      try {

        setLoading(true);

        setMessage("");


        // =====================================
        // Load Current Decision
        // =====================================

        const decisionResponse =
          await fetch(

            `${API_URL}/decisions/${decisionId}`

          );


        const decisionData =
          await decisionResponse.json();


        if (!decisionResponse.ok) {

          setMessage(

            decisionData.detail ||
            "Could not load decision"

          );

          return;

        }


        setDecision(
          decisionData
        );


        // =====================================
        // Load Version History
        // =====================================

        const versionResponse =
          await fetch(

            `${API_URL}/decisions/${decisionId}/versions`

          );


        const versionData =
          await versionResponse.json();


        if (!versionResponse.ok) {

          setMessage(

            versionData.detail ||
            "Could not load version history"

          );

          return;

        }


        setVersions(
          Array.isArray(versionData)
            ? versionData
            : []
        );


      } catch (error) {

        console.error(
          "Version history error:",
          error
        );

        setMessage(
          "Backend connection failed"
        );


      } finally {

        setLoading(false);

      }

    };


    loadHistory();

  }, [decisionId]);


  // =====================================
  // Loading
  // =====================================

  if (loading) {

    return (

      <div
        style={{
          padding: "30px"
        }}
      >

        <p>
          Loading version history...
        </p>

      </div>

    );

  }


  // =====================================
  // UI
  // =====================================

  return (

    <div
      style={{
        padding: "30px"
      }}
    >


      {/* BACK BUTTON */}

      <button

        type="button"

        onClick={() =>
          navigate(
            "/decisions?mode=view"
          )
        }

      >

        Back to Decisions

      </button>


      <br /><br />


      <h1>
        Decision Version History
      </h1>


      {/* =====================================
          CURRENT DECISION INFORMATION
      ===================================== */}

      {decision && (

        <div

          style={{

            padding: "15px",

            border:
              "1px solid #ccc",

            marginBottom:
              "25px",

            maxWidth:
              "800px",

          }}

        >

          <h2>
            Current Decision
          </h2>


          <p>

            <strong>
              Decision ID:
            </strong>

            {" "}

            {
              decision.decision_id
            }

          </p>


          <p>

            <strong>
              Title:
            </strong>

            {" "}

            {
              decision.decision_title
            }

          </p>


          <p>

            <strong>
              Description:
            </strong>

            {" "}

            {
              decision.decision_description
            }

          </p>

        </div>

      )}


      {/* MESSAGE */}

      {message && (

        <p>
          {message}
        </p>

      )}


      {/* =====================================
          VERSION HISTORY
      ===================================== */}

      <h2>
        Version History
      </h2>


      {versions.length === 0 ? (

        <p>
          No version history available.
        </p>

      ) : (

        <table

          border="1"

          cellPadding="10"

          style={{

            borderCollapse:
              "collapse",

            width:
              "100%",

          }}

        >


          <thead>

            <tr>

              <th>
                Version
              </th>

              <th>
                Title
              </th>

              <th>
                Description
              </th>

              <th>
                Status
              </th>

              <th>
                Modified By
              </th>

              <th>
                Modified At
              </th>

              <th>
                Change Summary
              </th>

            </tr>

          </thead>


          <tbody>

            {versions.map(
              (version) => (

                <tr
                  key={
                    version.id
                  }
                >


                  {/* VERSION NUMBER */}

                  <td>

                    Version{" "}

                    {
                      version.version_number
                    }

                  </td>


                  {/* TITLE */}

                  <td>

                    {
                      version.title ||
                      "-"
                    }

                  </td>


                  {/* DESCRIPTION */}

                  <td>

                    {
                      version.description ||
                      "-"
                    }

                  </td>


                  {/* STATUS */}

                  <td>

                    {
                      version.status ||
                      "-"
                    }

                  </td>


                  {/* MODIFIED BY */}

                  <td>

                    User ID{" "}

                    {
                      version.modified_by
                    }

                  </td>


                  {/* MODIFIED AT */}

                  <td>

                    {
                      version.modified_at

                        ? new Date(
                            version.modified_at
                          )
                            .toLocaleString()

                        : "-"
                    }

                  </td>


                  {/* CHANGE SUMMARY */}

                  <td>

                    {
                      version.change_summary ||
                      "-"
                    }

                  </td>


                </tr>

              )
            )}

          </tbody>


        </table>

      )}


    </div>

  );

}


export default DecisionHistory;