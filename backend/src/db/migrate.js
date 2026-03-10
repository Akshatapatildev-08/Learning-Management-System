import { query } from './index.js';

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'instructor', 'admin') NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    short_description TEXT NOT NULL,
    what_you_will_learn TEXT NOT NULL,
    thumbnail TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    instructor_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_courses_instructor
      FOREIGN KEY (instructor_id) REFERENCES users(id)
      ON DELETE RESTRICT ON UPDATE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_number INT NOT NULL,
    UNIQUE KEY uniq_sections_course_order (course_id, order_number),
    CONSTRAINT fk_sections_course
      FOREIGN KEY (course_id) REFERENCES courses(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    order_number INT NOT NULL,
    youtube_url TEXT NOT NULL,
    duration_seconds INT NOT NULL,
    UNIQUE KEY uniq_lessons_section_order (section_id, order_number),
    CONSTRAINT fk_lessons_section
      FOREIGN KEY (section_id) REFERENCES sections(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_enrollments_user_course (user_id, course_id),
    CONSTRAINT fk_enrollments_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_enrollments_course
      FOREIGN KEY (course_id) REFERENCES courses(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    lesson_id INT NOT NULL,
    status ENUM('in_progress', 'completed') NOT NULL DEFAULT 'in_progress',
    completed_at TIMESTAMP NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_progress_user_lesson (user_id, lesson_id),
    CONSTRAINT fk_progress_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_progress_course
      FOREIGN KEY (course_id) REFERENCES courses(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_progress_lesson
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB`,
  `CREATE TABLE IF NOT EXISTS last_watched (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    lesson_id INT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_last_watched_user_course (user_id, course_id),
    CONSTRAINT fk_last_watched_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_last_watched_course
      FOREIGN KEY (course_id) REFERENCES courses(id)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_last_watched_lesson
      FOREIGN KEY (lesson_id) REFERENCES lessons(id)
      ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB`,
];

export async function initDb() {
  for (const statement of schemaStatements) {
    await query(statement);
  }
}
