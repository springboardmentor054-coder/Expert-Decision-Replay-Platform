import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateDecision.css";

function CreateDecision() {
    const navigate = useNavigate();

    const categories = [
        { id: 1, name: "General" },
        { id: 2, name: "Technology" },
        { id: 3, name: "Finance" },
        { id: 4, name: "Operations" },
        { id: 5, name: "Human Resources" },
        { id: 6, name: "Marketing" },
        { id: 7, name: "Security" }
    ];

    const [decision, setDecision] = useState({
        title: "",
        problem_statement: "",
        description: "",
        category_id: 1,
        status: "Draft"
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setDecision((previous) => ({
            ...previous,
            [name]:
                name === "category_id"
                    ? Number(value)
                    : value
        }));

        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");

        if (!decision.title.trim()) {
            setError("Decision title is required.");
            return;
        }

        if (!decision.problem_statement.trim()) {
            setError("Problem Statement is required.");
            return;
        }

        if (!decision.category_id) {
            setError("Please select a category.");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            setError("Your session has expired. Please login again.");

            setTimeout(() => {
                navigate("/login");
            }, 1200);

            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/decisions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        title: decision.title.trim(),
                        problem_statement:
                            decision.problem_statement.trim(),
                        description:
                            decision.description.trim(),
                        category_id: Number(
                            decision.category_id
                        ),
                        status: "Draft"
                    })
                }
            );

            let data = {};

            try {
                data = await response.json();
            } catch {
                data = {};
            }

            console.log(
                "CREATE DECISION STATUS:",
                response.status
            );

            console.log(
                "CREATE DECISION RESPONSE:",
                data
            );

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("userEmail");

                setError(
                    "Your session has expired. Please login again."
                );

                setTimeout(() => {
                    navigate("/login");
                }, 1200);

                return;
            }

            if (response.ok) {
                alert("Decision Created Successfully!");

                navigate("/decisions");

                return;
            }

            let errorMessage =
                "Unable to create decision.";

            if (typeof data.detail === "string") {
                errorMessage = data.detail;
            } else if (Array.isArray(data.detail)) {
                errorMessage = data.detail
                    .map((item) =>
                        item?.msg
                            ? item.msg
                            : "Invalid input"
                    )
                    .join(", ");
            } else if (data.message) {
                errorMessage = data.message;
            }

            setError(errorMessage);

        } catch (error) {
            console.error(
                "CREATE DECISION ERROR:",
                error
            );

            setError(
                "Unable to connect to the server. Make sure the backend is running."
            );

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-decision-page">

            {/* HEADER */}

            <header className="create-decision-header">

                <div className="create-decision-brand">

                    <div className="create-decision-logo">
                        ED
                    </div>

                    <div>
                        <h2>
                            Expert Decision
                        </h2>

                        <span>
                            Replay Platform
                        </span>
                    </div>

                </div>

                <button
                    type="button"
                    className="back-button"
                    onClick={() =>
                        navigate("/decisions")
                    }
                    disabled={isSubmitting}
                >
                    ← Back to Decisions
                </button>

            </header>


            {/* MAIN CONTENT */}

            <main className="create-decision-main">

                {/* PAGE INTRO */}

                <div className="create-decision-intro">

                    <div>

                        <span className="create-decision-eyebrow">
                            DECISION MANAGEMENT
                        </span>

                        <h1>
                            Create New Decision
                        </h1>

                        <p>
                            Create and document an important
                            organizational decision.
                        </p>

                    </div>

                </div>


                {/* FORM CARD */}

                <div className="create-decision-card">

                    <div className="create-decision-card-header">

                        <div className="form-header-icon">
                            +
                        </div>

                        <div>

                            <h2>
                                Decision Information
                            </h2>

                            <p>
                                Provide the details required
                                to create a new decision.
                            </p>

                        </div>

                    </div>


                    {/* ERROR MESSAGE */}

                    {error && (
                        <div className="create-decision-error">

                            <span>
                                ⚠
                            </span>

                            <p>
                                {error}
                            </p>

                        </div>
                    )}


                    {/* FORM */}

                    <form
                        className="create-decision-form"
                        onSubmit={handleSubmit}
                    >

                        {/* TITLE */}

                        <div className="create-form-group">

                            <label htmlFor="title">
                                Decision Title
                                <span>*</span>
                            </label>

                            <input
                                id="title"
                                type="text"
                                name="title"
                                placeholder="Enter a clear decision title"
                                value={decision.title}
                                onChange={handleChange}
                                disabled={isSubmitting}
                                maxLength={200}
                            />

                            <small>
                                Give your decision a short
                                and meaningful title.
                            </small>

                        </div>


                        {/* PROBLEM STATEMENT */}

                        <div className="create-form-group">

                            <label htmlFor="problem_statement">
                                Problem Statement
                                <span>*</span>
                            </label>

                            <textarea
                                id="problem_statement"
                                name="problem_statement"
                                placeholder="Describe the problem or challenge that requires a decision..."
                                value={
                                    decision.problem_statement
                                }
                                onChange={handleChange}
                                disabled={isSubmitting}
                                rows={5}
                            />

                            <small>
                                Clearly explain the problem
                                or challenge being addressed.
                            </small>

                        </div>


                        {/* DESCRIPTION */}

                        <div className="create-form-group">

                            <label htmlFor="description">
                                Description
                            </label>

                            <textarea
                                id="description"
                                name="description"
                                placeholder="Provide additional context, background, or relevant information..."
                                value={
                                    decision.description
                                }
                                onChange={handleChange}
                                disabled={isSubmitting}
                                rows={6}
                            />

                            <small>
                                Add any additional background
                                or relevant information.
                            </small>

                        </div>


                        {/* CATEGORY */}

                        <div className="create-form-group">

                            <label htmlFor="category_id">
                                Category
                                <span>*</span>
                            </label>

                            <select
                                id="category_id"
                                name="category_id"
                                value={decision.category_id}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            >
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>

                            <small>
                                Select the category for
                                this decision.
                            </small>

                        </div>


                        {/* INFORMATION NOTICE */}

                        <div className="create-decision-info">

                            <div className="info-icon">
                                i
                            </div>

                            <div>

                                <strong>
                                    Decision status
                                </strong>

                                <p>
                                    New decisions are created
                                    as <b>Draft</b>. You can
                                    update the decision and
                                    submit it for review later.
                                </p>

                            </div>

                        </div>


                        {/* ACTIONS */}

                        <div className="create-form-actions">

                            <button
                                type="button"
                                className="create-cancel-button"
                                onClick={() =>
                                    navigate("/decisions")
                                }
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="create-submit-button"
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? "Creating..."
                                    : "Create Decision"}
                            </button>

                        </div>

                    </form>

                </div>


                {/* QUICK NAVIGATION */}

                <div className="create-quick-navigation">

                    <div className="quick-navigation-header">

                        <div className="quick-navigation-icon">
                            ⚡
                        </div>

                        <div>

                            <h3>
                                Decision Management
                            </h3>

                            <p>
                                Quickly navigate to other
                                decision management tools.
                            </p>

                        </div>

                    </div>


                    <div className="quick-navigation-buttons">

                        <button
                            type="button"
                            onClick={() =>
                                navigate("/decisions")
                            }
                        >
                            <span>
                                📋
                            </span>

                            View All Decisions

                            <b>
                                →
                            </b>
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                navigate("/alternatives")
                            }
                        >
                            <span>
                                ⚖️
                            </span>

                            View Alternatives

                            <b>
                                →
                            </b>
                        </button>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default CreateDecision;