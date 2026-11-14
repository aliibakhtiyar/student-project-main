
import {
  CalendarDays,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";

const AssignmentCard = ({ assignment }) => {

  const getStatus = () => {
    if (assignment.status === "TURNED_IN") {
      return {
        text: "Submitted",
        className: "text-green-400 bg-green-500/10",
        icon: CheckCircle2,
      };
    }

    return {
      text: "Pending",
      className: "text-yellow-400 bg-yellow-500/10",
      icon: Clock,
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  const formatDate = (date) => {
    if (!date) return "No due date";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-w-0 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800
    hover:border-indigo-500/40 transition">

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 min-w-0">

        <div className="min-w-0">
          <p className="text-sm text-indigo-400 font-medium break-words">
            {assignment.courseName}
          </p>

          <h3 className="text-lg font-semibold mt-2 break-words">
            {assignment.title}
          </h3>
        </div>

        <span
          className={`flex w-fit shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-full
          text-xs font-medium ${status.className}`}
        >
          <StatusIcon size={14} />
          {status.text}
        </span>

      </div>


      {assignment.description && (
        <p className="text-sm text-slate-400 mt-4 line-clamp-3 break-words">
          {assignment.description}
        </p>
      )}


      <div className="mt-5 space-y-3">

        <div className="flex items-start gap-2 text-sm text-slate-400 min-w-0">
          <CalendarDays size={17} className="shrink-0 mt-0.5" />
          <span className="break-words min-w-0">
            {formatDate(assignment.dueDate)}
          </span>
        </div>


        {assignment.maxPoints !== null && (
          <div className="text-sm text-slate-400">
            Points:{" "}
            <span className="text-white font-medium">
              {assignment.maxPoints}
            </span>
          </div>
        )}


        {assignment.assignedGrade !== null && (
          <div className="text-sm text-slate-400">
            Grade:{" "}
            <span className="text-green-400 font-medium">
              {assignment.assignedGrade}
            </span>
          </div>
        )}

      </div>


      {assignment.alternateLink && (
        <a
          href={assignment.alternateLink}
          target="_blank"
          rel="noreferrer"
          className="mt-5 w-full flex items-center justify-center gap-2
          px-3 sm:px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500
          transition text-sm font-medium text-center"
        >
          Open in Google Classroom
          <ExternalLink size={16} className="shrink-0" />
        </a>
      )}

    </div>
  );
};

export default AssignmentCard;
