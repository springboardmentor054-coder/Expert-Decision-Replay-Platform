import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Decision.css";

function AddAlternative() {

    const navigate = useNavigate();

    // Optional Decision ID from URL
    const { id } = useParams();

    const [alternative, setAlternative] = useState({
        decision_id: id || "",
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


        // Validate Alternative Name
        if (!alternative.alternative_name.trim()) {

            alert("Alternative Name is required");

            return;

        }


        // Validate Estimated Cost
        if (
            !alternative.estimated_cost ||
            Number(alternative.estimated_cost) <= 0
        ) {

            alert("Estimated Cost must be greater than 0");

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

                        decision_id: Number(
                            alternative.decision_id
                        ),

                        estimated_cost: Number(
                            alternative.estimated_cost
                        )

                    })

                }
            );


            const data = await response.json();


            console.log(
                "Response status:",
                response.status
            );

            console.log(
                "Response data:",
                data
            );


            if (response.ok) {

                alert(
                    "Alternative Created Successfully"
                );

                // Return to decision-specific alternatives
                navigate(
                    `/alternatives/${alternative.decision_id}`
                );

            } else {

                console.error(
                    "Create Alternative Error:",
                    data
                );

                alert(

                    data.detail ||

                    data.message ||

                    "Error Creating Alternative"

                );

            }

        } catch (error) {

            console.error(
                "Fetch error:",
                error
            );

            alert(
                "Unable to connect to the server"
            );

        }

    };


    return (

        <div className="alternative-form-page">


            {/* ================================= */}
            {/* PAGE HEADER */}
            {/* ================================= */}

            <div className="alternative-form-header">

                <div>

                    <span className="eyebrow">
                        DECISION ANALYSIS
                    </span>

                    <h1>
                        Add Alternative
                    </h1>

                    <p>
                        Add an option that can be evaluated as part of the decision-making process.
                    </p>

                </div>


                <button

                    className="secondary-btn"

                    onClick={() => {

                        if (alternative.decision_id) {

                            navigate(
                                `/alternatives/${alternative.decision_id}`
                            );

                        } else {

                            navigate("/alternatives");

                        }

                    }}

                >

                    ← Back to Alternatives

                </button>

            </div>



            {/* ================================= */}
            {/* FORM CARD */}
            {/* ================================= */}

            <div className="alternative-form-card">


                <div className="form-card-header">

                    <h2>
                        Alternative Information
                    </h2>

                    <p>
                        Provide the details required to evaluate this alternative.
                    </p>

                </div>



                <form onSubmit={handleSubmit}>


                    {/* ================================= */}
                    {/* DECISION ID */}
                    {/* ================================= */}

                    <div className="form-group">

                        <label>

                            Decision ID <span>*</span>

                        </label>


                        <input

                            type="number"

                            name="decision_id"

                            value={
                                alternative.decision_id
                            }

                            onChange={handleChange}

                            placeholder="Enter the Decision ID"

                            required

                            readOnly={
                                Boolean(id)
                            }

                        />

                        {id && (

                            <small className="field-help">

                                This alternative will be added to Decision {id}.

                            </small>

                        )}

                    </div>



                    {/* ================================= */}
                    {/* ALTERNATIVE NAME */}
                    {/* ================================= */}

                    <div className="form-group">

                        <label>

                            Alternative Name <span>*</span>

                        </label>


                        <input

                            type="text"

                            name="alternative_name"

                            value={
                                alternative.alternative_name
                            }

                            onChange={handleChange}

                            placeholder="Enter a clear alternative name"

                            required

                        />

                    </div>



                    {/* ================================= */}
                    {/* DESCRIPTION */}
                    {/* ================================= */}

                    <div className="form-group">

                        <label>

                            Description

                        </label>


                        <textarea

                            name="description"

                            value={
                                alternative.description
                            }

                            onChange={handleChange}

                            placeholder="Describe how this alternative addresses the problem..."

                            rows="5"

                        />

                    </div>



                    {/* ================================= */}
                    {/* ESTIMATED COST */}
                    {/* ================================= */}

                    <div className="form-group">

                        <label>

                            Estimated Cost <span>*</span>

                        </label>


                        <input

                            type="number"

                            name="estimated_cost"

                            value={
                                alternative.estimated_cost
                            }

                            onChange={handleChange}

                            placeholder="Enter estimated cost"

                            min="1"

                            required

                        />

                    </div>



                    {/* ================================= */}
                    {/* FEASIBILITY */}
                    {/* ================================= */}

                    <div className="form-group">

                        <label>

                            Feasibility

                        </label>


                        <select

                            name="feasibility"

                            value={
                                alternative.feasibility
                            }

                            onChange={handleChange}

                        >

                            <option value="">

                                Select feasibility

                            </option>

                            <option value="High">

                                High

                            </option>

                            <option value="Medium">

                                Medium

                            </option>

                            <option value="Low">

                                Low

                            </option>

                        </select>

                    </div>



                    {/* ================================= */}
                    {/* RISK LEVEL */}
                    {/* ================================= */}

                    <div className="form-group">

                        <label>

                            Risk Level <span>*</span>

                        </label>


                        <select

                            name="risk_level"

                            value={
                                alternative.risk_level
                            }

                            onChange={handleChange}

                            required

                        >

                            <option value="">

                                Select risk level

                            </option>

                            <option value="Low">

                                Low

                            </option>

                            <option value="Medium">

                                Medium

                            </option>

                            <option value="High">

                                High

                            </option>

                        </select>

                    </div>



                    {/* ================================= */}
                    {/* FORM ACTIONS */}
                    {/* ================================= */}

                    <div className="form-actions">


                        <button

                            type="button"

                            className="cancel-btn"

                            onClick={() => {

                                if (
                                    alternative.decision_id
                                ) {

                                    navigate(
                                        `/alternatives/${alternative.decision_id}`
                                    );

                                } else {

                                    navigate(
                                        "/alternatives"
                                    );

                                }

                            }}

                        >

                            Cancel

                        </button>



                        <button

                            type="submit"

                            className="submit-btn"

                        >

                            Create Alternative

                        </button>


                    </div>


                </form>


            </div>



            {/* ================================= */}
            {/* QUICK NAVIGATION */}
            {/* ================================= */}

            <div className="quick-navigation">


                <h3>
                    Decision Management
                </h3>


                <div className="quick-nav-buttons">


                    <button

                        onClick={() =>
                            navigate("/decisions")
                        }

                    >

                        📋 View All Decisions

                    </button>



                    <button

                        onClick={() =>
                            navigate("/alternatives")
                        }

                    >

                        ⚖️ View All Alternatives

                    </button>


                </div>


            </div>


        </div>

    );

}


export default AddAlternative;