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
    <div>

      <h2>Create Decision</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Title</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>


        <div>
          <label>Problem Statement</label>
          <br />
          <textarea
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
          />
        </div>


        <div>
          <label>Description</label>
          <br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>


        <div>
          <label>Category ID</label>
          <br />
          <input
            type="number"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          />
        </div>


        <br />

        <button type="submit">
          Create Decision
        </button>

      </form>

    </div>
  );
}

export default CreateDecision;