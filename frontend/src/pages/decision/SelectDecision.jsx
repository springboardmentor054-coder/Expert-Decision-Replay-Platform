import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Card,
  Table,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaClipboardList,
} from "react-icons/fa";

function SelectDecision() {
  const [decisions, setDecisions] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = "http://127.0.0.1:8000";

  const mode =
    new URLSearchParams(location.search).get("mode") || "create";

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        setMessage("");

        const response = await fetch(`${API_URL}/decisions`);

        if (!response.ok) {
          throw new Error("Could not load decisions");
        }

        const data = await response.json();
        setDecisions(data);
      } catch (error) {
        console.error(error);
        setMessage("Could not load decisions");
      }
    };

    fetchDecisions();
  }, []);

  const getPageHeading = () => {
    if (mode === "view") {
      return "Select Decision to View Alternatives";
    }

    if (mode === "upload-document") {
      return "Select Decision to Upload Document";
    }

    return "Select Decision to Add Alternative";
  };

  const getButtonText = () => {
    if (mode === "view") {
      return "View Alternatives";
    }

    if (mode === "upload-document") {
      return "Upload Document";
    }

    return "Add Alternative";
  };

  const handleSelectDecision = (decisionId) => {
    navigate(`/decisions/${decisionId}?mode=${mode}`);
  };

  return (
    <Container fluid className="py-4 px-4">
      <Button
        variant="outline-primary"
        className="mb-4"
        onClick={() => navigate("/dashboard")}
      >
        <FaArrowLeft className="me-2" />
        Back to Dashboard
      </Button>

      <h2 className="fw-bold text-primary mb-4">
        <FaClipboardList className="me-2" />
        {getPageHeading()}
      </h2>

      {message && (
        <Alert variant="danger">
          {message}
        </Alert>
      )}

      <Card className="shadow-sm border-0">
        <Card.Header>
          <h5 className="fw-bold mb-0">
            Available Decisions
          </h5>
        </Card.Header>

        <Card.Body>
          {decisions.length === 0 ? (
            <div className="text-center py-5">
              <Spinner
                animation="border"
                variant="primary"
              />
              <p className="text-muted mt-3 mb-0">
                No decisions available.
              </p>
            </div>
          ) : (
            <Table
              striped
              bordered
              hover
              responsive
              className="mb-0"
            >
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Decision Title</th>
                  <th>Description</th>
                  <th width="180">Action</th>
                </tr>
              </thead>

              <tbody>
                {decisions.map((decision) => (
                  <tr key={decision.decision_id}>
                    <td>{decision.decision_id}</td>

                    <td>{decision.decision_title}</td>

                    <td>{decision.decision_description}</td>

                    <td>
                      <Button
                        variant={
                          mode === "view"
                            ? "outline-primary"
                            : "success"
                        }
                        onClick={() =>
                          handleSelectDecision(
                            decision.decision_id
                          )
                        }
                      >
                        {getButtonText()}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default SelectDecision;