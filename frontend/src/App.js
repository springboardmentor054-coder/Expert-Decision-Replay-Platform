import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateDecision from './pages/CreateDecision';
import Decisions from "./pages/Decisions";
import EditDecision from "./pages/EditDecision";
import DecisionDetails from "./pages/DecisionDetails";
import VersionHistory from "./pages/VersionHistory";

import AddAlternative from "./pages/AddAlternative";
import Alternatives from "./pages/Alternatives";
import EditAlternative from "./pages/EditAlternative";
import AlternativeComparison from "./pages/AlternativeComparison";

import Documents from "./pages/Documents";
import UploadDocument from "./pages/UploadDocument";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        {/* Decision Routes */}
        <Route
          path="/"
          element={<CreateDecision />}
        />

        <Route
          path="/decisions"
          element={<Decisions />}
        />

        <Route
          path="/decision/:id"
          element={<DecisionDetails />}
        />

        <Route
          path="/decision/:id/history"
          element={<VersionHistory />}
        />

        <Route
          path="/edit/:id"
          element={<EditDecision />}
        />

        {/* Alternative Routes */}
        <Route
          path="/alternatives"
          element={<Alternatives />}
        />

        <Route
          path="/add-alternative"
          element={<AddAlternative />}
        />

        <Route
          path="/edit-alternative/:id"
          element={<EditAlternative />}
        />

        <Route
          path="/alternative-comparison"
          element={<AlternativeComparison />}
        />

        {/* Document Routes */}
        <Route
          path="/documents"
          element={<Documents />}
        />

        <Route
          path="/upload-document/:id"
          element={<UploadDocument />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;