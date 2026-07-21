import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Decision.css";

function AddAlternative() {

    const navigate = useNavigate();

    const [alternative, setAlternative] = useState({
        decision_id: "",
        alternative_name: "",
        description: "",
        estimated_cost: "",
        feasibility: "",
        risk_level: ""
    });

    const handleChange = (e) => {

        setAlternative({
            ...alternative,
            [e.target.name]: e.target.value
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        // Get JWT token
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first");
            navigate("/login");
            return;
        }

        // Validate Decision ID
        if (!alternative.decision_id) {
            alert("Decision ID is required");
            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/alternatives/",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        ...alternative,
                        decision_id: Number(alternative.decision_id),
                        estimated_cost: Number(alternative.estimated_cost)
                    })
                }
            );

            const data = await response.json();

            console.log("Response status:", response.status);
            console.log("Response data:", data);

            if (response.ok) {

                alert("Alternative Created Successfully");

                navigate("/alternatives");

            } else {

                console.error("Create Alternative Error:", data);

                alert(
                    data.detail ||
                    data.message ||
                    "Error Creating Alternative"
                );

            }

        } catch (error) {

            console.error("Fetch error:", error);

            alert("Unable to connect to the server");

        }

    };

    return (

        <div className="container">

            <h1>Add Alternative</h1>

            {/* Navigation Buttons */}

            <div style={{ marginBottom: "20px" }}>

                <button onClick={() => navigate("/")}>
                    Create Decision
                </button>

                <button
                    onClick={() => navigate("/decisions")}
                    style={{ marginLeft: "10px" }}
                >
                    View Decisions
                </button>

                <button
                    onClick={() => navigate("/alternatives")}
                    style={{ marginLeft: "10px" }}
                >
                    View Alternatives
                </button>

            </div>

            <div className="form-container">

                <form onSubmit={handleSubmit}>

                    {/* Decision ID */}

                    <div className="form-group">

                        <label>Decision ID</label>

                        <input
                            type="number"
                            name="decision_id"
                            value={alternative.decision_id}
                            onChange={handleChange}
                            placeholder="Enter Decision ID"
                            required
                        />

                    </div>

                    {/* Alternative Name */}

                    <div className="form-group">

                        <label>Alternative Name</label>

                        <input
                            type="text"
                            name="alternative_name"
                            value={alternative.alternative_name}
                            onChange={handleChange}
                            placeholder="Enter alternative name"
                            required
                        />

                    </div>

                    {/* Description */}

                    <div className="form-group">

                        <label>Description</label>

                        <textarea
                            name="description"
                            value={alternative.description}
                            onChange={handleChange}
                            placeholder="Enter alternative description"
                        />

                    </div>

                    {/* Estimated Cost */}

                    <div className="form-group">

                        <label>Estimated Cost</label>

                        <input
                            type="number"
                            name="estimated_cost"
                            value={alternative.estimated_cost}
                            onChange={handleChange}
                            placeholder="Enter estimated cost"
                            required
                        />

                    </div>

                    {/* Feasibility */}

                    <div className="form-group">

                        <label>Feasibility</label>

                        <input
                            type="text"
                            name="feasibility"
                            value={alternative.feasibility}
                            onChange={handleChange}
                            placeholder="Enter feasibility"
                        />

                    </div>

                    {/* Risk Level */}

                    <div className="form-group">

                        <label>Risk Level</label>

                        <input
                            type="text"
                            name="risk_level"
                            value={alternative.risk_level}
                            onChange={handleChange}
                            placeholder="Enter risk level"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                    >
                        Create
                    </button>

                </form>

            </div>

        </div>

    );

}

export default AddAlternative;