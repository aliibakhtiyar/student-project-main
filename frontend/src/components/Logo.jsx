const Logo = ({ light = false }) => {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${
          light
            ? "bg-white text-slate-950"
            : "bg-slate-950 text-white"
        }`}
      >
        U
      </div>

      <div>
        <h1
          className={`text-lg font-bold tracking-tight ${
            light ? "text-white" : "text-slate-950"
          }`}
        >
          UniSphere
        </h1>

        <p
          className={`text-[10px] ${
            light ? "text-slate-400" : "text-slate-400"
          }`}
        >
          Student ecosystem
        </p>
      </div>
    </div>
  );
};

export default Logo;