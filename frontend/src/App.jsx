import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
const QuizPractice = lazy(() => import("./pages/QuizPractice"));
const SkillStats = lazy(() => import("./pages/community/SkillStats"));
const Leaderboard = lazy(() => import("./pages/community/Leaderboard"));
const Friends = lazy(() => import("./pages/community/Friends"));
const Battles = lazy(() => import("./pages/community/Battles"));
const BattleRoom = lazy(() => import("./pages/community/BattleRoom"));
const StudyRooms = lazy(() => import("./pages/community/StudyRooms"));
const StudyRoom = lazy(() => import("./pages/community/StudyRoom"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Hackathons = lazy(() => import("./pages/Hackathons"));
const VerifyOTP = lazy(() => import("./pages/VerifyOTP"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Events = lazy(() => import("./pages/Events"));
const Opportunities = lazy(() => import("./pages/Opportunities"));
const Profile = lazy(() => import("./pages/Profile"));
const ResumeBuilder = lazy(() => import("./pages/ResumeBuilder"));
const Classroom = lazy(() => import("./pages/Classroom"));
// import ClassroomNotes from "./pages/ClassroomNotes";

const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));

import { useAuth } from "./context/AuthContext";
const Benefits = lazy(() => import("./pages/Benefits"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));

// Each page retains its own suspense boundary so the surrounding layout stays mounted.
const PageFallback = () => (
  <div className="flex min-h-[45vh] w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
  </div>
);

const LazyPage = ({ component: Component }) => (
  <Suspense fallback={<PageFallback />}>
    <Component />
  </Suspense>
);

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
        element={<LazyPage component={Login} />}
      />

      <Route
        path="/register"
        element={<LazyPage component={Register} />}
      />


      <Route
        path="/verify-otp"
        element={<LazyPage component={VerifyOTP} />}
      />


      {/* =========================
          PROTECTED ROUTES
      ========================= */}

      <Route
        element={
          <ProtectedRoute>
            <LazyPage component={DashboardLayout} />
          </ProtectedRoute>
        }
      >

        <Route
          path="/dashboard"
          element={<LazyPage component={Dashboard} />}
        />
              <Route path="/classroom" element={<LazyPage component={Classroom} />} />
              <Route path="/ai-assistant" element={<LazyPage component={AIAssistant} />} />
              <Route path="/public-profile" element={<LazyPage component={PublicProfile} />} />
        <Route
          path="/events"
          element={<LazyPage component={Events} />}
        />

        <Route
          path="/hackathons"
          element={<LazyPage component={Hackathons} />}
        />

        <Route
          path="/opportunities"
          element={<LazyPage component={Opportunities} />}
        />

        <Route
          path="/benefits"
          element={<LazyPage component={Benefits} />}
        />

        <Route
          path="/resume-builder"
          element={<LazyPage component={ResumeBuilder} />}
        />
        <Route
  path="/quiz-practice"
  element={<LazyPage component={QuizPractice} />}
/>

        <Route path="/skill-stats" element={<LazyPage component={SkillStats} />} />
        <Route path="/leaderboard" element={<LazyPage component={Leaderboard} />} />
        <Route path="/friends" element={<LazyPage component={Friends} />} />
        <Route path="/battles" element={<LazyPage component={Battles} />} />
        <Route path="/battles/:id" element={<LazyPage component={BattleRoom} />} />
        <Route path="/study-rooms" element={<LazyPage component={StudyRooms} />} />
        <Route path="/study-rooms/:id" element={<LazyPage component={StudyRoom} />} />
        <Route
          path="/profile"
          element={<LazyPage component={Profile} />}
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