import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    Table,
    Button,
    Badge,
    Spinner,
    Alert,
    Modal,
    Form
} from "react-bootstrap";
import {
    FaCheck,
    FaTimes,
    FaSyncAlt,
    FaEye
} from "react-icons/fa";
import {
    getApprovals,
    approveDecision,
    rejectDecision
} from "../../services/approvalService";

const PendingApprovals = () => {
    const navigate = useNavigate();

    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [remarks, setRemarks] = useState("");
    const [selectedApproval, setSelectedApproval] = useState(null);

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        loadApprovals();
    }, []);

    const loadApprovals = async () => {
        try {
            const res = await getApprovals();
            setApprovals(res.data);
        } catch (err) {
            console.error(err);
            setError("Unable to load approvals.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (approvalId) => {
        try {
            await approveDecision(approvalId, user.user_id);
            alert("Decision approved successfully.");
            loadApprovals();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "Approval failed.");
        }
    };

    const openRejectModal = (approvalId) => {
        setSelectedApproval(approvalId);
        setRemarks("");
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        try {
            await rejectDecision(
                selectedApproval,
                user.user_id,
                remarks
            );
            alert("Decision rejected successfully.");
            setShowRejectModal(false);
            loadApprovals();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.detail || "Reject failed.");
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );
    }

    return (
        <Card className="shadow border-0">
            <Card.Header className="bg-white">
                <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fw-bold">Pending Approvals</h3>
                    <Button
                        variant="outline-primary"
                        onClick={loadApprovals}
                    >
                        <FaSyncAlt className="me-2" />
                        Refresh
                    </Button>
                </div>
            </Card.Header>

            <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <Table striped bordered hover responsive>
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Decision</th>
                            <th>Reviewer</th>
                            <th>Level</th>
                            <th>Status</th>
                            <th>Remarks</th>
                            <th>Created</th>
                            <th width="220">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvals.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center">
                                    No Approvals Found
                                </td>
                            </tr>
                        ) : (
                            approvals.map((approval) => (
                                <tr key={approval.id}>
                                    <td>{approval.id}</td>
                                    <td>{approval.decision_title}</td>
                                    <td>{approval.reviewer_name}</td>
                                    <td>{approval.approval_level}</td>
                                    <td>
                                        {approval.status === "Approved" ? (
                                            <Badge bg="success">Approved</Badge>
                                        ) : approval.status === "Rejected" ? (
                                            <Badge bg="danger">Rejected</Badge>
                                        ) : (
                                            <Badge bg="warning" text="dark">
                                                Pending
                                            </Badge>
                                        )}
                                    </td>
                                    <td>{approval.remarks || "-"}</td>
                                    <td>
                                        {approval.created_at
                                            ? new Date(approval.created_at).toLocaleString()
                                            : "-"}
                                    </td>
                                    <td>
                                        {approval.status === "Pending" ? (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() =>
                                                    navigate(
                                                        `/approval-workflow/${approval.id}`
                                                    )
                                                }
                                            >
                                                <FaEye className="me-2" />
                                                View
                                            </Button>
                                        ) : (
                                            <span className="text-success fw-bold">
                                                Completed
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card.Body>

            <Modal
                show={showRejectModal}
                onHide={() => setShowRejectModal(false)}
            >
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
                    <Button
                        variant="secondary"
                        onClick={() => setShowRejectModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleReject}>
                        Reject
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default PendingApprovals;