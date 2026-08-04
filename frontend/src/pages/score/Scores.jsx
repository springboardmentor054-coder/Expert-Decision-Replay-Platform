import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Table,
  Button,
  Spinner,
  Alert
} from "react-bootstrap";
import { FaSave } from "react-icons/fa";

import { getDecisions } from "../../services/decisionService";
import { getAlternatives } from "../../services/alternativeService";
import { getCriteria } from "../../services/criteriaService";
import {
  createScore,
  updateScore,
  getDecisionScores
} from "../../services/scoreService";

const Scores = () => {
  // ==============================
  // Logged-in User
  // ==============================
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role || "User";

  // ==============================
  // State Declarations
  // ==============================
  const [decisions, setDecisions] = useState([]);
  const [alternatives, setAlternatives] = useState([]);
  const [criteria, setCriteria] = useState([]);

  const [selectedDecision, setSelectedDecision] = useState("");

  const [scores, setScores] = useState({});
  const [existingScores, setExistingScores] = useState({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // ==============================
  // API Fetchers
  // ==============================
  const fetchData = async () => {
    try {
      const decisionRes = await getDecisions();
      const alternativeRes = await getAlternatives();
      const criteriaRes = await getCriteria();

      setDecisions(decisionRes.data || []);
      setAlternatives(alternativeRes.data || []);
      setCriteria(criteriaRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch initial data.");
    } finally {
      setLoading(false);
    }
  };

  const loadExistingScores = async () => {
    try {
      const res = await getDecisionScores(selectedDecision);

      const savedScores = {};
      const scoreIds = {};

      (res.data || []).forEach((item) => {
        const key = `${item.alternative_id}_${item.criteria_id}`;
        savedScores[key] = item.score;
        scoreIds[key] = item.score_id;
      });

      setScores(savedScores);
      setExistingScores(scoreIds);
    } catch (err) {
      console.error(err);
      setError("Failed to load scores for the selected decision.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDecision) {
      setScores({});
      setExistingScores({});
      return;
    }
    loadExistingScores();
  }, [selectedDecision]);

  // ==============================
  // Handlers & Filters
  // ==============================
  const filteredAlternatives = alternatives.filter(
    (item) => item.decision_id === Number(selectedDecision)
  );

  const filteredCriteria = criteria.filter(
    (item) => item.decision_id === Number(selectedDecision)
  );

  const handleScoreChange = (alternativeId, criteriaId, value) => {
    setScores((prev) => ({
      ...prev,
      [`${alternativeId}_${criteriaId}`]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    setError("");

    try {
      for (const key in scores) {
        if (scores[key] === "" || scores[key] === null) continue;

        const [alternative_id, criteria_id] = key.split("_");

        const payload = {
          alternative_id: Number(alternative_id),
          criteria_id: Number(criteria_id),
          score: Number(scores[key])
        };

        if (existingScores[key]) {
          await updateScore(existingScores[key], payload);
        } else {
          await createScore(payload);
        }
      }

      setSuccess("Scores saved successfully.");
      loadExistingScores();
    } catch (err) {
      console.error(err);
      setError("Failed to save scores.");
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // Render
  // ==============================
  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-4">
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}

      <Card className="shadow-sm mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="fw-bold text-primary mb-0">Alternative Scores</h4>
        </Card.Header>

        <Card.Body>
          <div className="row mb-4">
            <div className="col-md-4">
              <Form.Group>
                <Form.Label className="fw-semibold">Select Decision</Form.Label>
                <Form.Select
                  value={selectedDecision}
                  onChange={(e) => setSelectedDecision(e.target.value)}
                >
                  <option value="">-- Select Decision --</option>
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
            </div>
          </div>

          {selectedDecision === "" ? (
            <Alert variant="info" className="mb-0">
              Please select a decision from the dropdown above to manage scores.
            </Alert>
          ) : filteredAlternatives.length === 0 || filteredCriteria.length === 0 ? (
            <Alert variant="warning" className="mb-0">
              Ensure this decision has both alternatives and criteria set up before assigning scores.
            </Alert>
          ) : (
            <>
              <Table bordered hover responsive className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Alternative</th>
                    {filteredCriteria.map((item) => (
                      <th key={item.criteria_id} className="text-center">
                        {item.criteria_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAlternatives.map((alternative) => (
                    <tr key={alternative.alternative_id}>
                      <td className="fw-semibold">
                        {alternative.alternative_name}
                      </td>

                      {filteredCriteria.map((criterion) => {
                        const scoreKey = `${alternative.alternative_id}_${criterion.criteria_id}`;
                        return (
                          <td key={criterion.criteria_id} width="120">
                            <Form.Control
                              type="number"
                              min="1"
                              max="10"
                              className="text-center"
                              value={scores[scoreKey] ?? ""}
                              readOnly={
                                role === "Reviewer" ||
                                role === "Manager"
                              }
                              onChange={(e) =>
                                handleScoreChange(
                                  alternative.alternative_id,
                                  criterion.criteria_id,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="d-flex justify-content-end mt-3">
                {(role === "User" || role === "Admin") && (
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="me-2" />
                        Save Scores
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Scores;