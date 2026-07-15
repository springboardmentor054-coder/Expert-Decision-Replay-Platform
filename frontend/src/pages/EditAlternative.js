import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Decision.css";

function EditAlternative() {

  const { id } = useParams();
  const navigate = useNavigate();


  const [alternative, setAlternative] = useState({
    decision_id: "",
    alternative_name: "",
    description: "",
    estimated_cost: "",
    feasibility: "",
    risk_level: ""
  });



  useEffect(() => {

    fetch(`http://127.0.0.1:8000/alternatives/${id}`)

      .then(response => response.json())

      .then(data => {

        setAlternative({

          decision_id: data.decision_id,

          alternative_name: data.alternative_name,

          description: data.description,

          estimated_cost: data.estimated_cost,

          feasibility: data.feasibility,

          risk_level: data.risk_level

        });

      })

      .catch(error => console.log(error));


  }, [id]);




  const handleChange = (e) => {

    setAlternative({

      ...alternative,

      [e.target.name]: e.target.value

    });

  };




  const handleSubmit = (e) => {

    e.preventDefault();


    console.log("Updating Alternative:", alternative);



    fetch(`http://127.0.0.1:8000/alternatives/${id}`, {

      method: "PUT",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify(alternative)

    })


      .then(response => {

        console.log("Response Status:", response.status);


        if (response.ok) {

          alert("Alternative Updated Successfully");

          navigate("/alternatives");

        }

        else {

          alert("Update Failed");

        }


      })


      .catch(error => {

        console.log("Error:", error);

      });


  };




  return (

    <div className="container">


      <h1>Edit Alternative</h1>




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

          onClick={() => navigate("/alternatives")}

          style={{ marginLeft: "10px" }}

        >

          View Alternatives

        </button>


      </div>





      <div className="form-container">


        <form onSubmit={handleSubmit}>


          <label>Alternative Name</label>


          <input

            name="alternative_name"

            value={alternative.alternative_name || ""}

            onChange={handleChange}

          />





          <label>Description</label>


          <textarea

            name="description"

            value={alternative.description || ""}

            onChange={handleChange}

          />





          <label>Estimated Cost</label>


          <input

            type="number"

            name="estimated_cost"

            value={alternative.estimated_cost || ""}

            onChange={handleChange}

          />





          <label>Feasibility</label>


          <input

            name="feasibility"

            value={alternative.feasibility || ""}

            onChange={handleChange}

          />





          <label>Risk Level</label>


          <input

            name="risk_level"

            value={alternative.risk_level || ""}

            onChange={handleChange}

          />





          <button

            type="submit"

            className="submit-btn"

          >

            Update Alternative

          </button>



        </form>


      </div>


    </div>

  );

}


export default EditAlternative;