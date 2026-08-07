import React, { useState } from "react";
import api from "../api";

function ComparisonView() {

  const [decisionId, setDecisionId] = useState("");
  const [alternatives, setAlternatives] = useState([]);


  const compareAlternatives = async () => {


    if (!decisionId) {

      alert("Please enter Decision ID");

      return;

    }


    try {


      const response = await api.get(
        `/decisions/${decisionId}/alternatives`
      );


      setAlternatives(response.data);



      if (response.data.length === 0) {

        alert("No alternatives found for this decision");

      }


    } catch (error) {


      console.log(error);

      alert("Failed to load alternatives");


    }


  };



  return (
  <div className="container">

    <div className="page-header">
      <div>
        <h1>Compare Alternatives</h1>
        <p className="page-subtitle">
          Compare available alternatives for a decision
        </p>
      </div>
    </div>

    <div className="card comparison-search">
      <label>Decision ID</label>

      <div className="comparison-input">
        <input
          type="number"
          placeholder="Enter decision ID"
          value={decisionId}
          onChange={(e) => setDecisionId(e.target.value)}
        />

        <button
          className="create-btn"
          onClick={compareAlternatives}
        >
          Compare
        </button>
      </div>
    </div>

    {alternatives.length > 0 ? (
      <div className="card table-card">

        <div className="comparison-heading">
          <div>
            <h2>Alternative Comparison</h2>
            <p>
              Review the available options side by side.
            </p>
          </div>

          <span className="decision-badge">
            Decision #{decisionId}
          </span>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Alternative</th>
                <th>Description</th>
                <th>Pros</th>
                <th>Cons</th>
                <th>Cost</th>
                <th>Feasibility</th>
                <th>Risk Level</th>
              </tr>
            </thead>

            <tbody>
              {alternatives.map((item) => (
                <tr key={item.id}>

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

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    ) : (
      <div className="card comparison-empty">
        <div className="empty-icon">⚖</div>

        <h3>No comparison available</h3>

        <p>
          Enter a Decision ID above and click Compare to view
          its alternatives.
        </p>
      </div>
    )}

  </div>
);

}


export default ComparisonView;