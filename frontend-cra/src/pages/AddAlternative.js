import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function AddAlternative() {

  const navigate = useNavigate();

  const [decisionId, setDecisionId] = useState("");
  const [alternativeName, setAlternativeName] = useState("");
  const [description, setDescription] = useState("");
  const [pros, setPros] = useState("");
  const [cons, setCons] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [feasibility, setFeasibility] = useState("");
  const [riskLevel, setRiskLevel] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await api.post("/alternatives/", {
        decision_id: Number(decisionId),
        alternative_name: alternativeName,
        description: description,
        pros: pros,
        cons: cons,
        estimated_cost: Number(estimatedCost),
        feasibility: feasibility,
        risk_level: riskLevel
      });

      console.log(response.data);

      alert("Alternative created successfully");

      navigate("/alternatives");

    } catch (error) {

      console.log("Full Error:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);

        alert(
          "Status: " +
            error.response.status +
            "\n\n" +
            JSON.stringify(error.response.data, null, 2)
        );
      } else {
        alert(error.message);
      }
    }
  };

  return (
  <div className="container">

    <div className="page-header">
      <div>
        <h1>Add Alternative</h1>
        <p className="page-subtitle">
          Define and evaluate an alternative for a decision
        </p>
      </div>
    </div>

    <div className="card form-card">
      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Decision ID</label>
          <input
            type="number"
            placeholder="Enter decision ID"
            value={decisionId}
            onChange={(e) => setDecisionId(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Alternative Name</label>
          <input
            type="text"
            placeholder="Enter alternative name"
            value={alternativeName}
            onChange={(e) => setAlternativeName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="4"
            placeholder="Describe the alternative"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Pros</label>
          <textarea
            rows="3"
            placeholder="Enter the advantages"
            value={pros}
            onChange={(e) => setPros(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Cons</label>
          <textarea
            rows="3"
            placeholder="Enter the disadvantages"
            value={cons}
            onChange={(e) => setCons(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Estimated Cost</label>
          <input
            type="number"
            placeholder="Enter estimated cost"
            value={estimatedCost}
            onChange={(e) => setEstimatedCost(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Feasibility</label>
          <input
            type="text"
            placeholder="Example: High, Medium, Low"
            value={feasibility}
            onChange={(e) => setFeasibility(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Risk Level</label>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            required
          >
            <option value="">Select Risk Level</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/alternatives")}
          >
            Cancel
          </button>

          <button type="submit" className="create-btn">
            Add Alternative
          </button>
        </div>

      </form>
    </div>

  </div>
);
}

export default AddAlternative;