import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../services/api";
import HackathonCard from "../components/HackathonCard";

const Hackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchHackathons = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        "/opportunities/hackathons",
        {
          params: {
            limit: 20,
            offset: 0,
            q: search || undefined,
          },
        }
      );

      setHackathons(data.hackathons || []);
    } catch (error) {
      console.error("Hackathons Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load hackathons"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  return (
    <div className="min-h-full bg-[#070B14] text-white">
      <div className="mx-auto max-w-7xl px-1 py-2">

        {/* ================= HEADER ================= */}
        <div className="mb-8">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            Build & Compete
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Hackathons
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            Discover hackathons, coding competitions and
            opportunities to build something amazing.
          </p>

        </div>

        {/* ================= SEARCH ================= */}
        <div className="mb-8 flex flex-col gap-3 md:flex-row">

          <div className="relative flex-1">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  fetchHackathons();
                }
              }}
              placeholder="Search hackathons..."
              className="w-full rounded-xl border border-slate-800 bg-[#0D1320] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />

          </div>

          <button
            type="button"
            onClick={fetchHackathons}
            className="rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Search
          </button>

        </div>

        {/* ================= COUNT ================= */}
        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-sm text-indigo-400">
            ◆
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">
              {hackathons.length} Hackathons
            </p>

            <p className="text-xs text-slate-600">
              Opportunities available
            </p>
          </div>

        </div>

        {/* ================= LOADING ================= */}
        {loading ? (

          <div className="rounded-2xl border border-slate-800 bg-[#0B111D] py-24 text-center">

            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-indigo-500" />

            <p className="mt-4 text-sm text-slate-500">
              Loading hackathons...
            </p>

          </div>

        ) : hackathons.length === 0 ? (

          /* ================= EMPTY ================= */
          <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0B111D] p-16 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-xl text-indigo-400">
              ◆
            </div>

            <h2 className="mt-4 font-semibold text-slate-200">
              No hackathons found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Try another search.
            </p>

          </div>

        ) : (

          /* ================= HACKATHON GRID ================= */
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {hackathons.map((hackathon, index) => (
              <HackathonCard
                key={
                  hackathon.id ||
                  hackathon._id ||
                  index
                }
                hackathon={hackathon}
              />
            ))}

          </div>

        )}

      </div>
    </div>
  );
};

export default Hackathons;