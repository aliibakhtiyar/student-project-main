import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import StatCard from "../components/StatCard";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();

  // ==========================================
  // STATE
  // ==========================================

  const [opportunities, setOpportunities] = useState([]);

  const [assignments, setAssignments] = useState([]);

  const [classroomConnected, setClassroomConnected] =
    useState(false);

  const [loading, setLoading] = useState(true);

  const [classroomLoading, setClassroomLoading] =
    useState(true);

  // Calendar
  const [currentDate, setCurrentDate] =
    useState(new Date());

  const [selectedDate, setSelectedDate] =
    useState(new Date());

  // ==========================================
  // USER
  // ==========================================

  const firstName =
    user?.name?.split(" ")[0] || "Student";

  // ==========================================
  // FETCH OPPORTUNITIES
  // ==========================================

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        jobsResponse,
        internshipsResponse,
      ] = await Promise.all([
        api.get("/opportunities/jobs", {
          params: {
            query: "developer",
            location: "Delhi",
            page: 1,
          },
        }),

        api.get("/opportunities/internships", {
          params: {
            query: "developer internship",
            location: "Delhi",
            page: 1,
          },
        }),
      ]);

      // ======================================
      // JOBS
      // ======================================

      const jobs = (
        jobsResponse.data?.jobs || []
      ).map((job) => ({
        id: `job-${job.id}`,

        title:
          job.title || "Developer",

        company:
          job.company?.display_name ||
          "Company",

        location:
          job.location?.display_name ||
          "Location unavailable",

        type: "Job",

        url:
          job.redirect_url || "#",
      }));

      // ======================================
      // INTERNSHIPS
      // ======================================

      const internships = (
        internshipsResponse.data?.internships || []
      ).map((job) => ({
        id: `internship-${job.id}`,

        title:
          job.title ||
          "Developer Internship",

        company:
          job.company?.display_name ||
          "Company",

        location:
          job.location?.display_name ||
          "Location unavailable",

        type: "Internship",

        url:
          job.redirect_url || "#",
      }));

      setOpportunities([
        ...internships,
        ...jobs,
      ]);

    } catch (error) {
      console.error(
        "Dashboard API Error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load dashboard data"
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FETCH GOOGLE CLASSROOM
  // ==========================================

  const fetchClassroomData = async () => {
    try {
      setClassroomLoading(true);

      // ======================================
      // CHECK CONNECTION
      // ======================================

      const statusResponse =
        await api.get("/classroom/status");

      console.log(
        "CLASSROOM STATUS:",
        statusResponse.data
      );

      const connected =
        statusResponse.data?.connected === true;

      setClassroomConnected(connected);

      // ======================================
      // NOT CONNECTED
      // ======================================

      if (!connected) {
        setAssignments([]);
        return;
      }

      // ======================================
      // GET ASSIGNMENTS
      // ======================================

      const assignmentsResponse =
        await api.get(
          "/classroom/assignments"
        );

      console.log(
        "CLASSROOM ASSIGNMENTS:",
        assignmentsResponse.data
      );

      const data =
        assignmentsResponse.data
          ?.assignments || [];

      setAssignments(data);

    } catch (error) {
      console.error(
        "CLASSROOM DASHBOARD ERROR:",
        error.response?.data ||
          error.message
      );

      setClassroomConnected(false);
      setAssignments([]);

    } finally {
      setClassroomLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    fetchDashboardData();
    fetchClassroomData();
  }, []);

  // ==========================================
  // DATE HELPERS
  // ==========================================

  const today = new Date();

  const isSameDay = (
    date1,
    date2
  ) => {
    return (
      date1.getFullYear() ===
        date2.getFullYear() &&
      date1.getMonth() ===
        date2.getMonth() &&
      date1.getDate() ===
        date2.getDate()
    );
  };

  // ==========================================
  // CALENDAR DAYS
  // ==========================================

  const calendarDays = useMemo(() => {
    const year =
      currentDate.getFullYear();

    const month =
      currentDate.getMonth();

    const firstDay =
      new Date(
        year,
        month,
        1
      ).getDay();

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    const days = [];

    // Empty cells
    for (
      let i = 0;
      i < firstDay;
      i++
    ) {
      days.push(null);
    }

    // Month days
    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(
        new Date(
          year,
          month,
          day
        )
      );
    }

    return days;
  }, [currentDate]);

  // ==========================================
  // ASSIGNMENT DATE MAP
  // ==========================================

  const assignmentDates = useMemo(() => {
    const map = {};

    assignments.forEach(
      (assignment) => {
        if (!assignment.dueDate) {
          return;
        }

        const date =
          new Date(
            assignment.dueDate
          );

        const key =
          `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (!map[key]) {
          map[key] = [];
        }

        map[key].push(
          assignment
        );
      }
    );

    return map;
  }, [assignments]);

  // ==========================================
  // SELECTED DATE ASSIGNMENTS
  // ==========================================

  const selectedDateAssignments =
    useMemo(() => {
      return assignments.filter(
        (assignment) => {
          if (!assignment.dueDate) {
            return false;
          }

          return isSameDay(
            new Date(
              assignment.dueDate
            ),
            selectedDate
          );
        }
      );
    }, [
      assignments,
      selectedDate,
    ]);

  // ==========================================
  // UPCOMING ASSIGNMENTS
  // ==========================================

  const upcomingAssignments =
    useMemo(() => {
      const now = new Date();

      return [...assignments]
        .filter((assignment) => {
          if (!assignment.dueDate) {
            return false;
          }

          return (
            new Date(
              assignment.dueDate
            ) >= now
          );
        })
        .sort(
          (a, b) =>
            new Date(
              a.dueDate
            ) -
            new Date(
              b.dueDate
            )
        );
    }, [assignments]);

  // ==========================================
  // NEXT ASSIGNMENT
  // ==========================================

  const nextAssignment =
    upcomingAssignments[0];

  // ==========================================
  // DUE SOON
  // ==========================================

  const dueSoonCount =
    useMemo(() => {
      const now = new Date();

      const nextSevenDays =
        new Date(now);

      nextSevenDays.setDate(
        now.getDate() + 7
      );

      return upcomingAssignments.filter(
        (assignment) => {
          const due =
            new Date(
              assignment.dueDate
            );

          return (
            due >= now &&
            due <= nextSevenDays
          );
        }
      ).length;
    }, [upcomingAssignments]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (
    dateString
  ) => {
    if (!dateString) {
      return "No due date";
    }

    return new Date(
      dateString
    ).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // DUE LABEL
  // ==========================================

  const getDueLabel = (
    dateString
  ) => {
    if (!dateString) {
      return "No due date";
    }

    const dueDate =
      new Date(dateString);

    if (
      isSameDay(
        dueDate,
        today
      )
    ) {
      return "Due today";
    }

    const tomorrow =
      new Date(today);

    tomorrow.setDate(
      today.getDate() + 1
    );

    if (
      isSameDay(
        dueDate,
        tomorrow
      )
    ) {
      return "Due tomorrow";
    }

    const difference =
      Math.ceil(
        (
          dueDate -
          today
        ) /
          (
            1000 *
            60 *
            60 *
            24
          )
      );

    if (
      difference > 0 &&
      difference <= 7
    ) {
      return `Due in ${difference} days`;
    }

    return formatDate(
      dateString
    );
  };

  // ==========================================
  // CALENDAR NAVIGATION
  // ==========================================

  const previousMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      )
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1
      )
    );
  };

  const goToToday = () => {
    const date =
      new Date();

    setCurrentDate(
      new Date(
        date.getFullYear(),
        date.getMonth(),
        1
      )
    );

    setSelectedDate(date);
  };

  // ==========================================
  // MONTH NAME
  // ==========================================

  const monthName =
    currentDate.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-[#070B14] px-4 py-6 text-white md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">

          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative">

            <div className="flex items-center gap-2">

              <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />

              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-indigo-400">
                Student workspace
              </p>

            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">

              Welcome back,{" "}

              <span className="text-indigo-400">
                {firstName}
              </span>

              .

            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Stay on top of your opportunities,
              assignments and deadlines.
            </p>

          </div>

        </div>

        {/* ==========================================
            STATS
        ========================================== */}

        <div className="grid gap-4 md:grid-cols-3">

          {/* OPPORTUNITIES */}

          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1526] p-5 transition hover:-translate-y-0.5 hover:bg-[#111C32] hover:shadow-sm">

            <StatCard
              title="Opportunities"
              value={
                loading
                  ? "..."
                  : opportunities.length
              }
              description="Jobs & internships"
              icon="◆"
            />

          </div>

          {/* ASSIGNMENTS */}

          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1526] p-5 transition hover:-translate-y-0.5 hover:bg-[#111C32] hover:shadow-sm">

            <StatCard
              title="Assignments"
              value={
                classroomLoading
                  ? "..."
                  : assignments.length
              }
              description={
                classroomConnected
                  ? "Upcoming assignments"
                  : "Connect Classroom"
              }
              icon="📝"
            />

          </div>

          {/* DUE SOON */}

          <div className="rounded-2xl border border-white/[0.07] bg-[#0D1526] p-5 transition hover:-translate-y-0.5 hover:bg-[#111C32] hover:shadow-sm">

            <StatCard
              title="Due Soon"
              value={
                classroomLoading
                  ? "..."
                  : dueSoonCount
              }
              description="Next 7 days"
              icon="⏰"
            />

          </div>

        </div>

        {/* ==========================================
            CLASSROOM + UPCOMING
        ========================================== */}

        <div className="mt-5 grid gap-5 lg:grid-cols-2">

          {/* ========================================
              CLASSROOM
          ======================================== */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10 text-lg">
                  📚
                </div>

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                    Google Classroom
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-white">
                    Classroom
                  </h2>

                </div>

              </div>

              <Link
                to="/classroom"
                className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-semibold text-slate-400 transition hover:border-indigo-400/30 hover:text-indigo-400"
              >
                Open →
              </Link>

            </div>

            {/* LOADING */}

            {classroomLoading ? (

              <div className="flex h-36 items-center justify-center">

                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />

              </div>

            ) : !classroomConnected ? (

              /* NOT CONNECTED */

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/10 p-5">

                <div className="flex items-start gap-4">

                  <div className="text-xl">
                    🔗
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-slate-200">
                      Connect your Classroom
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Connect Google Classroom to
                      see assignments and deadlines.
                    </p>

                    <Link
                      to="/classroom"
                      className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-[10px] font-semibold text-white transition hover:bg-indigo-500"
                    >
                      Connect Classroom
                    </Link>

                  </div>

                </div>

              </div>

            ) : (

              /* CONNECTED */

              <div className="mt-5">

                {/* STATUS */}

                <div className="flex items-center justify-between rounded-xl border border-emerald-400/10 bg-emerald-500/[0.04] px-4 py-3">

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-400">
                      Connected
                    </p>

                  </div>

                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm">
                    ✓
                  </div>

                </div>

                {/* NEXT ASSIGNMENT */}

                {nextAssignment ? (

                  <a
                    href={
                      nextAssignment.alternateLink ||
                      "/classroom"
                    }
                    target={
                      nextAssignment.alternateLink
                        ? "_blank"
                        : undefined
                    }
                    rel="noreferrer"
                    className="mt-3 block rounded-xl border border-white/10 bg-black/10 p-4 transition hover:border-indigo-500/30 hover:bg-indigo-500/[0.03]"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-[9px] font-bold uppercase tracking-wider text-indigo-400">
                          Next assignment
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-slate-200">
                          {nextAssignment.title}
                        </p>

                        <p className="mt-1 truncate text-xs text-slate-500">
                          {nextAssignment.courseName}
                        </p>

                      </div>

                      <span className="shrink-0 rounded-full bg-amber-500/10 px-2.5 py-1 text-[9px] font-semibold text-amber-400">
                        {getDueLabel(
                          nextAssignment.dueDate
                        )}
                      </span>

                    </div>

                  </a>

                ) : (

                  <div className="mt-3 rounded-xl border border-white/10 bg-black/10 p-5 text-center">

                    <div className="text-xl">
                      🎉
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-300">
                      All caught up
                    </p>

                    <p className="mt-1 text-[10px] text-slate-600">
                      No upcoming assignments.
                    </p>

                  </div>

                )}

              </div>

            )}

          </div>

          {/* ========================================
              UPCOMING
          ======================================== */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">

            {/* HEADER */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10 text-lg">
                  🔔
                </div>

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-400">
                    Deadlines
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-white">
                    Upcoming
                  </h2>

                </div>

              </div>

              {upcomingAssignments.length > 0 && (

                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold text-amber-400">
                  {upcomingAssignments.length}
                </span>

              )}

            </div>

            {/* UPCOMING LIST */}

            <div className="mt-5 max-h-[245px] space-y-2.5 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

              {classroomLoading ? (

                <div className="flex h-28 items-center justify-center">

                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />

                </div>

              ) : !classroomConnected ? (

                <div className="rounded-xl border border-white/10 bg-black/10 p-5 text-center">

                  <div className="text-xl">
                    🔗
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    Classroom not connected
                  </p>

                  <Link
                    to="/classroom"
                    className="mt-3 inline-block text-[10px] font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Connect Classroom →
                  </Link>

                </div>

              ) : upcomingAssignments.length ===
                0 ? (

                <div className="rounded-xl border border-emerald-400/10 bg-emerald-500/[0.04] p-5 text-center">

                  <div className="text-xl">
                    🎉
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    You're all caught up
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    No upcoming assignments.
                  </p>

                </div>

              ) : (

                upcomingAssignments.map(
                  (assignment) => (

                    <a
                      key={assignment.id}
                      href={
                        assignment.alternateLink ||
                        "/classroom"
                      }
                      target={
                        assignment.alternateLink
                          ? "_blank"
                          : undefined
                      }
                      rel="noreferrer"
                      className="group block rounded-xl border border-white/10 bg-black/10 p-3 transition hover:border-indigo-500/20 hover:bg-indigo-500/[0.03]"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-sm">
                          📝
                        </div>

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-indigo-400">
                            {assignment.title}
                          </p>

                          <p className="mt-1 truncate text-[10px] text-slate-600">
                            {assignment.courseName}
                          </p>

                        </div>

                        <span className="shrink-0 rounded-full bg-amber-500/10 px-2 py-1 text-[9px] font-semibold text-amber-400">
                          {getDueLabel(
                            assignment.dueDate
                          )}
                        </span>

                      </div>

                    </a>

                  )
                )

              )}

            </div>

            {/* FOOTER */}

            {classroomConnected &&
              upcomingAssignments.length > 0 && (

                <Link
                  to="/classroom"
                  className="mt-4 block text-center text-[10px] font-semibold text-slate-500 transition hover:text-indigo-400"
                >
                  View all assignments →
                </Link>

              )}

          </div>

        </div>

        {/* ==========================================
            CALENDAR
        ========================================== */}

        <div className="mt-5 grid gap-5 lg:grid-cols-3">

          {/* CALENDAR */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl lg:col-span-2">

            {/* CALENDAR HEADER */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                  📅
                </div>

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                    Academic calendar
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-white">
                    {monthName}
                  </h2>

                </div>

              </div>

              <div className="flex items-center gap-1.5">

                <button
                  onClick={previousMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-xs text-slate-400 transition hover:border-indigo-400/30 hover:text-indigo-400"
                >
                  ←
                </button>

                <button
                  onClick={goToToday}
                  className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[9px] font-semibold text-slate-400 transition hover:border-indigo-400/30 hover:text-indigo-400"
                >
                  Today
                </button>

                <button
                  onClick={nextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-xs text-slate-400 transition hover:border-indigo-400/30 hover:text-indigo-400"
                >
                  →
                </button>

              </div>

            </div>

            {/* WEEK DAYS */}

            <div className="mt-6 grid grid-cols-7">

              {[
                "Sun",
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
              ].map(
                (day) => (

                  <div
                    key={day}
                    className="pb-2 text-center text-[9px] font-bold uppercase tracking-wider text-slate-600"
                  >
                    {day}
                  </div>

                )
              )}

            </div>

            {/* CALENDAR GRID */}

            <div className="grid grid-cols-7 gap-1">

              {calendarDays.map(
                (date, index) => {

                  if (!date) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="min-h-[55px]"
                      />
                    );
                  }

                  const key =
                    `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

                  const dateAssignments =
                    assignmentDates[key] ||
                    [];

                  const hasAssignment =
                    dateAssignments.length >
                    0;

                  const isToday =
                    isSameDay(
                      date,
                      today
                    );

                  const isSelected =
                    isSameDay(
                      date,
                      selectedDate
                    );

                  return (
                    <button
                      key={key}
                      onClick={() =>
                        setSelectedDate(
                          date
                        )
                      }
                      className={`
                        relative min-h-[55px]
                        rounded-lg border
                        p-1.5 text-left
                        transition
                        ${
                          isSelected
                            ? "border-indigo-500/50 bg-indigo-500/10"
                            : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
                        }
                      `}
                    >

                      <div
                        className={`
                          flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-semibold
                          ${
                            isToday
                              ? "bg-indigo-600 text-white"
                              : "text-slate-400"
                          }
                        `}
                      >
                        {date.getDate()}
                      </div>

                      {hasAssignment && (

                        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1">

                          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />

                          <span className="text-[8px] font-bold text-amber-400">
                            {dateAssignments.length}
                          </span>

                        </div>

                      )}

                    </button>
                  );
                }
              )}

            </div>

            {/* LEGEND */}

            <div className="mt-4 flex items-center gap-4 border-t border-white/5 pt-3">

              <div className="flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />

                <span className="text-[9px] text-slate-600">
                  Today
                </span>

              </div>

              <div className="flex items-center gap-2">

                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />

                <span className="text-[9px] text-slate-600">
                  Assignment
                </span>

              </div>

            </div>

          </div>

          {/* SELECTED DATE */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">

            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Selected date
            </p>

            <h2 className="mt-2 text-lg font-bold text-white">
              {selectedDate.toLocaleDateString(
                "en-IN",
                {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }
              )}
            </h2>

            <div className="mt-5">

              {selectedDateAssignments.length ===
              0 ? (

                <div className="rounded-xl border border-white/10 bg-black/10 p-5 text-center">

                  <div className="text-xl">
                    ☕
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-300">
                    Nothing due
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    No assignment scheduled.
                  </p>

                </div>

              ) : (

                <div className="space-y-2">

                  {selectedDateAssignments.map(
                    (assignment) => (

                      <a
                        key={assignment.id}
                        href={
                          assignment.alternateLink ||
                          "/classroom"
                        }
                        target={
                          assignment.alternateLink
                            ? "_blank"
                            : undefined
                        }
                        rel="noreferrer"
                        className="block rounded-xl border border-amber-400/10 bg-amber-500/[0.04] p-3 transition hover:border-amber-400/30"
                      >

                        <div className="flex items-start gap-3">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-sm">
                            📝
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-xs font-semibold text-slate-200">
                              {assignment.title}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-slate-600">
                              {assignment.courseName}
                            </p>

                            {assignment.maxPoints !==
                              null &&
                              assignment.maxPoints !==
                                undefined && (

                                <p className="mt-2 text-[9px] text-slate-500">
                                  {assignment.maxPoints}
                                  {" "}
                                  points
                                </p>

                              )}

                          </div>

                        </div>

                      </a>

                    )
                  )}

                </div>

              )}

            </div>

            <Link
              to="/classroom"
              className="mt-5 flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-[10px] font-semibold text-slate-400 transition hover:border-indigo-500/30 hover:text-indigo-400"
            >
              Open Google Classroom →
            </Link>

          </div>

        </div>

        {/* ==========================================
            OPPORTUNITIES
        ========================================== */}

        <div className="mt-5 grid gap-5 lg:grid-cols-3">

          {/* PROFILE */}

          <div className="relative overflow-hidden rounded-3xl border border-indigo-400/10 bg-gradient-to-br from-indigo-950/60 via-[#0B1220] to-[#0A0F1C] p-6">

            <div className="relative">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10 text-lg text-indigo-400">
                ◈
              </div>

              <h2 className="mt-5 text-lg font-bold text-white">
                Complete your profile
              </h2>

              <p className="mt-2 text-xs leading-5 text-slate-400">
                Add your skills, interests and
                experience to unlock better
                recommendations.
              </p>

              <div className="mt-6">

                <div className="mb-2 flex items-center justify-between text-[10px]">

                  <span className="text-slate-500">
                    Profile completion
                  </span>

                  <span className="font-bold text-indigo-400">
                    60%
                  </span>

                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

                  <div className="h-full w-[60%] rounded-full bg-indigo-500" />

                </div>

              </div>

              <Link
                to="/profile"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-500"
              >
                Complete profile
                <span>→</span>
              </Link>

            </div>

          </div>

          {/* OPPORTUNITIES */}

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:col-span-2">

            <div className="flex items-center justify-between">

              <div>

                <div className="flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />

                  <h2 className="font-bold text-white">
                    Recommended opportunities
                  </h2>

                </div>

                <p className="mt-1.5 text-[10px] text-slate-500">
                  Jobs and internships for you
                </p>

              </div>

              <Link
                to="/opportunities"
                className="hidden rounded-lg border border-white/10 px-3 py-2 text-[10px] font-semibold text-slate-400 transition hover:border-indigo-400/30 hover:text-indigo-400 sm:block"
              >
                View all →
              </Link>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="flex h-52 items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />

                  <p className="mt-2 text-[10px] text-slate-500">
                    Finding opportunities...
                  </p>

                </div>

              </div>

            ) : opportunities.length ===
              0 ? (

              <div className="flex h-52 items-center justify-center text-center">

                <div>

                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-500">
                    ◇
                  </div>

                  <p className="mt-3 text-xs font-semibold text-slate-300">
                    No opportunities found
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    Try again later.
                  </p>

                </div>

              </div>

            ) : (

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                {opportunities
                  .slice(0, 4)
                  .map(
                    (opportunity) => (

                      <a
                        key={opportunity.id}
                        href={
                          opportunity.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="group rounded-xl border border-white/10 bg-white/[0.02] p-3 transition hover:border-indigo-500/30 hover:bg-indigo-500/[0.03]"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-400/10 bg-indigo-500/10 text-xs text-indigo-400">
                            ◆
                          </div>

                          <span className="rounded-full border border-indigo-400/10 bg-indigo-500/10 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-indigo-400">
                            {opportunity.type}
                          </span>

                        </div>

                        <p className="mt-3 line-clamp-2 text-xs font-semibold leading-5 text-slate-200 transition group-hover:text-indigo-400">
                          {opportunity.title}
                        </p>

                        <p className="mt-1.5 truncate text-[10px] text-slate-500">
                          {opportunity.company}
                        </p>

                        <p className="mt-1 truncate text-[9px] text-slate-600">
                          📍 {opportunity.location}
                        </p>

                      </a>

                    )
                  )}

              </div>

            )}

          </div>

        </div>

        {/* MOBILE */}

        <div className="mt-4 sm:hidden">

          <Link
            to="/opportunities"
            className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[10px] font-semibold text-slate-400 hover:border-indigo-500/30 hover:text-indigo-400"
          >
            View all opportunities →
          </Link>

        </div>

      </div>

    </div>
  );
};

export default Dashboard;