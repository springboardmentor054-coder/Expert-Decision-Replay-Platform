import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";

function EditAlternative() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [alternative, setAlternative] = useState({
    decision_id: "",
    alternative_name: "",
    description: "",
    pros: "",
    cons: "",
    estimated_cost: "",
    feasibility: "",
    risk_level: ""
  });


  useEffect(() => {

    const getAlternative = async () => {

      try {

        const response = await api.get(`/alternatives/${id}`);

        setAlternative(response.data);

      } catch (error) {

        console.log(error);
        alert("Failed to load alternative");

      }

    };

    getAlternative();

  }, [id]);



  const handleChange = (e) => {

    setAlternative({
      ...alternative,
      [e.target.name]: e.target.value
    });

  };



  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await api.put(`/alternatives/${id}`, {
        decision_id: Number(alternative.decision_id),
        alternative_name: alternative.alternative_name,
        description: alternative.description,
        pros: alternative.pros,
        cons: alternative.cons,
        estimated_cost: Number(alternative.estimated_cost),
        feasibility: alternative.feasibility,
        risk_level: alternative.risk_level
      });


      alert("Alternative updated successfully");

      navigate("/alternatives");


    } catch (error) {

      console.log(error);
      alert("Failed to update alternative");

    }

  };



  return (
  <div className="container">

    <div className="page-header">
      <div>
        <h1>Edit Alternative</h1>
        <p className="page-subtitle">
          Update the details and evaluation of this alternative
        </p>
      </div>
    </div>

    <div className="card form-card">
      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Decision ID</label>
          <input
            type="number"
            name="decision_id"
            placeholder="Enter decision ID"
            value={alternative.decision_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Alternative Name</label>
          <input
            type="text"
            name="alternative_name"
            placeholder="Enter alternative name"
            value={alternative.alternative_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            rows="4"
            name="description"
            placeholder="Describe the alternative"
            value={alternative.description}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Pros</label>
          <textarea
            rows="3"
            name="pros"
            placeholder="Enter the advantages"
            value={alternative.pros}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Cons</label>
          <textarea
            rows="3"
            name="cons"
            placeholder="Enter the disadvantages"
            value={alternative.cons}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Estimated Cost</label>
          <input
            type="number"
            name="estimated_cost"
            placeholder="Enter estimated cost"
            value={alternative.estimated_cost}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Feasibility</label>
          <input
            type="text"
            name="feasibility"
            placeholder="Example: High, Medium, Low"
            value={alternative.feasibility}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Risk Level</label>
          <select
            name="risk_level"
            value={alternative.risk_level}
            onChange={handleChange}
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
            Update Alternative
          </button>
        </div>

      </form>
    </div>

  </div>
);

}

export default EditAlternative;