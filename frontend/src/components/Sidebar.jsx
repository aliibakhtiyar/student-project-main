import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const Sidebar = ({ collapsed, setCollapsed }) => {
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
    { name: "Public Profile", path: "/public-profile", icon: "◉" },
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
    navigate("/login");
  };

  // Collapsed sidebar ke blank area par click
  const handleSidebarClick = (e) => {
    if (!collapsed) return;

    // Button ya link par click hua hai
    if (
      e.target.closest("a") ||
      e.target.closest("button")
    ) {
      return;
    }

    // Blank area par click
    setCollapsed(false);
  };

  return (
    <>
      <aside
        onClick={handleSidebarClick}
        className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-slate-800 bg-slate-950 transition-all duration-300 ${
          collapsed
            ? "w-[72px] cursor-pointer"
            : "w-64"
        }`}
      >
        {/* ================= HEADER ================= */}

        <div
          className={`flex h-20 shrink-0 items-center border-b border-slate-800 ${
            collapsed
              ? "justify-center"
              : "justify-between px-5"
          }`}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCollapsed(false);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white transition hover:bg-indigo-500"
              title="Open sidebar"
            >
              U
            </button>
          ) : (
            <>
              <Logo light />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed(true);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-lg text-slate-500 transition hover:bg-white/10 hover:text-white"
                title="Collapse sidebar"
              >
                ←
              </button>
            </>
          )}
        </div>

        {/* ================= NAVIGATION ================= */}

        <div className="sidebar-scroll flex-1 overflow-y-auto px-3 py-6">

          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
              Workspace
            </p>
          )}

          <nav className="space-y-1">

            {links.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                title={
                  collapsed
                    ? link.name
                    : undefined
                }
                className={({ isActive }) =>
                  `group flex items-center rounded-xl py-3 text-sm font-medium transition ${
                    collapsed
                      ? "justify-center px-2"
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

                {!collapsed && (
                  <span className="truncate">
                    {link.name}
                  </span>
                )}
              </NavLink>
            ))}

          </nav>


          {/* ================= MORE ================= */}

          <div className="mt-9">

            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                More
              </p>
            )}

            <NavLink
              to="/ai-assistant"
              title={
                collapsed
                  ? "AI Assistant"
                  : undefined
              }
              className={({ isActive }) =>
                `group flex items-center rounded-xl py-3 text-sm font-medium transition ${
                  collapsed
                    ? "justify-center px-2"
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

              {!collapsed && (
                <div className="flex min-w-0 flex-1 items-center justify-between gap-2">

                  <span className="truncate">
                    AI Assistant
                  </span>

                  <span className="rounded-full bg-indigo-500/10 px-2 py-1 text-[8px] font-bold tracking-wide text-indigo-400">
                    AI
                  </span>

                </div>
              )}

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
            onClick={() =>
              setShowLogoutModal(true)
            }
            title="Logout"
            className={`flex w-full items-center rounded-xl py-3 text-sm font-medium text-slate-500 transition hover:bg-red-500/10 hover:text-red-400 ${
              collapsed
                ? "justify-center"
                : "gap-3 px-3"
            }`}
          >

            <span className="text-base">
              ↪
            </span>

            {!collapsed && (
              <span>
                Logout
              </span>
            )}

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