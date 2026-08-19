import React, { useEffect, useState } from "react";
import API_BASE_URL from "../api";
import { useNavigate } from "react-router-dom";
import "./DecisionDetails.css";


function PendingApprovals() {

    const navigate = useNavigate();

    const [approvals, setApprovals] = useState([]);

    const [decisions, setDecisions] =
        useState({});

    const [loading, setLoading] =
        useState(true);


    // =========================================
    // GET TOKEN
    // =========================================

    const getToken = () => {

        return localStorage.getItem("token");

    };


    // =========================================
    // GET CURRENT USER EMAIL FROM JWT
    // =========================================

    const getCurrentUserEmail = () => {

        const token =
            localStorage.getItem("token");


        if (!token) {

            return null;

        }


        try {

            const payload =
                JSON.parse(
                    atob(
                        token
                            .split(".")[1]
                            .replace(/-/g, "+")
                            .replace(/_/g, "/")
                    )
                );


            console.log(
                "JWT Payload:",
                payload
            );


            const email =
                payload.sub;


            console.log(
                "Logged-in User Email:",
                email
            );


            return email;


        } catch (error) {

            console.log(
                "JWT Decode Error:",
                error
            );


            return null;

        }

    };


    // =========================================
    // GET CURRENT USER ID
    // =========================================

    const getCurrentUserId = async (
        token,
        email
    ) => {

        try {

            /*
             * Get all users from backend.
             *
             * We use the email from the JWT
             * to find the matching user.
             */

            const response =
                await fetch(
                    `${API_BASE_URL}/users`,
                    {
                        headers: {
                            "Authorization":
                                `Bearer ${token}`
                        }
                    }
                );


            if (!response.ok) {

                console.log(
                    "Failed to fetch users."
                );

                return null;

            }


            const users =
                await response.json();


            console.log(
                "All Users:",
                users
            );


            const currentUser =
                users.find(
                    user =>
                        user.email === email
                );


            if (!currentUser) {

                console.log(
                    "Current user not found."
                );

                return null;

            }


            console.log(
                "Current Logged-in User:",
                currentUser
            );


            console.log(
                "Current User ID:",
                currentUser.id
            );


            return currentUser.id;


        } catch (error) {

            console.log(
                "User Fetch Error:",
                error
            );


            return null;

        }

    };


    // =========================================
    // GET PENDING APPROVALS
    // =========================================

    useEffect(() => {


        const fetchApprovals =
            async () => {


                const token =
                    getToken();


                // =========================================
                // CHECK LOGIN
                // =========================================

                if (!token) {

                    alert(
                        "You are not logged in. Please login first."
                    );


                    navigate(
                        "/login"
                    );


                    return;

                }


                try {


                    // =========================================
                    // GET EMAIL FROM JWT
                    // =========================================

                    const currentUserEmail =
                        getCurrentUserEmail();


                    if (!currentUserEmail) {

                        alert(
                            "Unable to identify logged-in user."
                        );


                        return;

                    }


                    // =========================================
                    // GET NUMERIC USER ID
                    // =========================================

                    const currentUserId =
                        await getCurrentUserId(
                            token,
                            currentUserEmail
                        );


                    if (!currentUserId) {

                        alert(
                            "Unable to find your user account."
                        );


                        return;

                    }


                    console.log(
                        "Final Current User ID:",
                        currentUserId
                    );


                    // =========================================
                    // FETCH ALL APPROVALS
                    // =========================================

                    const response =
                        await fetch(
                            `${API_BASE_URL}/approvals`,
                            {
                                headers: {
                                    "Authorization":
                                        `Bearer ${token}`
                                }
                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            `Failed to fetch approvals. Status: ${response.status}`
                        );

                    }


                    const data =
                        await response.json();


                    console.log(
                        "All Approvals from Backend:",
                        data
                    );


                    // =========================================
                    // FILTER APPROVALS
                    // =========================================

                    const filteredApprovals =
                        data.filter(
                            approval => {


                                const reviewerMatches =
                                    String(
                                        approval.reviewer_id
                                    ) ===
                                    String(
                                        currentUserId
                                    );


                                const statusMatches =
                                    approval.status
                                        ?.toLowerCase() ===
                                    "pending";


                                console.log(
                                    "Checking Approval:",
                                    approval.id,

                                    "Reviewer:",
                                    approval.reviewer_id,

                                    "Current User ID:",
                                    currentUserId,

                                    "Reviewer Match:",
                                    reviewerMatches,

                                    "Status:",
                                    approval.status,

                                    "Status Match:",
                                    statusMatches
                                );


                                return (
                                    reviewerMatches &&
                                    statusMatches
                                );


                            }
                        );


                    console.log(
                        "Filtered Pending Approvals:",
                        filteredApprovals
                    );


                    setApprovals(
                        filteredApprovals
                    );


                    // =========================================
                    // FETCH DECISION DETAILS
                    // =========================================

                    filteredApprovals.forEach(
                        approval => {

                            fetchDecision(
                                approval.decision_id,
                                token
                            );

                        }
                    );


                } catch (error) {

                    console.log(
                        "Pending Approvals Error:",
                        error
                    );


                    alert(
                        "Failed to load pending approvals."
                    );


                } finally {

                    setLoading(
                        false
                    );

                }


            };


        fetchApprovals();


    }, [navigate]);


    // =========================================
    // GET DECISION DETAILS
    // =========================================

    const fetchDecision =
        async (
            decisionId,
            token
        ) => {


            try {


                const response =
                    await fetch(
                        `${API_BASE_URL}/decisions/${decisionId}`,
                        {
                            headers: {
                                "Authorization":
                                    `Bearer ${token}`
                            }
                        }
                    );


                if (response.ok) {


                    const data =
                        await response.json();


                    setDecisions(
                        previous => ({

                            ...previous,

                            [decisionId]:
                                data

                        })
                    );


                }


            } catch (error) {


                console.log(
                    "Decision Fetch Error:",
                    error
                );


            }


        };


    // =========================================
    // STATUS CLASS
    // =========================================

    const getStatusClass =
        (
            status
        ) => {


            if (!status) {

                return "status-default";

            }


            const normalized =
                status.toLowerCase();


            if (
                normalized ===
                "pending"
            ) {

                return "status-pending";

            }


            if (
                normalized ===
                "approved"
            ) {

                return "status-completed";

            }


            if (
                normalized ===
                "rejected"
            ) {

                return "status-cancelled";

            }


            return "status-default";

        };


    // =========================================
    // LOADING
    // =========================================

    if (loading) {

        return (

            <div className="details-loading">

                <div className="details-spinner"></div>

                <p>
                    Loading pending approvals...
                </p>

            </div>

        );

    }


    // =========================================
    // MAIN UI
    // =========================================

    return (

        <div className="decision-details-page">


            {/* ================================= */}
            {/* TOP NAVBAR */}
            {/* ================================= */}

            <header className="details-navbar">


                <div className="details-brand">


                    <div className="details-logo">
                        ED
                    </div>


                    <div>

                        <strong>
                            Expert Decision
                        </strong>

                        <span>
                            Replay Platform
                        </span>

                    </div>


                </div>


                <div>


                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                "/decisions"
                            )
                        }
                    >

                        ← Decisions

                    </button>


                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                "/approval-history"
                            )
                        }
                        style={{
                            marginLeft:
                                "10px"
                        }}
                    >

                        Approval History

                    </button>


                </div>


            </header>


            {/* ================================= */}
            {/* MAIN CONTENT */}
            {/* ================================= */}

            <main className="details-main">


                {/* ================================= */}
                {/* BREADCRUMB */}
                {/* ================================= */}

                <div className="breadcrumb">


                    <span
                        onClick={() =>
                            navigate(
                                "/decisions"
                            )
                        }
                    >

                        Decisions

                    </span>


                    <span>
                        /
                    </span>


                    <strong>
                        Pending Approvals
                    </strong>


                </div>


                {/* ================================= */}
                {/* HERO */}
                {/* ================================= */}

                <section className="decision-hero">


                    <div className="hero-content">


                        <div className="hero-label">
                            APPROVAL WORKFLOW
                        </div>


                        <h1>
                            Pending Approvals
                        </h1>


                        <p>
                            Review decisions assigned
                            to you for approval.
                        </p>


                    </div>


                </section>


                {/* ================================= */}
                {/* APPROVAL COUNT */}
                {/* ================================= */}

                <section className="overview-grid">


                    <div className="overview-card">


                        <div className="overview-icon">
                            ⏳
                        </div>


                        <div>


                            <span>
                                Pending Approvals
                            </span>


                            <strong>
                                {approvals.length}
                            </strong>


                        </div>


                    </div>


                </section>


                {/* ================================= */}
                {/* APPROVAL LIST */}
                {/* ================================= */}

                <section className="information-section">


                    <div className="section-title">


                        <div className="section-number">
                            01
                        </div>


                        <div>


                            <h2>
                                Decisions Awaiting Review
                            </h2>


                            <p>
                                Review and take action
                                on assigned decisions.
                            </p>


                        </div>


                    </div>


                    {
                        approvals.length === 0

                            ?

                            <div className="empty-comments">


                                <div>
                                    ✓
                                </div>


                                <p>
                                    No pending approvals
                                    assigned to you.
                                </p>


                            </div>


                            :


                            <div className="resource-grid">


                                {
                                    approvals.map(
                                        approval => {


                                            const decision =
                                                decisions[
                                                    approval.decision_id
                                                ];


                                            return (


                                                <button
                                                    className="resource-card"
                                                    key={
                                                        approval.id
                                                    }
                                                    onClick={() =>
                                                        navigate(
                                                            `/approval/${approval.id}`
                                                        )
                                                    }
                                                >


                                                    <div className="resource-icon orange">
                                                        ⏳
                                                    </div>


                                                    <div>


                                                        <h3>

                                                            {
                                                                decision
                                                                    ? decision.title
                                                                    : `Decision #${approval.decision_id}`
                                                            }

                                                        </h3>


                                                        <p>

                                                            Approval Level:{" "}

                                                            {
                                                                approval.approval_level
                                                            }

                                                        </p>


                                                        <span
                                                            className={`status-badge ${getStatusClass(
                                                                approval.status
                                                            )}`}
                                                        >

                                                            {
                                                                approval.status
                                                            }

                                                        </span>


                                                    </div>


                                                    <span>
                                                        →
                                                    </span>


                                                </button>


                                            );


                                        }
                                    )


                                }


                            </div>

                    }


                </section>


            </main>


        </div>

    );

}


export default PendingApprovals;
