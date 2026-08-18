import "./App.css";

import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

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

import Profile from "./pages/Profile";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ================================= */}
                {/* AUTHENTICATION ROUTES             */}
                {/* NO SIDEBAR                       */}
                {/* ================================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ================================= */}
                {/* APPLICATION ROUTES               */}
                {/* SIDEBAR + MAIN CONTENT           */}
                {/* ================================= */}

                <Route element={<MainLayout />}>


                    {/* ========================= */}
                    {/* DASHBOARD */}
                    {/* ========================= */}

                    <Route
                        path="/"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />


                    {/* ========================= */}
                    {/* PROFILE */}
                    {/* ========================= */}

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />


                    {/* ========================= */}
                    {/* DECISIONS */}
                    {/* ========================= */}

                    <Route
                        path="/decisions"
                        element={<Decisions />}
                    />

                    <Route
                        path="/create-decision"
                        element={<CreateDecision />}
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
                    {/* ALTERNATIVES */}
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
                    {/* DOCUMENTS */}
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
                    {/* APPROVALS */}
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
                    {/* NOTIFICATIONS */}
                    {/* ========================= */}

                    <Route
                        path="/notifications"
                        element={<Notifications />}
                    />


                    {/* ========================= */}
                    {/* AUDIT LOGS */}
                    {/* ========================= */}

                    <Route
                        path="/audit-logs"
                        element={<AuditLogs />}
                    />


                    {/* ========================= */}
                    {/* REPORTS */}
                    {/* ========================= */}

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