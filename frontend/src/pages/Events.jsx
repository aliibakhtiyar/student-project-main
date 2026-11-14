
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import api from "../services/api";
import EventCard from "../components/EventCard";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        "/opportunities/events",
        {
          params: {
            search: search.trim() || "technology",
            location: "India",
            category,
            date: "month",
          },
        }
      );

      setEvents(data.events || []);
    } catch (error) {
      console.error("Events Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl overflow-x-hidden">

      {/* ================= HEADER ================= */}

      <div className="mb-6 sm:mb-8">

        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Discover
        </p>

        <div className="mt-2 flex flex-col justify-between gap-4 sm:gap-5 md:flex-row md:items-end">

          <div className="min-w-0">

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Tech Events
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Discover technology events happening
              across India.
            </p>

          </div>

          <div className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 sm:w-auto sm:min-w-[120px] sm:px-5">

            <div>

              <p className="text-xs text-slate-400">
                Available
              </p>

              <p className="text-lg font-bold text-slate-950">
                {events.length}
              </p>

            </div>

          </div>

        </div>
      </div>

      {/* ================= SEARCH ================= */}

      <form
        onSubmit={handleSearch}
        className="mb-6 flex min-w-0 flex-col gap-3 sm:mb-7 md:flex-row"
      >

        <div className="relative min-w-0 flex-1">

          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-slate-400">
            ⌕
          </span>

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search AI, React, cybersecurity, cloud..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
          />

        </div>

        {/* Category */}

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value)
          }
          className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-950 md:w-auto md:min-w-[180px]"
        >

          <option value="all">
            All Tech
          </option>

          <option value="ai">
            AI / ML
          </option>

          <option value="web">
            Web Development
          </option>

          <option value="cybersecurity">
            Cybersecurity
          </option>

          <option value="cloud">
            Cloud Computing
          </option>

          <option value="developer">
            Software Development
          </option>

          <option value="startup">
            Tech Startups
          </option>

        </select>

        <button
          type="submit"
          className="w-full shrink-0 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 md:w-auto"
        >
          Search
        </button>

      </form>

      {/* ================= LOCATION ================= */}

      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">

        <span className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-600">
          India
        </span>

        <span>
          Technology events
        </span>

      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">

          {[1, 2, 3, 4, 5, 6].map(
            (item) => (
              <div
                key={item}
                className="h-[390px] min-w-0 animate-pulse rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"
              >

                <div className="h-32 rounded-xl bg-slate-100" />

                <div className="mt-5 h-5 w-3/4 rounded bg-slate-100" />

                <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />

                <div className="mt-6 grid grid-cols-2 gap-3">

                  <div className="h-14 rounded-xl bg-slate-100" />

                  <div className="h-14 rounded-xl bg-slate-100" />

                </div>

                <div className="mt-5 h-10 rounded-xl bg-slate-100" />

              </div>
            )
          )}

        </div>
      )}

      {/* ================= NO EVENTS ================= */}

      {!loading && events.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-14 text-center sm:py-20">

          <p className="text-sm font-semibold text-slate-700">
            No tech events found
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Try another technology or search term.
          </p>

        </div>
      )}

      {/* ================= EVENT CARDS ================= */}

      {!loading && events.length > 0 && (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">

          {events.map((event, index) => (
            <EventCard
              key={event.id || index}
              event={event}
            />
          ))}

        </div>
      )}

    </div>
  );
};

export default Events;
