const EventCard = ({ event }) => {
  const formatDate = (date) => {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">

      {/* ================= TOP ================= */}

      <div className="relative h-36 overflow-hidden bg-slate-950">

        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <>
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5" />

            <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/5" />

            <div className="relative flex h-full flex-col justify-between p-5">

              <div className="flex items-center justify-between">

                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Tech Event
                </span>

                <span className="text-xs text-slate-400">
                  India
                </span>

              </div>

              <p className="text-xs font-medium text-slate-400">
                Technology
              </p>

            </div>
          </>
        )}

        {event.image && (
          <div className="absolute left-4 top-4">
            <span className="rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur">
              Tech Event
            </span>
          </div>
        )}

      </div>

      {/* ================= CONTENT ================= */}

      <div className="flex flex-1 flex-col p-5">

        {/* Title */}

        <h3 className="line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-slate-950">
          {event.title || "Technology Event"}
        </h3>

        {/* Description */}

        {event.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
            {event.description}
          </p>
        )}

        {/* Details */}

        <div className="mt-5 grid grid-cols-2 gap-3">

          {/* Date */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Date
            </p>

            <p className="mt-1.5 truncate text-xs font-semibold text-slate-700">
              {formatDate(
                event.startTime || event.date
              )}
            </p>

          </div>

          {/* Time */}

          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Time
            </p>

            <p className="mt-1.5 truncate text-xs font-semibold text-slate-700">
              {formatTime(
                event.startTime
              ) || "See event"}
            </p>

          </div>

          {/* Location */}

          <div className="col-span-2 rounded-xl bg-slate-50 p-3">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Location
            </p>

            <p className="mt-1.5 truncate text-xs font-semibold text-slate-700">
              {event.location ||
                event.city ||
                "Online / Not specified"}
            </p>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-auto border-t border-slate-100 pt-4">

          <div className="flex items-center justify-between gap-3">

            <span className="text-[10px] text-slate-400">
              {event.isFree
                ? "Free event"
                : event.price || "Event"}
            </span>

            {event.url ? (
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                View →
              </a>
            ) : (
              <span className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-400">
                No link
              </span>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default EventCard;