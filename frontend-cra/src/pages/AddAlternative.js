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
    <div>

      <h2>Add Alternative</h2>

      <form onSubmit={handleSubmit}>

        <label>Decision ID</label>
        <br />
        <input
          type="number"
          value={decisionId}
          onChange={(e) => setDecisionId(e.target.value)}
          required
        />

        <br /><br />

        <label>Alternative Name</label>
        <br />
        <input
          type="text"
          value={alternativeName}
          onChange={(e) => setAlternativeName(e.target.value)}
          required
        />

        <br /><br />

        <label>Description</label>
        <br />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br /><br />

        <label>Pros</label>
        <br />
        <textarea
          value={pros}
          onChange={(e) => setPros(e.target.value)}
        />

        <br /><br />

        <label>Cons</label>
        <br />
        <textarea
          value={cons}
          onChange={(e) => setCons(e.target.value)}
        />

        <br /><br />

        <label>Estimated Cost</label>
        <br />
        <input
          type="number"
          value={estimatedCost}
          onChange={(e) => setEstimatedCost(e.target.value)}
          required
        />

        <br /><br />

        <label>Feasibility</label>
        <br />
        <input
          type="text"
          value={feasibility}
          onChange={(e) => setFeasibility(e.target.value)}
          required
        />

        <br /><br />

        <label>Risk Level</label>
        <br />
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

        <br /><br />

        <button type="submit">
          Add Alternative
        </button>

      </form>

    </div>
  );
}

export default AddAlternative;