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

    <div>

      <h2>Add Comment</h2>


      <form onSubmit={handleSubmit}>

        <input
          type="number"
          name="decision_id"
          placeholder="Decision ID"
          value={comment.decision_id}
          onChange={handleChange}
        />


        <br/>


        <input
          type="number"
          name="user_id"
          placeholder="User ID"
          value={comment.user_id}
          onChange={handleChange}
        />


        <br/>


        <textarea
          name="comment"
          placeholder="Enter comment"
          value={comment.comment}
          onChange={handleChange}
        />


        <br/>


        <button type="submit">
          Add Comment
        </button>


      </form>

    </div>

  );

}


export default AddComment;