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

    <div>

      <h2>Edit Alternative</h2>


      <form onSubmit={handleSubmit}>


        <label>Decision ID</label>
        <br/>
        <input
          name="decision_id"
          value={alternative.decision_id}
          onChange={handleChange}
          required
        />

        <br/><br/>


        <label>Alternative Name</label>
        <br/>
        <input
          name="alternative_name"
          value={alternative.alternative_name}
          onChange={handleChange}
          required
        />

        <br/><br/>


        <label>Description</label>
        <br/>
        <textarea
          name="description"
          value={alternative.description}
          onChange={handleChange}
        />

        <br/><br/>


        <label>Pros</label>
        <br/>
        <textarea
          name="pros"
          value={alternative.pros}
          onChange={handleChange}
        />

        <br/><br/>


        <label>Cons</label>
        <br/>
        <textarea
          name="cons"
          value={alternative.cons}
          onChange={handleChange}
        />

        <br/><br/>


        <label>Estimated Cost</label>
        <br/>
        <input
          type="number"
          name="estimated_cost"
          value={alternative.estimated_cost}
          onChange={handleChange}
          required
        />

        <br/><br/>


        <label>Feasibility</label>
        <br/>
        <input
          name="feasibility"
          value={alternative.feasibility}
          onChange={handleChange}
          required
        />

        <br/><br/>


        <label>Risk Level</label>
        <br/>

        <select
          name="risk_level"
          value={alternative.risk_level}
          onChange={handleChange}
          required
        >

          <option value="">Select</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>

        </select>


        <br/><br/>


        <button type="submit">
          Update Alternative
        </button>


      </form>


    </div>

  );

}

export default EditAlternative;