import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../services/api";
import Logo from "../components/Logo";

const Register = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    institute: "",
    department: "",
    year: "",
    semester: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.institute
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...formData,

        year: formData.year
          ? Number(formData.year)
          : undefined,

        semester: formData.semester
          ? Number(formData.semester)
          : undefined,
      };

      const { data } = await api.post(
        "/auth/register",
        payload
      );

      toast.success(
        "OTP sent to your college email"
      );

      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5">

          <Logo />

          <Link
            to="/login"
            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
          >
            <span className="text-base">
              ←
            </span>

            Sign in
          </Link>

        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">

        {/* Heading */}
        <div className="mb-8">

          <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              ✓
            </span>

            Student verification
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
            Create your account
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Register with your college email to access
            the verified student ecosystem.
          </p>

        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* Personal Information */}
            <div>

              <h2 className="text-base font-bold text-slate-950">
                Personal information
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Tell us a little about yourself.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Name */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Mohd Ali"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                />

              </div>

              {/* Email */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  College email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@college.edu"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                />

                <p className="mt-2 text-xs text-slate-400">
                  Use your official institute email.
                </p>

              </div>

              {/* Password */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password *
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                />

              </div>

            </div>

            <div className="h-px bg-slate-100" />

            {/* Academic Information */}
            <div>

              <h2 className="text-base font-bold text-slate-950">
                Academic information
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                This helps personalize your opportunities.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* Institute */}
              <div className="md:col-span-2">

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Institute *
                </label>

                <select
                  name="institute"
                  value={formData.institute}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">
                    Select your institute
                  </option>

                  <option value="dtc">
                    Delhi Technical Campus
                  </option>

                  <option value="dtu">
                    Delhi Technological University
                  </option>

                  <option value="nsut">
                    Netaji Subhas University of Technology
                  </option>

                  <option value="iit-delhi">
                    IIT Delhi
                  </option>

                  <option value="iiit-delhi">
                    IIIT Delhi
                  </option>

                  <option value="du">
                    University of Delhi
                  </option>

                  <option value="amity-noida">
                    Amity University Noida
                  </option>

                  <option value="iit-madras">
                    IIT Madras
                  </option>

                  <option value="iit-bombay">
                    IIT Bombay
                  </option>

                  <option value="iit-kharagpur">
                    IIT Kharagpur
                  </option>
                </select>

              </div>

              {/* Department */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Department
                </label>

                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                />

              </div>

              {/* Year */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Year
                </label>

                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">
                    Select year
                  </option>

                  <option value="1">
                    1st Year
                  </option>

                  <option value="2">
                    2nd Year
                  </option>

                  <option value="3">
                    3rd Year
                  </option>

                  <option value="4">
                    4th Year
                  </option>
                </select>

              </div>

              {/* Semester */}
              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Semester
                </label>

                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">
                    Select semester
                  </option>

                  {Array.from(
                    { length: 8 },
                    (_, i) => (
                      <option
                        key={i + 1}
                        value={i + 1}
                      >
                        Semester {i + 1}
                      </option>
                    )
                  )}

                </select>

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Creating account..."
                : "Create account"}
            </button>

          </form>

        </div>

      </main>
    </div>
  );
};

export default Register;