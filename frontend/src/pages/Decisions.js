import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import { useNavigate } from "react-router-dom";
import "./Decision.css";

function Decisions() {
  const [decisions, setDecisions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const categoryNames = {
    1: "General",
    2: "Technology",
    3: "Finance",
    4: "Operations",
    5: "Human Resources",
    6: "Marketing",
    7: "Security"
  };

  useEffect(() => {
    fetch(`${API_BASE_URL}/decisions`)
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

  const deleteDecision = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/decisions/${id}`,
        {
          method: "DELETE"
        }
      );

      if (response.ok) {
        setDecisions((currentDecisions) =>
          currentDecisions.filter(
            (decision) => decision.id !== id
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) {
      return "Uncategorized";
    }

    return categoryNames[categoryId] || "Uncategorized";
  };

  const getNormalizedStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    const normalizedStatus = status.toLowerCase().trim();

    if (normalizedStatus === "approved") {
      return "Approved";
    }

    if (normalizedStatus === "rejected") {
      return "Rejected";
    }

    if (
      normalizedStatus === "pending" ||
      normalizedStatus === "review" ||
      normalizedStatus === "in review" ||
      normalizedStatus === "under review"
    ) {
      return "In Progress";
    }

    if (
      normalizedStatus === "done" ||
      normalizedStatus === "completed"
    ) {
      return "Completed";
    }

    if (normalizedStatus === "draft") {
      return "Draft";
    }

    return status;
  };

  const getStatusClass = (status) => {
    const normalizedStatus = getNormalizedStatus(status);

    switch (normalizedStatus) {
      case "Approved":
        return "status-approved";

      case "Rejected":
        return "status-rejected";

      case "In Progress":
        return "status-progress";

      case "Completed":
        return "status-completed";

      case "Draft":
        return "status-draft";

      default:
        return "status-default";
    }
  };

  const filteredDecisions = decisions.filter((decision) => {
    const search = searchTerm.toLowerCase().trim();

    const categoryName = getCategoryName(
      decision.category_id
    );

    const normalizedStatus = getNormalizedStatus(
      decision.status
    );

    const matchesSearch =
      decision.title
        ?.toLowerCase()
        .includes(search) ||
      decision.status
        ?.toLowerCase()
        .includes(search) ||
      categoryName
        .toLowerCase()
        .includes(search) ||
      String(decision.id).includes(search);

    const matchesStatus =
      statusFilter === "All" ||
      normalizedStatus === statusFilter;

    const matchesCategory =
      categoryFilter === "All" ||
      categoryName === categoryFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesCategory
    );
  });

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div className="decisions-page">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading decisions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="decisions-page">

      <header className="top-navbar">

        <div className="navbar-brand">
          <div className="navbar-logo">
            ED
          </div>

          <div className="navbar-brand-text">
            <h2>Expert Decision</h2>
            <span>Replay Platform</span>
          </div>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      <main className="decisions-main">

        <div className="page-header">

          <div>
            <span className="eyebrow">
              DECISION MANAGEMENT
            </span>

            <h1>All Decisions</h1>

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
            <span className="button-icon">+</span>
            Create Decision
          </button>

        </div>

        <section className="filters-section">

          <div className="filters-title">
            <span className="filter-icon">⚱</span>
            <h2>Filters</h2>
          </div>

          <div className="filters-row">

            <div className="filter-group">
              <label>Status</label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >
                <option value="All">
                  All Status
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Rejected">
                  Rejected
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Draft">
                  Draft
                </option>
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>

              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
              >
                <option value="All">
                  All Categories
                </option>

                <option value="General">
                  General
                </option>

                <option value="Technology">
                  Technology
                </option>

                <option value="Finance">
                  Finance
                </option>

                <option value="Operations">
                  Operations
                </option>

                <option value="Human Resources">
                  Human Resources
                </option>

                <option value="Marketing">
                  Marketing
                </option>

                <option value="Security">
                  Security
                </option>

                <option value="Uncategorized">
                  Uncategorized
                </option>
              </select>
            </div>

            <div className="filter-group search-filter">
              <label>Search</label>

              <div className="search-box">
                <span>🔍</span>

                <input
                  type="text"
                  placeholder="Search decisions..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>
            </div>

            <button
              className="reset-button"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setCategoryFilter("All");
              }}
            >
              Reset
            </button>

          </div>

        </section>

        <section className="decision-section">

          <div className="section-header">

            <div>
              <h2>Decision Records</h2>

              <p>
                {filteredDecisions.length} decision
                {filteredDecisions.length !== 1
                  ? "s"
                  : ""}{" "}
                found
              </p>
            </div>

          </div>

          {filteredDecisions.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                📋
              </div>

              <h3>
                No decisions found
              </h3>

              <p>
                Try changing your filters or create
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

                    <div className="decision-card-header">

                      <div className="decision-number">
                        Decision #{decision.id}
                      </div>

                      <span
                        className={`status-badge ${getStatusClass(
                          decision.status
                        )}`}
                      >
                        {getNormalizedStatus(
                          decision.status
                        )}
                      </span>

                    </div>

                    <div className="decision-card-body">

                      <h3>
                        {decision.title}
                      </h3>

                      <div className="decision-meta">

                        <div>
                          <span>Category</span>

                          <strong>
                            {getCategoryName(
                              decision.category_id
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Created By</span>

                          <strong>
                            {decision.created_by || "—"}
                          </strong>
                        </div>

                      </div>

                      <div className="created-date">

                        <span>Created</span>

                        <strong>
                          {formatDate(
                            decision.created_at
                          )}
                        </strong>

                      </div>

                    </div>

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
