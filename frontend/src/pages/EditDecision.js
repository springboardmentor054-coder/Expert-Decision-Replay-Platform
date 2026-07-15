import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Decision.css";

function EditDecision() {

  const { id } = useParams();
  const navigate = useNavigate();


  const [decision, setDecision] = useState({

    title: "",
    problem_statement: "",
    description: "",
    status: ""

  });



  useEffect(() => {

    fetch(`http://127.0.0.1:8000/decisions/${id}`)

      .then(response => response.json())

      .then(data => {

        setDecision(data);

      })

      .catch(error => console.log(error));


  }, [id]);




  const handleChange = (e) => {

    setDecision({

      ...decision,

      [e.target.name]: e.target.value

    });

  };




  const handleSubmit = (e) => {

    e.preventDefault();


    fetch(`http://127.0.0.1:8000/decisions/${id}`, {

      method: "PUT",

      headers: {

        "Content-Type": "application/json"

      },

      body: JSON.stringify(decision)

    })


    .then(response => {

      if(response.ok){

        alert("Decision Updated");

        navigate("/decisions");

      }

      else{

        alert("Update Failed");

      }

    })


    .catch(error => console.log(error));


  };




  return (

    <div className="container">


      <h1>Edit Decision</h1>


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


          <label>Title</label>


          <input

            name="title"

            value={decision.title || ""}

            onChange={handleChange}

          />




          <label>Problem Statement</label>


          <textarea

            name="problem_statement"

            value={decision.problem_statement || ""}

            onChange={handleChange}

          />




          <label>Description</label>


          <textarea

            name="description"

            value={decision.description || ""}

            onChange={handleChange}

          />




          <label>Status</label>


          <input

            name="status"

            value={decision.status || ""}

            onChange={handleChange}

          />




          <button type="submit" className="submit-btn">

            Update Decision

          </button>


        </form>


      </div>


    </div>

  );

}


export default EditDecision;