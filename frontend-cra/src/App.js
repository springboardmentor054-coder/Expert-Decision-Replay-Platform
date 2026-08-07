import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";

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


function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Don't show navbar on Login/Register pages
  if (location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register") {
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

      <div className="navbar-links">
        <Link to="/decisions">Decisions</Link>
        <Link to="/alternatives">Alternatives</Link>
        <Link to="/comparison">Comparison</Link>
        <Link to="/documents">Documents</Link>
        <Link to="/discussion">Discussion</Link>
        <Link to="/comments">Comments</Link>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </nav>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Navbar />

      <Routes>

        {/* Authentication */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Decision Routes */}
        <Route path="/decisions" element={<DecisionList />} />
        <Route path="/create-decision" element={<CreateDecision />} />
        <Route path="/edit-decision/:id" element={<EditDecision />} />
        <Route path="/decisions/:id/history" element={<VersionHistory />} />

        {/* Alternative Routes */}
        <Route path="/alternatives" element={<AlternativesList />} />
        <Route path="/add-alternative" element={<AddAlternative />} />
        <Route path="/edit-alternative/:id" element={<EditAlternative />} />

        {/* Comparison */}
        <Route path="/comparison" element={<ComparisonView />} />

        {/* Documents */}
        <Route path="/documents" element={<DocumentList />} />
        <Route path="/upload-document" element={<UploadDocument />} />

        {/* Discussion */}
        <Route path="/discussion" element={<Discussion />} />

        {/* Comments */}
        <Route path="/comments" element={<CommentsList />} />
        <Route path="/comments/add" element={<AddComment />} />
        <Route path="/comments/edit/:id" element={<EditComment />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;