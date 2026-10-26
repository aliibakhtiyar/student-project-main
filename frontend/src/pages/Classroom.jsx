import { useEffect, useState } from "react";
import { BookOpen, RefreshCw, Plus, Users, ClipboardList } from "lucide-react";
import UpcomingAssignments from "../components/UpcomingAssignments";

const API_URL = "http://localhost:5000";

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
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-8">

      {/* Header */}
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <BookOpen className="text-indigo-400" size={28} />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  Google Classroom
                </h1>

                <p className="text-slate-400 mt-1">
                  Manage your classes and assignments
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchCourses}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-slate-800 hover:bg-slate-700 border border-slate-700
              transition"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <button
              onClick={connectClassroom}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
              bg-indigo-600 hover:bg-indigo-500 transition font-medium"
            >
              <Plus size={18} />
              {connected ? "Reconnect" : "Connect Classroom"}
            </button>

          </div>
        </div>


        {/* Connection Status */}
        <div
          className={`mb-8 p-4 rounded-xl border ${
            connected
              ? "bg-green-500/10 border-green-500/20"
              : "bg-yellow-500/10 border-yellow-500/20"
          }`}
        >
          <div className="flex items-center gap-3">

            <div
              className={`w-3 h-3 rounded-full ${
                connected
                  ? "bg-green-400"
                  : "bg-yellow-400"
              }`}
            />

            <div>
              <p className="font-medium">
                {connected
                  ? "Google Classroom Connected"
                  : "Google Classroom Not Connected"}
              </p>

              <p className="text-sm text-slate-400">
                {connected
                  ? "Your Classroom courses are available below."
                  : "Connect your Google Classroom account to continue."}
              </p>
            </div>

          </div>
        </div>


        {/* Error */}
        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300">
            {error}
          </div>
        )}


        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Active Classes
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {loading ? "—" : courses.length}
                </h2>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10">
                <BookOpen
                  size={24}
                  className="text-indigo-400"
                />
              </div>
            </div>
          </div>


          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Assignments
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  —
                </h2>
              </div>

              <div className="p-3 rounded-xl bg-orange-500/10">
                <ClipboardList
                  size={24}
                  className="text-orange-400"
                />
              </div>
            </div>
          </div>


          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">
                  Connection
                </p>

                <h2 className="text-lg font-semibold mt-2">
                  {connected ? "Connected" : "Not Connected"}
                </h2>
              </div>

              <div className="p-3 rounded-xl bg-green-500/10">
                <Users
                  size={24}
                  className="text-green-400"
                />
              </div>
            </div>
          </div>

        </div>


        {/* Courses */}
        <section className="mb-12">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-2xl font-bold">
                My Classes
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                Your active Google Classroom courses
              </p>
            </div>
          </div>


          {loading ? (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-44 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse"
                />
              ))}

            </div>

          ) : courses.length === 0 ? (

            <div className="p-10 text-center rounded-2xl bg-slate-900 border border-slate-800">

              <BookOpen
                size={40}
                className="mx-auto text-slate-600 mb-4"
              />

              <h3 className="text-lg font-semibold">
                No active classes found
              </h3>

              <p className="text-slate-400 mt-2">
                Make sure you have joined at least one Google Classroom.
              </p>

            </div>

          ) : (

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

              {courses.map((course) => (

                <div
                  key={course.id}
                  className="group p-5 rounded-2xl bg-slate-900
                  border border-slate-800 hover:border-indigo-500/40
                  hover:bg-slate-900/80 transition"
                >

                  <div className="flex items-start justify-between">

                    <div className="p-3 rounded-xl bg-indigo-500/10">
                      <BookOpen
                        size={22}
                        className="text-indigo-400"
                      />
                    </div>

                    <span className="text-xs px-2.5 py-1 rounded-full
                    bg-green-500/10 text-green-400">
                      Active
                    </span>

                  </div>


                  <h3 className="text-lg font-semibold mt-5 line-clamp-2">
                    {course.name}
                  </h3>


                  {course.section && (
                    <p className="text-sm text-slate-400 mt-2">
                      {course.section}
                    </p>
                  )}


                  {course.descriptionHeading && (
                    <p className="text-sm text-slate-500 mt-3 line-clamp-2">
                      {course.descriptionHeading}
                    </p>
                  )}

                </div>

              ))}

            </div>

          )}

        </section>


        {/* Assignments */}
        <section>

          <UpcomingAssignments />

        </section>

      </div>
    </div>
  );
};

export default Classroom;