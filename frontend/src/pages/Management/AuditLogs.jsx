import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Row,
  Col,
  Form,
  Spinner
} from "react-bootstrap";
import { FaHistory, FaSearch } from "react-icons/fa";

// Named import matching option 2 in service file
import getAuditLogs from "../../services/auditLogService";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ======================================
  // Load Audit Logs
  // ======================================
  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs();

      console.log("API Response:", data);
      console.log("Is Array:", Array.isArray(data));

      if (Array.isArray(data)) {
        setLogs(data);
        setFilteredLogs(data);
      } else {
        setLogs([]);
        setFilteredLogs([]);
      }
    } catch (error) {
      console.error("Audit Log Error:", error);

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
      }

      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // ======================================
  // Search Filter
  // ======================================
  useEffect(() => {
    const query = search.toLowerCase();
    const result = logs.filter((log) => {
      return (
        log.action_type?.toLowerCase().includes(query) ||
        log.description?.toLowerCase().includes(query) ||
        String(log.user_id ?? "").includes(query)
      );
    });

    setFilteredLogs(result);
  }, [search, logs]);

  return (
    <div className="container-fluid py-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">
            <FaHistory className="me-2" />
            Audit Logs
          </h4>
          <h5 className="mb-0">
            Total Logs: {filteredLogs.length}
          </h5>
        </Card.Header>

        <Card.Body>
          <Row className="mb-3">
            <Col md={5}>
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <Form.Control
                  placeholder="Search by action, description or user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Table
              bordered
              striped
              hover
              responsive
            >
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Decision ID</th>
                  <th>Action</th>
                  <th>Description</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.id}</td>
                      <td>{log.user_id}</td>
                      <td>{log.decision_id ?? "-"}</td>
                      <td>{log.action_type}</td>
                      <td>{log.description}</td>
                      <td>
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center text-muted"
                    >
                      No Audit Logs Found
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

export default AuditLogs;