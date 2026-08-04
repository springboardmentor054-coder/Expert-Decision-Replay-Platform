import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const initialState = {
    user_id: "",
    decision_title: "",
    decision_description: "",
};

const DecisionForm = ({
    show,
    handleClose,
    handleSubmit,
    editingDecision,
}) => {

    const [formData, setFormData] = useState(initialState);

    useEffect(() => {

        if (editingDecision) {

            setFormData({
                user_id: editingDecision.user_id || "",
                decision_title: editingDecision.decision_title || "",
                decision_description:
                    editingDecision.decision_description || "",
            });

        } else {

            setFormData(initialState);

        }

    }, [editingDecision, show]);

    const onChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

    };

    const submit = (e) => {

        e.preventDefault();

        handleSubmit(formData);

    };

    return (

        <Modal show={show} onHide={handleClose} centered>

            <Modal.Header closeButton>

                <Modal.Title>

                    {editingDecision
                        ? "Edit Decision"
                        : "Add Decision"}

                </Modal.Title>

            </Modal.Header>

            <Form onSubmit={submit}>

                <Modal.Body>

                    <Form.Group className="mb-3">

                        <Form.Label>User ID</Form.Label>

                        <Form.Control
                            type="number"
                            name="user_id"
                            value={formData.user_id}
                            onChange={onChange}
                            required
                        />

                    </Form.Group>

                    <Form.Group className="mb-3">

                        <Form.Label>Decision Title</Form.Label>

                        <Form.Control
                            type="text"
                            name="decision_title"
                            value={formData.decision_title}
                            onChange={onChange}
                            required
                        />

                    </Form.Group>

                    <Form.Group>

                        <Form.Label>Description</Form.Label>

                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="decision_description"
                            value={formData.decision_description}
                            onChange={onChange}
                            required
                        />

                    </Form.Group>

                </Modal.Body>

                <Modal.Footer>

                    <Button
                        variant="secondary"
                        onClick={handleClose}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="primary"
                        type="submit"
                    >
                        {editingDecision
                            ? "Update"
                            : "Save"}
                    </Button>

                </Modal.Footer>

            </Form>

        </Modal>

    );

};

export default DecisionForm;