import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function AlternativesList() {

  const [alternatives, setAlternatives] = useState([]);

  const navigate = useNavigate();


  const getAlternatives = async () => {

    try {

      const response = await api.get("/alternatives/");

      setAlternatives(response.data);

    } catch (error) {

      console.log(error);
      alert("Failed to load alternatives");

    }

  };


  useEffect(() => {

    getAlternatives();

  }, []);



  const deleteAlternative = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this alternative?"
    );


    if (!confirmDelete) {
      return;
    }


    try {

      await api.delete(`/alternatives/${id}`);

      alert("Alternative deleted successfully");

      getAlternatives();


    } catch (error) {

      console.log(error);

      alert("Failed to delete alternative");

    }

  };



  return (
  <div className="container">

    <div className="page-header">
      <div>
        <h1>Alternatives</h1>
        <p className="page-subtitle">
          Compare and manage alternatives for organizational decisions
        </p>
      </div>

      <button
        className="create-btn"
        onClick={() => navigate("/add-alternative")}
      >
        + Add Alternative
      </button>
    </div>

    <div className="card table-card">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Decision ID</th>
              <th>Name</th>
              <th>Description</th>
              <th>Pros</th>
              <th>Cons</th>
              <th>Cost</th>
              <th>Feasibility</th>
              <th>Risk Level</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {alternatives.map((item) => (
              <tr key={item.id}>

                <td>{item.id}</td>

                <td>{item.decision_id}</td>

                <td className="decision-title">
                  {item.alternative_name}
                </td>

                <td>{item.description}</td>

                <td>{item.pros}</td>

                <td>{item.cons}</td>

                <td>{item.estimated_cost}</td>

                <td>
                  <span className="status-badge">
                    {item.feasibility}
                  </span>
                </td>

                <td>
                  <span className="risk-badge">
                    {item.risk_level}
                  </span>
                </td>

                <td>
                  <div className="action-buttons">

                    <button
                      className="edit-btn"
                      onClick={() =>
                        navigate(`/edit-alternative/${item.id}`)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteAlternative(item.id)
                      }
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


export default AlternativesList;