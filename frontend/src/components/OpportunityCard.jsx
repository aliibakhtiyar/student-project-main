const OpportunityCard = ({ opportunity }) => {
  // ============================================
  // DETERMINE OPPORTUNITY TYPE
  // ============================================

  const isInternship =
    opportunity.type === "Internship" ||
    opportunity.job_type?.toLowerCase()?.includes("intern");

  const type =
    isInternship
      ? "Internship"
      : opportunity.type || "Job";


  // ============================================
  // TITLE
  // ============================================

  const title =
    opportunity.job_title ||
    opportunity.title ||
    "Opportunity";


  // ============================================
  // COMPANY
  // ============================================

  const company =
    opportunity.company ||
    "Company";


  // ============================================
  // LOCATION
  // ============================================

  const location =
    opportunity.location ||
    "India";


  // ============================================
  // EXPERIENCE
  // ============================================

  const experience =
    opportunity.experience ||
    "Fresher";


  // ============================================
  // JOB TYPE
  // ============================================

  const workType =
    opportunity.job_type ||
    opportunity.workType ||
    "Not specified";


  // ============================================
  // SALARY
  // ============================================

  const salary =
    opportunity.salary ||
    opportunity.salary_range ||
    "Not specified";


  // ============================================
  // DESCRIPTION
  // ============================================

  const description =
    opportunity.job_description ||
    opportunity.description ||
    "";


  // ============================================
  // APPLY LINK
  // ============================================

  const applyUrl =
    opportunity.apply_link ||
    opportunity.url ||
    "#";


  // ============================================
  // POSTED DATE
  // ============================================

  const postedDate = opportunity.posted_date
    ? new Date(
        opportunity.posted_date
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Recently";


  // ============================================
  // SKILLS
  // ============================================

  const skills =
    opportunity.education_and_skills ||
    "";


  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <div className="border-b border-slate-100 bg-slate-950 p-5">

        <div className="flex items-start justify-between gap-3">

          {/* Title + Company */}
          <div className="min-w-0 flex-1">

            <h3 className="line-clamp-2 min-h-[48px] text-base font-bold leading-6 text-white">
              {title}
            </h3>

            <p className="mt-2 truncate text-xs text-slate-400">
              {company}
            </p>

          </div>


          {/* Type Badge */}
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
              isInternship
                ? "bg-emerald-400/10 text-emerald-300"
                : "bg-white/10 text-slate-300"
            }`}
          >
            {type}
          </span>

        </div>

      </div>


      {/* ================================================= */}
      {/* DETAILS */}
      {/* ================================================= */}

      <div className="flex flex-1 flex-col p-5">


        {/* ================================================= */}
        {/* INFO GRID */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 gap-3">


          {/* LOCATION */}
          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Location
            </p>

            <p className="mt-1.5 truncate text-xs font-semibold text-slate-700">
              {location}
            </p>

          </div>


          {/* SALARY */}
          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Salary
            </p>

            <p className="mt-1.5 truncate text-xs font-semibold text-slate-700">
              {salary}
            </p>

          </div>


          {/* EXPERIENCE */}
          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Experience
            </p>

            <p className="mt-1.5 truncate text-xs font-semibold text-slate-700">
              {experience}
            </p>

          </div>


          {/* WORK TYPE */}
          <div className="rounded-xl bg-slate-50 p-3">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Work Type
            </p>

            <p className="mt-1.5 truncate text-xs font-semibold text-slate-700">
              {workType}
            </p>

          </div>

        </div>


        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        {description && (

          <div className="mt-5">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              About opportunity
            </p>

            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
              {description}
            </p>

          </div>

        )}


        {/* ================================================= */}
        {/* SKILLS */}
        {/* ================================================= */}

        {skills && (

          <div className="mt-4">

            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Skills
            </p>

            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
              {skills}
            </p>

          </div>

        )}


        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="mt-auto border-t border-slate-100 pt-4">


          <div className="flex items-center justify-between gap-3">


            {/* Posted */}
            <div>

              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Posted
              </p>

              <p className="mt-1 text-[10px] font-medium text-slate-600">
                {postedDate}
              </p>

            </div>


            {/* Apply Button */}

            {applyUrl !== "#" ? (

              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                Apply →
              </a>

            ) : (

              <button
                disabled
                className="shrink-0 cursor-not-allowed rounded-xl bg-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-400"
              >
                No Link
              </button>

            )}

          </div>


          {/* External application text */}

          <p className="mt-3 text-right text-[9px] text-slate-400">
            Apply externally
          </p>

        </div>

      </div>

    </div>
  );
};


export default OpportunityCard;