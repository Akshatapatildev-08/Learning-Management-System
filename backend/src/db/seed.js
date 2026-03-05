import bcrypt from 'bcryptjs';
import db from './index.js';
import { initDb } from './migrate.js';

initDb();

const hash = (password) => bcrypt.hashSync(password, 10);

const existing = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (existing.count > 0) {
  console.log('Seed skipped: data already exists.');
  process.exit(0);
}

const insertUser = db.prepare(
  'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
);

insertUser.run('Admin User', 'admin@lms.com', hash('admin123'), 'admin');
insertUser.run('Alice Instructor', 'alice@lms.com', hash('instructor123'), 'instructor');
insertUser.run('Bob Student', 'bob@lms.com', hash('student123'), 'student');

const instructor = db.prepare("SELECT id FROM users WHERE email='alice@lms.com'").get();

const insertCourse = db.prepare(
  `INSERT INTO courses
  (title, description, short_description, what_you_will_learn, thumbnail, category, instructor_id)
  VALUES (?, ?, ?, ?, ?, ?, ?)`
);

const courses = [
  {
    key: 'java',
    title: 'Java Fundamentals',
    description: 'Master core Java concepts with practical examples and structured lessons.',
    short: 'Learn Java from basics to OOP and collections.',
    learn: 'Syntax, OOP, Collections, Exception Handling, Basic DSA in Java.',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4',
    category: 'Java',
  },
  {
    key: 'python',
    title: 'Python for Beginners',
    description: 'A beginner-friendly Python path focused on coding foundations and project skills.',
    short: 'Start Python with hands-on lessons and mini tasks.',
    learn: 'Python syntax, Functions, OOP, File handling, APIs.',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935',
    category: 'Python',
  },
  {
    key: 'ml',
    title: 'Machine Learning Essentials',
    description: 'Understand ML fundamentals, workflows, and key algorithms with practical intuition.',
    short: 'Build a strong ML foundation and workflow understanding.',
    learn: 'Data preprocessing, Regression, Classification, Evaluation.',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c',
    category: 'ML',
  },
  {
    key: 'datascience',
    title: 'Data Science Foundations',
    description: 'Learn data science workflow from data handling to visualization and analysis.',
    short: 'Data science basics with practical workflow.',
    learn: 'Data wrangling, EDA, visualization, notebooks, project flow.',
    thumbnail: 'https://images.unsplash.com/photo-1518186233392-c232efbf2373',
    category: 'Data Science',
  },
  {
    key: 'sql',
    title: 'SQL Complete Course',
    description: 'Understand SQL from fundamentals to advanced querying for real databases.',
    short: 'Master SQL queries and database concepts.',
    learn: 'SELECT, JOIN, GROUP BY, subqueries, normalization basics.',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d',
    category: 'SQL',
  },
  {
    key: 'html',
    title: 'HTML Mastery',
    description: 'Build strong web structure skills using semantic and accessible HTML.',
    short: 'Learn HTML from zero to solid web structure.',
    learn: 'Semantic tags, forms, media, accessibility basics.',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    category: 'HTML',
  },
  {
    key: 'css',
    title: 'CSS Styling and Layouts',
    description: 'Create beautiful and responsive web designs with modern CSS techniques.',
    short: 'From CSS basics to responsive layouts.',
    learn: 'Selectors, box model, flexbox, grid, responsive design.',
    thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2',
    category: 'CSS',
  },
  {
    key: 'javascript',
    title: 'JavaScript Core Concepts',
    description: 'Understand JavaScript fundamentals for frontend and full stack development.',
    short: 'Practical JavaScript for real web apps.',
    learn: 'Variables, functions, arrays, objects, DOM, async basics.',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    category: 'JavaScript',
  },
];

for (const c of courses) {
  insertCourse.run(c.title, c.description, c.short, c.learn, c.thumbnail, c.category, instructor.id);
}

const allCourses = db.prepare('SELECT id, title, category FROM courses').all();

const insertSection = db.prepare(
  'INSERT INTO sections (course_id, title, order_number) VALUES (?, ?, ?)'
);
const insertLesson = db.prepare(
  `INSERT INTO lessons
  (section_id, title, order_number, youtube_url, duration_seconds)
  VALUES (?, ?, ?, ?, ?)`
);

