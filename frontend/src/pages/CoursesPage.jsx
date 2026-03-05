import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  const enroll = async (courseId) => {
    setError('');
    try {
      await api.enroll(courseId);
      alert('Enrolled successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    api.courses().then(setCourses).catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <h1>Available Courses</h1>
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
              <button className="btn" onClick={() => enroll(course.id)}>Enroll</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
