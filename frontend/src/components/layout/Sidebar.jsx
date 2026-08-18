import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaListAlt,
  FaBalanceScale,
  FaStar,
  FaChartBar,
  FaFileAlt,
  FaComments,
  FaHistory,
  FaUsers,
  FaUserCircle,
  FaSignOutAlt
} from "react-icons/fa";

import "../../styles/sidebar.css";

import { FaBook } from "react-icons/fa";

const Sidebar = () => {

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  const role = user?.role || "User";

  const menuItems = [

    // ==========================
    // Dashboard
    // ==========================

    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />
    },

    // ==========================
    // USER
    // ==========================
// ==========================
// Decision Management
// Available to ALL roles
// ==========================

{
  heading: "Decision Management"
},

{
  title: "Decisions",
  path: "/decisions",
  icon: <FaClipboardList />
},

{
  title: "Alternatives",
  path: "/alternatives",
  icon: <FaListAlt />
},

{
  title: "Criteria",
  path: "/criteria",
  icon: <FaBalanceScale />
},

{
  title: "Scores",
  path: "/scores",
  icon: <FaStar />
},

{
  title: "Recommendation",
  path: "/recommendation",
  icon: <FaChartBar />
},

// ==========================
// Collaboration
// Available to ALL roles
// ==========================

{
  heading: "Collaboration"
},

{
  title: "Documents",
  path: "/documents",
  icon: <FaFileAlt />
},

{
  title: "Discussion",
  path: "/discussion",
  icon: <FaComments />
},

{
  title: "Version History",
  path: "/history",
  icon: <FaHistory />
},

{
  title: "Knowledge Repository",
  path: "/knowledge",
  icon: <FaBook />
},
    // ==========================
// REVIEWER
// ==========================

...(role === "Reviewer"
  ? [

      {
        heading: "Approval Workflow"
      },

      {
        title: "Pending Approvals",
        path: "/pending-approvals",
        icon: <FaClipboardList />
      },

      {
        title: "Approval History",
        path: "/approval-history",
        icon: <FaHistory />
      }

    ]
  : []),

    // ==========================
// MANAGER
// ==========================

...(role === "Manager"
  ? [

      {
        heading: "Approval Workflow"
      },

      {
        title: "Pending Approvals",
        path: "/pending-approvals",
        icon: <FaClipboardList />
      },

      {
        title: "Approval History",
        path: "/approval-history",
        icon: <FaHistory />
      },

      {
        heading: "Management"
      },

      {
        title: "Team",
        path: "/team",
        icon: <FaUsers />
      },

      {
        title: "Audit Logs",
        path: "/audit-logs",
        icon: <FaHistory />
      },

      {
        title: "Reports",
        path: "/reports",
        icon: <FaChartBar />
      }

    ]
  : []),

    // ==========================
// ADMIN
// ==========================

...(role === "Admin"
  ? [

      {
        heading: "Administration"
      },

      {
        title: "Users",
        path: "/users",
        icon: <FaUsers />
      },

      {
        heading: "Approval Workflow"
      },

      {
        title: "Pending Approvals",
        path: "/pending-approvals",
        icon: <FaClipboardList />
      },

      {
        title: "Approval History",
        path: "/approval-history",
        icon: <FaHistory />
      },

      {
        heading: "Management"
      },

      {
        title: "Team",
        path: "/team",
        icon: <FaUsers />
      },

      {
        title: "Audit Logs",
        path: "/audit-logs",
        icon: <FaHistory />
      },

      {
        title: "Reports",
        path: "/reports",
        icon: <FaChartBar />
      }

    ]
  : []),

    // ==========================
    // COMMON MENU
    // ==========================

    {
      title: "Profile",
      path: "/profile",
      icon: <FaUserCircle />
    }

  ];

  const handleLogout = () => {

    localStorage.clear();

    window.location.href = "/";

  };

  return (

    <aside className="sidebar">

      <div className="sidebar-logo">

        <h4>EDRP</h4>

        <span>
          Expert Decision Replay Platform
        </span>

      </div>

      <nav>

        {

          menuItems.map((item, index) =>

            item.heading ? (

              <div
                key={index}
                className="sidebar-heading"
              >

                {item.heading}

              </div>

            ) : (

              <NavLink

                key={index}

                to={item.path}

                className={({ isActive }) =>

                  isActive

                    ? "sidebar-link active"

                    : "sidebar-link"

                }

              >

                <span className="icon">

                  {item.icon}

                </span>

                <span>

                  {item.title}

                </span>

              </NavLink>

            )

          )

        }

      </nav>

      <div className="sidebar-footer">

        <button

          className="logout-btn"

          onClick={handleLogout}

        >

          <FaSignOutAlt />

          <span>

            Logout

          </span>

        </button>

      </div>

    </aside>

  );

};

export default Sidebar;