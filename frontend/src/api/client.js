const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

function getAuthHeaders() {
  const token = localStorage.getItem('lms_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...getAuthHeaders(),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  signup: (payload) => request('/auth/signup', { method: 'POST', body: JSON.stringify(payload) }),
  courses: () => request('/courses'),
  courseById: (id) => request(`/courses/${id}`),
  courseLessons: (courseId) => request(`/courses/${courseId}/lessons`),
  enroll: (course_id) => request('/enrollments', { method: 'POST', body: JSON.stringify({ course_id }) }),
  learningByCourse: (courseId) => request(`/learning/course/${courseId}`),
  lessonById: (lessonId) => request(`/learning/lesson/${lessonId}`),
  markComplete: (lesson_id) => request('/learning/complete', { method: 'POST', body: JSON.stringify({ lesson_id }) }),
  progressByCourse: (courseId) => request(`/progress/course/${courseId}`),
};
