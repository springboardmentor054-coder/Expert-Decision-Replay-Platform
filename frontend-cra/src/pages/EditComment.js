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

    <div>

      <h2>Edit Comment</h2>


      <form onSubmit={handleSubmit}>


        <textarea
          name="comment"
          value={comment.comment}
          onChange={handleChange}
        />


        <br />


        <button type="submit">
          Update Comment
        </button>


      </form>


    </div>

  );

}


export default EditComment;