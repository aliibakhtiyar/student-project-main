import { useAuth } from "../context/AuthContext";

const Navbar = ({ setMobileOpen }) => {
  const { user } = useAuth();

  const firstLetter =
    user?.name?.charAt(0)?.toUpperCase() || "S";

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 md:px-8">

      {/* ================= LEFT ================= */}
      <div className="flex items-center gap-4">

        {/* Mobile Menu */}
        <button
          type="button"
          onClick={() => setMobileOpen?.(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 text-lg text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
        >
          ☰
        </button>

        {/* Search */}
        <div className="hidden w-72 md:block">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">

            <span className="text-sm text-slate-500">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />

          </div>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex items-center gap-4">

        {/* Notification */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 text-slate-400 transition hover:bg-white/5 hover:text-white"
          title="Notifications"
        >
          ♢

          {/* Notification dot */}
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>

        {/* Divider */}
        <div className="hidden h-8 w-px bg-slate-800 sm:block" />

        {/* User */}
        <div className="flex items-center gap-3">

          {/* Avatar */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-slate-950">
            {firstLetter}
          </div>

          {/* User Details */}
          <div className="hidden sm:block">

            <p className="max-w-32 truncate text-sm font-semibold text-white">
              {user?.name || "Student"}
            </p>

            <p className="max-w-32 truncate text-[11px] text-slate-500">
              {user?.institute || "Student"}
            </p>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;