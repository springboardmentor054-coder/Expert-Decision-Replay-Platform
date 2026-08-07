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
  <div className="container">

    <div className="page-header">
      <div>
        <h1>Comments</h1>
        <p className="page-subtitle">
          Review and manage comments related to decisions
        </p>
      </div>

      <Link to="/comments/add" className="create-btn">
        + Add Comment
      </Link>
    </div>

    <div className="card table-card">
      <div className="table-wrapper">
        <table>
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
            {comments.map((c) => (
              <tr key={c.id}>

                <td>{c.id}</td>

                <td>{c.decision_id}</td>

                <td className="decision-title">
                  {c.user_name}
                </td>

                <td>{c.comment}</td>

                <td>{c.created_at}</td>

                <td>
                  <div className="action-buttons">

                    <Link
                      to={`/comments/edit/${c.id}`}
                      className="edit-btn"
                    >
                      Edit
                    </Link>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(c.id)}
                    >
                      Delete
                    </button>

                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  </div>
);
}


export default CommentsList;