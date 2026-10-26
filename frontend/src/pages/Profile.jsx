import { useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, getCurrentUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    department: user?.department || "",
    year: user?.year || "",
    semester: user?.semester || "",
    github: user?.github || "",
    linkedin: user?.linkedin || "",
  });

  const firstLetter =
    user?.name?.charAt(0)?.toUpperCase() || "S";

  /* =========================
     FORM CHANGE
  ========================= */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     EDIT
  ========================= */

  const handleEdit = () => {
    setFormData({
      name: user?.name || "",
      department: user?.department || "",
      year: user?.year || "",
      semester: user?.semester || "",
      github: user?.github || "",
      linkedin: user?.linkedin || "",
    });

    setEditing(true);
  };

  /* =========================
     CANCEL
  ========================= */

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      department: user?.department || "",
      year: user?.year || "",
      semester: user?.semester || "",
      github: user?.github || "",
      linkedin: user?.linkedin || "",
    });

    setEditing(false);
  };

  /* =========================
     UPDATE PROFILE
  ========================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await api.put("/auth/profile", {
        name: formData.name,
        department: formData.department,

        year: formData.year
          ? Number(formData.year)
          : undefined,

        semester: formData.semester
          ? Number(formData.semester)
          : undefined,

        github: formData.github,
        linkedin: formData.linkedin,
      });

      await getCurrentUser();

      toast.success("Profile updated successfully");

      setEditing(false);
    } catch (error) {
      console.error("Profile Update Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Unable to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-full bg-[#070B14] text-white">

      <div className="mx-auto max-w-6xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Account
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
              Profile
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your student profile and account information.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={handleEdit}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Edit Profile
            </button>
          )}

        </div>

        {/* ================= PROFILE CARD ================= */}

        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B111D] shadow-sm"
        >

          {/* ================= COVER ================= */}

          <div className="relative h-32 bg-[#111827]">

            {/* subtle decoration */}

            <div className="absolute right-8 top-7 h-24 w-24 rounded-full bg-indigo-600/10 blur-2xl" />

            <div className="absolute left-1/3 top-0 h-20 w-20 rounded-full bg-blue-600/5 blur-2xl" />

            {/* Avatar */}

            <div className="absolute left-6 top-20 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-[#0B111D] bg-indigo-600 text-2xl font-bold text-white shadow-lg md:left-8">

              {firstLetter}

            </div>

          </div>

          {/* ================= PROFILE INFO ================= */}

          <div className="px-6 pb-8 pt-14 md:px-8">

            {/* NAME */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-xl font-bold text-white">
                    {user?.name || "Student"}
                  </h2>

                  {user?.isStudentVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      ✓ Verified
                    </span>
                  )}

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {user?.institute || "Institute not added"}
                </p>

              </div>

            </div>

            <div className="my-7 h-px bg-slate-800" />

            {/* ================= BASIC INFORMATION ================= */}

            <div>

              <h3 className="text-sm font-bold text-white">
                Basic information
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                {/* FULL NAME */}

                <div className="rounded-xl border border-slate-800 bg-[#0D1320] p-4">

                  <label className="text-xs text-slate-500">
                    Full name
                  </label>

                  {editing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2.5 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {user?.name || "Not available"}
                    </p>
                  )}

                </div>

                {/* COLLEGE EMAIL */}

                <div className="rounded-xl border border-slate-800 bg-[#0D1320] p-4">

                  <div className="flex gap-3">

                    <span className="mt-0.5 text-lg text-slate-500">
                      ✉
                    </span>

                    <div className="min-w-0">

                      <p className="text-xs text-slate-500">
                        College email
                      </p>

                      <p className="mt-1 break-all text-sm font-semibold text-slate-200">
                        {user?.email || "Not available"}
                      </p>

                    </div>

                  </div>

                  <p className="mt-2 text-[10px] text-slate-600">
                    College email cannot be changed.
                  </p>

                </div>

                {/* INSTITUTE */}

                <div className="rounded-xl border border-slate-800 bg-[#0D1320] p-4">

                  <label className="text-xs text-slate-500">
                    Institute
                  </label>

                  <p className="mt-1 text-sm font-semibold text-slate-200">
                    {user?.institute || "Not added"}
                  </p>

                  <p className="mt-2 text-[10px] text-emerald-500">
                    ✓ Verified institute
                  </p>

                </div>

                {/* DEPARTMENT */}

                <div className="rounded-xl border border-slate-800 bg-[#0D1320] p-4">

                  <label className="text-xs text-slate-500">
                    Department
                  </label>

                  {editing ? (
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="e.g. Computer Science"
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2.5 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {user?.department || "Not added"}
                    </p>
                  )}

                </div>

                {/* YEAR */}

                <div className="rounded-xl border border-slate-800 bg-[#0D1320] p-4">

                  <label className="text-xs text-slate-500">
                    Academic year
                  </label>

                  {editing ? (
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2.5 text-sm font-medium text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="">
                        Select year
                      </option>

                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                      <option value="5">Year 5</option>
                      <option value="6">Year 6</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {user?.year
                        ? `Year ${user.year}`
                        : "Not added"}
                    </p>
                  )}

                </div>

                {/* SEMESTER */}

                <div className="rounded-xl border border-slate-800 bg-[#0D1320] p-4">

                  <label className="text-xs text-slate-500">
                    Semester
                  </label>

                  {editing ? (
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2.5 text-sm font-medium text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    >
                      <option value="">
                        Select semester
                      </option>

                      {Array.from(
                        { length: 12 },
                        (_, index) => (
                          <option
                            key={index + 1}
                            value={index + 1}
                          >
                            Semester {index + 1}
                          </option>
                        )
                      )}
                    </select>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {user?.semester
                        ? `Semester ${user.semester}`
                        : "Not added"}
                    </p>
                  )}

                </div>

              </div>

            </div>

            {/* ================= SOCIAL PROFILES ================= */}

            <div className="mt-8">

              <h3 className="text-sm font-bold text-white">
                Social profiles
              </h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2">

                {/* GITHUB */}

                <div className="rounded-xl border border-slate-800 bg-[#0D1320] p-4">

                  <label className="text-xs text-slate-500">
                    GitHub
                  </label>

                  {editing ? (
                    <input
                      type="url"
                      name="github"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2.5 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  ) : user?.github ? (
                    <a
                      href={user.github}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      {user.github}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      Not added
                    </p>
                  )}

                </div>

                {/* LINKEDIN */}

                <div className="rounded-xl border border-slate-800 bg-[#0D1320] p-4">

                  <label className="text-xs text-slate-500">
                    LinkedIn
                  </label>

                  {editing ? (
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-2 w-full rounded-lg border border-slate-700 bg-[#070B14] px-3 py-2.5 text-sm font-medium text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  ) : user?.linkedin ? (
                    <a
                      href={user.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                    >
                      {user.linkedin}
                    </a>
                  ) : (
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      Not added
                    </p>
                  )}

                </div>

              </div>

            </div>

            {/* ================= ACTION BUTTONS ================= */}

            {editing && (
              <div className="mt-8 flex justify-end gap-3 border-t border-slate-800 pt-6">

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-xl border border-slate-700 bg-transparent px-5 py-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>
            )}

          </div>

        </form>

      </div>

    </div>
  );
};

export default Profile;