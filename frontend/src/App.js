import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import CreateDecision from "./pages/CreateDecision";
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
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";

import PendingApprovals from "./pages/PendingApprovals";
import ApprovalDetails from "./pages/ApprovalDetails";
import ApprovalHistory from "./pages/ApprovalHistory";

import Notifications from "./pages/Notifications";

import AuditLogs from "./pages/AuditLogs";

import Reports from "./pages/Reports";


function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* ========================= */}
        {/* HOME / DASHBOARD ROUTE */}
        {/* ========================= */}

        <Route
          path="/"
          element={<Dashboard />}
        />


        {/* ========================= */}
        {/* AUTHENTICATION ROUTES */}
        {/* ========================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ========================= */}
        {/* DASHBOARD ROUTE */}
        {/* ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* ========================= */}
        {/* DECISION ROUTES */}
        {/* ========================= */}

        <Route
          path="/create-decision"
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
        {/* ALTERNATIVE ROUTES */}
        {/* ========================= */}

        <Route
          path="/alternatives"
          element={<Alternatives />}
        />

        <Route
          path="/alternatives/:id"
          element={<Alternatives />}
        />

        <Route
          path="/add-alternative"
          element={<AddAlternative />}
        />

        <Route
          path="/add-alternative/:id"
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

        <Route
          path="/alternative-comparison/:id"
          element={<AlternativeComparison />}
        />


        {/* ========================= */}
        {/* DOCUMENT ROUTES */}
        {/* ========================= */}

        <Route
          path="/documents"
          element={<Documents />}
        />

        <Route
          path="/documents/:id"
          element={<Documents />}
        />

        <Route
          path="/upload-document/:id"
          element={<UploadDocument />}
        />


        {/* ========================= */}
        {/* APPROVAL ROUTES */}
        {/* ========================= */}

        <Route
          path="/approvals"
          element={<PendingApprovals />}
        />

        <Route
          path="/approval/:id"
          element={<ApprovalDetails />}
        />

        <Route
          path="/approval-history"
          element={<ApprovalHistory />}
        />


        {/* ========================= */}
        {/* NOTIFICATION ROUTE */}
        {/* ========================= */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />


        {/* ========================= */}
        {/* AUDIT LOG ROUTE */}
        {/* ========================= */}

        <Route
          path="/audit-logs"
          element={<AuditLogs />}
        />


        {/* ========================= */}
        {/* REPORTS ROUTE */}
        {/* ========================= */}

        <Route
          path="/reports"
          element={<Reports />}
        />

      </Routes>

    </BrowserRouter>

  );

}


export default App;