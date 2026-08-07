import React, { useEffect, useState } from "react";
import api from "../api";
import { useParams, useNavigate } from "react-router-dom";

function EditDecision() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {

  const getDecision = async () => {
    try {

      const response = await api.get(`/decisions/${id}`);

      setTitle(response.data.title);
      setProblemStatement(response.data.problem_statement);
      setDescription(response.data.description);
      setCategoryId(response.data.category_id);

    } catch (error) {
      console.log(error);
    }
  };

  getDecision();

}, [id]);


  const handleUpdate = async (e) => {

    e.preventDefault();

    try {

      await api.put(`/decisions/${id}`, {
        title: title,
        problem_statement: problemStatement,
        description: description,
        category_id: Number(categoryId)
      });

      alert("Decision updated successfully");

      navigate("/decisions");

    } catch (error) {
      console.log(error);
      alert("Update failed");
    }
  };


  return (
  <div className="container">
    <div className="page-header">
      <div>
        <h1>Edit Decision</h1>
        <p className="page-subtitle">
          Update the details of this organizational decision
        </p>
      </div>
    </div>

    <div className="card form-card">
      <form onSubmit={handleUpdate}>

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
            placeholder="Describe the problem or situation"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="4"
            placeholder="Provide additional details"
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
            Update Decision
          </button>
        </div>

      </form>
    </div>
  </div>
);
}

export default EditDecision;