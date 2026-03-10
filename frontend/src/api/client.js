const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('lms_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...getAuthHeaders(),
      },
    });
  } catch (_err) {
    throw new Error('Unable to reach API. Check backend is running and VITE_API_BASE is correct.');
  }

  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (_err) {
      data = { message: text };
    }
  }
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
  enrollmentsMine: () => request('/enrollments/mine'),
  learningByCourse: (courseId) => request(`/learning/course/${courseId}`),
  lessonById: (lessonId) => request(`/learning/lesson/${lessonId}`),
  markComplete: (lesson_id) => request('/learning/complete', { method: 'POST', body: JSON.stringify({ lesson_id }) }),
  progressByCourse: (courseId) => request(`/progress/course/${courseId}`),
};
