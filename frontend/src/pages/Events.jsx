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
    <div className="mx-auto max-w-7xl">

      {/* ================= HEADER ================= */}

      <div className="mb-8">

        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Discover
        </p>

        <div className="mt-2 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Tech Events
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Discover technology events happening
              across India.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-2.5">

            <p className="text-xs text-slate-400">
              Available
            </p>

            <p className="text-lg font-bold text-slate-950">
              {events.length}
            </p>

          </div>

        </div>
      </div>

      {/* ================= SEARCH ================= */}

      <form
        onSubmit={handleSearch}
        className="mb-7 flex flex-col gap-3 md:flex-row"
      >

        <div className="relative flex-1">

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
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-950"
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
          className="rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Search
        </button>

      </form>

      {/* ================= LOCATION ================= */}

      <div className="mb-5 flex items-center gap-2 text-xs text-slate-500">

        <span className="rounded-lg bg-slate-100 px-3 py-2 font-medium text-slate-600">
          India
        </span>

        <span>
          Technology events
        </span>

      </div>

      {/* ================= LOADING ================= */}

      {loading && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

          {[1, 2, 3, 4, 5, 6].map(
            (item) => (
              <div
                key={item}
                className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
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
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center">

          <p className="text-sm font-semibold text-slate-700">
            No tech events found
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Try another technology or search term.
          </p>

        </div>
      )}

      {/* ================= EVENT CARDS ================= */}

      {!loading && events.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">

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