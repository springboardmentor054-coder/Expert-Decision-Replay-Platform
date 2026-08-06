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
    <div>
      <h2>Decision List</h2>

      <table border="1">
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
              <td>{decision.title}</td>
              <td>{decision.category_id}</td>
              <td>{decision.status}</td>
              <td>{decision.created_by}</td>
              <td>{decision.created_at}</td>

              <td>
                <button
                  onClick={() =>
                    navigate(`/edit-decision/${decision.id}`)
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() => deleteDecision(decision.id)}
                >
                  Delete
                </button>

                <button
                  onClick={() =>
                    navigate(`/decisions/${decision.id}/history`)
                  }
                >
                  View History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DecisionList;