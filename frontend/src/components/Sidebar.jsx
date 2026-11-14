
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const Sidebar = ({
  collapsed,
  setCollapsed,
  mobileOpen = false,
  setMobileOpen,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const links = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "⌂",
    },
    {
      name: "Student Benefits",
      path: "/benefits",
      icon: "◇",
    },
    {
      name: "Events",
      path: "/events",
      icon: "▣",
    },
    {
      name: "Hackathons",
      path: "/hackathons",
      icon: "◆",
    },
    {
      name: "Opportunities",
      path: "/opportunities",
      icon: "●",
    },
    {
      name: "Classroom Notes",
      path: "/classroom",
      icon: "▤",
    },
    {
      name: "Resume Builder",
      path: "/resume-builder",
      icon: "▥",
    },
    {
      name: "Public Profile",
      path: "/public-profile",
      icon: "◉",
    },
    {
      name: "Quiz Practice",
      path: "/quiz-practice",
      icon: "𖡎",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: "○",
    },
  ];

  const handleLogout = () => {
    logout();
    setShowLogoutModal(false);
    setMobileOpen?.(false);
    navigate("/login");
  };

  const closeMobileSidebar = () => {
    setMobileOpen?.(false);
  };

  // Collapsed sidebar ke blank area par click
  const handleSidebarClick = (e) => {
    if (!collapsed) return;

    if (
      e.target.closest("a") ||
      e.target.closest("button")
    ) {
      return;
    }

    setCollapsed(false);
  };

  return (
    <>
      {/* ================= MOBILE OVERLAY ================= */}

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* ================= SIDEBAR ================= */}

      <aside
        onClick={handleSidebarClick}
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${
          collapsed
            ? "lg:w-[72px] lg:cursor-pointer"
            : "lg:w-64"
        }`}
      >
        {/* ================= HEADER ================= */}

        <div
          className={`flex h-20 shrink-0 items-center border-b border-slate-800 ${
            collapsed
              ? "justify-between px-4 lg:justify-center lg:px-0"
              : "justify-between px-5"
          }`}
        >
          {collapsed ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed(false);
                }}
                className="hidden h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white transition hover:bg-indigo-500 lg:flex"
                title="Open sidebar"
              >
                U
              </button>

              <div className="lg:hidden">
                <Logo light />
              </div>
            </>
          ) : (
            <Logo light />
          )}

          {/* Desktop Collapse */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-white/10 hover:text-white lg:flex"
            title={collapsed ? "Open sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
            title="Close sidebar"
          >
            ×
          </button>
        </div>

        {/* ================= NAVIGATION ================= */}

        <div className="sidebar-scroll flex-1 overflow-y-auto overflow-x-hidden px-3 py-6">

          <p
            className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 ${
              collapsed ? "lg:hidden" : ""
            }`}
          >
            Workspace
          </p>

          <nav className="space-y-1">

            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={closeMobileSidebar}
                title={
                  collapsed
                    ? link.name
                    : undefined
                }
                className={({ isActive }) =>
                  `group flex items-center rounded-xl py-3 text-sm font-medium transition ${
                    collapsed
                      ? "gap-3 px-3 lg:justify-center lg:px-2"
                      : "gap-3 px-3"
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/30"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                  }`
                }
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm">
                  {link.icon}
                </span>

                <span
                  className={`truncate ${
                    collapsed ? "lg:hidden" : ""
                  }`}
                >
                  {link.name}
                </span>
              </NavLink>
            ))}

          </nav>

          {/* ================= MORE ================= */}

          <div className="mt-9">

            <p
              className={`mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 ${
                collapsed ? "lg:hidden" : ""
              }`}
            >
              More
            </p>

            <NavLink
              to="/ai-assistant"
              onClick={closeMobileSidebar}
              title={
                collapsed
                  ? "AI Assistant"
                  : undefined
              }
              className={({ isActive }) =>
                `group flex items-center rounded-xl py-3 text-sm font-medium transition ${
                  collapsed
                    ? "gap-3 px-3 lg:justify-center lg:px-2"
                    : "gap-3 px-3"
                } ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-950/30"
                    : "text-slate-400 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >

              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm">
                ✦
              </span>

              <div
                className={`flex min-w-0 flex-1 items-center justify-between gap-2 ${
                  collapsed ? "lg:hidden" : ""
                }`}
              >

                <span className="truncate">
                  AI Assistant
                </span>

                <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-[8px] font-bold tracking-wide text-indigo-400">
                  AI
                </span>

              </div>

            </NavLink>

          </div>

        </div>

        {/* ================= LOGOUT ================= */}

        <div
          className="border-t border-slate-800 p-3"
          onClick={(e) => e.stopPropagation()}
        >

          <button
            type="button"
            onClick={() => {
              setShowLogoutModal(true);
              closeMobileSidebar();
            }}
            title="Logout"
            className={`flex w-full items-center rounded-xl py-3 text-sm font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 ${
              collapsed
                ? "justify-center lg:justify-center"
                : "gap-3 px-3"
            }`}
          >

            <span className="shrink-0 text-base">
              ↪
            </span>

            <span
              className={collapsed ? "lg:hidden" : ""}
            >
              Logout
            </span>

          </button>

        </div>

      </aside>

      {/* ================= LOGOUT MODAL ================= */}

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm"
          onClick={() =>
            setShowLogoutModal(false)
          }
        >

          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Icon */}

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-lg text-red-600">
              ↪
            </div>

            {/* Title */}

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              Logout?
            </h2>

            {/* Description */}

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to logout from your
              UniSphere account?
            </p>

            {/* Buttons */}

            <div className="mt-6 flex gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowLogoutModal(false)
                }
                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Logout
              </button>

            </div>

          </div>

        </div>
      )}

    </>
  );
};

export default Sidebar;
