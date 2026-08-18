import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Spinner,
  Modal
} from "react-bootstrap";
import {
  FaUsers,
  FaSearch,
  FaEye,
  FaTrash
} from "react-icons/fa";
import {
  getUsers,
  updateRole,
  deleteUser
} from "../../services/teamService";

const TeamManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const loggedRole = loggedUser?.role || "User";

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ==========================
  // Pagination
  // ==========================
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  // ==========================
  // Load Users
  // ==========================
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ==========================
  // View User
  // ==========================
  const handleView = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // ==========================
  // Change Role
  // ==========================
  const handleRoleChange = async (id, role) => {
    try {
      await updateRole(id, role);
      loadUsers();
    } catch (error) {
      console.error(error);
      alert("Unable to update role.");
    }
  };

  // ==========================
  // Delete User
  // ==========================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) {
      return;
    }
    try {
      await deleteUser(id);
      loadUsers();
    } catch (error) {
      console.error(error);
      alert("Unable to delete user.");
    }
  };

  // ==========================
  // Search + Filter
  // ==========================
  useEffect(() => {
    let filtered = users;

    if (search !== "") {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(search.toLowerCase()) ||
          user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "All") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to page 1 when filtering
  }, [users, search, roleFilter]);

  // ==========================
  // Pagination Logic
  // ==========================
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;

  return (
    <div className="container-fluid py-4 px-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="fw-bold text-primary mb-0">
            <FaUsers className="me-2" />
            Team Management
          </h4>
        </Card.Header>

        <Card.Body>
          {/* Step 6: Statistics Cards (5 Cards in Responsive Grid) */}
          <div className="row mb-4 g-3">
            <div className="col">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h6>Total Users</h6>
                  <h2>{users.length}</h2>
                </Card.Body>
              </Card>
            </div>

            <div className="col">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h6>Admins</h6>
                  <h2 className="text-danger">
                    {users.filter((u) => u.role === "Admin").length}
                  </h2>
                </Card.Body>
              </Card>
            </div>

            <div className="col">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h6>Managers</h6>
                  <h2 className="text-primary">
                    {users.filter((u) => u.role === "Manager").length}
                  </h2>
                </Card.Body>
              </Card>
            </div>

            <div className="col">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h6>Reviewers</h6>
                  <h2 className="text-success">
                    {users.filter((u) => u.role === "Reviewer").length}
                  </h2>
                </Card.Body>
              </Card>
            </div>

            <div className="col">
              <Card className="border-0 shadow-sm text-center">
                <Card.Body>
                  <h6>Users</h6>
                  <h2 className="text-secondary">
                    {users.filter((u) => u.role === "User").length}
                  </h2>
                </Card.Body>
              </Card>
            </div>
          </div>

          {/* Search and Role Filter */}
          <div className="row mb-3">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <Form.Control
                  placeholder="Search user..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Reviewer">Reviewer</option>
                <option value="User">User</option>
              </Form.Select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              <Table bordered hover striped responsive>
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th width="260">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center">
                        No Users Found
                      </td>
                    </tr>
                  ) : (
                    /* Replace Table Mapping & Use Index Row Number */
                    currentUsers.map((user, index) => (
                      <tr key={user.user_id}>
                        {/* Step 4: Serial Number Row */}
                        <td>{indexOfFirstUser + index + 1}</td>
                        <td>{user.username}</td>
                        <td>{user.email}</td>
                        {/* Step 5: Role Badges */}
                        <td>
                          <span
                            className={`badge ${
                              user.role === "Admin"
                                ? "bg-danger"
                                : user.role === "Manager"
                                ? "bg-primary"
                                : user.role === "Reviewer"
                                ? "bg-success"
                                : "bg-secondary"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => handleView(user)}
                          >
                            <FaEye />
                          </Button>

                          {loggedRole === "Admin" && (
                            <>
                              <Form.Select
                                size="sm"
                                className="d-inline w-auto me-2"
                                value={user.role}
                                onChange={(e) =>
                                  handleRoleChange(
                                    user.user_id,
                                    e.target.value
                                  )
                                }
                              >
                                <option value="Admin">Admin</option>
                                <option value="Manager">Manager</option>
                                <option value="Reviewer">Reviewer</option>
                                <option value="User">User</option>
                              </Form.Select>

                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleDelete(user.user_id)}
                              >
                                <FaTrash />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {/* Step 7: Pagination Footer */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <p className="mb-0">
                  Showing{" "}
                  <strong>
                    {filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1}
                  </strong>{" "}
                  -{" "}
                  <strong>
                    {Math.min(indexOfLastUser, filteredUsers.length)}
                  </strong>{" "}
                  of <strong>{filteredUsers.length}</strong> Users
                </p>
                <div>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className="mx-3">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* User Details Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>User Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedUser && (
                <>
                  <p>
                    <strong>ID:</strong> {selectedUser.user_id}
                  </p>
                  <p>
                    <strong>Username:</strong> {selectedUser.username}
                  </p>
                  <p>
                    <strong>Email:</strong> {selectedUser.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {selectedUser.role}
                  </p>
                </>
              )}
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default TeamManagement;