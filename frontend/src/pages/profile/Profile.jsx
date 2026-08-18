import React from "react";
import {
  Card,
  Row,
  Col,
  Badge
} from "react-bootstrap";

import {
  FaUserCircle,
  FaEnvelope,
  FaUserTag,
  FaIdBadge
} from "react-icons/fa";

const Profile = () => {

  const storedUser =
    localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  if (!user) {

    return (
      <div className="container-fluid py-4">

        <Card className="shadow-sm">

          <Card.Body>

            <h4>
              My Profile
            </h4>

            <p className="text-muted mb-0">
              No user information found.
            </p>

          </Card.Body>

        </Card>

      </div>
    );

  }

  return (

    <div className="container-fluid py-4">

      <Card className="shadow-sm">

        <Card.Header>

          <h4 className="mb-0">

            <FaUserCircle className="me-2" />

            My Profile

          </h4>

        </Card.Header>


        <Card.Body>

          <Row>

            {/* Profile Icon */}

            <Col
              md={3}
              className="text-center mb-4"
            >

              <FaUserCircle
                size={120}
                className="text-primary"
              />

              <h4 className="mt-3">

                {user.username || "User"}

              </h4>

              <Badge bg="primary">

                {user.role || "User"}

              </Badge>

            </Col>


            {/* User Information */}

            <Col md={9}>

              <Card className="border">

                <Card.Body>

                  <h5 className="mb-4">

                    Account Information

                  </h5>


                  {/* User ID */}

                  <Row className="mb-3">

                    <Col md={4}>

                      <strong>

                        <FaIdBadge className="me-2" />

                        User ID

                      </strong>

                    </Col>

                    <Col md={8}>

                      {user.user_id || "-"}

                    </Col>

                  </Row>


                  {/* Username */}

                  <Row className="mb-3">

                    <Col md={4}>

                      <strong>

                        <FaUserCircle className="me-2" />

                        Username

                      </strong>

                    </Col>

                    <Col md={8}>

                      {user.username || "-"}

                    </Col>

                  </Row>


                  {/* Email */}

                  <Row className="mb-3">

                    <Col md={4}>

                      <strong>

                        <FaEnvelope className="me-2" />

                        Email

                      </strong>

                    </Col>

                    <Col md={8}>

                      {user.email || "-"}

                    </Col>

                  </Row>


                  {/* Role */}

                  <Row className="mb-3">

                    <Col md={4}>

                      <strong>

                        <FaUserTag className="me-2" />

                        Role

                      </strong>

                    </Col>

                    <Col md={8}>

                      <Badge bg="secondary">

                        {user.role || "User"}

                      </Badge>

                    </Col>

                  </Row>

                </Card.Body>

              </Card>

            </Col>

          </Row>

        </Card.Body>

      </Card>

    </div>

  );

};

export default Profile;