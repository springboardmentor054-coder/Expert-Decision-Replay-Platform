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

        // If a Decision ID is provided,
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

        console.log(error);

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

      }

    } catch (error) {

      console.log(error);

    }

  };


  return (

    <div className="container">


      <h1>
        {id
          ? `Alternatives for Decision ${id}`
          : "All Alternatives"
        }
      </h1>


      {/* Navigation Buttons */}

      <div style={{ marginBottom: "20px" }}>


        <button onClick={() => navigate("/")}>
          Create Decision
        </button>


        <button
          onClick={() => navigate("/decisions")}
          style={{ marginLeft: "10px" }}
        >
          View Decisions
        </button>


        <button
          onClick={() => navigate("/add-alternative")}
          style={{ marginLeft: "10px" }}
        >
          Add Alternative
        </button>


        <button
          onClick={() => navigate("/alternative-comparison")}
          style={{ marginLeft: "10px" }}
        >
          Compare Alternatives
        </button>


      </div>


      {id && (

        <button
          onClick={() => navigate(`/decision/${id}`)}
          style={{ marginBottom: "20px" }}
        >
          Back to Decision {id}
        </button>

      )}


      <table>


        <thead>

          <tr>

            <th>ID</th>

            <th>Alternative Name</th>

            <th>Cost</th>

            <th>Feasibility</th>

            <th>Risk Level</th>

            <th>Actions</th>

          </tr>

        </thead>


        <tbody>

          {alternatives.length === 0 ? (

            <tr>

              <td colSpan="6">
                No alternatives found for this decision.
              </td>

            </tr>

          ) : (

            alternatives.map((alternative) => (

              <tr key={alternative.id}>

                <td>
                  {alternative.id}
                </td>

                <td>
                  {alternative.alternative_name}
                </td>

                <td>
                  {alternative.estimated_cost}
                </td>

                <td>
                  {alternative.feasibility}
                </td>

                <td>
                  {alternative.risk_level}
                </td>


                <td>

                  <button
                    onClick={() =>
                      navigate(`/edit-alternative/${alternative.id}`)
                    }
                  >
                    Edit
                  </button>


                  <button
                    onClick={() => {

                      if (
                        window.confirm(
                          "Are you sure you want to delete this alternative?"
                        )
                      ) {

                        deleteAlternative(alternative.id);

                      }

                    }}
                    style={{ marginLeft: "10px" }}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>


    </div>

  );

}


export default Alternatives;