import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function CourseDetailsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [error, setError] = useState('');

  const enroll = async () => {
    setError('');
    try {
      await api.enroll(courseId);
      navigate(`/learn/${courseId}`);
    } catch (err) {
      if (err.message.includes('Already')) {
        navigate(`/learn/${courseId}`);
        return;
      }
      setError(err.message);
    }
  };

  useEffect(() => {
    api.courseById(courseId).then(setCourse).catch((err) => setError(err.message));
  }, [courseId]);

  if (!course) return <p>Loading...</p>;

  return (
    <section className="card details">
      <img src={course.thumbnail} alt={course.title} className="detail-thumb" />
      <div>
        <p className="muted">{course.category}</p>
        <h1>{course.title}</h1>
        <p className="muted">Instructor: {course.instructor_name}</p>
        <p>{course.description}</p>
        <h3>What You Will Learn</h3>
        <p>{course.what_you_will_learn}</p>
        <p>Total lessons: {course.total_lessons}</p>
        <p>Total duration: {formatDuration(course.total_duration_seconds)}</p>
        {error ? <p className="error">{error}</p> : null}
        <div className="row">
          <Link to="/" className="btn btn-outline">Back</Link>
          <button className="btn" onClick={enroll}>Enroll</button>
        </div>
      </div>
    </section>
  );
}
