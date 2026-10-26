import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#070B14]">
      <div className="flex min-h-screen">

        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div className="flex min-w-0 flex-1 flex-col">

          <Navbar />

          <main className="flex-1 p-5 md:p-8">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;