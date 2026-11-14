
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#070B14]">
      <div className="flex min-h-screen w-full">

        {/* Sidebar */}
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* Navbar */}
          <Navbar
            setMobileOpen={setMobileOpen}
          />

          {/* Page Content */}
          <main className="min-w-0 w-full flex-1 p-3 sm:p-5 md:p-8">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
