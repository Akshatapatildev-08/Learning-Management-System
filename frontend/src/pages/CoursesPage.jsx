import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [error, setError] = useState('');
  const hasToken = Boolean(localStorage.getItem('lms_token'));

  const enroll = async (courseId) => {
    setError('');
    try {
      await api.enroll(courseId);
      setEnrolledIds((prev) => new Set([...prev, Number(courseId)]));
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    api.courses().then(setCourses).catch((err) => setError(err.message));
    if (hasToken) {
      api
        .enrollmentsMine()
        .then((enrolled) => setEnrolledIds(new Set(enrolled.map((course) => course.id))))
        .catch(() => setEnrolledIds(new Set()));
    }
  }, [hasToken]);

  return (
    <section>
      <h1>Courses</h1>
      {error ? <p className="error">{error}</p> : null}
      <div className="grid">
        {courses.map((course) => (
          <article className="card" key={course.id}>
            <img src={course.thumbnail} alt={course.title} className="thumb" />
            <h3>{course.title}</h3>
            <p className="muted">Instructor: {course.instructor_name}</p>
            <p>{course.short_description}</p>
            <div className="row">
              <Link className="btn btn-outline" to={`/courses/${course.id}`}>Details</Link>
              {hasToken ? (
                enrolledIds.has(course.id) ? (
                  <span className="badge">Already Enrolled</span>
                ) : (
                  <button className="btn" onClick={() => enroll(course.id)}>Enroll</button>
                )
              ) : (
                <Link className="btn" to="/login">Login to Enroll</Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
