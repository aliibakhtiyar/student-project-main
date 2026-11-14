
import { useState } from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { login } = useAuth();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post(
        "/auth/verify-otp",
        {
          email,
          otp,
        }
      );

      login(data.token, data.user);

      toast.success("Email verified successfully");

      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-slate-50 px-4 sm:px-5">
        <div className="w-full max-w-md text-center">

          <h1 className="text-lg font-bold text-slate-950 sm:text-xl">
            Verification session expired
          </h1>

          <Link
            to="/register"
            className="mt-4 inline-block text-sm font-semibold text-slate-950 underline"
          >
            Register again
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">

      {/* Header */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-20 sm:px-5">

          <Logo />

          <Link
            to="/register"
            className="flex shrink-0 items-center gap-2 text-sm text-slate-500 transition hover:text-slate-950"
          >
            <span className="text-base">←</span>
            Back
          </Link>

        </div>

      </header>

      {/* Main */}

      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-3 py-8 sm:min-h-[calc(100vh-80px)] sm:px-5 sm:py-10">

        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 md:p-9">

          {/* Icon */}

          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-xl text-white">
            ✓
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Verify your email
          </h1>

          <p className="mt-2 break-words text-sm leading-6 text-slate-500">
            Enter the 6-digit code sent to{" "}
            <span className="break-all font-semibold text-slate-800">
              {email}
            </span>
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-7"
          >

            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              autoComplete="one-time-code"
              className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-4 text-center text-xl font-bold tracking-[0.35em] outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-100 sm:text-2xl sm:tracking-[0.45em]"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-slate-950 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Verifying..."
                : "Verify email"}
            </button>

          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            The OTP is valid for 10 minutes.
          </p>

        </div>

      </main>

    </div>
  );
};

export default VerifyOTP;
