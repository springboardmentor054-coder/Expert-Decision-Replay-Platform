import React, { useEffect, useState } from "react";
import api from "../api";

function Discussion() {

  const [decisionId, setDecisionId] = useState("");
  const [userId, setUserId] = useState("");
  const [comment, setComment] = useState("");

  const [comments, setComments] = useState([]);

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const [meetingSummary, setMeetingSummary] = useState("");
  const [conclusion, setConclusion] = useState("");
  const [nextAction, setNextAction] = useState("");

  const [error, setError] = useState("");


  useEffect(() => {
    fetchComments();
  }, []);



  const fetchComments = async () => {

    try {

      const response = await api.get("/comments/");

      setComments(response.data);

    } 
    catch (err) {

      console.log(err);

      setError("Failed to load comments");

    }

  };




  const addComment = async () => {


    if (decisionId === "") {
      alert("Please enter Decision ID");
      return;
    }


    if (userId === "") {
      alert("Please enter User ID");
      return;
    }


    if (comment.trim() === "") {
      alert("Comment cannot be empty");
      return;
    }



    try {


      await api.post("/comments/", {

      decision_id: parseInt(decisionId),

      comment: comment
    });



      alert("Comment added successfully");


      setDecisionId("");

      setUserId("");

      setComment("");


      fetchComments();


    }
    catch(err) {

      console.log(err);

      setError("Failed to add comment");

    }

  };





  const updateComment = async () => {

    try {


      await api.put(`/comments/${editId}`, {

        comment: editText

      });



      alert("Comment updated successfully");


      setEditId(null);

      setEditText("");


      fetchComments();


    }
    catch(err) {

      console.log(err);

      setError("Failed to update comment");

    }

  };





  const deleteComment = async (id) => {


    try {


      await api.delete(`/comments/${id}`);


      alert("Comment deleted");


      fetchComments();


    }
    catch(err) {

      console.log(err);

      setError("Failed to delete comment");

    }

  };





  return (
  <div className="container">

    <div className="page-header">
      <div>
        <h1>Discussion</h1>
        <p className="page-subtitle">
          Collaborate and manage discussions related to decisions
        </p>
      </div>
    </div>

    {/* Add Comment */}
    <div className="card form-card">
      <h2>Add Comment</h2>

      <div className="form-group">
        <label>Decision ID</label>
        <input
          type="number"
          placeholder="Enter decision ID"
          value={decisionId}
          onChange={(e) => setDecisionId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>User ID</label>
        <input
          type="number"
          placeholder="Enter user ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Comment</label>
        <textarea
          rows="4"
          placeholder="Write your comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <button className="create-btn" onClick={addComment}>
        Add Comment
      </button>
    </div>

    {/* Error */}
    {error && (
      <div className="error-message">
        {error}
      </div>
    )}

    {/* Edit Comment */}
    {editId && (
      <div className="card form-card">
        <h2>Edit Comment</h2>

        <div className="form-group">
          <label>Comment</label>
          <textarea
            rows="4"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button
            className="cancel-btn"
            onClick={() => {
              setEditId(null);
              setEditText("");
            }}
          >
            Cancel
          </button>

          <button
            className="create-btn"
            onClick={updateComment}
          >
            Update Comment
          </button>
        </div>
      </div>
    )}

    {/* Comments */}
    <div className="section-heading">
      <h2>Comment List</h2>
      <p>Recent discussion and collaboration activity</p>
    </div>

    <div className="card table-card">
      {comments.length === 0 ? (
        <p className="empty-state">No comments found.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Decision ID</th>
                <th>User</th>
                <th>Comment</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {comments.map((item) => (
                <tr key={item.id}>

                  <td>{item.id}</td>

                  <td>{item.decision_id}</td>

                  <td className="decision-title">
                    {item.user_name}
                  </td>

                  <td>{item.comment}</td>

                  <td>
                    {new Date(item.created_at).toLocaleString()}
                  </td>

                  <td>
                    {new Date(item.updated_at).toLocaleString()}
                  </td>

                  <td>
                    <div className="action-buttons">

                      <button
                        className="edit-btn"
                        onClick={() => {
                          setEditId(item.id);
                          setEditText(item.comment);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteComment(item.id)}
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
      )}
    </div>

    {/* Meeting Notes */}
    <div className="card form-card meeting-card">
      <div>
        <h2>Meeting Notes</h2>
        <p className="page-subtitle">
          Capture important outcomes and follow-up actions
        </p>
      </div>

      <div className="form-group">
        <label>Meeting Summary</label>
        <textarea
          rows="5"
          placeholder="Enter meeting summary..."
          value={meetingSummary}
          onChange={(e) => setMeetingSummary(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Conclusion</label>
        <textarea
          rows="4"
          placeholder="Enter conclusion..."
          value={conclusion}
          onChange={(e) => setConclusion(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Next Action</label>
        <textarea
          rows="4"
          placeholder="Enter next action..."
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
        />
      </div>
    </div>

  </div>
);

}


export default Discussion;