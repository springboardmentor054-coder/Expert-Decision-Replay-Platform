import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decision.css";

function Alternatives() {

  const [alternatives, setAlternatives] = useState([]);

  const navigate = useNavigate();


  useEffect(() => {

    fetch("http://127.0.0.1:8000/alternatives")

      .then(response => response.json())

      .then(data => {
        setAlternatives(data);
      })

      .catch(error => {
        console.log(error);
      });

  }, []);




  const deleteAlternative = async (id) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/alternatives/${id}`,
        {
          method: "DELETE",
        }
      );


      if (response.ok) {

        setAlternatives(
          alternatives.filter(
            (alternative) => alternative.id !== id
          )
        );

      }


    } catch (error) {

      console.log(error);

    }

  };




  return (

    <div className="container">


      <h1>All Alternatives</h1>



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


          {alternatives.map((alternative) => (

            <tr key={alternative.id}>


              <td>{alternative.id}</td>


              <td>{alternative.alternative_name}</td>


              <td>{alternative.estimated_cost}</td>


              <td>{alternative.feasibility}</td>


              <td>{alternative.risk_level}</td>





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

          ))}


        </tbody>


      </table>


    </div>

  );

}


export default Alternatives;