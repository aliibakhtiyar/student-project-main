import { Navigate, Route, Routes } from "react-router-dom";
import QuizPractice from "./pages/QuizPractice";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Hackathons from "./pages/Hackathons";
import VerifyOTP from "./pages/VerifyOTP";

import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import Opportunities from "./pages/Opportunities";
import Profile from "./pages/Profile";
import ResumeBuilder from "./pages/ResumeBuilder";
import Classroom from "./pages/Classroom";
// import ClassroomNotes from "./pages/ClassroomNotes";

import DashboardLayout from "./layouts/DashboardLayout";

import { useAuth } from "./context/AuthContext";
import Benefits from "./pages/Benefits";
import AIAssistant from "./pages/AIAssistant";
import PublicProfile from "./pages/PublicProfile";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>

      {/* =========================
          PUBLIC ROUTES
      ========================= */}

      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      <Route
        path="/verify-otp"
        element={<VerifyOTP />}
      />


      {/* =========================
          PROTECTED ROUTES
      ========================= */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
              <Route path="/classroom" element={<Classroom />} />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/public-profile" element={<PublicProfile />} />
        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/hackathons"
          element={<Hackathons />}
        />

        <Route
          path="/opportunities"
          element={<Opportunities />}
        />

        <Route
          path="/benefits"
          element={<Benefits />}
        />

        <Route
          path="/resume-builder"
          element={<ResumeBuilder />}
        />
        <Route
  path="/quiz-practice"
  element={<QuizPractice />}
/>

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Route>


      {/* =========================
          FALLBACK
      ========================= */}

      <Route
        path="*"
        element={<Navigate to="/dashboard" replace />}
      />

    </Routes>
  );
};

export default App;