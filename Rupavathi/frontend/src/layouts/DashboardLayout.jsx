import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Side_bar';
import Navbar from '../components/Navbar';
import './DashboardLayout.css';

function DashboardLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const openMobileSidebar = () => setIsMobileSidebarOpen(true);
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={closeMobileSidebar}
      />

      <div className="dashboard-main">
        <Navbar onMenuClick={openMobileSidebar} />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;