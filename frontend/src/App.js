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
import Login from "./pages/Login";


function App() {

  return (

    <BrowserRouter>

      <Routes>


        {/* ========================= */}
        {/* Decision Routes */}
        {/* ========================= */}

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


        {/* ========================= */}
        {/* Alternative Routes */}
        {/* ========================= */}

        {/* All Alternatives */}

        <Route
          path="/alternatives"
          element={<Alternatives />}
        />


        {/* Decision-Specific Alternatives */}

        <Route
          path="/alternatives/:id"
          element={<Alternatives />}
        />


        {/* Add Alternative */}

        <Route
          path="/add-alternative"
          element={<AddAlternative />}
        />


        {/* Edit Alternative */}

        <Route
          path="/edit-alternative/:id"
          element={<EditAlternative />}
        />


        {/* Compare All Alternatives */}

        <Route
          path="/alternative-comparison"
          element={<AlternativeComparison />}
        />


        {/* Compare Alternatives for Specific Decision */}

        <Route
          path="/alternative-comparison/:id"
          element={<AlternativeComparison />}
        />


        {/* ========================= */}
        {/* Document Routes */}
        {/* ========================= */}

        {/* All Documents */}

        <Route
          path="/documents"
          element={<Documents />}
        />


        {/* Decision-Specific Documents */}

        <Route
          path="/documents/:id"
          element={<Documents />}
        />


        {/* Upload Document for Specific Decision */}

        <Route
          path="/upload-document/:id"
          element={<UploadDocument />}
        />


        {/* ========================= */}
        {/* Login Route */}
        {/* ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />


      </Routes>

    </BrowserRouter>

  );

}


export default App;