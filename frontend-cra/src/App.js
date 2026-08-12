import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
  Navigate,
  Outlet
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/register";

import DecisionList from "./pages/DecisionList";
import CreateDecision from "./pages/CreateDecision";
import EditDecision from "./pages/EditDecision";

import AlternativesList from "./pages/AlternativesList";
import AddAlternative from "./pages/AddAlternative";
import EditAlternative from "./pages/EditAlternative";

import ComparisonView from "./pages/ComparisonView";

import UploadDocument from "./pages/UploadDocument";
import DocumentList from "./pages/DocumentList";

import Discussion from "./pages/Discussion";

import CommentsList from "./pages/CommentsList";
import AddComment from "./pages/AddComment";
import EditComment from "./pages/EditComment";

import VersionHistory from "./pages/VersionHistory";
import Notifications from "./pages/Notifications";
import AuditLogs from "./pages/AuditLogs";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";


/* =========================
   PROTECTED ROUTE
========================= */

function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}


/* =========================
   NAVBAR
========================= */

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show navbar on Login/Register pages
  if (
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register"
  ) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">

      <div className="navbar-brand">
        <Link to="/decisions">
          Expert Decision
        </Link>
      </div>

      <Link to="/dashboard">Dashboard</Link>

      <div className="navbar-links">

        <Link to="/decisions">Decisions</Link>

        <Link to="/alternatives">Alternatives</Link>

        <Link to="/comparison">Comparison</Link>

        <Link to="/documents">Documents</Link>

        <Link to="/discussion">Discussion</Link>

        <Link to="/comments">Comments</Link>

        <Link to="/notifications">Notifications</Link>

        <Link to="/audit-logs">Audit Logs</Link>

        <Link to="/reports">Reports</Link>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </nav>
  );
}


/* =========================
   APP
========================= */

function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* =========================
            PUBLIC ROUTES
        ========================= */}

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />


        {/* =========================
            PROTECTED ROUTES
        ========================= */}

        <Route element={<ProtectedRoute />}>

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* =========================
              DECISION ROUTES
          ========================= */}

          <Route
            path="/decisions"
            element={<DecisionList />}
          />

          <Route
            path="/create-decision"
            element={<CreateDecision />}
          />

          <Route
            path="/edit-decision/:id"
            element={<EditDecision />}
          />

          <Route
            path="/decisions/:id/history"
            element={<VersionHistory />}
          />


          {/* =========================
              ALTERNATIVE ROUTES
          ========================= */}

          <Route
            path="/alternatives"
            element={<AlternativesList />}
          />

          <Route
            path="/add-alternative"
            element={<AddAlternative />}
          />

          <Route
            path="/edit-alternative/:id"
            element={<EditAlternative />}
          />


          {/* =========================
              COMPARISON
          ========================= */}

          <Route
            path="/comparison"
            element={<ComparisonView />}
          />


          {/* =========================
              DOCUMENTS
          ========================= */}

          <Route
            path="/documents"
            element={<DocumentList />}
          />

          <Route
            path="/upload-document"
            element={<UploadDocument />}
          />


          {/* =========================
              DISCUSSION
          ========================= */}

          <Route
            path="/discussion"
            element={<Discussion />}
          />


          {/* =========================
              COMMENTS
          ========================= */}

          <Route
            path="/comments"
            element={<CommentsList />}
          />

          <Route
            path="/comments/add"
            element={<AddComment />}
          />

          <Route
            path="/comments/edit/:id"
            element={<EditComment />}
          />


          {/* =========================
              NOTIFICATIONS
          ========================= */}

          <Route
            path="/notifications"
            element={<Notifications />}
          />


          {/* =========================
              AUDIT LOGS
          ========================= */}

          <Route
            path="/audit-logs"
            element={<AuditLogs />}
          />


          {/* =========================
              REPORTS
          ========================= */}

          <Route
            path="/reports"
            element={<Reports />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;