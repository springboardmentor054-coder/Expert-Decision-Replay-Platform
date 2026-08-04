import React, { useEffect, useState, useCallback } from "react";
import {
    Button,
    Card,
    Table,
    Form,
    Spinner,
    Row,
    Col
} from "react-bootstrap";
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch
} from "react-icons/fa";

import AlternativeForm from "../../components/forms/AlternativeForm";
import {
    getDecisionAlternatives,
    createAlternative,
    updateAlternative,
    deleteAlternative
} from "../../services/alternativeService";
import { getDecisions } from "../../services/decisionService";

const Alternatives = () => {
    // ==============================
    // Logged-in User
    // ==============================
    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role || "User";

    // ==============================
    // State
    // ==============================
    const [alternatives, setAlternatives] = useState([]);
    const [decisions, setDecisions] = useState([]);
    const [selectedDecision, setSelectedDecision] = useState("");
    const [filteredAlternatives, setFilteredAlternatives] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingAlternative, setEditingAlternative] = useState(null);

    // ==============================
    // Load Decisions on Mount
    // ==============================
    useEffect(() => {
        loadDecisions();
    }, []);

    const loadDecisions = async () => {
        try {
            const res = await getDecisions();
            setDecisions(res.data || []);
        } catch (error) {
            console.error("Failed to fetch decisions:", error);
        }
    };

    // ==============================
    // Load Alternatives by Decision ID
    // ==============================
    const loadAlternatives = useCallback(async (decisionId) => {
        if (!decisionId) {
            setAlternatives([]);
            setFilteredAlternatives([]);
            return;
        }

        try {
            setLoading(true);
            const res = await getDecisionAlternatives(decisionId);
            setAlternatives(res.data || []);
            setFilteredAlternatives(res.data || []);
        } catch (error) {
            console.error("Failed to load alternatives:", error);
            alert("Unable to load alternatives.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle dropdown selection change
    const handleDecisionChange = (e) => {
        const decisionId = e.target.value;
        setSelectedDecision(decisionId);
        loadAlternatives(decisionId);
    };

    // ==============================
    // Search Filter
    // ==============================
    useEffect(() => {
        const filtered = alternatives.filter((alternative) =>
            alternative.alternative_name
                ?.toLowerCase()
                .includes(search.toLowerCase())
        );
        setFilteredAlternatives(filtered);
    }, [search, alternatives]);

    // ==============================
    // Add / Edit / Delete Handlers
    // ==============================
    const handleAdd = () => {
        setEditingAlternative(null);
        setShowModal(true);
    };

    const handleEdit = (alternative) => {
        setEditingAlternative(alternative);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this alternative?"
        );
        if (!confirmDelete) return;

        try {
            await deleteAlternative(id);
            loadAlternatives(selectedDecision);
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Delete failed.");
        }
    };

    // ==============================
    // Save Handler (Create / Update)
    // ==============================
    const handleSave = async (formData) => {
        try {
            if (editingAlternative) {
                await updateAlternative(
                    editingAlternative.alternative_id,
                    formData
                );
            } else {
                await createAlternative(formData);
            }

            setShowModal(false);
            setEditingAlternative(null);
            loadAlternatives(selectedDecision);
        } catch (error) {
            console.error("Save failed:", error);
            alert("Unable to save.");
        }
    };

    // ==============================
    // UI Render
    // ==============================
    return (
        <div className="container-fluid py-4 px-4">
            <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h4 className="fw-bold text-primary mb-0">
                        Alternatives Management
                    </h4>
                    {(role === "User" || role === "Admin") && (
                        <Button
    variant="primary"
    disabled={!selectedDecision}
    onClick={handleAdd}
>
                            <FaPlus className="me-2" />
                            Add Alternative
                        </Button>
                    )}
                </Card.Header>

                <Card.Body>
                    {/* Filters Row */}
                    <Row className="mb-3">
                        {/* Decision Dropdown */}
                        <Col md={6} className="mb-2 mb-md-0">
                            <Form.Select
                                value={selectedDecision}
                                onChange={handleDecisionChange}
                            >
                                <option value="">-- Select Decision --</option>
                                {decisions.map((d) => (
                                    <option key={d.decision_id} value={d.decision_id}>
                                        {d.decision_title}
                                    </option>
                                ))}
                            </Form.Select>
                        </Col>

                        {/* Search Input */}
                        <Col md={6}>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaSearch />
                                </span>
                                <Form.Control
                                    placeholder="Search by alternative name..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </Col>
                    </Row>

                    {/* Table or Loading Indicator */}
                    {loading ? (
                        <div className="text-center p-5">
                            <Spinner animation="border" variant="primary" />
                            <h5 className="mt-3">Loading Alternatives...</h5>
                        </div>
                    ) : (
                        <Table bordered hover responsive striped>
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                   
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Cost</th>
                                    <th>Feasibility</th>
                                    <th>Risk</th>
                                    <th width="180">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAlternatives.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center">
                                            {selectedDecision
                                                ? "No Alternatives Found"
                                                : "Please select a decision to view alternatives."}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAlternatives.map((alternative) => (
                                        <tr key={alternative.alternative_id}>
                                            <td>{alternative.alternative_id}</td>
                                            
                                            <td>{alternative.alternative_name}</td>
                                            <td>{alternative.description}</td>
                                            <td>{alternative.estimated_cost}</td>
                                            <td>{alternative.feasibility}</td>
                                            <td>{alternative.risk_level}</td>
                                            <td className="text-center text-nowrap">
                                                {(role === "User" || role === "Admin") && (
                                                    <>
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            className="me-2"
                                                            onClick={() => handleEdit(alternative)}
                                                        >
                                                            <FaEdit className="me-1" />
                                                            Edit
                                                        </Button>

                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleDelete(alternative.alternative_id)
                                                            }
                                                        >
                                                            <FaTrash className="me-1" />
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    )}

                    {/* Modal Form */}
                   <AlternativeForm
    show={showModal}
    handleClose={() => {
        setShowModal(false);
        setEditingAlternative(null);
    }}
    handleSubmit={handleSave}
    editingAlternative={editingAlternative}
    selectedDecision={selectedDecision}
/>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Alternatives;