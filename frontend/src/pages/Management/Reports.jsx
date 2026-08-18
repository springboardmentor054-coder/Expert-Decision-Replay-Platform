import React, { useEffect, useState } from "react";
import {
    Card,
    Row,
    Col,
    Spinner
} from "react-bootstrap";

import {
    FaUsers,
    FaClipboardList,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaFileAlt,
    FaComments,
    FaHistory,
    FaUserCheck
} from "react-icons/fa";

import { getDashboardReport } from "../../services/reportService";

const Reports = () => {

    const [report, setReport] = useState(null);

    const [loading, setLoading] = useState(true);

    // ==========================
    // Load Report
    // ==========================

    const loadReport = async () => {

        try {

            setLoading(true);

            const data =
                await getDashboardReport();

            setReport(data);

        }

        catch (error) {

            console.error(error);

            alert("Unable to load reports.");

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        loadReport();

    }, []);

    if (loading) {

        return (

            <div className="text-center mt-5">

                <Spinner animation="border"/>

            </div>

        );

    }

    return (

        <div className="container-fluid py-4">

            <h2 className="mb-4">

                Reports Dashboard

            </h2>

            <Row>

                <Col md={3} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaUsers
                                size={35}
                                className="text-primary mb-2"
                            />

                            <h6>Total Users</h6>

                            <h2>

                                {report.total_users}

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={3} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaClipboardList
                                size={35}
                                className="text-success mb-2"
                            />

                            <h6>Total Decisions</h6>

                            <h2>

                                {report.total_decisions}

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={3} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaCheckCircle
                                size={35}
                                className="text-success mb-2"
                            />

                            <h6>Approved</h6>

                            <h2>

                                {report.approved}

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={3} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaClock
                                size={35}
                                className="text-warning mb-2"
                            />

                            <h6>Pending</h6>

                            <h2>

                                {

                                    report.pending_review +

                                    report.pending_manager

                                }

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

            <Row>

                <Col md={3} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaTimesCircle
                                size={35}
                                className="text-danger mb-2"
                            />

                            <h6>Rejected</h6>

                            <h2>

                                {report.rejected}

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={3} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaFileAlt
                                size={35}
                                className="text-info mb-2"
                            />

                            <h6>Documents</h6>

                            <h2>

                                {report.documents}

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={3} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaComments
                                size={35}
                                className="text-secondary mb-2"
                            />

                            <h6>Discussions</h6>

                            <h2>

                                {report.discussions}

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={3} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaHistory
                                size={35}
                                className="text-dark mb-2"
                            />

                            <h6>Audit Logs</h6>

                            <h2>

                                {report.audit_logs}

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

            <Row>

                <Col md={4} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaUserCheck
                                size={35}
                                className="text-primary mb-2"
                            />

                            <h6>

                                Pending Approvals

                            </h6>

                            <h2>

                                {

                                    report.pending_approvals

                                }

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={4} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaCheckCircle
                                size={35}
                                className="text-success mb-2"
                            />

                            <h6>

                                Approved Approvals

                            </h6>

                            <h2>

                                {

                                    report.approved_approvals

                                }

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

                <Col md={4} className="mb-4">

                    <Card className="shadow-sm">

                        <Card.Body>

                            <FaTimesCircle
                                size={35}
                                className="text-danger mb-2"
                            />

                            <h6>

                                Rejected Approvals

                            </h6>

                            <h2>

                                {

                                    report.rejected_approvals

                                }

                            </h2>

                        </Card.Body>

                    </Card>

                </Col>

            </Row>

        </div>

    );

};

export default Reports;