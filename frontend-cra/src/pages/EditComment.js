import React, { useEffect, useState } from "react";
import { getCommentById, updateComment } from "../api";
import { useNavigate, useParams } from "react-router-dom";


function EditComment() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [comment, setComment] = useState({
    comment: ""
  });


  useEffect(() => {

    const loadData = async () => {

      try {

        const response = await getCommentById(id);

        setComment({
          comment: response.data.comment
        });

      }
      catch(error) {

        console.log("Error loading comment:", error);

      }

    };


    loadData();

  }, [id]);


  const handleChange = (e) => {

    setComment({
      ...comment,
      [e.target.name]: e.target.value
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await updateComment(id, comment);

      alert("Comment updated successfully");

      navigate("/comments");

    }
    catch(error) {

      console.log("Update error:", error);

    }

  };


  return (
  <div className="container">

    <div className="page-header">
      <div>
        <h1>Edit Comment</h1>
        <p className="page-subtitle">
          Update the comment associated with this decision
        </p>
      </div>
    </div>

    <div className="card form-card">
      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Comment</label>

          <textarea
            name="comment"
            rows="6"
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
            Update Comment
          </button>

        </div>

      </form>
    </div>

  </div>
);

}


export default EditComment;