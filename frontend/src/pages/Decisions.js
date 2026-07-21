import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decision.css";

function Decisions() {

  const [decisions, setDecisions] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {

    fetch("http://127.0.0.1:8000/decisions")

      .then((response) => response.json())

      .then((data) => {

        setDecisions(data);

      })

      .catch((error) => {

        console.log(error);

      });

  }, []);


  const deleteDecision = async (id) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/decisions/${id}`,
        {
          method: "DELETE",
        }
      );


      if (response.ok) {

        setDecisions(
          decisions.filter(
            (decision) => decision.id !== id
          )
        );

      }

    } catch (error) {

      console.log(error);

    }

  };


  return (

    <div className="container">


      <h1>All Decisions</h1>


      <div style={{ marginBottom: "20px" }}>


        {/* Create Decision */}

        <button onClick={() => navigate("/")}>

          Create Decision

        </button>


        {/* View All Alternatives */}

        <button

          onClick={() => navigate("/alternatives")}

          style={{ marginLeft: "10px" }}

        >

          View Alternatives

        </button>


        {/* View All Documents */}

        <button

          onClick={() => navigate("/documents")}

          style={{ marginLeft: "10px" }}

        >

          View Documents

        </button>


      </div>


      <table>


        <thead>

          <tr>

            <th>ID</th>

            <th>Title</th>

            <th>Category</th>

            <th>Status</th>

            <th>Created By</th>

            <th>Created Date</th>

            <th>Actions</th>

          </tr>

        </thead>


        <tbody>


          {decisions.map((decision) => (


            <tr key={decision.id}>


              <td>

                {decision.id}

              </td>


              <td>

                {decision.title}

              </td>


              <td>

                {decision.category_id}

              </td>


              <td>

                {decision.status}

              </td>


              <td>

                {decision.created_by}

              </td>


              <td>

                {new Date(

                  decision.created_at

                ).toLocaleString(

                  "en-GB",

                  {

                    day: "2-digit",

                    month: "2-digit",

                    year: "numeric",

                    hour: "2-digit",

                    minute: "2-digit"

                  }

                )}

              </td>


              <td>


                {/* View Decision */}

                <button

                  onClick={() =>

                    navigate(

                      `/decision/${decision.id}`

                    )

                  }

                >

                  View

                </button>


                {/* Edit Decision */}

                <button

                  onClick={() =>

                    navigate(

                      `/edit/${decision.id}`

                    )

                  }

                  style={{ marginLeft: "10px" }}

                >

                  Edit

                </button>


                {/* Upload Document */}

                <button

                  onClick={() =>

                    navigate(

                      `/upload-document/${decision.id}`

                    )

                  }

                  style={{ marginLeft: "10px" }}

                >

                  Upload Document

                </button>


                {/* View Documents For This Decision */}

                <button

                  onClick={() =>

                    navigate(

                      `/documents/${decision.id}`

                    )

                  }

                  style={{ marginLeft: "10px" }}

                >

                  Documents

                </button>


                {/* Delete Decision */}

                <button

                  onClick={() => {


                    if (

                      window.confirm(

                        "Are you sure you want to delete this decision?"

                      )

                    ) {


                      deleteDecision(

                        decision.id

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


    </div>

  );

}


export default Decisions;