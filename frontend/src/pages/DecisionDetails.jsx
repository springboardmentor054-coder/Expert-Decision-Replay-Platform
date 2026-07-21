import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function DecisionDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [decision, setDecision] = useState(null);

    // Comments
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedComment, setEditedComment] = useState("");

    // Meeting Notes
    const [meetingNotes, setMeetingNotes] = useState([]);
    const [meetingSummary, setMeetingSummary] = useState("");
    const [conclusion, setConclusion] = useState("");
    const [nextAction, setNextAction] = useState("");


    // Get JWT Token
    const getToken = () => {
        return localStorage.getItem("token");
    };


    // Get Decision Details
    useEffect(() => {

        fetch(`http://127.0.0.1:8000/decisions/${id}`)
            .then(response => response.json())
            .then(data => setDecision(data))
            .catch(error => console.log(error));

    }, [id]);


    // Get Comments
    useEffect(() => {

        fetch(`http://127.0.0.1:8000/comments/decision/${id}`)
            .then(response => response.json())
            .then(data => setComments(data))
            .catch(error => console.log(error));

    }, [id]);


    // Get Meeting Notes
    useEffect(() => {

        fetch(`http://127.0.0.1:8000/meeting-notes/decision/${id}`)
            .then(response => response.json())
            .then(data => setMeetingNotes(data))
            .catch(error => console.log(error));

    }, [id]);


    // Add Comment
    const addComment = async () => {

        if (newComment.trim() === "") {
            alert("Comment cannot be empty");
            return;
        }

        const token = getToken();

        if (!token) {
            alert("You are not logged in. Please login first.");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/comments/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        decision_id: parseInt(id),
                        content: newComment
                    })
                }
            );

            if (response.ok) {

                const createdComment = await response.json();

                setComments([
                    ...comments,
                    createdComment
                ]);

                setNewComment("");

            } else {

                const errorData = await response.json().catch(() => null);

                console.log("Add Comment Error:", errorData);

                alert(
                    `Failed to add comment. Status: ${response.status}`
                );

            }

        } catch (error) {

            console.log("Add Comment Error:", error);

            alert("Failed to add comment. Check if backend is running.");

        }

    };


    // Delete Comment
    const deleteComment = async (commentId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this comment?"
        );

        if (!confirmDelete) {
            return;
        }

        const token = getToken();

        if (!token) {
            alert("You are not logged in. Please login first.");
            return;
        }

        try {

            const response = await fetch(
                `http://127.0.0.1:8000/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (response.ok) {

                setComments(
                    comments.filter(
                        comment => comment.id !== commentId
                    )
                );

            } else {

                alert(
                    `Failed to delete comment. Status: ${response.status}`
                );

            }

        } catch (error) {

            console.log("Delete Comment Error:", error);

            alert("Failed to delete comment.");

        }

    };


    // Edit Comment
    const editComment = (comment) => {

        setEditingCommentId(comment.id);
        setEditedComment(comment.comment);

    };


    // Save Edited Comment
    const saveEdit = async (commentId) => {

        if (editedComment.trim() === "") {

            alert("Comment cannot be empty");
            return;

        }

        const token = getToken();

        if (!token) {
            alert("You are not logged in. Please login first.");
            return;
        }

        try {

            const response = await fetch(
                `http://127.0.0.1:8000/comments/${commentId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        content: editedComment
                    })
                }
            );

            if (response.ok) {

                const updated = await response.json();

                setComments(
                    comments.map(comment =>
                        comment.id === commentId
                            ? updated
                            : comment
                    )
                );

                setEditingCommentId(null);
                setEditedComment("");

            } else {

                alert(
                    `Failed to update comment. Status: ${response.status}`
                );

            }

        } catch (error) {

            console.log("Update Comment Error:", error);

            alert("Failed to update comment.");

        }

    };


    // Add Meeting Note
    const addMeetingNote = async () => {

        if (
            meetingSummary.trim() === "" ||
            conclusion.trim() === "" ||
            nextAction.trim() === ""
        ) {

            alert("All meeting note fields are required");
            return;

        }

        const token = getToken();

        if (!token) {
            alert("You are not logged in. Please login first.");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/meeting-notes/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({

                        decision_id: parseInt(id),
                        meeting_summary: meetingSummary,
                        conclusion: conclusion,
                        next_action: nextAction

                    })
                }
            );

            if (response.ok) {

                const createdNote = await response.json();

                setMeetingNotes([
                    ...meetingNotes,
                    createdNote
                ]);

                setMeetingSummary("");
                setConclusion("");
                setNextAction("");

            } else {

                alert(
                    `Failed to save meeting note. Status: ${response.status}`
                );

            }

        } catch (error) {

            console.log("Meeting Note Error:", error);

            alert("Failed to save meeting note.");

        }

    };


    // Loading
    if (!decision) {

        return <h2>Loading...</h2>;

    }


    return (

        <div style={{ padding: "20px" }}>

            <h1>{decision.title}</h1>

            <p>
                <strong>Problem:</strong> {decision.problem_statement}
            </p>

            <p>
                <strong>Description:</strong> {decision.description}
            </p>

            <p>
                <strong>Status:</strong> {decision.status}
            </p>

            <br />

            {/* Decision Related Buttons */}

           {/* Decision Related Buttons */}

<button
    onClick={() => navigate("/decisions")}
>
    View Decisions
</button>

{" "}

<button
    onClick={() => navigate(`/alternatives/${id}`)}
>
    View Alternatives
</button>
{" "}

<button
    onClick={() => navigate(`/alternative-comparison/${id}`)}
>
    Compare Alternatives
</button>

{" "}

<button
    onClick={() => navigate(`/documents/${id}`)}
>
    View Documents
</button>

{" "}

<button
    onClick={() => navigate(`/decision/${id}/history`)}
>
    View History
</button>

            <hr />


            {/* Discussion */}

            <h2>Discussion</h2>

            <textarea
                placeholder="Write your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows="4"
                cols="60"
            />

            <br />
            <br />

            <button onClick={addComment}>
                Add Comment
            </button>


            <hr />


            {/* Comments */}

            <h2>Comments</h2>

            {
                comments.length === 0 ?

                    <p>No comments yet.</p>

                    :

                    comments.map(comment => (

                        <div
                            key={comment.id}
                            style={{
                                border: "1px solid #ccc",
                                padding: "10px",
                                marginBottom: "10px",
                                borderRadius: "5px"
                            }}
                        >

                            <p>
                                <strong>User:</strong>{" "}
                                {comment.user?.name || `User ${comment.user_id}`}
                            </p>


                            {
                                editingCommentId === comment.id ?

                                    <>

                                        <textarea
                                            value={editedComment}
                                            onChange={(e) =>
                                                setEditedComment(e.target.value)
                                            }
                                            rows="3"
                                            cols="60"
                                        />

                                        <br />
                                        <br />

                                        <button
                                            onClick={() =>
                                                saveEdit(comment.id)
                                            }
                                        >
                                            Save
                                        </button>

                                        <button
                                            onClick={() => {
                                                setEditingCommentId(null);
                                                setEditedComment("");
                                            }}
                                        >
                                            Cancel
                                        </button>

                                    </>

                                    :

                                    <p>
                                        <strong>Comment:</strong>{" "}
                                        {comment.comment}
                                    </p>
                            }


                            <p>
                                <strong>Date:</strong>{" "}
                                {new Date(comment.created_at)
                                    .toLocaleString(
                                        "en-GB",
                                        {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        }
                                    )}
                            </p>


                            {
                                editingCommentId !== comment.id &&

                                <button
                                    onClick={() => editComment(comment)}
                                >
                                    Edit
                                </button>
                            }


                            <button
                                onClick={() => deleteComment(comment.id)}
                            >
                                Delete
                            </button>

                        </div>

                    ))
            }


            <hr />


            {/* Meeting Notes */}

            <h2>Meeting Notes</h2>

            <textarea
                placeholder="Meeting Summary"
                value={meetingSummary}
                onChange={(e) => setMeetingSummary(e.target.value)}
                rows="4"
                cols="60"
            />

            <br />
            <br />

            <textarea
                placeholder="Conclusion"
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                rows="3"
                cols="60"
            />

            <br />
            <br />

            <textarea
                placeholder="Next Action"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                rows="3"
                cols="60"
            />

            <br />
            <br />

            <button onClick={addMeetingNote}>
                Save Meeting Note
            </button>


            <h2>Previous Meeting Notes</h2>

            {
                meetingNotes.length === 0 ?

                    <p>No meeting notes available.</p>

                    :

                    meetingNotes.map(note => (

                        <div
                            key={note.id}
                            style={{
                                border: "1px solid #ccc",
                                padding: "10px",
                                marginBottom: "10px"
                            }}
                        >

                            <p>
                                <strong>Summary:</strong>{" "}
                                {note.meeting_summary}
                            </p>

                            <p>
                                <strong>Conclusion:</strong>{" "}
                                {note.conclusion}
                            </p>

                            <p>
                                <strong>Next Action:</strong>{" "}
                                {note.next_action}
                            </p>

                            <p>
                                <strong>Date:</strong>{" "}
                                {new Date(note.created_at)
                                    .toLocaleString("en-GB")}
                            </p>

                        </div>

                    ))
            }

        </div>

    );

}

export default DecisionDetails;