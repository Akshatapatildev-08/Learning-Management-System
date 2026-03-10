import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseDetailsPage from './pages/CourseDetailsPage.jsx';
import LearningPage from './pages/LearningPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

function authUser() {
  const raw = localStorage.getItem('lms_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function Protected({ children }) {
  const token = localStorage.getItem('lms_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function NavBar() {
  const navigate = useNavigate();
  const user = authUser();
  const isLoggedIn = Boolean(localStorage.getItem('lms_token'));

  const logout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    sessionStorage.clear();
    window.dispatchEvent(new Event('lms:logout'));
    navigate('/login', { replace: true, state: { resetForm: true } });
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">LMS</Link>
      <nav>
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/courses" className="nav-link">Courses</Link>
        {isLoggedIn ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <button onClick={logout} className="btn btn-outline">
              {user?.name ? `Logout (${user.name})` : 'Logout'}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/signup" className="btn">Signup</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage initialMode="login" />} />
          <Route path="/signup" element={<LoginPage initialMode="signup" />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route
            path="/dashboard"
            element={
              <Protected>
                <DashboardPage />
              </Protected>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <CourseDetailsPage />
            }
          />
          <Route
            path="/learn/:courseId"
            element={
              <Protected>
                <LearningPage />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
