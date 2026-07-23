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
    status: "Draft"
  });

  const handleChange = (e) => {
    setDecision({
      ...decision,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (decision.title.trim() === "") {
      alert("Title cannot be empty");
      return;
    }

    if (decision.problem_statement.trim() === "") {
      alert("Problem Statement is mandatory");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/decisions",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },

          body: JSON.stringify(decision)
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert("Decision Created Successfully");

        navigate("/decisions");

      } else {

        console.error("Create Decision Error:", data);

        alert(
          data.detail ||
          data.message ||
          "Error Creating Decision"
        );

      }

    } catch (error) {

      console.error("Error:", error);

      alert("Unable to connect to the server");

    }

  };

  return (

    <div className="decision-page">

      {/* Header */}

      <div className="decision-header">

        <div>
          <h1>Create New Decision</h1>

          <p>
            Create and document an important organizational decision.
          </p>
        </div>

        <button
          className="secondary-btn"
          onClick={() => navigate("/decisions")}
        >
          ← Back to Decisions
        </button>

      </div>


      {/* Main Form */}

      <div className="decision-form-card">

        <div className="form-card-header">

          <h2>Decision Information</h2>

          <p>
            Provide the details required to create a new decision.
          </p>

        </div>


        <form onSubmit={handleSubmit}>

          {/* Title */}

          <div className="form-group">

            <label>
              Decision Title <span>*</span>
            </label>

            <input
              type="text"
              name="title"
              placeholder="Enter a clear decision title"
              value={decision.title}
              onChange={handleChange}
            />

          </div>


          {/* Problem Statement */}

          <div className="form-group">

            <label>
              Problem Statement <span>*</span>
            </label>

            <textarea
              name="problem_statement"
              placeholder="Describe the problem or challenge that requires a decision..."
              value={decision.problem_statement}
              onChange={handleChange}
              rows="5"
            />

          </div>


          {/* Description */}

          <div className="form-group">

            <label>
              Description
            </label>

            <textarea
              name="description"
              placeholder="Provide additional context, background, or relevant information..."
              value={decision.description}
              onChange={handleChange}
              rows="6"
            />

          </div>


          {/* Form Actions */}

          <div className="form-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/decisions")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-btn"
            >
              Create Decision
            </button>

          </div>

        </form>

      </div>


      {/* Quick Navigation */}

      <div className="quick-navigation">

        <h3>Decision Management</h3>

        <div className="quick-nav-buttons">

          <button
            onClick={() => navigate("/decisions")}
          >
            📋 View All Decisions
          </button>

          <button
            onClick={() => navigate("/alternatives")}
          >
            ⚖️ View Alternatives
          </button>

        </div>

      </div>

    </div>

  );

}

export default CreateDecision;