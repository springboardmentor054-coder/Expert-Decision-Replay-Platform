import React from "react";
import { Outlet, useLocation } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

import "../../styles/layout.css";

const Layout = () => {
  const location = useLocation();

  // Automatically display page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";

      case "/decisions":
        return "Decision Management";

      case "/alternatives":
        return "Alternatives";

      case "/criteria":
        return "Criteria";

      case "/scores":
        return "Alternative Scores";

      case "/recommendation":
        return "Recommendation Engine";

      case "/documents":
        return "Document Management";

      case "/discussion":
        return "Discussion";

      case "/history":
        return "Version History";

      case "/users":
        return "User Management";

      case "/profile":
        return "My Profile";

      default:
        return "Expert Decision Replay Platform";
    }
  };

  return (
    <div className="app-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="main-wrapper">

        {/* Top Navigation */}
        <Topbar title={getPageTitle()} />

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />

      </div>

    </div>
  );
};

export default Layout;