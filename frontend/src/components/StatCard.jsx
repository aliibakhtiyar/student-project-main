
const StatCard = ({
  title,
  value,
  description,
  icon,
}) => {
  return (
    <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#0D1526] p-4 sm:p-5 transition duration-200 hover:-translate-y-0.5 hover:bg-[#111C32] hover:shadow-lg hover:shadow-black/10">

      <div className="flex items-start justify-between gap-2">

        {/* TEXT */}
        <div className="min-w-0 flex-1">

          <p className="text-xs font-medium text-slate-400 break-words">
            {title}
          </p>

          <p className="mt-2 break-words text-2xl sm:text-3xl font-extrabold tracking-tight text-indigo-300">
            {value}
          </p>

        </div>

        {/* ICON */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.05] text-lg">
          {icon}
        </div>

      </div>

      {/* DESCRIPTION */}
      <p className="mt-4 break-words text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
};

export default StatCard;
