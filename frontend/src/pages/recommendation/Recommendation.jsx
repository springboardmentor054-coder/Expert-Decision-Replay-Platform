import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Table,
  Spinner,
  Alert,
  ProgressBar,
  Badge
} from "react-bootstrap";

import { getDecisions } from "../../services/decisionService";
import { getRecommendation } from "../../services/recommendationService";

const Recommendation = () => {
  const [decisions, setDecisions] = useState([]);
  const [selectedDecision, setSelectedDecision] = useState("");
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDecisions();
  }, []);

  const loadDecisions = async () => {
    try {
      const res = await getDecisions();
      setDecisions(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const loadRecommendation = async (decisionId) => {
    if (!decisionId) {
      setRecommendation(null);
      return;
    }

    setLoading(true);

    try {
      const res = await getRecommendation(decisionId);
      setRecommendation(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const medal = (rank) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  return (
    <div className="container-fluid py-4">
      <Card className="shadow">
        <Card.Header>
          <h3 className="fw-bold text-primary mb-0">
            Recommendation Engine
          </h3>
        </Card.Header>

        <Card.Body>
          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold">Select Decision</Form.Label>
            <Form.Select
              value={selectedDecision}
              onChange={(e) => {
                setSelectedDecision(e.target.value);
                loadRecommendation(e.target.value);
              }}
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

          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : recommendation ? (
            <>
              <Card className="mb-4 border-success shadow-sm">
                <Card.Body>
                  <h4 className="text-success mb-3">
                    🏆 Recommended Alternative
                  </h4>
                  <h2>
                    {recommendation.recommended_alternative?.alternative_name}
                  </h2>
                  <h5 className="text-muted">
                    Score: {recommendation.recommended_alternative?.total_score}
                  </h5>
                  <p className="mb-0 mt-2">{recommendation.reason}</p>
                </Card.Body>
              </Card>

              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <div className="row text-center">
                    <div className="col-md-4 mb-3 mb-md-0">
                      <strong>Decision</strong>
                      <br />
                      {recommendation.decision}
                    </div>
                    <div className="col-md-4 mb-3 mb-md-0">
                      <strong>Criteria Used</strong>
                      <br />
                      {recommendation.criteria_used}
                    </div>
                    <div className="col-md-4">
                      <strong>Alternatives</strong>
                      <br />
                      {recommendation.total_alternatives}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Table bordered hover responsive className="align-middle">
                <thead className="table-dark">
                  <tr>
                    <th style={{ width: "80px" }} className="text-center">Rank</th>
                    <th>Alternative</th>
                    <th style={{ width: "120px" }} className="text-center">Score</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {(recommendation.all_alternatives || []).map((item) => (
                    <tr key={item.alternative_id}>
                      <td className="text-center fs-5">
                        {medal(item.rank)}
                      </td>
                      <td className="fw-semibold">
                        {item.alternative_name}
                      </td>
                      <td className="text-center">
                        <Badge bg="primary" className="fs-6 px-3">
                          {item.total_score}
                        </Badge>
                      </td>
                      <td>
                        <ProgressBar
                          now={item.total_score}
                          label={`${item.total_score}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <Alert variant="info" className="mb-0">
              Please select a decision from the dropdown above to view recommendations.
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Recommendation;