import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Spinner
} from "react-bootstrap";
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaHistory
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import DecisionForm from "../../components/forms/DecisionForm";
import {
  getDecisions,
  createDecision,
  updateDecision,
  deleteDecision,
  submitDecision
} from "../../services/decisionService";

const Decisions = () => {
  const navigate = useNavigate();

  // ==========================
  // Logged-in User
  // ==========================
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "User";

  // ==========================
  // States
  // ==========================
  const [decisions, setDecisions] = useState([]);
  const [filteredDecisions, setFilteredDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingDecision, setEditingDecision] = useState(null);

  // ==========================
  // Load Decisions
  // ==========================
  const loadDecisions = async () => {
    try {
      setLoading(true);
      const response = await getDecisions();
      setDecisions(response.data);
      setFilteredDecisions(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load decisions.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Initial Load
  // ==========================
  useEffect(() => {
    loadDecisions();
  }, []);

  // ==========================
  // Search Filter
  // ==========================
  useEffect(() => {
    const filtered = decisions.filter((decision) =>
      decision.decision_title
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredDecisions(filtered);
  }, [search, decisions]);

  // ==========================
  // Add Decision
  // ==========================
  const handleAdd = () => {
    setEditingDecision(null);
    setShowModal(true);
  };

  // ==========================
  // Edit Decision
  // ==========================
  const handleEdit = (decision) => {
    setEditingDecision(decision);
    setShowModal(true);
  };

  // ==========================
  // Submit Decision
  // ==========================
  const handleSubmitDecision = async (decisionId) => {
    if (!window.confirm("Submit this decision for approval?")) {
      return;
    }

    try {
      await submitDecision(decisionId);
      alert("Decision submitted successfully.");
      loadDecisions();
    } catch (error) {
      console.error(error);
      alert(
        error?.response?.data?.detail ||
        "Submission failed."
      );
    }
  };

  // ==========================
  // Delete Decision
  // ==========================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this decision?")) {
      return;
    }

    try {
      await deleteDecision(id);
      loadDecisions();
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };

  // ==========================
  // Save Decision
  // ==========================
  const handleSave = async (formData) => {
    try {
      if (editingDecision) {
        await updateDecision(editingDecision.decision_id, formData);
      } else {
        await createDecision(formData);
      }

      setShowModal(false);
      setEditingDecision(null);
      loadDecisions();
    } catch (error) {
      console.error(error);
      alert("Save failed.");
    }
  };

  return (
    <div className="container-fluid py-4 px-4">
      <Card className="shadow-sm">
        {/* ========================== */}
        {/* Header                     */}
        {/* ========================== */}
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="fw-bold text-primary mb-0">Decision Management</h4>
          {(role === "User" || role === "Admin") && (
            <Button variant="primary" onClick={handleAdd}>
              <FaPlus className="me-2" />
              Add Decision
            </Button>
          )}
        </Card.Header>

        {/* ========================== */}
        {/* Body                       */}
        {/* ========================== */}
        <Card.Body>
          <div className="row mb-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <Form.Control
                  type="text"
                  placeholder="Search by decision title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <h5 className="mt-3">Loading Decisions...</h5>
            </div>
          ) : (
            <Table bordered hover striped responsive className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>User</th>
                  <th>Status</th>
                  <th width="420">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDecisions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No Decisions Found
                    </td>
                  </tr>
                ) : (
                  filteredDecisions.map((decision) => (
                    <tr key={decision.decision_id}>
                      <td>{decision.decision_id}</td>
                      <td>{decision.decision_title}</td>
                      <td>{decision.decision_description}</td>
                      <td>{decision.user_id}</td>
                      <td>
                        <span
                          className={`badge ${
                            decision.status === "Approved"
                              ? "bg-success"
                              : decision.status === "Pending Review"
                              ? "bg-warning text-dark"
                              : decision.status === "Rejected"
                              ? "bg-danger"
                              : "bg-secondary"
                          }`}
                        >
                          {decision.status}
                        </span>
                      </td>
                      <td className="text-center text-nowrap">
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() =>
                            navigate(`/decisions/${decision.decision_id}`)
                          }
                        >
                          <FaEye className="me-1" />
                          View
                        </Button>

                        {(role === "User" || role === "Admin") && (
                          <>
                            <Button
                              variant="warning"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEdit(decision)}
                            >
                              <FaEdit className="me-1" />
                              Edit
                            </Button>

                            <Button
                              variant="danger"
                              size="sm"
                              className="me-2"
                              onClick={() =>
                                handleDelete(decision.decision_id)
                              }
                            >
                              <FaTrash className="me-1" />
                              Delete
                            </Button>
                          </>
                        )}

                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/decisions/${decision.decision_id}/history`
                            )
                          }
                        >
                          <FaHistory className="me-1" />
                          History
                        </Button>

                        {(role === "User" || role === "Admin") &&
                          decision.status === "Draft" && (
                            <Button
                              variant="success"
                              size="sm"
                              className="ms-2"
                              onClick={() =>
                                handleSubmitDecision(
                                  decision.decision_id
                                )
                              }
                            >
                              Submit
                            </Button>
                          )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}

          <DecisionForm
            show={showModal}
            handleClose={() => {
              setShowModal(false);
              setEditingDecision(null);
            }}
            handleSubmit={handleSave}
            editingDecision={editingDecision}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Decisions;