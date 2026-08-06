import { BrowserRouter, Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <BrowserRouter>
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