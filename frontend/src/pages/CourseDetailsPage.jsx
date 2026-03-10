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
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [error, setError] = useState('');
  const hasToken = Boolean(localStorage.getItem('lms_token'));

  const enroll = async () => {
    if (!hasToken) {
      navigate('/login');
      return;
    }

    setError('');
    try {
      await api.enroll(courseId);
      setAlreadyEnrolled(true);
    } catch (err) {
      if (err.message.includes('Already')) {
        setAlreadyEnrolled(true);
        return;
      }
      setError(err.message);
    }
  };

  useEffect(() => {
    api.courseById(courseId).then(setCourse).catch((err) => setError(err.message));
    if (hasToken) {
      api
        .enrollmentsMine()
        .then((enrolled) => {
          const isEnrolled = enrolled.some((item) => Number(item.id) === Number(courseId));
          setAlreadyEnrolled(isEnrolled);
        })
        .catch(() => setAlreadyEnrolled(false));
    } else {
      setAlreadyEnrolled(false);
    }
  }, [courseId, hasToken]);

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
          <Link to="/courses" className="btn btn-outline">Back</Link>
          <button className="btn" onClick={enroll} disabled={alreadyEnrolled}>
            {alreadyEnrolled ? 'Already Enrolled' : 'Enroll'}
          </button>
          {alreadyEnrolled ? <Link className="btn btn-outline" to={`/learn/${courseId}`}>Go to Learning</Link> : null}
        </div>
      </div>
    </section>
  );
}
