import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Decision.css";

function Alternatives() {

  const [alternatives, setAlternatives] = useState([]);

  const navigate = useNavigate();

  // Get Decision ID from URL
  const { id } = useParams();


  useEffect(() => {

    fetch("http://127.0.0.1:8000/alternatives")

      .then(response => response.json())

      .then(data => {

        // If Decision ID is provided,
        // show only alternatives linked to that decision
        if (id) {

          const filteredAlternatives = data.filter(
            alternative =>
              alternative.decision_id === parseInt(id)
          );

          setAlternatives(filteredAlternatives);

        } else {

          // If no Decision ID is provided,
          // show all alternatives
          setAlternatives(data);

        }

      })

      .catch(error => {

        console.log("Error fetching alternatives:", error);

      });

  }, [id]);


  const deleteAlternative = async (alternativeId) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/alternatives/${alternativeId}`,
        {
          method: "DELETE",
        }
      );


      if (response.ok) {

        setAlternatives(
          alternatives.filter(
            alternative => alternative.id !== alternativeId
          )
        );

        alert("Alternative deleted successfully");

      } else {

        alert("Unable to delete alternative");

      }

    } catch (error) {

      console.log("Delete Error:", error);

      alert("Server connection failed");

    }

  };


  return (

    <div className="alternatives-page">


      {/* ================================= */}
      {/* PAGE HEADER */}
      {/* ================================= */}

      <div className="alternatives-header">

        <div>

          <span className="eyebrow">
            DECISION ANALYSIS
          </span>

          <h1>
            {id
              ? `Alternatives for Decision ${id}`
              : "All Alternatives"
            }
          </h1>

          <p>

            {id
              ? "Review and manage the alternatives considered for this decision."
              : "Review and manage all available decision alternatives."
            }

          </p>

        </div>


        <div className="alternatives-header-actions">

          <button
            className="secondary-btn"
            onClick={() => navigate("/decisions")}
          >
            ← Back to Decisions
          </button>

          <button
            className="primary-action-btn"
            onClick={() => navigate("/add-alternative")}
          >
            + Add Alternative
          </button>

        </div>

      </div>



      {/* ================================= */}
      {/* DECISION CONTEXT */}
      {/* ================================= */}

      {id && (

        <div className="decision-context-card">

          <div className="context-icon">
            ⚖️
          </div>

          <div>

            <strong>
              Decision {id}
            </strong>

            <span>
              Showing only alternatives linked to this decision
            </span>

          </div>

        </div>

      )}



      {/* ================================= */}
      {/* ALTERNATIVES SUMMARY */}
      {/* ================================= */}

      <div className="alternatives-summary">

        <div className="summary-card">

          <div className="summary-icon">
            ⚖️
          </div>

          <div>

            <span>
              Total Alternatives
            </span>

            <strong>
              {alternatives.length}
            </strong>

          </div>

        </div>


        <div className="summary-card">

          <div className="summary-icon blue">
            📊
          </div>

          <div>

            <span>
              Comparison
            </span>

            <strong>
              Available
            </strong>

          </div>

        </div>

      </div>



      {/* ================================= */}
      {/* ALTERNATIVES TABLE CARD */}
      {/* ================================= */}

      <div className="alternatives-card">


        <div className="alternatives-card-header">

          <div>

            <h2>
              Alternative Options
            </h2>

            <p>
              Evaluate the available choices before making a final decision.
            </p>

          </div>


          <button
            className="comparison-btn"
            onClick={() =>
              id
                ? navigate(`/alternative-comparison/${id}`)
                : navigate("/alternative-comparison")
            }
          >
            ⇄ Compare Alternatives
          </button>

        </div>



        {alternatives.length === 0 ? (

          /* ================================= */
          /* EMPTY STATE */
          /* ================================= */

          <div className="alternatives-empty-state">

            <div className="empty-alternative-icon">
              ⚖️
            </div>

            <h3>
              No Alternatives Found
            </h3>

            <p>

              {id
                ? `No alternatives have been added to Decision ${id} yet.`
                : "No alternatives have been created yet."
              }

            </p>


            <button
              className="primary-action-btn"
              onClick={() => navigate("/add-alternative")}
            >
              + Add Your First Alternative
            </button>

          </div>

        ) : (

          /* ================================= */
          /* TABLE */
          /* ================================= */

          <div className="alternatives-table-wrapper">

            <table className="alternatives-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Alternative</th>

                  <th>Estimated Cost</th>

                  <th>Feasibility</th>

                  <th>Risk Level</th>

                  <th>Actions</th>

                </tr>

              </thead>


              <tbody>

                {alternatives.map((alternative) => (

                  <tr key={alternative.id}>


                    <td>

                      <span className="alternative-id">

                        #{alternative.id}

                      </span>

                    </td>


                    <td>

                      <div className="alternative-name">

                        <strong>
                          {alternative.alternative_name}
                        </strong>

                      </div>

                    </td>


                    <td>

                      <span className="cost-value">

                        {alternative.estimated_cost}

                      </span>

                    </td>


                    <td>

                      <span className="feasibility-badge">

                        {alternative.feasibility}

                      </span>

                    </td>


                    <td>

                      <span
                        className={`risk-badge risk-${String(
                          alternative.risk_level
                        ).toLowerCase()}`}
                      >

                        {alternative.risk_level}

                      </span>

                    </td>


                    <td>

                      <div className="alternative-actions">


                        <button

                          className="edit-alt-btn"

                          onClick={() =>
                            navigate(
                              `/edit-alternative/${alternative.id}`
                            )
                          }

                        >

                          Edit

                        </button>



                        <button

                          className="delete-alt-btn"

                          onClick={() => {

                            if (
                              window.confirm(
                                "Are you sure you want to delete this alternative?"
                              )
                            ) {

                              deleteAlternative(
                                alternative.id
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

        )}

      </div>



      {/* ================================= */}
      {/* BACK TO DECISION */}
      {/* ================================= */}

      {id && (

        <div className="back-to-decision">

          <button
            onClick={() => navigate(`/decision/${id}`)}
          >

            ← Back to Decision {id}

          </button>

        </div>

      )}


    </div>

  );

}


export default Alternatives;