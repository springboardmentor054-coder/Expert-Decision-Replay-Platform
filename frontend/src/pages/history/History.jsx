import React, { useEffect, useState } from "react";

import {
    Card,
    Form,
    Table,
    Spinner,
    Alert,
    Button,
    Badge,
    Modal
} from "react-bootstrap";

import {
    FaHistory,
    FaEye
} from "react-icons/fa";

import { getDecisions } from "../../services/decisionService";

import {
    getDecisionVersions,
    getVersion
} from "../../services/historyService";

const History = () => {

    const [loading, setLoading] = useState(true);

    const [decisions, setDecisions] = useState([]);

    const [selectedDecision, setSelectedDecision] = useState("");

    const [versions, setVersions] = useState([]);

    const [selectedVersion, setSelectedVersion] = useState(null);

    const [showModal, setShowModal] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {

        loadDecisions();

    }, []);

    useEffect(() => {

        if (selectedDecision) {

            loadVersions();

        }

    }, [selectedDecision]);

    const loadDecisions = async () => {

        try {

            const res = await getDecisions();

            setDecisions(res.data);

        }

        catch (err) {

            console.error(err);

            setError(
                "Unable to load decisions."
            );

        }

        finally {

            setLoading(false);

        }

    };

    const loadVersions = async () => {

        try {

            const res =
                await getDecisionVersions(
                    selectedDecision
                );

            setVersions(res.data);

        }

        catch (err) {

            console.error(err);

            setError(
                "Unable to load version history."
            );

        }

    };

    const handleView = async (versionNumber) => {

        try {

            const res =
                await getVersion(
                    selectedDecision,
                    versionNumber
                );

            setSelectedVersion(
                res.data
            );

            setShowModal(true);

        }

        catch (err) {

            console.error(err);

        }

    };

    if (loading) {

        return (

            <div className="text-center mt-5">

                <Spinner animation="border"/>

            </div>

        );

    }

        return (

        <div className="container-fluid py-4">

            <Card className="shadow border-0">

                <Card.Header className="bg-white">

                    <div className="d-flex justify-content-between align-items-center">

                        <h3 className="fw-bold text-primary mb-0">

                            <FaHistory className="me-2"/>

                            Version History

                        </h3>

                        <Badge bg="secondary">

                            {versions.length} Versions

                        </Badge>

                    </div>

                </Card.Header>

                <Card.Body>

                    {error &&

                        <Alert
                            variant="danger"
                            dismissible
                            onClose={() => setError("")}
                        >

                            {error}

                        </Alert>

                    }

                    <Form.Group className="mb-4">

                        <Form.Label>

                            <strong>Select Decision</strong>

                        </Form.Label>

                        <Form.Select

                            value={selectedDecision}

                            onChange={(e)=>

                                setSelectedDecision(

                                    e.target.value

                                )

                            }

                        >

                            <option value="">

                                Select Decision

                            </option>

                            {

                                decisions.map((decision)=>(

                                    <option

                                        key={decision.decision_id}

                                        value={decision.decision_id}

                                    >

                                        {decision.decision_title}

                                    </option>

                                ))

                            }

                        </Form.Select>

                    </Form.Group>

                    {

                        selectedDecision && (

                            versions.length === 0 ?

                            (

                                <Alert variant="info">

                                    No version history found.

                                </Alert>

                            )

                            :

                            <Table
                                striped
                                bordered
                                hover
                                responsive
                            >

                                <thead className="table-dark">

                                    <tr>

                                        <th>Version</th>

                                        <th>Title</th>

                                        <th>Status</th>

                                        <th>Modified By</th>

                                        <th>Modified At</th>

                                        <th>Action</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {

                                        versions.map((version)=>(

                                            <tr
                                                key={version.version_number}
                                            >

                                                <td>

                                                    <Badge bg="primary">

                                                        V{version.version_number}

                                                    </Badge>

                                                </td>

                                                <td>

                                                    {version.title}

                                                </td>

                                                <td>

                                                    <Badge bg="success">

                                                        {version.status}

                                                    </Badge>

                                                </td>

                                                <td>

                                                    {version.modified_by}

                                                </td>

                                                <td>

                                                    {

                                                        new Date(

                                                            version.modified_at

                                                        ).toLocaleString()

                                                    }

                                                </td>

                                                <td>

                                                    <Button

                                                        size="sm"

                                                        variant="outline-primary"

                                                        onClick={()=>

                                                            handleView(

                                                                version.version_number

                                                            )

                                                        }

                                                    >

                                                        <FaEye className="me-1"/>

                                                        View

                                                    </Button>

                                                </td>

                                            </tr>

                                        ))

                                    }

                                </tbody>

                            </Table>

                        )

                    }

                </Card.Body>

            </Card>

            <Modal

                show={showModal}

                onHide={() => setShowModal(false)}

                size="lg"

            >

                <Modal.Header closeButton>

                    <Modal.Title>

                        Decision Version Details

                    </Modal.Title>

                </Modal.Header>

                <Modal.Body>

                    {

                        selectedVersion &&

                        <>

                            <p>

                                <strong>

                                    Version:

                                </strong>

                                {" "}

                                {selectedVersion.version_number}

                            </p>

                            <p>

                                <strong>

                                    Title:

                                </strong>

                                {" "}

                                {selectedVersion.title}

                            </p>

                            <p>

                                <strong>

                                    Description:

                                </strong>

                                {" "}

                                {selectedVersion.description}

                            </p>

                            <p>

                                <strong>

                                    Status:

                                </strong>

                                {" "}

                                {selectedVersion.status}

                            </p>

                            <p>

                                <strong>

                                    Modified By:

                                </strong>

                                {" "}

                                {selectedVersion.modified_by}

                            </p>

                            <p>

                                <strong>

                                    Modified At:

                                </strong>

                                {" "}

                                {

                                    new Date(

                                        selectedVersion.modified_at

                                    ).toLocaleString()

                                }

                            </p>

                            <p>

                                <strong>

                                    Change Summary:

                                </strong>

                                {" "}

                                {selectedVersion.change_summary}

                            </p>

                        </>

                    }

                </Modal.Body>

                <Modal.Footer>

                    <Button

                        variant="secondary"

                        onClick={() => setShowModal(false)}

                    >

                        Close

                    </Button>

                </Modal.Footer>

            </Modal>

        </div>

    );

};

export default History;