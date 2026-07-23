import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Decision.css";

function AlternativeComparison() {

    const [alternatives, setAlternatives] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    // Get Decision ID from URL
    const { id } = useParams();


    // =================================
    // FETCH ALTERNATIVES
    // =================================

    useEffect(() => {

        setLoading(true);

        const url = id
            ? `http://127.0.0.1:8000/alternatives/decision/${id}`
            : "http://127.0.0.1:8000/alternatives";


        fetch(url)

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Failed to fetch alternatives"
                    );

                }

                return response.json();

            })

            .then(data => {

                setAlternatives(data);

                setLoading(false);

            })

            .catch(error => {

                console.log(
                    "Error fetching alternatives:",
                    error
                );

                setAlternatives([]);

                setLoading(false);

            });

    }, [id]);


    // =================================
    // FIND LOWEST COST
    // =================================

    const lowestCost = alternatives.length > 0

        ? Math.min(
            ...alternatives.map(
                alternative =>
                    Number(
                        alternative.estimated_cost
                    )
            )
        )

        : 0;


    // =================================
    // COUNT LOW RISK
    // =================================

    const lowRiskCount =
        alternatives.filter(
            alternative =>
                alternative.risk_level === "Low"
        ).length;


    // =================================
    // COUNT HIGH FEASIBILITY
    // =================================

    const highFeasibilityCount =
        alternatives.filter(
            alternative =>
                alternative.feasibility === "High"
        ).length;


    // =================================
    // RISK BADGE CLASS
    // =================================

    const getRiskClass = (risk) => {

        if (risk === "Low") {

            return "risk-low";

        }

        if (risk === "Medium") {

            return "risk-medium";

        }

        if (risk === "High") {

            return "risk-high";

        }

        return "risk-default";

    };


    // =================================
    // FEASIBILITY BADGE CLASS
    // =================================

    const getFeasibilityClass = (feasibility) => {

        if (feasibility === "High") {

            return "feasibility-high";

        }

        if (feasibility === "Medium") {

            return "feasibility-medium";

        }

        if (feasibility === "Low") {

            return "feasibility-low";

        }

        return "feasibility-default";

    };


    // =================================
    // CHECK BEST COST
    // =================================

    const isLowestCost = (cost) => {

        return (
            Number(cost) === lowestCost &&
            alternatives.length > 1
        );

    };


    return (

        <div className="comparison-page">


            {/* ================================= */}
            {/* TOP NAVBAR */}
            {/* ================================= */}

            <nav className="top-navbar">

                <div className="navbar-brand">

                    <div className="navbar-logo">
                        ED
                    </div>

                    <div>

                        <h2>
                            Expert Decision Replay
                        </h2>

                        <span>
                            Alternative Analysis
                        </span>

                    </div>

                </div>


                <button

                    className="logout-button"

                    onClick={() => {

                        localStorage.removeItem(
                            "token"
                        );

                        navigate("/login");

                    }}

                >

                    Logout

                </button>

            </nav>



            {/* ================================= */}
            {/* MAIN CONTENT */}
            {/* ================================= */}

            <main className="comparison-main">


                {/* ================================= */}
                {/* HEADER */}
                {/* ================================= */}

                <div className="comparison-header">


                    <div>

                        <span className="eyebrow">
                            DECISION ANALYSIS
                        </span>


                        <h1>

                            {id
                                ? `Alternative Comparison`
                                : "Alternative Comparison"
                            }

                        </h1>


                        <p>

                            {id

                                ? `Compare available alternatives for Decision ${id} before making a final choice.`

                                : "Review and compare alternatives across the decision portfolio."

                            }

                        </p>

                    </div>


                    {id && (

                        <button

                            className="secondary-btn"

                            onClick={() =>
                                navigate(
                                    `/decision/${id}`
                                )
                            }

                        >

                            ← Back to Decision

                        </button>

                    )}


                </div>



                {/* ================================= */}
                {/* SUMMARY CARDS */}
                {/* ================================= */}

                {!loading &&
                    alternatives.length > 0 && (

                        <div className="comparison-stats">


                            <div className="comparison-stat-card">

                                <div className="comparison-stat-icon blue">
                                    ⚖️
                                </div>

                                <div>

                                    <span>
                                        Alternatives
                                    </span>

                                    <strong>
                                        {alternatives.length}
                                    </strong>

                                </div>

                            </div>



                            <div className="comparison-stat-card">

                                <div className="comparison-stat-icon green">
                                    ✓
                                </div>

                                <div>

                                    <span>
                                        High Feasibility
                                    </span>

                                    <strong>
                                        {highFeasibilityCount}
                                    </strong>

                                </div>

                            </div>



                            <div className="comparison-stat-card">

                                <div className="comparison-stat-icon purple">
                                    ₹
                                </div>

                                <div>

                                    <span>
                                        Lowest Cost
                                    </span>

                                    <strong>

                                        ₹
                                        {lowestCost.toLocaleString(
                                            "en-IN"
                                        )}

                                    </strong>

                                </div>

                            </div>



                            <div className="comparison-stat-card">

                                <div className="comparison-stat-icon orange">
                                    🛡️
                                </div>

                                <div>

                                    <span>
                                        Low Risk
                                    </span>

                                    <strong>
                                        {lowRiskCount}
                                    </strong>

                                </div>

                            </div>


                        </div>

                    )}



                {/* ================================= */}
                {/* LOADING */}
                {/* ================================= */}

                {loading ? (

                    <div className="comparison-loading">

                        <div className="loading-spinner"></div>

                        <p>
                            Loading alternatives...
                        </p>

                    </div>

                ) : alternatives.length === 0 ? (


                    /* ================================= */
                    /* EMPTY STATE */
                    /* ================================= */

                    <div className="comparison-empty">

                        <div className="empty-icon">
                            ⚖️
                        </div>

                        <h2>
                            No Alternatives Available
                        </h2>

                        <p>

                            {id

                                ? "Add alternatives to this decision before comparing them."

                                : "Create alternatives before starting a comparison."

                            }

                        </p>


                        <button

                            className="create-button"

                            onClick={() => {

                                if (id) {

                                    navigate(
                                        `/add-alternative/${id}`
                                    );

                                } else {

                                    navigate(
                                        "/add-alternative"
                                    );

                                }

                            }}

                        >

                            <span className="button-icon">
                                +
                            </span>

                            Add Alternative

                        </button>

                    </div>


                ) : (


                    /* ================================= */
                    /* COMPARISON TABLE */
                    /* ================================= */

                    <div className="comparison-card">


                        <div className="comparison-card-header">

                            <div>

                                <h2>
                                    Compare Alternatives
                                </h2>

                                <p>
                                    Evaluate cost, feasibility, and risk side by side.
                                </p>

                            </div>


                            <span className="comparison-count">

                                {alternatives.length} Options

                            </span>

                        </div>



                        <div className="comparison-table-wrapper">


                            <table className="comparison-table">


                                <thead>

                                    <tr>

                                        <th>
                                            Alternative
                                        </th>

                                        <th>
                                            Description
                                        </th>

                                        <th>
                                            Estimated Cost
                                        </th>

                                        <th>
                                            Feasibility
                                        </th>

                                        <th>
                                            Risk Level
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>


                                    {alternatives.map(
                                        (alternative) => (

                                            <tr
                                                key={
                                                    alternative.id
                                                }
                                            >


                                                {/* Alternative */}

                                                <td>

                                                    <div className="alternative-name-cell">

                                                        <div className="alternative-number">

                                                            {String(
                                                                alternative.id
                                                            ).padStart(
                                                                2,
                                                                "0"
                                                            )}

                                                        </div>


                                                        <div>

                                                            <strong>

                                                                {
                                                                    alternative.alternative_name
                                                                }

                                                            </strong>

                                                            {isLowestCost(
                                                                alternative.estimated_cost
                                                            ) && (

                                                                <span className="recommended-tag">

                                                                    Lowest Cost

                                                                </span>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>



                                                {/* Description */}

                                                <td>

                                                    <div className="description-cell">

                                                        {
                                                            alternative.description ||
                                                            "No description provided"
                                                        }

                                                    </div>

                                                </td>



                                                {/* Cost */}

                                                <td>

                                                    <strong className="cost-value">

                                                        ₹
                                                        {Number(
                                                            alternative.estimated_cost
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}

                                                    </strong>

                                                </td>



                                                {/* Feasibility */}

                                                <td>

                                                    <span

                                                        className={`comparison-badge ${getFeasibilityClass(
                                                            alternative.feasibility
                                                        )}`}

                                                    >

                                                        {
                                                            alternative.feasibility ||
                                                            "Not Rated"
                                                        }

                                                    </span>

                                                </td>



                                                {/* Risk */}

                                                <td>

                                                    <span

                                                        className={`comparison-badge ${getRiskClass(
                                                            alternative.risk_level
                                                        )}`}

                                                    >

                                                        {
                                                            alternative.risk_level ||
                                                            "Not Rated"
                                                        }

                                                    </span>

                                                </td>


                                            </tr>

                                        )
                                    )}


                                </tbody>


                            </table>


                        </div>


                    </div>

                )}



                {/* ================================= */}
                {/* QUICK NAVIGATION */}
                {/* ================================= */}

                <div className="comparison-navigation">


                    <button

                        onClick={() =>
                            navigate("/decisions")
                        }

                    >

                        📋 View Decisions

                    </button>



                    <button

                        onClick={() =>
                            navigate("/alternatives")
                        }

                    >

                        ⚖️ View Alternatives

                    </button>


                    {id && (

                        <button

                            onClick={() =>
                                navigate(
                                    `/alternatives/${id}`
                                )
                            }

                        >

                            ← View Decision Alternatives

                        </button>

                    )}


                </div>


            </main>


        </div>

    );

}


export default AlternativeComparison;