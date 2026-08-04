import React, { useEffect, useState } from "react";

import {
    Card,
    Table,
    Button,
    Form,
    Spinner,
    Alert
} from "react-bootstrap";

import {
    FaUpload,
    FaDownload,
    FaTrash,
    FaSearch,
    FaFilePdf,
    FaFileWord,
    FaFileExcel,
    FaFileImage,
    FaFile
} from "react-icons/fa";

import { getDecisions } from "../../services/decisionService";

import {
    getDocuments,
    uploadDocument,
    deleteDocument,
    downloadDocument
} from "../../services/documentService";

const Documents = () => {

    const [documents, setDocuments] = useState([]);

    const [decisions, setDecisions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [selectedDecision, setSelectedDecision] = useState("");

    const [search, setSearch] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);

    const [success, setSuccess] = useState("");

    const [error, setError] = useState("");

    // Change this after login integration
    const uploadedBy = 1;

    useEffect(() => {

        fetchData();

    }, []);

    const fetchData = async () => {

        try {

            const decisionRes =
                await getDecisions();

            const documentRes =
                await getDocuments();

            setDecisions(decisionRes.data);

            setDocuments(documentRes.data);

        }

        catch (err) {

            console.error(err);

            setError("Failed to load data.");

        }

        finally {

            setLoading(false);

        }

    };

    // Upload Document

    const handleUpload = async () => {

        if (!selectedDecision) {

            setError("Please select a decision.");

            return;

        }

        if (!selectedFile) {

            setError("Please choose a file.");

            return;

        }

        const formData = new FormData();

        formData.append(
            "decision_id",
            selectedDecision
        );

        formData.append(
            "uploaded_by",
            uploadedBy
        );

        formData.append(
            "file",
            selectedFile
        );

        try {

            await uploadDocument(formData);

            setSuccess(
                "Document uploaded successfully."
            );

            setSelectedFile(null);

            fetchData();

        }

        catch (err) {

            console.error(err);

            setError(
                "Upload failed."
            );

        }

    };

    // Delete

    const handleDelete = async (id) => {

        if (!window.confirm(
            "Delete this document?"
        )) return;

        try {

            await deleteDocument(id);

            setSuccess(
                "Document deleted."
            );

            fetchData();

        }

        catch (err) {

            console.error(err);

            setError(
                "Delete failed."
            );

        }

    };

    // Download

    const handleDownload = (id) => {

        downloadDocument(id);

    };

    // Search + Filter

    const filteredDocuments = documents.filter((doc) => {

        const matchDecision =
            selectedDecision === "" ||
            doc.decision_id === Number(selectedDecision);

        const matchSearch =
            doc.file_name
                .toLowerCase()
                .includes(search.toLowerCase());

        return (
            matchDecision &&
            matchSearch
        );

    });

    const getFileIcon = (type) => {

        if (!type)
            return <FaFile />;

        if (type.includes("pdf"))
            return (
                <FaFilePdf
                    className="text-danger"
                />
            );

        if (type.includes("word"))
            return (
                <FaFileWord
                    className="text-primary"
                />
            );

        if (
            type.includes("excel") ||
            type.includes("sheet")
        )
            return (
                <FaFileExcel
                    className="text-success"
                />
            );

        if (
            type.includes("image")
        )
            return (
                <FaFileImage
                    className="text-warning"
                />
            );

        return <FaFile />;

    };

        if (loading) {

        return (

            <div className="text-center mt-5">

                <Spinner animation="border" />

            </div>

        );

    }

    return (

        <div className="container-fluid py-4">

            <Card className="shadow">

                <Card.Header className="d-flex justify-content-between align-items-center">

                    <h3 className="fw-bold text-primary">

                        Document Management

                    </h3>

                </Card.Header>

                <Card.Body>

                    {
                        success &&
                        <Alert
                            variant="success"
                            onClose={() => setSuccess("")}
                            dismissible
                        >
                            {success}
                        </Alert>
                    }

                    {
                        error &&
                        <Alert
                            variant="danger"
                            onClose={() => setError("")}
                            dismissible
                        >
                            {error}
                        </Alert>
                    }

                    {/* Upload Section */}

                    <Card className="mb-4">

                        <Card.Body>

                            <div className="row">

                                <div className="col-md-4">

                                    <Form.Label>

                                        Decision

                                    </Form.Label>

                                    <Form.Select

                                        value={selectedDecision}

                                        onChange={(e) =>
                                            setSelectedDecision(
                                                e.target.value
                                            )
                                        }

                                    >

                                        <option value="">

                                            Select Decision

                                        </option>

                                        {

                                            decisions.map((decision) => (

                                                <option

                                                    key={
                                                        decision.decision_id
                                                    }

                                                    value={
                                                        decision.decision_id
                                                    }

                                                >

                                                    {
                                                        decision.decision_title
                                                    }

                                                </option>

                                            ))

                                        }

                                    </Form.Select>

                                </div>

                                <div className="col-md-5">

                                    <Form.Label>

                                        Choose File

                                    </Form.Label>

                                    <Form.Control

                                        type="file"

                                        onChange={(e) =>
                                            setSelectedFile(
                                                e.target.files[0]
                                            )
                                        }

                                    />

                                </div>

                                <div className="col-md-3 d-flex align-items-end">

                                    <Button

                                        className="w-100"

                                        onClick={handleUpload}

                                    >

                                        <FaUpload className="me-2"/>

                                        Upload

                                    </Button>

                                </div>

                            </div>

                        </Card.Body>

                    </Card>

                    {/* Search */}

                    <div className="row mb-3">

                        <div className="col-md-4">

                            <div className="input-group">

                                <span className="input-group-text">

                                    <FaSearch/>

                                </span>

                                <Form.Control

                                    placeholder="Search document..."

                                    value={search}

                                    onChange={(e)=>
                                        setSearch(
                                            e.target.value
                                        )
                                    }

                                />

                            </div>

                        </div>

                    </div>

                    {/* Documents Table */}

                    <Table

                        striped

                        bordered

                        hover

                        responsive

                    >

                        <thead className="table-dark">

                            <tr>

                                <th>ID</th>

                                <th>File</th>

                                <th>Decision</th>

                                <th>Uploaded By</th>

                                <th>Date</th>

                                <th width="220">

                                    Actions

                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            {

                                filteredDocuments.length === 0 ?

                                (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            className="text-center"
                                        >

                                            No Documents Found

                                        </td>

                                    </tr>

                                )

                                :

                                filteredDocuments.map((doc)=>(

                                    <tr
                                        key={doc.document_id}
                                    >

                                        <td>

                                            {doc.document_id}

                                        </td>

                                        <td>

                                            {getFileIcon(doc.file_type)}

                                            {" "}

                                            {doc.file_name}

                                        </td>

                                        <td>

                                            {doc.decision_title}

                                        </td>

                                        <td>

                                            {doc.uploaded_by}

                                        </td>

                                        <td>

                                            {

                                                new Date(
                                                    doc.uploaded_at
                                                ).toLocaleDateString()

                                            }

                                        </td>

                                        <td>

                                            <Button

                                                variant="success"

                                                size="sm"

                                                className="me-2"

                                                onClick={()=>

                                                    handleDownload(
                                                        doc.document_id
                                                    )

                                                }

                                            >

                                                <FaDownload/>

                                            </Button>

                                            <Button

                                                variant="danger"

                                                size="sm"

                                                onClick={()=>

                                                    handleDelete(
                                                        doc.document_id
                                                    )

                                                }

                                            >

                                                <FaTrash/>

                                            </Button>

                                        </td>

                                    </tr>

                                ))

                            }

                        </tbody>

                    </Table>

                </Card.Body>

            </Card>

        </div>

    );

};

export default Documents;