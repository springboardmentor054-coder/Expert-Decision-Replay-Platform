import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function CreateDecision() {

  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!title) {
      alert("Title is required");
      return;
    }

    if (!problemStatement) {
      alert("Problem statement is required");
      return;
    }

    try {

      await api.post("/decisions/", {
        title: title,
        problem_statement: problemStatement,
        description: description,
        category_id: Number(categoryId)
      });

      alert("Decision created successfully");

      navigate("/decisions");

    } catch (error) {
      console.log(error);
      alert("Failed to create decision");
    }
  };


  return (
  <div className="container">
    <div className="page-header">
      <div>
        <h1>Create Decision</h1>
        <p className="page-subtitle">
          Record a new organizational decision
        </p>
      </div>
    </div>

    <div className="card form-card">
      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            placeholder="Enter decision title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Problem Statement</label>
          <textarea
            rows="4"
            placeholder="Describe the problem or situation that requires a decision"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="4"
            placeholder="Provide additional details about the decision"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Category ID</label>
          <input
            type="number"
            placeholder="Enter category ID"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/decisions")}
          >
            Cancel
          </button>

          <button type="submit" className="create-btn">
            Create Decision
          </button>
        </div>

      </form>
    </div>
  </div>
);
}

export default CreateDecision;