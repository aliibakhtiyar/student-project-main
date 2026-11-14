
import { useEffect, useState } from "react";
import {
  BookOpen,
  RefreshCw,
  Plus,
  Users,
  ClipboardList,
} from "lucide-react";
import UpcomingAssignments from "../components/UpcomingAssignments";

const API_URL = "https://student-project-main.onrender.com";

const Classroom = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/classroom/courses`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch courses");
      }

      setCourses(data.courses || []);
      setConnected(true);
    } catch (err) {
      console.error(err);
      setConnected(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const connectClassroom = () => {
    window.location.href =
      `${API_URL}/api/classroom/connect`;
  };

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-950 p-3 text-white sm:p-5 md:p-8">

      <div className="mx-auto w-full max-w-7xl min-w-0">

        {/* Header */}
        <div className="mb-6 flex min-w-0 flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">

          <div className="min-w-0">

            <div className="flex min-w-0 items-center gap-3">

              <div className="shrink-0 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2.5 sm:p-3">
                <BookOpen className="text-indigo-400" size={26} />
              </div>

              <div className="min-w-0">

                <h1 className="break-words text-2xl font-bold sm:text-3xl">
                  Google Classroom
                </h1>

                <p className="mt-1 text-sm leading-5 text-slate-400">
                  Manage your classes and assignments
                </p>

              </div>

            </div>

          </div>

          {/* ACTION BUTTONS */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">

            <button
              onClick={fetchCourses}
              disabled={loading}
              className="flex min-w-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm transition hover:bg-slate-700 disabled:opacity-50 sm:px-4"
            >
              <RefreshCw
                size={17}
                className={`shrink-0 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>

            <button
              onClick={connectClassroom}
              className="flex min-w-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-medium transition hover:bg-indigo-500 sm:px-4"
            >
              <Plus size={17} className="shrink-0" />
              <span className="truncate">
                {connected ? "Reconnect" : "Connect Classroom"}
              </span>
            </button>

          </div>

        </div>

        {/* Connection Status */}
        <div
          className={`mb-6 rounded-xl border p-3 sm:mb-8 sm:p-4 ${
            connected
              ? "bg-green-500/10 border-green-500/20"
              : "bg-yellow-500/10 border-yellow-500/20"
          }`}
        >

          <div className="flex min-w-0 items-start gap-3">

            <div
              className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                connected
                  ? "bg-green-400"
                  : "bg-yellow-400"
              }`}
            />

            <div className="min-w-0">

              <p className="break-words text-sm font-medium sm:text-base">
                {connected
                  ? "Google Classroom Connected"
                  : "Google Classroom Not Connected"}
              </p>

              <p className="mt-1 break-words text-xs leading-5 text-slate-400 sm:text-sm">
                {connected
                  ? "Your Classroom courses are available below."
                  : "Connect your Google Classroom account to continue."}
              </p>

            </div>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 break-words rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 sm:mb-8 sm:p-4">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 sm:mb-10">

          {/* Active Classes */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">

            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">

                <p className="text-sm text-slate-400">
                  Active Classes
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  {loading ? "—" : courses.length}
                </h2>

              </div>

              <div className="shrink-0 rounded-xl bg-indigo-500/10 p-3">
                <BookOpen
                  size={23}
                  className="text-indigo-400"
                />
              </div>

            </div>

          </div>

          {/* Assignments */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">

            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">

                <p className="text-sm text-slate-400">
                  Assignments
                </p>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  —
                </h2>

              </div>

              <div className="shrink-0 rounded-xl bg-orange-500/10 p-3">
                <ClipboardList
                  size={23}
                  className="text-orange-400"
                />
              </div>

            </div>

          </div>

          {/* Connection */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5">

            <div className="flex items-center justify-between gap-3">

              <div className="min-w-0">

                <p className="text-sm text-slate-400">
                  Connection
                </p>

                <h2 className="mt-2 break-words text-base font-semibold sm:text-lg">
                  {connected ? "Connected" : "Not Connected"}
                </h2>

              </div>

              <div className="shrink-0 rounded-xl bg-green-500/10 p-3">
                <Users
                  size={23}
                  className="text-green-400"
                />
              </div>

            </div>

          </div>

        </div>

        {/* Courses */}
        <section className="mb-8 min-w-0 sm:mb-12">

          <div className="mb-5">

            <h2 className="text-xl font-bold sm:text-2xl">
              My Classes
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Your active Google Classroom courses
            </p>

          </div>

          {loading ? (

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"
                />
              ))}

            </div>

          ) : courses.length === 0 ? (

            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-4 py-10 text-center sm:p-10">

              <BookOpen
                size={40}
                className="mx-auto mb-4 text-slate-600"
              />

              <h3 className="text-lg font-semibold">
                No active classes found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
                Make sure you have joined at least one Google Classroom.
              </p>

            </div>

          ) : (

            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">

              {courses.map((course) => (

                <div
                  key={course.id}
                  className="group min-w-0 rounded-2xl border border-slate-800 bg-slate-900 p-4 transition hover:border-indigo-500/40 hover:bg-slate-900/80 sm:p-5"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div className="shrink-0 rounded-xl bg-indigo-500/10 p-3">
                      <BookOpen
                        size={22}
                        className="text-indigo-400"
                      />
                    </div>

                    <span className="shrink-0 rounded-full bg-green-500/10 px-2.5 py-1 text-xs text-green-400">
                      Active
                    </span>

                  </div>

                  <h3 className="mt-5 break-words text-lg font-semibold leading-6">
                    {course.name}
                  </h3>

                  {course.section && (
                    <p className="mt-2 break-words text-sm text-slate-400">
                      {course.section}
                    </p>
                  )}

                  {course.descriptionHeading && (
                    <p className="mt-3 line-clamp-2 break-words text-sm leading-5 text-slate-500">
                      {course.descriptionHeading}
                    </p>
                  )}

                </div>

              ))}

            </div>

          )}

        </section>

        {/* Assignments */}
        <section className="min-w-0">
          <UpcomingAssignments />
        </section>

      </div>

    </div>
  );
};

export default Classroom;
