import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";

const initialState = {
  decision_id: 0,
  alternative_name: "",
  description: "",
  pros: "",
  cons: "",
  estimated_cost: "",
  feasibility: "",
  risk_level: "",
};

const AlternativeForm = ({
  show,
  handleClose,
  handleSubmit,
  editingAlternative,
  selectedDecision,
}) => {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (editingAlternative) {
      setFormData({
        decision_id:
          editingAlternative.decision_id || selectedDecision,
        alternative_name:
          editingAlternative.alternative_name || "",
        description:
          editingAlternative.description || "",
        pros:
          editingAlternative.pros || "",
        cons:
          editingAlternative.cons || "",
        estimated_cost:
          editingAlternative.estimated_cost || "",
        feasibility:
          editingAlternative.feasibility || "",
        risk_level:
          editingAlternative.risk_level || "",
      });
    } else {
      setFormData({
        ...initialState,
        decision_id: selectedDecision,
      });
    }
  }, [editingAlternative, show, selectedDecision]);

  const onChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const submitForm = (e) => {
    e.preventDefault();
    handleSubmit(formData);
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {editingAlternative
            ? "Edit Alternative"
            : "Add Alternative"}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={submitForm}>
        <Modal.Body>

          {/* Hidden Decision ID */}
          <input
            type="hidden"
            name="decision_id"
            value={formData.decision_id}
          />

          <Row>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Alternative Name</Form.Label>
                <Form.Control
                  type="text"
                  name="alternative_name"
                  value={formData.alternative_name}
                  onChange={onChange}
                  required
                />
              </Form.Group>
            </Col>

          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={onChange}
            />
          </Form.Group>

          <Row>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Pros</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="pros"
                  value={formData.pros}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cons</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="cons"
                  value={formData.cons}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>

          </Row>

          <Row>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Estimated Cost</Form.Label>
                <Form.Control
                  type="number"
                  name="estimated_cost"
                  value={formData.estimated_cost}
                  onChange={onChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Feasibility</Form.Label>
                <Form.Select
                  name="feasibility"
                  value={formData.feasibility}
                  onChange={onChange}
                >
                  <option value="">Select</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Risk Level</Form.Label>
                <Form.Select
                  name="risk_level"
                  value={formData.risk_level}
                  onChange={onChange}
                >
                  <option value="">Select</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </Form.Select>
              </Form.Group>
            </Col>

          </Row>

        </Modal.Body>

        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>

          <Button
            variant="primary"
            type="submit"
          >
            {editingAlternative
              ? "Update Alternative"
              : "Save Alternative"}
          </Button>

        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AlternativeForm;