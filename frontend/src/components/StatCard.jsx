const StatCard = ({
  title,
  value,
  description,
  icon,
}) => {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-[#0D1526] p-5 transition duration-200 hover:-translate-y-0.5 hover:bg-[#111C32] hover:shadow-lg hover:shadow-black/10">
      
      <div className="flex items-start justify-between">
        
        {/* TEXT */}
        <div>
          <p className="text-xs font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold tracking-tight text-indigo-300">
            {value}
          </p>
        </div>

        {/* ICON */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.05] text-lg">
          {icon}
        </div>

      </div>

      {/* DESCRIPTION */}
      <p className="mt-4 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
};

export default StatCard;