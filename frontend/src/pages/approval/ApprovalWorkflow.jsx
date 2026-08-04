import React, { useEffect, useState } from "react";
import {
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
  Modal,
  Form
} from "react-bootstrap";
import { useParams } from "react-router-dom";

import {
  getApprovalDetails,
  approveDecision,
  rejectDecision
} from "../../services/approvalService";

const ApprovalWorkflow = () => {
  // ==========================
  // Route Parameter
  // ==========================
  const { approvalId } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));

  // ==========================
  // State
  // ==========================
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [remarks, setRemarks] = useState("");

  // ==========================
  // Load Approval Details
  // ==========================
  useEffect(() => {
    loadApproval();
  }, []);

  const loadApproval = async () => {
    try {
      const res = await getApprovalDetails(approvalId);
      setDetails(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load approval.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveDecision(approvalId, user.user_id);
      alert("Approved Successfully");
      loadApproval();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Approval Failed");
    }
  };

  const handleReject = async () => {
    try {
      await rejectDecision(approvalId, user.user_id, remarks);
      alert("Rejected Successfully");
      setShowReject(false);
      loadApproval();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Reject Failed");
    }
  };

  // ==========================
  // Loading
  // ==========================
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // ==========================
  // Error
  // ==========================
  if (error) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  // ==========================
  // No Data
  // ==========================
  if (!details) {
    return (
      <div className="container mt-4">
        <Alert variant="warning">No approval details found.</Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <Card className="shadow">
        <Card.Header>
          <h3 className="fw-bold text-primary mb-0">Approval Workflow</h3>
        </Card.Header>

        <Card.Body>
          {/* Decision Details */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">📋 Decision Details</h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <strong>Title</strong>
                  <p className="mt-2">{details.decision.title}</p>
                </div>

                <div className="col-md-6 mb-3">
                  <strong>Status</strong>
                  <div className="mt-2">
                    <Badge bg="warning" text="dark">
                      {details.decision.status}
                    </Badge>
                  </div>
                </div>

                <div className="col-12">
                  <strong>Description</strong>
                  <div className="border rounded p-3 bg-light mt-2">
                    {details.decision.description}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Approval Information */}
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Approval Information</h5>
            </Card.Header>

            <Card.Body>
              <p>
                <strong>Current Reviewer :</strong> {details.reviewer?.name}
              </p>

              <p>
                <strong>Role :</strong> {details.reviewer?.role}
              </p>

              <p>
                <strong>Approval Level :</strong> {details.approval?.level}
              </p>

              <p className="mb-0">
                <strong>Status :</strong> {details.approval?.status}
              </p>
            </Card.Body>
          </Card>

          {/* Recommended Alternative */}
          {details.recommended_alternative && (
            <Card className="border-success shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">⭐ Recommended Alternative</h5>
              </Card.Header>
              <Card.Body>
                <h3 className="text-success">
                  {details.recommended_alternative.alternative_name}
                </h3>
                <h5>
                  Total Score : {details.recommended_alternative.total_score}
                </h5>
                <h6>Rank : #{details.recommended_alternative.rank}</h6>
              </Card.Body>
            </Card>
          )}

          {/* All Alternatives */}
          <Card className="mt-4 shadow-sm">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">🥇 Alternative Ranking</h5>
            </Card.Header>

            <Card.Body>
              <table className="table table-bordered table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th width="80">Rank</th>
                    <th>Alternative</th>
                    <th width="120">Score</th>
                    <th width="150">Cost</th>
                    <th width="150">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {details.alternatives.map((item) => (
                    <tr
                      key={item.alternative_id}
                      className={
                        details.recommended_alternative &&
                        item.alternative_id ===
                          details.recommended_alternative.alternative_id
                          ? "table-success"
                          : ""
                      }
                    >
                      <td className="text-center fw-bold">
                        {item.rank === 1
                          ? "🥇"
                          : item.rank === 2
                          ? "🥈"
                          : item.rank === 3
                          ? "🥉"
                          : item.rank}
                      </td>
                      <td>{item.alternative_name}</td>
                      <td className="text-center">{item.total_score}</td>
                      <td>₹ {item.estimated_cost}</td>
                      <td>{item.risk_level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Approval Actions */}
              {details.approval?.status === "Pending" &&
                details.reviewer?.id === user?.user_id && (
                  <div className="d-flex justify-content-end mt-4">
                    <Button
                      variant="success"
                      className="me-2"
                      onClick={handleApprove}
                    >
                      {user?.role === "Reviewer"
                        ? "Send to Manager"
                        : "Final Approve"}
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => setShowReject(true)}
                    >
                      ❌ Reject
                    </Button>
                  </div>
                )}
            </Card.Body>
          </Card>

          {/* Criteria Score Matrix */}
          <Card className="mt-4 shadow-sm">
            <Card.Header className="bg-secondary text-white">
              <h5 className="mb-0">📊 Criteria Score Matrix</h5>
            </Card.Header>

            <Card.Body>
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Alternative</th>
                    {details.criteria.map((c) => (
                      <th key={c.criteria_id} className="text-center">
                        {c.name}
                      </th>
                    ))}
                    <th className="text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {details.score_matrix.map((row) => {
                    const total = row.scores.reduce(
                      (sum, s) => sum + s.score,
                      0
                    );

                    return (
                      <tr key={row.alternative_id}>
                        <td className="fw-bold">{row.alternative_name}</td>
                        {row.scores.map((score) => (
                          <td key={score.criteria_id} className="text-center">
                            {score.score}
                          </td>
                        ))}
                        <td className="text-center fw-bold">{total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Card.Body>
      </Card>

      {/* Reject Modal */}
      <Modal show={showReject} onHide={() => setShowReject(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Decision</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReject(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReject}>
            Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ApprovalWorkflow;