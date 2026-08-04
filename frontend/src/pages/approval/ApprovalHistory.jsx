import React, { useEffect, useState } from "react";
import { Card, Table, Spinner, Alert } from "react-bootstrap";
import { getApprovalHistory } from "../../services/approvalService";

const ApprovalHistory = () => {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {

        try {

            const res = await getApprovalHistory();

            setHistory(res.data);

        }

        catch (err) {

            console.error(err);

            setError("Unable to load approval history.");

        }

        finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (
            <div className="text-center mt-5">
                <Spinner animation="border" />
            </div>
        );

    }

    if (error) {

        return (
            <Alert variant="danger">
                {error}
            </Alert>
        );

    }

    return (

        <Card className="shadow">

            <Card.Header className="bg-dark text-white">

                <h4>Approval History</h4>

            </Card.Header>

            <Card.Body>

                <Table striped bordered hover responsive>

                    <thead>

                        <tr>

                            <th>Decision</th>

                            <th>Reviewer</th>

                            <th>Role</th>

                            <th>Level</th>

                            <th>Status</th>

                            <th>Remarks</th>

                            <th>Approved At</th>

                        </tr>

                    </thead>

                    <tbody>

                        {history.map((item) => (

                            <tr key={item.approval_id}>

                                <td>{item.decision_title}</td>

                                <td>{item.reviewer_name}</td>

                                <td>{item.role}</td>

                                <td>{item.approval_level}</td>

                                <td>{item.status}</td>

                                <td>{item.remarks || "-"}</td>

                                <td>
                                    {item.approved_at
                                        ? new Date(item.approved_at).toLocaleString()
                                        : "-"}
                                </td>

                            </tr>

                        ))}

                    </tbody>

                </Table>

            </Card.Body>

        </Card>

    );

};

export default ApprovalHistory;