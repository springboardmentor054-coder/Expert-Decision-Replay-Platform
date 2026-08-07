import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function DecisionList() {
  const [decisions, setDecisions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getDecisions();
  }, []);

  const getDecisions = async () => {
    try {
      const response = await api.get("/decisions/");
      setDecisions(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteDecision = async (id) => {
    try {
      await api.delete(`/decisions/${id}`);

      alert("Decision deleted successfully");

      getDecisions();
    } catch (error) {
      console.log(error);
      alert("Delete failed");
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
            {decisions.map((decision) => (
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
                        navigate(`/edit-decision/${decision.id}`)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteDecision(decision.id)}
                    >
                      Delete
                    </button>

                    <button
                      className="history-btn"
                      onClick={() =>
                        navigate(`/decisions/${decision.id}/history`)
                      }
                    >
                      History
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

export default DecisionList;