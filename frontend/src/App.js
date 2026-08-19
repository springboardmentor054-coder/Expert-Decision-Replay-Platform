import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";

import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// ==========================
// Public Pages
// ==========================
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// ==========================
// Dashboard
// ==========================
import Dashboard from "./pages/dashboard/Dashboard";

// ==========================
// Decision Module
// ==========================
import Decisions from "./pages/decision/Decisions";
import DecisionDetails from "./pages/decision/DecisionDetails";
import SelectDecision from "./pages/decision/SelectDecision";
import EditDecision from "./pages/decision/EditDecision";
import DecisionHistory from "./pages/decision/DecisionHistory";

// ==========================
// Alternative Module
// ==========================
import Alternatives from "./pages/alternative/Alternatives";

// ==========================
// Criteria Module
// ==========================
import Criteria from "./pages/criteria/Criteria";

// ==========================
// Score Module
// ==========================
import Scores from "./pages/score/Scores";

// ==========================
// Recommendation Module
// ==========================
import Recommendation from "./pages/recommendation/Recommendation";

// ==========================
// Collaboration Module
// ==========================
import Documents from "./pages/document/Documents";
import Discussions from "./pages/discussion/Discussions";

// ==========================
// Version History
// ==========================
import History from "./pages/history/History";

// ==========================
// Approval Module
// ==========================
import PendingApprovals from "./pages/approval/PendingApprovals";
import ApprovalWorkflow from "./pages/approval/ApprovalWorkflow";
import ApprovalHistory from "./pages/approval/ApprovalHistory";

// ==========================
// Management Module
// ==========================
import Users from "./pages/user/Users";
import Profile from "./pages/profile/Profile";
import Reports from "./pages/Management/Reports";
import TeamManagement from "./pages/Management/TeamManagement";
import AuditLogs from "./pages/Management/AuditLogs";

// ==========================
// Knowledge Repository
// ==========================
import KnowledgeRepository from "./pages/Knowledge/KnowledgeRepository";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==========================
            Public Routes
        ========================== */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==========================
            Protected Layout
        ========================== */}

        <Route element={<Layout />}>

          {/* ==========================
              Dashboard
          ========================== */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* ==========================
              Decision Module
          ========================== */}

          <Route
            path="/decisions"
            element={<Decisions />}
          />

          <Route
            path="/decisions/:decisionId"
            element={<DecisionDetails />}
          />

          <Route
            path="/select-decision"
            element={<SelectDecision />}
          />

          <Route
            path="/decisions/:decisionId/edit"
            element={<EditDecision />}
          />

          <Route
            path="/decisions/:decisionId/history"
            element={<DecisionHistory />}
          />

          {/* ==========================
              Alternative Module
          ========================== */}

          <Route
            path="/alternatives"
            element={<Alternatives />}
          />

          {/* ==========================
              Criteria Module
          ========================== */}

          <Route
            path="/criteria"
            element={<Criteria />}
          />

          {/* ==========================
              Score Module
          ========================== */}

          <Route
            path="/scores"
            element={<Scores />}
          />

          {/* ==========================
              Recommendation Module
          ========================== */}

          <Route
            path="/recommendation"
            element={<Recommendation />}
          />

          {/* ==========================
              Documents
          ========================== */}

          <Route
            path="/documents"
            element={<Documents />}
          />

          {/* ==========================
              Discussion
          ========================== */}

          <Route
            path="/discussion"
            element={<Discussions />}
          />

          {/* ==========================
              Version History
          ========================== */}

          <Route
            path="/history"
            element={<History />}
          />

          {/* ==========================
              Pending Approvals
          ========================== */}

          <Route
            path="/pending-approvals"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Reviewer",
                  "Manager",
                  "Admin"
                ]}
              >
                <PendingApprovals />
              </ProtectedRoute>
            }
          />

          {/* ==========================
              Approval History
          ========================== */}

          <Route
            path="/approval-history"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Reviewer",
                  "Manager",
                  "Admin"
                ]}
              >
                <ApprovalHistory />
              </ProtectedRoute>
            }
          />

          {/* ==========================
              Approval Workflow
          ========================== */}

          <Route
            path="/approval-workflow/:approvalId"
            element={<ApprovalWorkflow />}
          />

          {/* ==========================
              Users
          ========================== */}

          <Route
            path="/users"
            element={
              <ProtectedRoute
                allowedRoles={["Admin"]}
              >
                <Users />
              </ProtectedRoute>
            }
          />

          {/* ==========================
              Team Management
          ========================== */}

          <Route
            path="/team"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Manager"
                ]}
              >
                <TeamManagement />
              </ProtectedRoute>
            }
          />

          {/* ==========================
              Audit Logs
          ========================== */}

          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Manager"
                ]}
              >
                <AuditLogs />
              </ProtectedRoute>
            }
          />

          {/* ==========================
              Reports
          ========================== */}

          <Route
            path="/reports"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "Admin",
                  "Manager"
                ]}
              >
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* ==========================
              Knowledge Repository
          ========================== */}

          <Route
            path="/knowledge"
            element={<KnowledgeRepository />}
          />

          {/* ==========================
              Profile
          ========================== */}

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;