const HackathonCard = ({ hackathon }) => {
  const title =
    hackathon.title ||
    "Hackathon";

  const organizer =
    hackathon.organiser ||
    "Organizer";

  const location =
    hackathon.city ||
    "Online";

  const url =
    hackathon.url ||
    "#";

  const deadline = hackathon.deadline
    ? new Date(hackathon.deadline).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "No deadline";

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">

      {/* Top section */}
      <div className="relative h-36 overflow-hidden bg-slate-950">

        {/* subtle background */}
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-white/5" />

        <div className="relative flex h-full flex-col justify-between p-5">

          <div className="flex items-center justify-between">

            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
              Hackathon
            </span>

            <span className="text-xs font-medium text-slate-400">
              {hackathon.mode || "ONLINE"}
            </span>

          </div>

          <div>
            <p className="text-xs text-slate-400">
              {hackathon.platform || "Competition"}
            </p>
          </div>

        </div>
      </div>

      {/* Content */}
      <div className="p-5">

        {/* Title */}
        <h3 className="line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-slate-950">
          {title}
        </h3>

        {/* Organizer */}
        <p className="mt-2 line-clamp-1 text-xs text-slate-500">
          {organizer}
        </p>

        {/* Info */}
        <div className="mt-5 space-y-3">

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">

            <span className="text-xs text-slate-400">
              Location
            </span>

            <span className="max-w-[160px] truncate text-xs font-medium text-slate-700">
              {location}
            </span>

          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">

            <span className="text-xs text-slate-400">
              Deadline
            </span>

            <span className="text-xs font-medium text-slate-700">
              {deadline}
            </span>

          </div>

          <div className="flex items-center justify-between">

            <span className="text-xs text-slate-400">
              Prize
            </span>

            <span className="text-sm font-bold text-slate-950">
              {hackathon.prize?.label || "—"}
            </span>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center gap-3">

          <div className="flex-1">

            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Team
            </p>

            <p className="mt-0.5 text-xs font-semibold text-slate-700">
              {hackathon.team || "Any"}
            </p>

          </div>

          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            View →
          </a>

        </div>

      </div>
    </div>
  );
};

export default HackathonCard;