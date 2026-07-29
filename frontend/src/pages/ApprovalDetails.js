import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./DecisionDetails.css";

function ApprovalDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [approval, setApproval] = useState(null);
    const [decision, setDecision] = useState(null);

    const [remarks, setRemarks] = useState("");

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);


    // =========================================
    // GET TOKEN
    // =========================================

    const getToken = () => {

        return localStorage.getItem("token");

    };


    // =========================================
    // GET APPROVAL DETAILS
    // =========================================

    useEffect(() => {

        const fetchApprovalDetails =
            async () => {

                const token =
                    getToken();

                if (!token) {

                    alert(
                        "You are not logged in. Please login first."
                    );

                    navigate("/login");

                    return;

                }

                try {

                    const approvalResponse =
                        await fetch(
                            `http://127.0.0.1:8000/approvals/${id}`,
                            {
                                headers: {
                                    "Authorization":
                                        `Bearer ${token}`
                                }
                            }
                        );


                    if (!approvalResponse.ok) {

                        throw new Error(
                            "Failed to fetch approval"
                        );

                    }


                    const approvalData =
                        await approvalResponse.json();


                    setApproval(
                        approvalData
                    );


                    // Fetch related decision

                    const decisionResponse =
                        await fetch(
                            `http://127.0.0.1:8000/decisions/${approvalData.decision_id}`,
                            {
                                headers: {
                                    "Authorization":
                                        `Bearer ${token}`
                                }
                            }
                        );


                    if (
                        decisionResponse.ok
                    ) {

                        const decisionData =
                            await decisionResponse.json();

                        setDecision(
                            decisionData
                        );

                    }

                } catch (error) {

                    console.log(
                        "Approval Details Error:",
                        error
                    );

                    alert(
                        "Failed to load approval details."
                    );

                } finally {

                    setLoading(false);

                }

            };


        fetchApprovalDetails();

    }, [id, navigate]);


    // =========================================
    // APPROVE DECISION
    // =========================================

    const approveDecision =
        async () => {

            const token =
                getToken();

            if (!token) {

                alert(
                    "You are not logged in."
                );

                return;

            }


            const confirmApprove =
                window.confirm(
                    "Are you sure you want to approve this decision?"
                );


            if (!confirmApprove) {
                return;
            }


            setProcessing(true);


            try {

                const response =
                    await fetch(
                        `http://127.0.0.1:8000/approvals/${id}/approve`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                remarks:
                                    remarks
                            })
                        }
                    );


                const data =
                    await response
                        .json()
                        .catch(
                            () => null
                        );


                if (response.ok) {

                    alert(
                        "Decision approved successfully!"
                    );

                    setApproval(
                        data
                    );

                    if (decision) {

                        setDecision({
                            ...decision,
                            status: "Approved"
                        });

                    }

                } else {

                    alert(
                        data?.detail ||
                        "Failed to approve decision."
                    );

                }

            } catch (error) {

                console.log(
                    "Approve Error:",
                    error
                );

                alert(
                    "Failed to approve decision."
                );

            } finally {

                setProcessing(false);

            }

        };


    // =========================================
    // REJECT DECISION
    // =========================================

    const rejectDecision =
        async () => {

            const token =
                getToken();

            if (!token) {

                alert(
                    "You are not logged in."
                );

                return;

            }


            if (
                remarks.trim() === ""
            ) {

                alert(
                    "Remarks are mandatory when rejecting a decision."
                );

                return;

            }


            const confirmReject =
                window.confirm(
                    "Are you sure you want to reject this decision?"
                );


            if (!confirmReject) {
                return;
            }


            setProcessing(true);


            try {

                const response =
                    await fetch(
                        `http://127.0.0.1:8000/approvals/${id}/reject`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body: JSON.stringify({
                                remarks:
                                    remarks
                            })
                        }
                    );


                const data =
                    await response
                        .json()
                        .catch(
                            () => null
                        );


                if (response.ok) {

                    alert(
                        "Decision rejected successfully!"
                    );

                    setApproval(
                        data
                    );

                    if (decision) {

                        setDecision({
                            ...decision,
                            status: "Rejected"
                        });

                    }

                } else {

                    alert(
                        data?.detail ||
                        "Failed to reject decision."
                    );

                }

            } catch (error) {

                console.log(
                    "Reject Error:",
                    error
                );

                alert(
                    "Failed to reject decision."
                );

            } finally {

                setProcessing(false);

            }

        };


    // =========================================
    // STATUS CLASS
    // =========================================

    const getStatusClass =
        (status) => {

            if (!status) {
                return "status-default";
            }

            const normalized =
                status.toLowerCase();

            if (
                normalized === "pending"
            ) {
                return "status-pending";
            }

            if (
                normalized === "approved"
            ) {
                return "status-completed";
            }

            if (
                normalized === "rejected"
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
                    Loading approval details...
                </p>

            </div>

        );

    }


    if (!approval) {

        return (

            <div className="details-loading">

                <p>
                    Approval not found.
                </p>

                <button
                    className="primary-action"
                    onClick={() =>
                        navigate("/approvals")
                    }
                >
                    Back to Approvals
                </button>

            </div>

        );

    }


    // =========================================
    // MAIN UI
    // =========================================

    return (

        <div className="decision-details-page">


            {/* NAVBAR */}

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


                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/approvals")
                    }
                >
                    ← Back to Approvals
                </button>

            </header>


            {/* MAIN */}

            <main className="details-main">


                {/* BREADCRUMB */}

                <div className="breadcrumb">

                    <span
                        onClick={() =>
                            navigate("/approvals")
                        }
                    >
                        Pending Approvals
                    </span>

                    <span>
                        /
                    </span>

                    <strong>
                        Approval #{approval.id}
                    </strong>

                </div>


                {/* HERO */}

                <section className="decision-hero">

                    <div className="hero-content">

                        <div className="hero-label">
                            APPROVAL REVIEW #{approval.id}
                        </div>

                        <h1>
                            {
                                decision
                                    ? decision.title
                                    : `Decision #${approval.decision_id}`
                            }
                        </h1>

                        <div className="hero-status">

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

                    </div>

                </section>


                {/* APPROVAL INFORMATION */}

                <section className="overview-grid">


                    <div className="overview-card">

                        <div className="overview-icon">
                            #
                        </div>

                        <div>

                            <span>
                                Approval ID
                            </span>

                            <strong>
                                #{approval.id}
                            </strong>

                        </div>

                    </div>


                    <div className="overview-card">

                        <div className="overview-icon">
                            📋
                        </div>

                        <div>

                            <span>
                                Decision ID
                            </span>

                            <strong>
                                #{approval.decision_id}
                            </strong>

                        </div>

                    </div>


                    <div className="overview-card">

                        <div className="overview-icon">
                            👤
                        </div>

                        <div>

                            <span>
                                Reviewer
                            </span>

                            <strong>
                                User {approval.reviewer_id}
                            </strong>

                        </div>

                    </div>


                    <div className="overview-card">

                        <div className="overview-icon">
                            ◈
                        </div>

                        <div>

                            <span>
                                Approval Level
                            </span>

                            <strong>
                                {approval.approval_level}
                            </strong>

                        </div>

                    </div>


                </section>


                {/* DECISION INFORMATION */}

                {
                    decision &&

                    <section className="information-section">

                        <div className="section-title">

                            <div className="section-number">
                                01
                            </div>

                            <div>

                                <h2>
                                    Decision Information
                                </h2>

                                <p>
                                    Review the decision before
                                    taking approval action.
                                </p>

                            </div>

                        </div>


                        <div className="information-grid">


                            <div className="information-card">

                                <h3>
                                    Problem Statement
                                </h3>

                                <p>
                                    {
                                        decision.problem_statement ||
                                        "No problem statement provided."
                                    }
                                </p>

                            </div>


                            <div className="information-card">

                                <h3>
                                    Description
                                </h3>

                                <p>
                                    {
                                        decision.description ||
                                        "No description provided."
                                    }
                                </p>

                            </div>


                        </div>


                    </section>

                }


                {/* APPROVAL ACTION */}

                <section className="information-section">


                    <div className="section-title">

                        <div className="section-number">
                            02
                        </div>

                        <div>

                            <h2>
                                Review Decision
                            </h2>

                            <p>
                                Provide remarks and take
                                approval action.
                            </p>

                        </div>

                    </div>


                    {
                        approval.status ===
                            "Pending" ?

                            <div className="meeting-form">

                                <div className="form-field">

                                    <label>
                                        Remarks
                                    </label>

                                    <textarea
                                        placeholder="Add your review remarks..."
                                        value={remarks}
                                        onChange={(e) =>
                                            setRemarks(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>


                                <div
                                    style={{
                                        display: "flex",
                                        gap: "12px",
                                        marginTop: "10px"
                                    }}
                                >

                                    <button
                                        className="primary-action"
                                        onClick={
                                            approveDecision
                                        }
                                        disabled={
                                            processing
                                        }
                                    >
                                        {
                                            processing
                                                ? "Processing..."
                                                : "✓ Approve Decision"
                                        }
                                    </button>


                                    <button
                                        className="cancel-action"
                                        onClick={
                                            rejectDecision
                                        }
                                        disabled={
                                            processing
                                        }
                                    >
                                        {
                                            processing
                                                ? "Processing..."
                                                : "✕ Reject Decision"
                                        }
                                    </button>

                                </div>

                            </div>

                            :

                            <div className="information-card">

                                <h3>
                                    Approval Completed
                                </h3>

                                <p>

                                    This approval has already
                                    been marked as{" "}

                                    <strong>
                                        {
                                            approval.status
                                        }
                                    </strong>.

                                </p>


                                {
                                    approval.remarks &&

                                    <p>

                                        <strong>
                                            Remarks:
                                        </strong>{" "}

                                        {
                                            approval.remarks
                                        }

                                    </p>

                                }


                                {
                                    approval.approved_at &&

                                    <p>

                                        <strong>
                                            Processed At:
                                        </strong>{" "}

                                        {new Date(
                                            approval.approved_at
                                        ).toLocaleString(
                                            "en-GB"
                                        )}

                                    </p>

                                }

                            </div>

                    }

                </section>


            </main>

        </div>

    );

}

export default ApprovalDetails;