import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decision.css";

function Decisions() {

  const [decisions, setDecisions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const userEmail = localStorage.getItem("userEmail") || "User";


  /* ========================= */
  /* FETCH DECISIONS */
  /* ========================= */

  useEffect(() => {

    fetch("http://127.0.0.1:8000/decisions")

      .then((response) => response.json())

      .then((data) => {

        setDecisions(data);
        setLoading(false);

      })

      .catch((error) => {

        console.log(error);
        setLoading(false);

      });

  }, []);


  /* ========================= */
  /* DELETE DECISION */
  /* ========================= */

  const deleteDecision = async (id) => {

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/decisions/${id}`,
        {
          method: "DELETE",
        }
      );


      if (response.ok) {

        setDecisions(
          decisions.filter(
            (decision) => decision.id !== id
          )
        );

      }

    } catch (error) {

      console.log(error);

    }

  };


  /* ========================= */
  /* LOGOUT */
  /* ========================= */

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");

    navigate("/login");

  };


  /* ========================= */
  /* FILTER DECISIONS */
  /* ========================= */

  const filteredDecisions = decisions.filter((decision) => {

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      decision.title?.toLowerCase().includes(search) ||
      decision.status?.toLowerCase().includes(search) ||
      String(decision.id).includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      decision.status === statusFilter;

    return matchesSearch && matchesStatus;

  });


  /* ========================= */
  /* STATISTICS */
  /* ========================= */

  const totalDecisions = decisions.length;

  const activeDecisions = decisions.filter(
    (decision) =>
      decision.status?.toLowerCase() === "active"
  ).length;

  const completedDecisions = decisions.filter(
    (decision) =>
      decision.status?.toLowerCase() === "completed"
  ).length;

  const pendingDecisions = decisions.filter(
    (decision) =>
      decision.status?.toLowerCase() === "pending"
  ).length;


  /* ========================= */
  /* STATUS CLASS */
  /* ========================= */

  const getStatusClass = (status) => {

    if (!status) return "status-default";

    const normalizedStatus =
      status.toLowerCase();

    if (normalizedStatus === "active") {
      return "status-active";
    }

    if (normalizedStatus === "completed") {
      return "status-completed";
    }

    if (normalizedStatus === "pending") {
      return "status-pending";
    }

    if (normalizedStatus === "cancelled") {
      return "status-cancelled";
    }

    return "status-default";

  };


  /* ========================= */
  /* LOADING */
  /* ========================= */

  if (loading) {

    return (

      <div className="decisions-page">

        <div className="loading-screen">

          <div className="loading-spinner"></div>

          <p>
            Loading decisions...
          </p>

        </div>

      </div>

    );

  }


  return (

    <div className="decisions-page">


      {/* ========================= */}
      {/* TOP NAVIGATION */}
      {/* ========================= */}

      <header className="top-navbar">

        <div className="navbar-brand">

          <div className="navbar-logo">
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


        <div className="navbar-right">

          <div className="user-info">

            <div className="user-avatar">
              {userEmail.charAt(0).toUpperCase()}
            </div>

            <div className="user-details">

              <strong>
                {userEmail}
              </strong>

              <span>
                Decision Manager
              </span>

            </div>

          </div>


          <button
            className="logout-button"
            onClick={handleLogout}
          >

            Logout

          </button>

        </div>

      </header>


      {/* ========================= */}
      {/* MAIN CONTENT */}
      {/* ========================= */}

      <main className="decisions-main">


        {/* PAGE HEADER */}

        <div className="dashboard-header">

          <div>

            <span className="eyebrow">
              DECISION MANAGEMENT
            </span>

            <h1>
              All Decisions
            </h1>

            <p>
              Review, manage, and track your organization's
              important decisions.
            </p>

          </div>


          <button
            className="create-button"
            onClick={() =>
              navigate("/create-decision")
            }
          >

            <span className="button-icon">
              +
            </span>

            Create Decision

          </button>

        </div>


        {/* ========================= */}
        {/* QUICK NAVIGATION */}
        {/* ========================= */}

        <div className="quick-actions">

          <button
            onClick={() =>
              navigate("/alternatives")
            }
          >

            <span className="quick-icon">
              ⚖
            </span>

            <span>
              <strong>
                Alternatives
              </strong>

              <small>
                Compare available options
              </small>
            </span>

            <span className="quick-arrow">
              →
            </span>

          </button>


          <button
            onClick={() =>
              navigate("/documents")
            }
          >

            <span className="quick-icon">
              📄
            </span>

            <span>
              <strong>
                Documents
              </strong>

              <small>
                View supporting files
              </small>
            </span>

            <span className="quick-arrow">
              →
            </span>

          </button>

        </div>


        {/* ========================= */}
        {/* STATISTICS */}
        {/* ========================= */}

        <div className="stats-grid">


          <div className="stat-card">

            <div className="stat-icon blue">
              ◈
            </div>

            <div>

              <span>
                Total Decisions
              </span>

              <strong>
                {totalDecisions}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon green">
              ✓
            </div>

            <div>

              <span>
                Active
              </span>

              <strong>
                {activeDecisions}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon purple">
              ★
            </div>

            <div>

              <span>
                Completed
              </span>

              <strong>
                {completedDecisions}
              </strong>

            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon orange">
              ◷
            </div>

            <div>

              <span>
                Pending
              </span>

              <strong>
                {pendingDecisions}
              </strong>

            </div>

          </div>


        </div>


        {/* ========================= */}
        {/* DECISION SECTION */}
        {/* ========================= */}

        <section className="decision-section">


          <div className="section-header">

            <div>

              <h2>
                Decision Records
              </h2>

              <p>
                {filteredDecisions.length} decision
                {filteredDecisions.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>

            </div>


            {/* SEARCH + FILTER */}

            <div className="filters">

              <div className="search-box">

                <span>
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Search decisions..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

              </div>


              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >

                <option value="All">
                  All Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>

              </select>

            </div>

          </div>


          {/* ========================= */}
          {/* DECISION CARDS */}
          {/* ========================= */}

          {filteredDecisions.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h3>
                No decisions found
              </h3>

              <p>
                Try changing your search or create
                a new decision.
              </p>

              <button
                className="create-button"
                onClick={() =>
                  navigate("/create-decision")
                }
              >
                Create Your First Decision
              </button>

            </div>

          ) : (

            <div className="decision-grid">

              {filteredDecisions.map(
                (decision) => (

                  <div
                    className="decision-card"
                    key={decision.id}
                  >


                    {/* CARD HEADER */}

                    <div className="decision-card-header">

                      <div className="decision-number">
                        Decision #{decision.id}
                      </div>

                      <span
                        className={`status-badge ${getStatusClass(
                          decision.status
                        )}`}
                      >
                        {decision.status}
                      </span>

                    </div>


                    {/* CARD CONTENT */}

                    <div className="decision-card-body">

                      <h3>
                        {decision.title}
                      </h3>

                      <div className="decision-meta">

                        <div>
                          <span>
                            Category
                          </span>

                          <strong>
                            {decision.category_id}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Created By
                          </span>

                          <strong>
                            {decision.created_by}
                          </strong>
                        </div>

                      </div>

                      <div className="created-date">

                        <span>
                          Created
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


                    {/* CARD ACTIONS */}

                    <div className="decision-card-actions">


                      <button
                        className="view-button"
                        onClick={() =>
                          navigate(
                            `/decision/${decision.id}`
                          )
                        }
                      >
                        View
                      </button>


                      <button
                        className="edit-button"
                        onClick={() =>
                          navigate(
                            `/edit/${decision.id}`
                          )
                        }
                      >
                        Edit
                      </button>


                      <button
                        className="document-button"
                        onClick={() =>
                          navigate(
                            `/documents/${decision.id}`
                          )
                        }
                      >
                        Documents
                      </button>


                      <button
                        className="upload-button"
                        onClick={() =>
                          navigate(
                            `/upload-document/${decision.id}`
                          )
                        }
                      >
                        Upload
                      </button>


                      <button
                        className="delete-button"
                        onClick={() => {

                          if (
                            window.confirm(
                              "Are you sure you want to delete this decision?"
                            )
                          ) {

                            deleteDecision(
                              decision.id
                            );

                          }

                        }}
                      >
                        Delete
                      </button>


                    </div>


                  </div>

                )
              )}

            </div>

          )}

        </section>


      </main>

    </div>

  );

}

export default Decisions;