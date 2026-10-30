import { useEffect, useState } from "react";
import { ClipboardList, RefreshCw } from "lucide-react";
import AssignmentCard from "./AssignmentCard";

const API_URL = "https://student-project-main.onrender.com";

const UpcomingAssignments = () => {

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/classroom/assignments`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch assignments"
        );
      }

      setAssignments(data.assignments || []);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center
      sm:justify-between gap-4 mb-5">

        <div>

          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList
              size={25}
              className="text-indigo-400"
            />

            Upcoming Assignments
          </h2>

          <p className="text-slate-400 text-sm mt-1">
            Assignments collected from your Google Classroom
          </p>

        </div>


        <button
          onClick={fetchAssignments}
          disabled={loading}
          className="flex items-center justify-center gap-2
          px-4 py-2 rounded-xl bg-slate-800
          hover:bg-slate-700 border border-slate-700 transition"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>

      </div>


      {/* Error */}
      {error && (
        <div className="p-4 mb-5 rounded-xl bg-red-500/10
        border border-red-500/20 text-red-300">
          {error}
        </div>
      )}


      {/* Loading */}
      {loading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-64 rounded-2xl bg-slate-900
              border border-slate-800 animate-pulse"
            />
          ))}

        </div>
      )}


      {/* Empty */}
      {!loading && !error && assignments.length === 0 && (
        <div className="p-10 text-center rounded-2xl
        bg-slate-900 border border-slate-800">

          <ClipboardList
            size={40}
            className="mx-auto text-slate-600 mb-4"
          />

          <h3 className="text-lg font-semibold">
            No upcoming assignments
          </h3>

          <p className="text-slate-400 mt-2">
            You don't have any upcoming assignments.
          </p>

        </div>
      )}


      {/* Assignments */}
      {!loading && assignments.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">

          {assignments.map((assignment) => (
            <AssignmentCard
              key={`${assignment.courseId}-${assignment.id}`}
              assignment={assignment}
            />
          ))}

        </div>
      )}

    </div>
  );
};

export default UpcomingAssignments;