const seededLessonsByKey = {
  java: {
    section1: [
      {
        title: 'Java Introduction and Setup',
        youtube_url: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
        duration_seconds: 900,
      },
      {
        title: 'Variables, Data Types, and Operators',
        youtube_url: 'https://www.youtube.com/watch?v=RRubcjpTkks',
        duration_seconds: 1200,
      },
    ],
    section2: [
      {
        title: 'OOP Concepts in Java',
        youtube_url: 'https://www.youtube.com/watch?v=6T_HgnjoYwM',
        duration_seconds: 1500,
      },
      {
        title: 'Collections and Exception Handling',
        youtube_url: 'https://www.youtube.com/watch?v=rzA7UJ-hQn4',
        duration_seconds: 1400,
      },
    ],
  },
  python: {
    section1: [
      {
        title: 'Python Introduction and Installation',
        youtube_url: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
        duration_seconds: 900,
      },
      {
        title: 'Python Syntax and Core Data Types',
        youtube_url: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
        duration_seconds: 1200,
      },
    ],
    section2: [
      {
        title: 'Functions and Object-Oriented Programming',
        youtube_url: 'https://www.youtube.com/watch?v=Ej_02ICOIgs',
        duration_seconds: 1500,
      },
      {
        title: 'File Handling and Working with APIs',
        youtube_url: 'https://www.youtube.com/watch?v=uh2ebFW8OYM',
        duration_seconds: 1400,
      },
    ],
  },
  ml: {
    section1: [
      {
        title: 'Machine Learning Fundamentals',
        youtube_url: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
        duration_seconds: 1000,
      },
      {
        title: 'Data Preprocessing and Feature Engineering',
        youtube_url: 'https://www.youtube.com/watch?v=OtD8wVaFm6E',
        duration_seconds: 1300,
      },
    ],
    section2: [
      {
        title: 'Regression and Classification Basics',
        youtube_url: 'https://www.youtube.com/watch?v=7eh4d6sabA0',
        duration_seconds: 1500,
      },
      {
        title: 'Model Evaluation and Validation',
        youtube_url: 'https://www.youtube.com/watch?v=85dtiMz9tSo',
        duration_seconds: 1400,
      },
    ],
  },
  datascience: {
    section1: [
      {
        title: 'Data Science Introduction',
        youtube_url: 'https://www.youtube.com/watch?v=ua-CiDNNj30',
        duration_seconds: 1000,
      },
      {
        title: 'Data Analysis with Python',
        youtube_url: 'https://www.youtube.com/watch?v=r-uOLxNrNk8',
        duration_seconds: 1400,
      },
    ],
    section2: [
      {
        title: 'Data Visualization Basics',
        youtube_url: 'https://www.youtube.com/watch?v=GPVsHOlRBBI',
        duration_seconds: 1200,
      },
      {
        title: 'Pandas and EDA Workflow',
        youtube_url: 'https://www.youtube.com/watch?v=vmEHCJofslg',
        duration_seconds: 1500,
      },
    ],
  },
  sql: {
    section1: [
      {
        title: 'SQL Basics and Setup',
        youtube_url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
        duration_seconds: 1100,
      },
      {
        title: 'SELECT, WHERE, ORDER BY',
        youtube_url: 'https://www.youtube.com/watch?v=7S_tz1z_5bA',
        duration_seconds: 1200,
      },
    ],
    section2: [
      {
        title: 'JOINs and Relationships',
        youtube_url: 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw',
        duration_seconds: 1400,
      },
      {
        title: 'GROUP BY and Aggregations',
        youtube_url: 'https://www.youtube.com/watch?v=qEwskgPyW5A',
        duration_seconds: 1300,
      },
    ],
  },
  html: {
    section1: [
      {
        title: 'HTML Full Course Introduction',
        youtube_url: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
        duration_seconds: 900,
      },
      {
        title: 'Semantic HTML and Structure',
        youtube_url: 'https://www.youtube.com/watch?v=kGW8Al_cga4',
        duration_seconds: 1000,
      },
    ],
    section2: [
      {
        title: 'Forms, Inputs, and Validation',
        youtube_url: 'https://www.youtube.com/watch?v=fNcJuPIZ2WE',
        duration_seconds: 1100,
      },
      {
        title: 'Accessibility Basics in HTML',
        youtube_url: 'https://www.youtube.com/watch?v=20SHvU2PKsM',
        duration_seconds: 1000,
      },
    ],
  },
  css: {
    section1: [
      {
        title: 'CSS Crash Course',
        youtube_url: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
        duration_seconds: 900,
      },
      {
        title: 'Flexbox Fundamentals',
        youtube_url: 'https://www.youtube.com/watch?v=JJSoEo8JSnc',
        duration_seconds: 1000,
      },
    ],
    section2: [
      {
        title: 'CSS Grid Layout',
        youtube_url: 'https://www.youtube.com/watch?v=t6CBKf8K_Ac',
        duration_seconds: 1200,
      },
      {
        title: 'Responsive Design Basics',
        youtube_url: 'https://www.youtube.com/watch?v=srvUrASNj0s',
        duration_seconds: 1100,
      },
    ],
  },
  javascript: {
    section1: [
      {
        title: 'JavaScript for Beginners',
        youtube_url: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
        duration_seconds: 900,
      },
      {
        title: 'Functions, Arrays, and Objects',
        youtube_url: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
        duration_seconds: 1100,
      },
    ],
    section2: [
      {
        title: 'DOM Manipulation',
        youtube_url: 'https://www.youtube.com/watch?v=0ik6X4DJKCc',
        duration_seconds: 1200,
      },
      {
        title: 'Async JavaScript Basics',
        youtube_url: 'https://www.youtube.com/watch?v=PoRJizFvM7s',
        duration_seconds: 1200,
      },
    ],
  },
};

for (const course of allCourses) {
  insertSection.run(course.id, 'Getting Started', 1);
  insertSection.run(course.id, 'Core Concepts', 2);

  const sections = db
    .prepare('SELECT id, order_number FROM sections WHERE course_id = ? ORDER BY order_number')
    .all(course.id);

  const key = courses.find((c) => c.title === course.title)?.key;
  const categoryData = seededLessonsByKey[key];

  categoryData.section1.forEach((lesson, idx) => {
    insertLesson.run(sections[0].id, lesson.title, idx + 1, lesson.youtube_url, lesson.duration_seconds);
  });

  categoryData.section2.forEach((lesson, idx) => {
    insertLesson.run(sections[1].id, lesson.title, idx + 1, lesson.youtube_url, lesson.duration_seconds);
  });
}

const student = db.prepare("SELECT id FROM users WHERE email='bob@lms.com'").get();
const firstCourse = db.prepare('SELECT id FROM courses ORDER BY id LIMIT 1').get();
db.prepare('INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)').run(student.id, firstCourse.id);

console.log('Seed complete. Demo logins:');
console.log('admin@lms.com / admin123');
console.log('alice@lms.com / instructor123');
console.log('bob@lms.com / student123');
