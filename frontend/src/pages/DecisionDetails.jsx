import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./DecisionDetails.css";

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


    // =========================================
    // GET DECISION DETAILS
    // =========================================

    useEffect(() => {

        fetch(`http://127.0.0.1:8000/decisions/${id}`)
            .then(response => response.json())
            .then(data => setDecision(data))
            .catch(error => console.log(error));

    }, [id]);


    // =========================================
    // GET COMMENTS
    // =========================================

    useEffect(() => {

        fetch(`http://127.0.0.1:8000/comments/decision/${id}`)
            .then(response => response.json())
            .then(data => setComments(data))
            .catch(error => console.log(error));

    }, [id]);


    // =========================================
    // GET MEETING NOTES
    // =========================================

    useEffect(() => {

        fetch(`http://127.0.0.1:8000/meeting-notes/decision/${id}`)
            .then(response => response.json())
            .then(data => setMeetingNotes(data))
            .catch(error => console.log(error));

    }, [id]);


    // =========================================
    // ADD COMMENT
    // =========================================

    const addComment = async () => {

        if (newComment.trim() === "") {

            alert("Comment cannot be empty");
            return;

        }

        const token = getToken();

        if (!token) {

            alert(
                "You are not logged in. Please login first."
            );

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

                const createdComment =
                    await response.json();

                setComments([
                    ...comments,
                    createdComment
                ]);

                setNewComment("");

            } else {

                const errorData =
                    await response
                        .json()
                        .catch(() => null);

                console.log(
                    "Add Comment Error:",
                    errorData
                );

                alert(
                    `Failed to add comment. Status: ${response.status}`
                );

            }

        } catch (error) {

            console.log(
                "Add Comment Error:",
                error
            );

            alert(
                "Failed to add comment. Check if backend is running."
            );

        }

    };


    // =========================================
    // DELETE COMMENT
    // =========================================

    const deleteComment = async (commentId) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this comment?"
            );

        if (!confirmDelete) {
            return;
        }

        const token = getToken();

        if (!token) {

            alert(
                "You are not logged in. Please login first."
            );

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
                        comment =>
                            comment.id !== commentId
                    )
                );

            } else {

                alert(
                    `Failed to delete comment. Status: ${response.status}`
                );

            }

        } catch (error) {

            console.log(
                "Delete Comment Error:",
                error
            );

            alert(
                "Failed to delete comment."
            );

        }

    };


    // =========================================
    // EDIT COMMENT
    // =========================================

    const editComment = (comment) => {

        setEditingCommentId(comment.id);

        setEditedComment(
            comment.comment
        );

    };


    // =========================================
    // SAVE EDITED COMMENT
    // =========================================

    const saveEdit = async (commentId) => {

        if (editedComment.trim() === "") {

            alert(
                "Comment cannot be empty"
            );

            return;

        }

        const token = getToken();

        if (!token) {

            alert(
                "You are not logged in. Please login first."
            );

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

                const updated =
                    await response.json();

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

            console.log(
                "Update Comment Error:",
                error
            );

            alert(
                "Failed to update comment."
            );

        }

    };


    // =========================================
    // ADD MEETING NOTE
    // =========================================

    const addMeetingNote = async () => {

        if (
            meetingSummary.trim() === "" ||
            conclusion.trim() === "" ||
            nextAction.trim() === ""
        ) {

            alert(
                "All meeting note fields are required"
            );

            return;

        }

        const token = getToken();

        if (!token) {

            alert(
                "You are not logged in. Please login first."
            );

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

                        decision_id:
                            parseInt(id),

                        meeting_summary:
                            meetingSummary,

                        conclusion:
                            conclusion,

                        next_action:
                            nextAction

                    })
                }
            );


            if (response.ok) {

                const createdNote =
                    await response.json();

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

            console.log(
                "Meeting Note Error:",
                error
            );

            alert(
                "Failed to save meeting note."
            );

        }

    };


    // =========================================
    // STATUS CLASS
    // =========================================

    const getStatusClass = (status) => {

        if (!status) {
            return "status-default";
        }

        const normalized =
            status.toLowerCase();

        if (normalized === "active") {
            return "status-active";
        }

        if (normalized === "completed") {
            return "status-completed";
        }

        if (normalized === "pending") {
            return "status-pending";
        }

        if (normalized === "cancelled") {
            return "status-cancelled";
        }

        return "status-default";

    };


    // =========================================
    // LOADING
    // =========================================

    if (!decision) {

        return (

            <div className="details-loading">

                <div className="details-spinner"></div>

                <p>
                    Loading decision details...
                </p>

            </div>

        );

    }


    // =========================================
    // MAIN UI
    // =========================================

    return (

        <div className="decision-details-page">


            {/* ================================= */}
            {/* TOP NAVBAR */}
            {/* ================================= */}

            <header className="details-navbar">

                <div className="details-brand">

                    <div className="details-logo">
                        ED
                    </div>

                    <div>

                        <strong>
                            Expert Decision
                        </strong>

                        <span>
                            Replay Platform
                        </span>

                    </div>

                </div>


                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/decisions")
                    }
                >

                    ← Back to Decisions

                </button>

            </header>


            {/* ================================= */}
            {/* MAIN CONTENT */}
            {/* ================================= */}

            <main className="details-main">


                {/* ================================= */}
                {/* BREADCRUMB */}
                {/* ================================= */}

                <div className="breadcrumb">

                    <span
                        onClick={() =>
                            navigate("/decisions")
                        }
                    >
                        Decisions
                    </span>

                    <span>
                        /
                    </span>

                    <strong>
                        Decision #{decision.id}
                    </strong>

                </div>


                {/* ================================= */}
                {/* DECISION HERO */}
                {/* ================================= */}

                <section className="decision-hero">


                    <div className="hero-content">

                        <div className="hero-label">
                            DECISION RECORD #{decision.id}
                        </div>

                        <h1>
                            {decision.title}
                        </h1>

                        <div className="hero-status">

                            <span
                                className={`status-badge ${getStatusClass(
                                    decision.status
                                )}`}
                            >
                                {decision.status}
                            </span>

                        </div>

                    </div>


                    <button
                        className="hero-edit-button"
                        onClick={() =>
                            navigate(
                                `/edit/${decision.id}`
                            )
                        }
                    >

                        ✎ Edit Decision

                    </button>


                </section>


                {/* ================================= */}
                {/* DECISION OVERVIEW */}
                {/* ================================= */}

                <section className="overview-grid">


                    <div className="overview-card">

                        <div className="overview-icon">
                            ?
                        </div>

                        <div>

                            <span>
                                Decision ID
                            </span>

                            <strong>
                                #{decision.id}
                            </strong>

                        </div>

                    </div>


                    <div className="overview-card">

                        <div className="overview-icon">
                            ◈
                        </div>

                        <div>

                            <span>
                                Category
                            </span>

                            <strong>
                                {decision.category_id}
                            </strong>

                        </div>

                    </div>


                    <div className="overview-card">

                        <div className="overview-icon">
                            👤
                        </div>

                        <div>

                            <span>
                                Created By
                            </span>

                            <strong>
                                User {decision.created_by}
                            </strong>

                        </div>

                    </div>


                    <div className="overview-card">

                        <div className="overview-icon">
                            ◷
                        </div>

                        <div>

                            <span>
                                Created Date
                            </span>

                            <strong>

                                {new Date(
                                    decision.created_at
                                ).toLocaleString(
                                    "en-GB",
                                    {
                                        day: "2-digit",
                                        month: "2-digit",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                    }
                                )}

                            </strong>

                        </div>

                    </div>


                </section>


                {/* ================================= */}
                {/* DECISION INFORMATION */}
                {/* ================================= */}

                <section className="information-section">


                    <div className="section-title">

                        <div className="section-number">
                            01
                        </div>

                        <div>

                            <h2>
                                Decision Information
                            </h2>

                            <p>
                                Understand the problem and context
                                behind this decision.
                            </p>

                        </div>

                    </div>


                    <div className="information-grid">


                        <div className="information-card">

                            <h3>
                                Problem Statement
                            </h3>

                            <p>
                                {decision.problem_statement ||
                                    "No problem statement provided."}
                            </p>

                        </div>


                        <div className="information-card">

                            <h3>
                                Description
                            </h3>

                            <p>
                                {decision.description ||
                                    "No description provided."}
                            </p>

                        </div>


                    </div>


                </section>


                {/* ================================= */}
                {/* RELATED RESOURCES */}
                {/* ================================= */}

                <section className="information-section">


                    <div className="section-title">

                        <div className="section-number">
                            02
                        </div>

                        <div>

                            <h2>
                                Decision Resources
                            </h2>

                            <p>
                                Access all information related
                                to this decision.
                            </p>

                        </div>

                    </div>


                    <div className="resource-grid">


                        <button
                            className="resource-card"
                            onClick={() =>
                                navigate(
                                    `/alternatives/${id}`
                                )
                            }
                        >

                            <div className="resource-icon blue">
                                ⚖
                            </div>

                            <div>

                                <h3>
                                    Alternatives
                                </h3>

                                <p>
                                    View available options
                                    for this decision.
                                </p>

                            </div>

                            <span>
                                →
                            </span>

                        </button>


                        <button
                            className="resource-card"
                            onClick={() =>
                                navigate(
                                    `/alternative-comparison/${id}`
                                )
                            }
                        >

                            <div className="resource-icon purple">
                                ⇄
                            </div>

                            <div>

                                <h3>
                                    Compare Alternatives
                                </h3>

                                <p>
                                    Evaluate and compare
                                    decision options.
                                </p>

                            </div>

                            <span>
                                →
                            </span>

                        </button>


                        <button
                            className="resource-card"
                            onClick={() =>
                                navigate(
                                    `/documents/${id}`
                                )
                            }
                        >

                            <div className="resource-icon green">
                                📄
                            </div>

                            <div>

                                <h3>
                                    Documents
                                </h3>

                                <p>
                                    View supporting documents
                                    and files.
                                </p>

                            </div>

                            <span>
                                →
                            </span>

                        </button>


                        <button
                            className="resource-card"
                            onClick={() =>
                                navigate(
                                    `/decision/${id}/history`
                                )
                            }
                        >

                            <div className="resource-icon orange">
                                ↺
                            </div>

                            <div>

                                <h3>
                                    Version History
                                </h3>

                                <p>
                                    Track changes made to
                                    this decision.
                                </p>

                            </div>

                            <span>
                                →
                            </span>

                        </button>


                    </div>


                </section>


                {/* ================================= */}
                {/* DISCUSSION */}
                {/* ================================= */}

                <section className="discussion-section">


                    <div className="section-title">

                        <div className="section-number">
                            03
                        </div>

                        <div>

                            <h2>
                                Discussion
                            </h2>

                            <p>
                                Collaborate and record team
                                discussions about this decision.
                            </p>

                        </div>

                    </div>


                    {/* ADD COMMENT */}

                    <div className="comment-composer">

                        <textarea
                            placeholder="Share your thoughts or add a comment..."
                            value={newComment}
                            onChange={(e) =>
                                setNewComment(
                                    e.target.value
                                )
                            }
                        />

                        <div className="composer-footer">

                            <span>
                                Your comment will be linked
                                to Decision #{decision.id}
                            </span>

                            <button
                                className="primary-action"
                                onClick={addComment}
                            >
                                Add Comment
                            </button>

                        </div>

                    </div>


                    {/* COMMENTS */}

                    <div className="comments-container">

                        <div className="comments-header">

                            <h3>
                                Discussion History
                            </h3>

                            <span>
                                {comments.length} comment
                                {comments.length !== 1
                                    ? "s"
                                    : ""}
                            </span>

                        </div>


                        {
                            comments.length === 0 ?

                                <div className="empty-comments">

                                    <div>
                                        💬
                                    </div>

                                    <p>
                                        No comments yet.
                                        Start the discussion!
                                    </p>

                                </div>

                                :

                                comments.map(
                                    comment => (

                                        <div
                                            className="comment-card"
                                            key={comment.id}
                                        >


                                            <div className="comment-avatar">

                                                {(
                                                    comment.user?.name ||
                                                    `User ${comment.user_id}`
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}

                                            </div>


                                            <div className="comment-content">


                                                <div className="comment-top">

                                                    <div>

                                                        <strong>
                                                            {comment.user?.name ||
                                                                `User ${comment.user_id}`}
                                                        </strong>

                                                        <span>
                                                            {new Date(
                                                                comment.created_at
                                                            ).toLocaleString(
                                                                "en-GB",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit"
                                                                }
                                                            )}
                                                        </span>

                                                    </div>


                                                    <div className="comment-actions">

                                                        {
                                                            editingCommentId !==
                                                            comment.id &&

                                                            <button
                                                                onClick={() =>
                                                                    editComment(
                                                                        comment
                                                                    )
                                                                }
                                                            >
                                                                Edit
                                                            </button>
                                                        }


                                                        <button
                                                            className="comment-delete"
                                                            onClick={() =>
                                                                deleteComment(
                                                                    comment.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </div>


                                                {
                                                    editingCommentId ===
                                                    comment.id ?

                                                        <div className="edit-comment-box">

                                                            <textarea
                                                                value={
                                                                    editedComment
                                                                }
                                                                onChange={(e) =>
                                                                    setEditedComment(
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />

                                                            <div>

                                                                <button
                                                                    className="primary-action"
                                                                    onClick={() =>
                                                                        saveEdit(
                                                                            comment.id
                                                                        )
                                                                    }
                                                                >
                                                                    Save
                                                                </button>

                                                                <button
                                                                    className="cancel-action"
                                                                    onClick={() => {

                                                                        setEditingCommentId(
                                                                            null
                                                                        );

                                                                        setEditedComment(
                                                                            ""
                                                                        );

                                                                    }}
                                                                >
                                                                    Cancel
                                                                </button>

                                                            </div>

                                                        </div>

                                                        :

                                                        <p>
                                                            {comment.comment}
                                                        </p>
                                                }


                                            </div>


                                        </div>

                                    )
                                )

                        }

                    </div>


                </section>


                {/* ================================= */}
                {/* MEETING NOTES */}
                {/* ================================= */}

                <section className="meeting-section">


                    <div className="section-title">

                        <div className="section-number">
                            04
                        </div>

                        <div>

                            <h2>
                                Meeting Notes
                            </h2>

                            <p>
                                Record important discussions,
                                conclusions, and next actions.
                            </p>

                        </div>

                    </div>


                    {/* MEETING NOTE FORM */}

                    <div className="meeting-form">


                        <div className="form-field">

                            <label>
                                Meeting Summary
                            </label>

                            <textarea
                                placeholder="Summarize the key points discussed..."
                                value={meetingSummary}
                                onChange={(e) =>
                                    setMeetingSummary(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Conclusion
                            </label>

                            <textarea
                                placeholder="What was decided during the meeting?"
                                value={conclusion}
                                onChange={(e) =>
                                    setConclusion(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <div className="form-field">

                            <label>
                                Next Action
                            </label>

                            <textarea
                                placeholder="What should happen next?"
                                value={nextAction}
                                onChange={(e) =>
                                    setNextAction(
                                        e.target.value
                                    )
                                }
                            />

                        </div>


                        <button
                            className="primary-action"
                            onClick={addMeetingNote}
                        >
                            Save Meeting Note
                        </button>


                    </div>


                    {/* PREVIOUS NOTES */}

                    <div className="previous-notes">

                        <div className="notes-header">

                            <h3>
                                Previous Meeting Notes
                            </h3>

                            <span>
                                {meetingNotes.length} record
                                {meetingNotes.length !== 1
                                    ? "s"
                                    : ""}
                            </span>

                        </div>


                        {
                            meetingNotes.length === 0 ?

                                <div className="empty-notes">

                                    <div>
                                        📝
                                    </div>

                                    <p>
                                        No meeting notes available.
                                    </p>

                                </div>

                                :

                                meetingNotes.map(
                                    note => (

                                        <div
                                            className="meeting-note-card"
                                            key={note.id}
                                        >

                                            <div className="note-date">

                                                {new Date(
                                                    note.created_at
                                                ).toLocaleString(
                                                    "en-GB"
                                                )}

                                            </div>


                                            <div className="note-item">

                                                <span>
                                                    Summary
                                                </span>

                                                <p>
                                                    {
                                                        note.meeting_summary
                                                    }
                                                </p>

                                            </div>


                                            <div className="note-item">

                                                <span>
                                                    Conclusion
                                                </span>

                                                <p>
                                                    {
                                                        note.conclusion
                                                    }
                                                </p>

                                            </div>


                                            <div className="note-item">

                                                <span>
                                                    Next Action
                                                </span>

                                                <p>
                                                    {
                                                        note.next_action
                                                    }
                                                </p>

                                            </div>

                                        </div>

                                    )
                                )

                        }

                    </div>


                </section>


            </main>

        </div>

    );

}

export default DecisionDetails;