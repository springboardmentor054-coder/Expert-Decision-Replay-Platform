import React, { useState } from "react";
import { createComment } from "../api";
import { useNavigate } from "react-router-dom";


function AddComment() {

  const navigate = useNavigate();

  const [comment, setComment] = useState({
    decision_id: "",
    user_id: "",
    comment: ""
  });


  const handleChange = (e) => {
    setComment({
      ...comment,
      [e.target.name]: e.target.value
    });
  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await createComment(comment);

      alert("Comment added successfully");

      navigate("/comments");

    }
    catch(error) {

      console.log(error);
      alert("Error adding comment");

    }

  };


  return (
  <div className="container">

    <div className="page-header">
      <div>
        <h1>Add Comment</h1>
        <p className="page-subtitle">
          Add a comment to an organizational decision
        </p>
      </div>
    </div>

    <div className="card form-card">
      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Decision ID</label>
          <input
            type="number"
            name="decision_id"
            placeholder="Enter decision ID"
            value={comment.decision_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>User ID</label>
          <input
            type="number"
            name="user_id"
            placeholder="Enter user ID"
            value={comment.user_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Comment</label>
          <textarea
            name="comment"
            rows="5"
            placeholder="Write your comment..."
            value={comment.comment}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/comments")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="create-btn"
          >
            Add Comment
          </button>

        </div>

      </form>
    </div>

  </div>
);

}


export default AddComment;