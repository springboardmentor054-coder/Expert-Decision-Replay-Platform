import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Table,
  Form,
  Modal,
  Alert
} from "react-bootstrap";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash
} from "react-icons/fa";

import {
  getCriteria,
  createCriterion,
  updateCriterion,
  deleteCriterion
} from "../../services/criteriaService";
import { getDecisions } from "../../services/decisionService";

const Criteria = () => {
  // ==============================
  // Logged-in User
  // ==============================
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "User";

  // ==============================
  // State Declarations
  // ==============================
  const [criteria, setCriteria] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDecision, setSelectedDecision] = useState("");
  const [search, setSearch] = useState("");
  const [decisions, setDecisions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    decision_id: "",
    criteria_name: "",
    weight: ""
  });

  // ==============================
  // API Fetchers
  // ==============================
  const fetchCriteria = async () => {
    try {
      const response = await getCriteria();
      setCriteria(response.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch criteria.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDecisions = async () => {
    try {
      const response = await getDecisions();
      setDecisions(response.data || []);
    } catch (err) {
      console.error("Error fetching decisions:", err);
    }
  };

  useEffect(() => {
    fetchCriteria();
    fetchDecisions();
  }, []);

  // ==============================
  // Handlers
  // ==============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    setSuccess("");
    setError("");

    if (
      !formData.decision_id ||
      !formData.criteria_name ||
      !formData.weight
    ) {
      setError("All fields are required.");
      return;
    }

    try {
      if (editingCriteria) {
        await updateCriterion(
          editingCriteria.criteria_id,
          {
            decision_id: Number(formData.decision_id),
            criteria_name: formData.criteria_name,
            weight: Number(formData.weight)
          }
        );

        setSuccess("Criteria updated successfully.");
      } else {
        await createCriterion({
          decision_id: Number(formData.decision_id),
          criteria_name: formData.criteria_name,
          weight: Number(formData.weight)
        });

        setSuccess("Criteria added successfully.");
      }

      setEditingCriteria(null);
      setShowModal(false);

      setFormData({
        decision_id: "",
        criteria_name: "",
        weight: ""
      });

      fetchCriteria();
    } catch (err) {
      console.error(err);
      setError("Unable to save criteria.");
    }
  };

  const handleEdit = (item) => {
    setEditingCriteria(item);

    setFormData({
      decision_id: item.decision_id,
      criteria_name: item.criteria_name,
      weight: item.weight
    });

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this criterion?"))
      return;

    try {
      await deleteCriterion(id);

      setSuccess("Criteria deleted successfully.");

      fetchCriteria();
    } catch (err) {
      console.error(err);

      setError("Unable to delete criterion.");
    }
  };

  // Safe Filtering Logic
  const filteredCriteria = criteria.filter((item) => {
    const matchesSearch = item.criteria_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesDecision =
      selectedDecision === "" ||
      item.decision_id === Number(selectedDecision);

    return matchesSearch && matchesDecision;
  });

  return (
    <div className="container-fluid py-4 px-4">
      {success && (
        <Alert
          variant="success"
          onClose={() => setSuccess("")}
          dismissible
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          variant="danger"
          onClose={() => setError("")}
          dismissible
        >
          {error}
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="fw-bold text-primary mb-0">Criteria Management</h4>
          {(role === "User" || role === "Admin") && (
            <Button
              variant="primary"
              onClick={() => {
                setEditingCriteria(null);
                setFormData({
                  decision_id: "",
                  criteria_name: "",
                  weight: ""
                });
                setShowModal(true);
              }}
            >
              <FaPlus className="me-2" />
              Add Criteria
            </Button>
          )}
        </Card.Header>

        <Card.Body>
          <div className="row mb-3">
            <div className="col-md-4 mb-2 mb-md-0">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <Form.Control
                  placeholder="Search Criteria..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-4">
              <Form.Select
                value={selectedDecision}
                onChange={(e) => setSelectedDecision(e.target.value)}
              >
                <option value="">All Decisions</option>
                {decisions.map((decision) => (
                  <option
                    key={decision.decision_id}
                    value={decision.decision_id}
                  >
                    {decision.decision_title}
                  </option>
                ))}
              </Form.Select>
            </div>
          </div>

          <Card className="shadow-sm mb-4">
            <Card.Header>
              <h5 className="mb-0">Evaluation Summary</h5>
            </Card.Header>

            <Card.Body>
              {selectedDecision === "" ? (
                <Alert variant="info" className="mb-0">
                  Select a decision to view its evaluation criteria summary.
                </Alert>
              ) : (
                <>
                  <Table bordered hover responsive className="mb-3">
                    <thead>
                      <tr>
                        <th>Criteria</th>
                        <th width="150">Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCriteria.length === 0 ? (
                        <tr>
                          <td colSpan="2" className="text-center">
                            No Criteria Found for Selected Decision
                          </td>
                        </tr>
                      ) : (
                        filteredCriteria.map((item) => (
                          <tr key={item.criteria_id}>
                            <td>{item.criteria_name}</td>
                            <td>{item.weight}%</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>

                  <h5 className="text-end mb-0">
                    Total Weight:{" "}
                    {filteredCriteria.reduce(
                      (sum, c) => sum + (Number(c.weight) || 0),
                      0
                    )}
                    %
                  </h5>
                </>
              )}
            </Card.Body>
          </Card>

          <Table bordered hover striped responsive>
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Decision</th>
                <th>Criteria Name</th>
                <th>Weight</th>
                <th width="150" className="text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredCriteria.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    No Criteria Found
                  </td>
                </tr>
              ) : (
                filteredCriteria.map((item) => (
                  <tr key={item.criteria_id}>
                    <td>{item.criteria_id}</td>
                    <td>
                      {decisions.find(
                        (d) => d.decision_id === item.decision_id
                      )?.decision_title || "Unknown"}
                    </td>
                    <td>{item.criteria_name}</td>
                    <td>{item.weight}%</td>
                    <td className="text-center">
                      {(role === "User" || role === "Admin") && (
                        <>
                          <Button
                            size="sm"
                            variant="warning"
                            className="me-2"
                            onClick={() => handleEdit(item)}
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(item.criteria_id)}
                          >
                            <FaTrash />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {(role === "User" || role === "Admin") && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingCriteria ? "Edit Criteria" : "Add Criteria"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Decision</Form.Label>
              <Form.Select
                name="decision_id"
                value={formData.decision_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Decision</option>
                {decisions.map((decision) => (
                  <option
                    key={decision.decision_id}
                    value={decision.decision_id}
                  >
                    {decision.decision_title}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Criteria Name</Form.Label>
              <Form.Control
                type="text"
                name="criteria_name"
                value={formData.criteria_name}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight</Form.Label>
              <Form.Control
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
            >
              {editingCriteria ? "Update" : "Save"}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Criteria;