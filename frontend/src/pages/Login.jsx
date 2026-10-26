import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post(
        "/auth/login",
        formData
      );

      login(data.token, data.user);

      toast.success("Welcome back!");

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Unable to login"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">

      {/* =========================
          LEFT SECTION
      ========================= */}

      <div className="hidden bg-slate-950 p-12 lg:flex lg:flex-col lg:justify-between">

        <Logo light />

        <div className="max-w-xl">

          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">

            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              ✓
            </span>

            Verified student ecosystem

          </div>

          <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-white">
            Your campus.
            <br />
            Your opportunities.
            <br />
            One place.
          </h1>

          <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
            Discover events, internships, jobs and student
            opportunities tailored to you.
          </p>

        </div>

        <p className="text-xs text-slate-600">
          UniSphere © 2026
        </p>

      </div>

      {/* =========================
          RIGHT SECTION
      ========================= */}

      <div className="flex min-h-screen items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* Mobile Logo */}

          <div className="mb-10 lg:hidden">
            <Logo />
          </div>

          {/* Heading */}

          <div className="mb-8">

            <h2 className="text-3xl font-bold tracking-tight text-slate-950">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to continue to your student dashboard.
            </p>

          </div>

          {/* Form */}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                College email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@college.edu"
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
              />

            </div>

            {/* Password */}

            <div>

              <div className="mb-2 flex items-center justify-between">

                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>

                <button
                  type="button"
                  className="text-xs font-medium text-slate-400 hover:text-slate-900"
                  onClick={() =>
                    toast("Password reset will be available soon.")
                  }
                >
                  Forgot password?
                </button>

              </div>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-100"
                />

                {/* Show / Hide Password */}

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Signing in..."
                : "Sign in"}
            </button>

          </form>

          {/* Divider */}

          <div className="my-7 flex items-center gap-4">

            <div className="h-px flex-1 bg-slate-100" />

            <span className="text-xs text-slate-400">
              New here?
            </span>

            <div className="h-px flex-1 bg-slate-100" />

          </div>

          {/* Register */}

          <Link
            to="/register"
            className="block w-full rounded-xl border border-slate-200 px-4 py-3.5 text-center text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Create student account
          </Link>

        </div>

      </div>

    </div>
  );
};

export default Login;