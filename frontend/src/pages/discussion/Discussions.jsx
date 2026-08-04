import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge
} from "react-bootstrap";

import {
  FaComments,
  FaPaperPlane,
  FaUserCircle,
  FaEdit,
  FaTrash
} from "react-icons/fa";

import { getDecisions } from "../../services/decisionService";

import {
  getDecisionDiscussions,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion
} from "../../services/discussionService";

const Discussions = () => {

  const [loading, setLoading] = useState(true);

  const [decisions, setDecisions] = useState([]);

  const [selectedDecision, setSelectedDecision] = useState("");

  const [discussions, setDiscussions] = useState([]);

  const [comment, setComment] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  const currentUser = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {

    loadDecisions();

  }, []);

  useEffect(() => {

    if (selectedDecision) {

      loadDiscussions();

    }

  }, [selectedDecision]);

  const loadDecisions = async () => {

    try {

      const res = await getDecisions();

      setDecisions(res.data);

    }

    catch (err) {

      console.error(err);

      setError("Failed to load decisions.");

    }

    finally {

      setLoading(false);

    }

  };

  const loadDiscussions = async () => {

    try {

      const res =
        await getDecisionDiscussions(
          selectedDecision
        );

      setDiscussions(res.data);

    }

    catch (err) {

      console.error(err);

      setError("Failed to load discussions.");

    }

  };

  const handleSubmit = async () => {

    if (!comment.trim()) {

      setError("Please enter a comment.");

      return;

    }

    try {

      if (editingId) {

        await updateDiscussion(

          editingId,

          {

            comment

          }

        );

        setSuccess(
          "Comment updated successfully."
        );

      }

      else {

        await createDiscussion({

          decision_id: Number(selectedDecision),

          user_id: currentUser.user_id,

          comment

        });

        setSuccess(
          "Comment added successfully."
        );

      }

      setComment("");

      setEditingId(null);

      loadDiscussions();

    }

    catch (err) {

      console.error(err);

      setError("Operation failed.");

    }

  };

  const handleEdit = (discussion) => {

    setEditingId(
      discussion.discussion_id
    );

    setComment(
      discussion.comment
    );

    window.scrollTo({

      top: 0,

      behavior: "smooth"

    });

  };

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Delete this comment?"
      )
    ) return;

    try {

      await deleteDiscussion(id);

      setSuccess(
        "Comment deleted successfully."
      );

      loadDiscussions();

    }

    catch (err) {

    console.error(err);

    console.log("Response:", err.response);

    if (err.response) {

        console.log("Status:", err.response.status);

        console.log("Data:", err.response.data);

        setError(
            JSON.stringify(err.response.data)
        );

    }

    else {

        setError(err.message);

    }

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

              <FaComments className="me-2"/>

              Discussion Board

            </h3>

            <Badge bg="secondary">

              {discussions.length} Comments

            </Badge>

          </div>

        </Card.Header>

        <Card.Body>

          {success && (

            <Alert
              variant="success"
              dismissible
              onClose={() => setSuccess("")}
            >
              {success}
            </Alert>

          )}

          {error && (

            <Alert
              variant="danger"
              dismissible
              onClose={() => setError("")}
            >
              {error}
            </Alert>

          )}

          <Form.Group className="mb-4">

            <Form.Label>

              <strong>Select Decision</strong>

            </Form.Label>

            <Form.Select
              value={selectedDecision}
              onChange={(e) =>
                setSelectedDecision(e.target.value)
              }
            >

              <option value="">
                Select Decision
              </option>

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

          {selectedDecision && (

            <>

              <Card className="mb-4">

                <Card.Body>

                  <Form.Group>

                    <Form.Label>

                      <strong>

                        {editingId
                          ? "Edit Comment"
                          : "New Comment"}

                      </strong>

                    </Form.Label>

                    <Form.Control

                      as="textarea"

                      rows={4}

                      value={comment}

                      placeholder="Write your comment..."

                      onChange={(e) =>
                        setComment(e.target.value)
                      }

                    />

                  </Form.Group>

                  <div className="mt-3">

                    <Button
                      onClick={handleSubmit}
                    >

                      <FaPaperPlane className="me-2"/>

                      {editingId
                        ? "Update Comment"
                        : "Post Comment"}

                    </Button>

                  </div>

                </Card.Body>

              </Card>

              <h5 className="mb-3">

                Discussion Timeline

              </h5>

              {

                discussions.length === 0 ?

                (

                  <Alert variant="info">

                    No discussion available.

                  </Alert>

                )

                :

                discussions.map((item) => {

                  const canEdit =

                    currentUser?.role === "Admin" ||

                    currentUser?.user_id === item.user_id;

                  return (

                    <Card
                      className="mb-3 shadow-sm"
                      key={item.discussion_id}
                    >

                      <Card.Body>

                        <div className="d-flex justify-content-between">

                          <div>

                            <h6 className="mb-1">

                              <FaUserCircle className="text-primary me-2"/>

                              {

                                currentUser?.user_id === item.user_id

                                ?

                                "You"

                                :

                                item.username

                              }

                            </h6>

                            <Badge bg="primary">

                              {

                                item.discussion_type ||

                                "Comment"

                              }

                            </Badge>

                          </div>

                          <small className="text-muted">

                            {

                              new Date(

                                item.created_at

                              ).toLocaleString()

                            }

                          </small>

                        </div>

                        <hr/>

                        <p className="mb-3">

                          {item.comment}

                        </p>

                        {

                          canEdit &&

                          <>

                            <Button

                              variant="outline-warning"

                              size="sm"

                              className="me-2"

                              onClick={() =>
                                handleEdit(item)
                              }

                            >

                              <FaEdit className="me-1"/>

                              Edit

                            </Button>

                            <Button

                              variant="outline-danger"

                              size="sm"

                              onClick={() =>
                                handleDelete(
                                  item.discussion_id
                                )
                              }

                            >

                              <FaTrash className="me-1"/>

                              Delete

                            </Button>

                          </>

                        }

                      </Card.Body>

                    </Card>

                  );

                })

              }

            </>

          )}

        </Card.Body>

      </Card>

    </div>

  );

};

export default Discussions;