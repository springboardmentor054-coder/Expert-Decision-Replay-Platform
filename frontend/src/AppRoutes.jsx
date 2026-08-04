import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/layout/Layout";

const Dashboard = () => <h2>Dashboard</h2>;
const Decisions = () => <h2>Decisions</h2>;
const Alternatives = () => <h2>Alternatives</h2>;
const Criteria = () => <h2>Criteria</h2>;
const Scores = () => <h2>Scores</h2>;
const Recommendation = () => <h2>Recommendation</h2>;
const Documents = () => <h2>Documents</h2>;
const Discussion = () => <h2>Discussion</h2>;
const History = () => <h2>History</h2>;
const Users = () => <h2>Users</h2>;
const Profile = () => <h2>Profile</h2>;

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="decisions" element={<Decisions />} />
                    <Route path="alternatives" element={<Alternatives />} />
                    <Route path="criteria" element={<Criteria />} />
                    <Route path="scores" element={<Scores />} />
                    <Route path="recommendation" element={<Recommendation />} />
                    <Route path="documents" element={<Documents />} />
                    <Route path="discussion" element={<Discussion />} />
                    <Route path="history" element={<History />} />
                    <Route path="users" element={<Users />} />
                    <Route path="profile" element={<Profile />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;