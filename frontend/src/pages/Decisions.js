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


        <button onClick={() => navigate("/")}>
          Create Decision
        </button>


        <button
          onClick={() => navigate("/alternatives")}
          style={{ marginLeft: "10px" }}
        >
          View Alternatives
        </button>


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
            <th>Problem Statement</th>
            <th>Status</th>
            <th>Actions</th>

          </tr>

        </thead>



        <tbody>

          {decisions.map((decision) => (

            <tr key={decision.id}>


              <td>{decision.id}</td>


              <td>{decision.title}</td>


              <td>{decision.problem_statement}</td>


              <td>{decision.status}</td>



              <td>


                <button
                  onClick={() =>
                    navigate(`/edit/${decision.id}`)
                  }
                >
                  Edit
                </button>



                <button
                  onClick={() =>
                    navigate(`/upload-document/${decision.id}`)
                  }
                  style={{ marginLeft: "10px" }}
                >
                  Upload Document
                </button>



                <button
                  onClick={() =>
                    navigate("/documents")
                  }
                  style={{ marginLeft: "10px" }}
                >
                  Documents
                </button>



                <button

                  onClick={() => {

                    if (
                      window.confirm(
                        "Are you sure you want to delete this decision?"
                      )
                    ) {

                      deleteDecision(decision.id);

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