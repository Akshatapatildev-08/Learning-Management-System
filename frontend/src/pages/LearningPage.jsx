import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';

function flattenLessons(lessons) {
  return lessons.map((lesson, index) => ({ ...lesson, idx: index }));
}

export default function LearningPage() {
  const { courseId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [current, setCurrent] = useState(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const byIndex = useMemo(() => flattenLessons(lessons), [lessons]);
  const currentIndex = byIndex.findIndex((l) => l.id === current?.id);

  const loadCourse = async () => {
    setError('');
    try {
      const result = await api.learningByCourse(courseId);
      setLessons(result.lessons);
      setProgress(result.completion_percentage);

      const initialLesson =
        result.lessons.find((l) => l.id === result.last_watched_lesson_id) || result.lessons[0] || null;

      if (initialLesson) {
        const detailed = await api.lessonById(initialLesson.id);
        setCurrent({ ...initialLesson, ...detailed });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const selectLesson = async (lessonId) => {
    setError('');
    try {
      const lesson = await api.lessonById(lessonId);
      setCurrent(lesson);
    } catch (err) {
      setError(err.message);
    }
  };

  const markCompleted = async () => {
    if (!current) return;
    try {
      const result = await api.markComplete(current.id);
      setProgress(result.completion_percentage);
      setLessons((prev) => prev.map((l) => (l.id === current.id ? { ...l, completed: true } : l)));
    } catch (err) {
      setError(err.message);
    }
  };

  const move = (step) => {
    if (currentIndex < 0) return;
    const target = byIndex[currentIndex + step];
    if (target) {
      selectLesson(target.id);
    }
  };

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  return (
    <section className="learn-layout">
      <div className="player-panel card">
        <h2>Learning Area</h2>
        {error ? <p className="error">{error}</p> : null}

        {current ? (
          <>
            <div className="video-wrap">
              <iframe
                title={current.title}
                src={current.embed_url}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <h3>{current.title}</h3>
            <div className="row">
              <button className="btn btn-outline" onClick={() => move(-1)} disabled={currentIndex <= 0}>Previous</button>
              <button className="btn" onClick={markCompleted}>Mark Completed</button>
              <button
                className="btn btn-outline"
                onClick={() => move(1)}
                disabled={currentIndex < 0 || currentIndex >= byIndex.length - 1}
              >
                Next
              </button>
            </div>
            <p className="muted">Progress: {progress}%</p>
            <div className="progress-bar">
              <div style={{ width: `${progress}%` }} />
            </div>
          </>
        ) : (
          <p>No lesson available</p>
        )}
      </div>

      <aside className="sidebar card">
        <h3>Lessons</h3>
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <button
                className={`lesson-item ${current?.id === lesson.id ? 'active' : ''}`}
                onClick={() => selectLesson(lesson.id)}
              >
                <span>{lesson.title}</span>
                <span>{lesson.completed ? 'Completed' : 'Pending'}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}
