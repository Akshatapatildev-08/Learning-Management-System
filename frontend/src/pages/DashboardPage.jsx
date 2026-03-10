import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrolled, setEnrolled] = useState([]);
  const [error, setError] = useState('');

  const logout = () => {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    sessionStorage.clear();
    window.dispatchEvent(new Event('lms:logout'));
    navigate('/login', { replace: true, state: { resetForm: true } });
  };

  useEffect(() => {
    Promise.all([api.courses(), api.enrollmentsMine()])
      .then(([allCourses, myCourses]) => {
        setCourses(allCourses);
        setEnrolled(myCourses);
      })
      .catch((err) => setError(err.message));
  }, []);

  const enrolledSet = useMemo(() => new Set(enrolled.map((c) => c.id)), [enrolled]);
  const availableCourses = useMemo(
    () => courses.filter((course) => !enrolledSet.has(course.id)),
    [courses, enrolledSet]
  );

  return (
    <section className="dashboard">
      <div className="row row-space">
        <h1>Dashboard</h1>
        <button className="btn btn-outline" onClick={logout}>Logout</button>
      </div>
      {error ? <p className="error">{error}</p> : null}

      <div>
        <h2>Available Courses</h2>
        <div className="grid">
          {availableCourses.map((course) => (
            <article className="card" key={course.id}>
              <img src={course.thumbnail} alt={course.title} className="thumb" />
              <h3>{course.title}</h3>
              <p className="muted">Instructor: {course.instructor_name}</p>
              <p>{course.short_description}</p>
              <Link className="btn btn-outline" to={`/courses/${course.id}`}>Course Details</Link>
            </article>
          ))}
          {availableCourses.length === 0 ? <p className="muted">No available courses right now.</p> : null}
        </div>
      </div>

      <div>
        <h2>Enrolled Courses</h2>
        <div className="grid">
          {enrolled.map((course) => (
            <article className="card" key={course.id}>
              <img src={course.thumbnail} alt={course.title} className="thumb" />
              <h3>{course.title}</h3>
              <p>{course.short_description}</p>
              <div className="row">
                <span className="badge">Enrolled</span>
                <Link className="btn" to={`/learn/${course.id}`}>Continue Learning</Link>
              </div>
            </article>
          ))}
          {enrolled.length === 0 ? <p className="muted">You have not enrolled in any course yet.</p> : null}
        </div>
      </div>
    </section>
  );
}
