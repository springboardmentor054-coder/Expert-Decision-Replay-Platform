import React, { useEffect, useState } from "react";

import {
  Card,
  Table,
  Form,
  Row,
  Col,
  Spinner,
  Button,
  Badge
} from "react-bootstrap";

import {
  FaBook,
  FaSearch,
  FaEye,
  FaFilePdf
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import {
  getKnowledgeRepository
} from "../../services/knowledgeService";

import {
  getDecisionReportData
} from "../../services/reportService";

import {
  generateDecisionPDF
} from "../../utils/pdfReport";


const KnowledgeRepository = () => {

  const navigate = useNavigate();

  const [decisions, setDecisions] = useState([]);
  const [filteredDecisions, setFilteredDecisions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // PDF generation state
  const [generatingPDF, setGeneratingPDF] = useState(null);


  // ======================================
  // Load Knowledge Repository
  // ======================================

  const loadKnowledge = async () => {

    try {

      setLoading(true);

      const data =
        await getKnowledgeRepository();

      console.log(
        "Knowledge Repository:",
        data
      );

      setDecisions(data || []);
      setFilteredDecisions(data || []);

    } catch (error) {

      console.error(
        "Knowledge Repository Error:",
        error
      );

      setDecisions([]);
      setFilteredDecisions([]);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadKnowledge();

  }, []);


  // ======================================
  // Search
  // ======================================

  useEffect(() => {

    const query =
      search.toLowerCase();

    const result =
      decisions.filter((decision) => {

        return (

          decision.decision_title
            ?.toLowerCase()
            .includes(query)

          ||

          decision.decision_description
            ?.toLowerCase()
            .includes(query)

        );

      });

    setFilteredDecisions(result);

  }, [search, decisions]);


  // ======================================
  // View Decision
  // ======================================

  const viewDecision = (id) => {

    navigate(
      `/decisions/${id}`
    );

  };


  // ======================================
  // Generate PDF Report
  // ======================================

  const generatePDF = async (decisionId) => {

    try {

      setGeneratingPDF(decisionId);

      console.log(
        "Generating PDF for decision:",
        decisionId
      );

      const data =
        await getDecisionReportData(
          decisionId
        );

      console.log(
        "Decision Report Data:",
        data
      );

      generateDecisionPDF(data);

    } catch (error) {

      console.error(
        "PDF Generation Error:",
        error
      );

      if (error.response) {

        console.error(
          "Status:",
          error.response.status
        );

        console.error(
          "Response:",
          error.response.data
        );

      }

      alert(
        "Unable to generate PDF report."
      );

    } finally {

      setGeneratingPDF(null);

    }

  };


  return (

    <div className="container-fluid py-4">

      <Card className="shadow-sm">

        {/* ======================================
            HEADER
        ====================================== */}

        <Card.Header>

          <h4 className="mb-0">

            <FaBook className="me-2" />

            Knowledge Repository

          </h4>

        </Card.Header>


        <Card.Body>


          {/* ======================================
              SEARCH
          ====================================== */}

          <Row className="mb-4">

            <Col md={6}>

              <div className="input-group">

                <span className="input-group-text">

                  <FaSearch />

                </span>

                <Form.Control

                  placeholder="Search approved decisions..."

                  value={search}

                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }

                />

              </div>

            </Col>


            <Col md={3}>

              <div className="text-muted mt-2">

                Total Knowledge Items:

                <strong className="ms-2">

                  {
                    filteredDecisions.length
                  }

                </strong>

              </div>

            </Col>

          </Row>


          {/* ======================================
              LOADING
          ====================================== */}

          {loading ? (

            <div className="text-center p-5">

              <Spinner animation="border" />

              <div className="mt-2">

                Loading Knowledge Repository...

              </div>

            </div>

          ) : (


            /* ======================================
               TABLE
            ====================================== */

            <Table
              bordered
              striped
              hover
              responsive
            >

              <thead className="table-dark">

                <tr>

                  <th>ID</th>

                  <th>Decision</th>

                  <th>Description</th>

                  <th>Status</th>

                  <th>Created</th>

                  <th>Action</th>

                </tr>

              </thead>


              <tbody>

                {filteredDecisions.length > 0 ? (

                  filteredDecisions.map(
                    (decision) => (

                      <tr
                        key={
                          decision.decision_id
                        }
                      >

                        {/* ID */}

                        <td>

                          {
                            decision.decision_id
                          }

                        </td>


                        {/* DECISION */}

                        <td>

                          <strong>

                            {
                              decision.decision_title
                            }

                          </strong>

                        </td>


                        {/* DESCRIPTION */}

                        <td>

                          {
                            decision.decision_description ||
                            "-"
                          }

                        </td>


                        {/* STATUS */}

                        <td>

                          <Badge bg="success">

                            {
                              decision.status
                            }

                          </Badge>

                        </td>


                        {/* CREATED */}

                        <td>

                          {
                            decision.created_at
                              ? new Date(
                                  decision.created_at
                                ).toLocaleString()
                              : "-"
                          }

                        </td>


                        {/* ACTIONS */}

                        <td>

                          <div className="d-flex gap-2">

                            {/* VIEW */}

                            <Button

                              variant="outline-primary"

                              size="sm"

                              onClick={() =>
                                viewDecision(
                                  decision.decision_id
                                )
                              }

                            >

                              <FaEye className="me-1" />

                              View

                            </Button>


                            {/* PDF */}

                            <Button

                              variant="outline-danger"

                              size="sm"

                              disabled={
                                generatingPDF ===
                                decision.decision_id
                              }

                              onClick={() =>
                                generatePDF(
                                  decision.decision_id
                                )
                              }

                            >

                              <FaFilePdf className="me-1" />

                              {generatingPDF ===
                              decision.decision_id
                                ? "Generating..."
                                : "PDF"}

                            </Button>

                          </div>

                        </td>

                      </tr>

                    )

                  )

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center text-muted py-4"
                    >

                      No approved decisions
                      found in the Knowledge Repository.

                    </td>

                  </tr>

                )}

              </tbody>

            </Table>

          )}

        </Card.Body>

      </Card>

    </div>

  );

};


export default KnowledgeRepository;