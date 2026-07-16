import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decision.css";

function CreateDecision() {

  const navigate = useNavigate();

  const [decision, setDecision] = useState({
    title: "",
    problem_statement: "",
    description: "",
    category_id: 1,
    status: "Draft",
    created_by: 1
  });

  const handleChange = (e) => {
    setDecision({
      ...decision,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {

    e.preventDefault();

    if (decision.title.trim() === "") {
      alert("Title cannot be empty");
      return;
    }

    if (decision.problem_statement.trim() === "") {
      alert("Problem Statement is mandatory");
      return;
    }

    fetch("http://127.0.0.1:8000/decisions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(decision)
    })
      .then(response => {

        if (response.ok) {

          alert("Decision Created Successfully");
          navigate("/decisions");

        } else {

          alert("Error Creating Decision");

        }

      })
      .catch(error => console.log(error));

  };

  return (

    <div className="container">

      <h1>Create Decision</h1>

      {/* Navigation Buttons */}
      <div style={{ marginBottom: "20px" }}>

        <button onClick={() => navigate("/decisions")}>
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

          <div className="form-group">

            <label>Title</label>

            <input
              name="title"
              value={decision.title}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label>Problem Statement</label>

            <textarea
              name="problem_statement"
              value={decision.problem_statement}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label>Description</label>

            <textarea
              name="description"
              value={decision.description}
              onChange={handleChange}
            />

          </div>

          <button className="submit-btn">
            Create
          </button>

        </form>

      </div>

    </div>

  );

}

export default CreateDecision;