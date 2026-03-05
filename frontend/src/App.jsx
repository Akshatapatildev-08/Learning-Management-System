import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseDetailsPage from './pages/CourseDetailsPage.jsx';
import LearningPage from './pages/LearningPage.jsx';

function authUser() {
  const raw = localStorage.getItem('lms_user');
  return raw ? JSON.parse(raw) : null;
}

function Protected({ children }) {
  const token = localStorage.getItem('lms_token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function NavBar() {
  const navigate = useNavigate();
  const user = authUser();

  const logout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    navigate('/login');
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">LMS</Link>
      <nav>
        <Link to="/" className="nav-link">Courses</Link>
        {user ? (
          <button onClick={logout} className="btn btn-outline">Logout ({user.name})</button>
        ) : (
          <Link to="/login" className="btn btn-outline">Login</Link>
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
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <Protected>
                <CoursesPage />
              </Protected>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <Protected>
                <CourseDetailsPage />
              </Protected>
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
        </Routes>
      </main>
    </div>
  );
}
