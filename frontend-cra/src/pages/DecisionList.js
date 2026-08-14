import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function DecisionList() {
  const [decisions, setDecisions] = useState([]);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    getDecisions();
    getCurrentUser();
  }, []);

  const getDecisions = async () => {
    try {
      const response = await api.get("/decisions/");
      setDecisions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.user_id;

      const response = await api.get("/users/" + userId);

      setUserRole(response.data.role_id);
    } catch (error) {
      console.log("Failed to get current user:", error);
    }
  };

  const deleteDecision = async (id) => {
    try {
      await api.delete("/decisions/" + id);

      alert("Decision deleted successfully");

      getDecisions();
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  // Submit Draft decision for approval
  const submitForApproval = async (id) => {
    try {
      await api.put("/approval/" + id + "/submit");

      alert("Decision submitted for approval");

      getDecisions();
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.detail ||
          "Failed to submit decision for approval"
      );
    }
  };

  // Approve Pending Approval decision
  const approveDecision = async (id) => {
    try {
      await api.put("/approval/" + id + "/approve");

      alert("Decision approved");

      getDecisions();
    } catch (error) {
      console.log(error);
      alert("Approval failed");
    }
  };

  // Reject Pending Approval decision
  const rejectDecision = async (id) => {
    try {
      await api.put("/approval/" + id + "/reject");

      alert("Decision rejected");

      getDecisions();
    } catch (error) {
      console.log(error);
      alert("Rejection failed");
    }
  };

  return (
    <div className="container">

      <div className="page-header">

        <div>
          <h1>Decisions</h1>

          <p className="page-subtitle">
            Manage and review organizational decisions
          </p>
        </div>

        <button
          className="create-btn"
          onClick={() => navigate("/create-decision")}
        >
          + Create Decision
        </button>

      </div>

      <div className="card table-card">

        <div className="table-wrapper">

          <table>

            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {decisions.length > 0 ? (

                decisions.map((decision) => (

                  <tr key={decision.id}>

                    <td className="decision-title">
                      {decision.title}
                    </td>

                    <td>
                      {decision.category_id}
                    </td>

                    <td>
                      <span className="status-badge">
                        {decision.status}
                      </span>
                    </td>

                    <td>
                      {decision.created_by}
                    </td>

                    <td>
                      {decision.created_at}
                    </td>

                    <td>

                      <div className="action-buttons">

                        <button
                          className="edit-btn"
                          onClick={() =>
                            navigate("/edit-decision/" + decision.id)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteDecision(decision.id)
                          }
                        >
                          Delete
                        </button>

                        <button
                          className="history-btn"
                          onClick={() =>
                            navigate(
                              "/decisions/" +
                              decision.id +
                              "/history"
                            )
                          }
                        >
                          History
                        </button>

                        {/* ADMIN APPROVAL ACTIONS */}
                        {userRole === 1 && (
                          <>
                            {/* Draft → Submit for Approval */}
                            {decision.status === "Draft" && (
                              <button
                                className="approve-btn"
                                onClick={() =>
                                  submitForApproval(decision.id)
                                }
                              >
                                Submit for Approval
                              </button>
                            )}

                            {/* Pending Approval → Approve / Reject */}
                            {decision.status === "Pending Approval" && (
                              <>
                                <button
                                  className="approve-btn"
                                  onClick={() =>
                                    approveDecision(decision.id)
                                  }
                                >
                                  Approve
                                </button>

                                <button
                                  className="reject-btn"
                                  onClick={() =>
                                    rejectDecision(decision.id)
                                  }
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </>
                        )}

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan="6"
                    className="empty-state"
                  >
                    No decisions found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default DecisionList;