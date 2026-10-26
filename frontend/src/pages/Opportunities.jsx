import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import OpportunityCard from "../components/OpportunityCard";
import api from "../services/api";

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);

      let jobs = [];
      let internships = [];

      // =========================
      // JOBS
      // =========================

      if (type === "all" || type === "job") {
        const { data } = await api.get(
          "/opportunities/jobs",
          {
            params: {
              query: search || "developer",
              location: "Delhi",
            },
          }
        );

        jobs = (data.jobs || []).map((job) => ({
          id: `job-${job.id}`,
          title: job.title,
          company:
            job.company?.display_name ||
            "Company not available",
          location:
            job.location?.display_name ||
            "Location not available",
          type: "Job",
          description: job.description,
          url: job.redirect_url,
          salary:
            job.salary_min && job.salary_max
              ? `₹${job.salary_min} - ₹${job.salary_max}`
              : "Not specified",
          experience: "Fresher / Entry Level",
          workType:
            job.contract_type ||
            "Not specified",
        }));
      }

      // =========================
      // INTERNSHIPS
      // =========================

      if (
        type === "all" ||
        type === "internship"
      ) {
        const { data } = await api.get(
          "/opportunities/internships",
          {
            params: {
              query:
                search ||
                "internship developer",
              location: "Delhi",
            },
          }
        );

        internships = (
          data.internships || []
        ).map((job) => ({
          id: `internship-${job.id}`,
          title: job.title,
          company:
            job.company?.display_name ||
            "Company not available",
          location:
            job.location?.display_name ||
            "Location not available",
          type: "Internship",
          description: job.description,
          url: job.redirect_url,
          salary:
            job.salary_min && job.salary_max
              ? `₹${job.salary_min} - ₹${job.salary_max}`
              : "Not specified",
          experience: "Fresher",
          workType:
            job.contract_type ||
            "Not specified",
        }));
      }

      setOpportunities([
        ...jobs,
        ...internships,
      ]);
    } catch (error) {
      console.error(
        "Opportunity Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load opportunities"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchOpportunities();
  };

  return (
    <div className="min-h-full bg-[#070B14] text-white">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8">

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
            Career
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            Opportunities
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 md:text-base">
            Find internships and jobs relevant to
            students.
          </p>

        </div>

        {/* ================= SEARCH ================= */}

        <form
          onSubmit={handleSearch}
          className="mb-8 rounded-2xl border border-slate-800 bg-[#0B111D] p-3"
        >
          <div className="flex flex-col gap-3 md:flex-row">

            {/* Search */}
            <div className="relative flex-1">

              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-500">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search jobs, internships..."
                className="w-full rounded-xl border border-slate-800 bg-[#0D1320] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />

            </div>

            {/* Filter */}
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value)
              }
              className="rounded-xl border border-slate-800 bg-[#0D1320] px-4 py-3 text-sm text-slate-300 outline-none transition focus:border-indigo-500"
            >
              <option
                value="all"
                className="bg-[#0D1320]"
              >
                All types
              </option>

              <option
                value="internship"
                className="bg-[#0D1320]"
              >
                Internship
              </option>

              <option
                value="job"
                className="bg-[#0D1320]"
              >
                Job
              </option>
            </select>

            {/* Search Button */}
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Search
            </button>

          </div>
        </form>

        {/* ================= COUNT ================= */}

        <div className="mb-5 flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-sm text-indigo-400">
            ◆
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-200">
              {opportunities.length} Opportunities
            </p>

            <p className="text-xs text-slate-600">
              Jobs & internships available
            </p>
          </div>

        </div>

        {/* ================= LOADING ================= */}

        {loading ? (

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-[390px] animate-pulse rounded-2xl border border-slate-800 bg-[#0B111D] p-5"
                >
                  <div className="h-5 w-3/4 rounded bg-slate-800" />

                  <div className="mt-3 h-4 w-1/2 rounded bg-slate-800" />

                  <div className="mt-7 grid grid-cols-2 gap-3">

                    <div className="h-16 rounded-xl bg-slate-800" />
                    <div className="h-16 rounded-xl bg-slate-800" />
                    <div className="h-16 rounded-xl bg-slate-800" />
                    <div className="h-16 rounded-xl bg-slate-800" />

                  </div>

                  <div className="mt-5 h-20 rounded-xl bg-slate-800" />

                  <div className="mt-5 h-10 rounded-xl bg-slate-800" />
                </div>
              )
            )}

          </div>

        ) : opportunities.length === 0 ? (

          /* ================= NO RESULTS ================= */

          <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0B111D] py-20 text-center">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-xl text-indigo-400">
              ◆
            </div>

            <p className="mt-4 text-sm font-semibold text-slate-200">
              No opportunities found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Try another search.
            </p>

          </div>

        ) : (

          /* ================= CARDS ================= */

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

            {opportunities.map(
              (opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                />
              )
            )}

          </div>

        )}

      </div>
    </div>
  );
};

export default Opportunities;