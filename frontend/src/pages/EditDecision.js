import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import { useParams, useNavigate } from "react-router-dom";
import "./EditDecision.css";

function EditDecision() {

  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const [decision, setDecision] = useState({
    title: "",
    problem_statement: "",
    description: "",
    status: "Draft"
  });

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ==========================================
     LOAD DECISION
  ========================================== */

  useEffect(() => {

    const loadDecision = async () => {

      if (!token) {
        navigate("/login");
        return;
      }

      try {

        const response = await fetch(
          `${API_BASE_URL}/decisions/${id}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          }
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to load decision");
        }

        const data = await response.json();

        setDecision({
          title: data.title || "",
          problem_statement: data.problem_statement || "",
          description: data.description || "",
          status: data.status || "Draft"
        });

      } catch (error) {

        console.error(
          "Error fetching decision:",
          error
        );

        alert("Unable to load decision");

      } finally {

        setLoading(false);

      }

    };

    loadDecision();

  }, [id, navigate, token]);


  /* ==========================================
     HANDLE CHANGE
  ========================================== */

  const handleChange = (e) => {

    setDecision({
      ...decision,
      [e.target.name]: e.target.value
    });

  };


  /* ==========================================
     UPDATE DECISION
  ========================================== */

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (decision.title.trim() === "") {
      alert("Title cannot be empty");
      return;
    }

    if (decision.problem_statement.trim() === "") {
      alert("Problem Statement is mandatory");
      return;
    }

    if (!token) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {

      const response = await fetch(
        `${API_BASE_URL}/decisions/${id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },

          body: JSON.stringify(decision)
        }
      );

      const data = await response.json();

      if (response.ok) {

        alert("Decision Updated Successfully");

        navigate(`/decision/${id}`);

      } else {

        console.error(
          "Update Error:",
          data
        );

        alert(
          data.detail ||
          data.message ||
          "Update Failed"
        );

      }

    } catch (error) {

      console.error(
        "Network Error:",
        error
      );

      alert("Server connection failed");

    } finally {

      setIsSubmitting(false);

    }

  };


  /* ==========================================
     LOADING
  ========================================== */

  if (loading) {

    return (

      <div className="edit-decision-page">

        <div className="edit-loading">

          <div className="edit-loading-spinner"></div>

          <p>
            Loading decision...
          </p>

        </div>

      </div>

    );

  }


  /* ==========================================
     PAGE
  ========================================== */

  return (

    <div className="edit-decision-page">


      {/* ==========================================
          TOP NAVIGATION
      ========================================== */}

      <header className="edit-decision-header">

        <div className="edit-decision-brand">

          <div className="edit-decision-logo">
            ED
          </div>

          <div>

            <h2>
              Expert Decision
            </h2>

            <span>
              Replay Platform
            </span>

          </div>

        </div>


        <button
          className="edit-back-button"
          onClick={() =>
            navigate(`/decision/${id}`)
          }
        >
          ← Back to Decision
        </button>

      </header>


      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <main className="edit-decision-main">


        {/* ==========================================
            PAGE INTRO
        ========================================== */}

        <div className="edit-decision-intro">

          <span className="edit-decision-eyebrow">
            DECISION MANAGEMENT
          </span>

          <h1>
            Edit Decision
          </h1>

          <p>
            Update the decision details and track changes
            through version history.
          </p>

        </div>


        {/* ==========================================
            FORM CARD
        ========================================== */}

        <div className="edit-decision-card">


          {/* CARD HEADER */}

          <div className="edit-card-header">

            <div className="edit-form-icon">
              ✎
            </div>

            <div>

              <h2>
                Update Decision Information
              </h2>

              <p>
                Modify the details below and save your changes.
              </p>

            </div>

          </div>


          {/* FORM */}

          <form
            className="edit-decision-form"
            onSubmit={handleSubmit}
          >


            {/* ======================================
                TITLE
            ====================================== */}

            <div className="edit-form-group">

              <label htmlFor="title">

                Decision Title

                <span>*</span>

              </label>

              <input
                id="title"
                type="text"
                name="title"
                placeholder="Enter a clear decision title"
                value={decision.title}
                onChange={handleChange}
              />

              <small>
                Update the title if the decision context has changed.
              </small>

            </div>


            {/* ======================================
                PROBLEM STATEMENT
            ====================================== */}

            <div className="edit-form-group">

              <label htmlFor="problem_statement">

                Problem Statement

                <span>*</span>

              </label>

              <textarea
                id="problem_statement"
                name="problem_statement"
                placeholder="Describe the problem or challenge that requires a decision..."
                value={decision.problem_statement}
                onChange={handleChange}
                rows="5"
              />

              <small>
                Clearly explain the problem or challenge being addressed.
              </small>

            </div>


            {/* ======================================
                DESCRIPTION
            ====================================== */}

            <div className="edit-form-group">

              <label htmlFor="description">

                Description

              </label>

              <textarea
                id="description"
                name="description"
                placeholder="Provide additional context, background, or relevant information..."
                value={decision.description}
                onChange={handleChange}
                rows="6"
              />

              <small>
                Add or update supporting context and information.
              </small>

            </div>


            {/* ======================================
                STATUS
            ====================================== */}

            <div className="edit-form-group">

              <label htmlFor="status">

                Decision Status

              </label>

              <select
                id="status"
                name="status"
                value={decision.status}
                onChange={handleChange}
              >

                <option value="Draft">
                  Draft
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Under Review">
                  Under Review
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Rejected">
                  Rejected
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>

              </select>

              <small>
                Changing the decision automatically creates a new version
                through the backend version tracking workflow.
              </small>

            </div>


            {/* ======================================
                VERSION INFORMATION
            ====================================== */}

            <div className="edit-version-info">

              <div className="version-info-icon">
                ↻
              </div>

              <div>

                <strong>
                  Version Tracking
                </strong>

                <p>
                  Changes made to this decision are tracked
                  automatically. You can review previous versions
                  from the Version History page.
                </p>

              </div>

            </div>


            {/* ======================================
                ACTIONS
            ====================================== */}

            <div className="edit-form-actions">

              <button
                type="button"
                className="edit-cancel-button"
                onClick={() =>
                  navigate(`/decision/${id}`)
                }
                disabled={isSubmitting}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="edit-submit-button"
                disabled={isSubmitting}
              >

                {isSubmitting
                  ? "Updating..."
                  : "Update Decision"}

              </button>

            </div>

          </form>

        </div>


        {/* ==========================================
            QUICK NAVIGATION
        ========================================== */}

        <div className="edit-quick-navigation">

          <div className="edit-quick-header">

            <div className="edit-quick-icon">
              ⚡
            </div>

            <div>

              <h3>
                Decision Management
              </h3>

              <p>
                Quickly navigate to related decision tools.
              </p>

            </div>

          </div>


          <div className="edit-quick-buttons">

            <button
              onClick={() =>
                navigate("/decisions")
              }
            >

              <span>
                📋
              </span>

              View All Decisions

              <b>
                →
              </b>

            </button>


            <button
              onClick={() =>
                navigate(`/decision/${id}/history`)
              }
            >

              <span>
                🔄
              </span>

              View Version History

              <b>
                →
              </b>

            </button>

          </div>

        </div>


      </main>

    </div>

  );

}

export default EditDecision;
