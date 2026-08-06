import React, { useEffect, useState } from "react";
import { getComments, deleteComment } from "../api";
import { Link } from "react-router-dom";


function CommentsList() {

  const [comments, setComments] = useState([]);


  useEffect(() => {
    loadComments();
  }, []);


  const loadComments = async () => {
    try {
      const response = await getComments();
      setComments(response.data);
    }
    catch (error) {
      console.log("Error loading comments:", error);
    }
  };


  const handleDelete = async (id) => {

    if(window.confirm("Delete this comment?")) {

      try {
        await deleteComment(id);
        loadComments();
      }
      catch(error) {
        console.log("Delete error:", error);
      }

    }

  };


  return (
    <div>

      <h2>Comments</h2>

      <Link to="/comments/add">
        Add Comment
      </Link>


      <table border="1">

        <thead>
          <tr>
            <th>ID</th>
            <th>Decision ID</th>
            <th>User</th>
            <th>Comment</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>


        <tbody>

        {
          comments.map((c) => (

            <tr key={c.id}>

              <td>{c.id}</td>

              <td>{c.decision_id}</td>

              <td>{c.user_name}</td>

              <td>{c.comment}</td>

              <td>{c.created_at}</td>

              <td>

                <Link to={`/comments/edit/${c.id}`}>
                  Edit
                </Link>


                <button
                  onClick={() => handleDelete(c.id)}
                >
                  Delete
                </button>

              </td>

            </tr>

          ))
        }

        </tbody>

      </table>


    </div>
  );
}


export default CommentsList;