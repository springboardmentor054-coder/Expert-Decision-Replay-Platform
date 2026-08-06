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
    <div>

      <h2>Edit Decision</h2>

      <form onSubmit={handleUpdate}>

        <label>Title</label>
        <br />
        <input
          value={title}
          onChange={(e)=>setTitle(e.target.value)}
        />

        <br /><br />

        <label>Problem Statement</label>
        <br />
        <textarea
          value={problemStatement}
          onChange={(e)=>setProblemStatement(e.target.value)}
        />

        <br /><br />

        <label>Description</label>
        <br />
        <textarea
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
        />

        <br /><br />

        <label>Category ID</label>
        <br />
        <input
          type="number"
          value={categoryId}
          onChange={(e)=>setCategoryId(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          Update Decision
        </button>

      </form>

    </div>
  );
}

export default EditDecision;