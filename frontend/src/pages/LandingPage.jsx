import { Link } from 'react-router-dom';
const previewTracks = [
  {
    id: 'backend-track',
    title: 'Backend Developer Track',
    summary: 'Build API, database, and authentication fundamentals for real apps.',
    skills: 'Java, SQL, API Design',
    level: 'Beginner to Intermediate',
  },
  {
    id: 'frontend-track',
    title: 'Frontend Developer Track',
    summary: 'Create responsive interfaces and interactive web applications.',
    skills: 'HTML, CSS, JavaScript',
    level: 'Beginner',
  },
  {
    id: 'data-track',
    title: 'Data & ML Track',
    summary: 'Start with analysis and move into machine learning basics.',
    skills: 'Python, Data Science, ML',
    level: 'Intermediate',
  },
];

export default function LandingPage() {

  return (
    <section className="landing landing-minimal">
      <div className="minimal-hero">
        <p className="kicker">LMS Platform</p>
        <h1>Learn clearly. Progress daily.</h1>
        <p className="muted">
          A simple learning workspace to browse courses, enroll quickly, and continue where you left off.
        </p>
        <div className="row hero-actions">
          <Link to="/login" className="btn">Sign In</Link>
          <Link to="/signup" className="btn btn-outline">Sign Up</Link>
        </div>
      </div>

      <div className="minimal-divider" />

      <div className="preview-wrap">
        <div className="row row-space preview-head">
          <h2>Featured Learning Paths</h2>
          <Link to="/courses" className="nav-link-dark">View all courses</Link>
        </div>
        <div className="preview-split">
          {previewTracks[0] ? (
            <article className="card preview-featured">
              <p className="kicker">Featured Track</p>
              <h3>{previewTracks[0].title}</h3>
              <p>{previewTracks[0].summary}</p>
              <p className="muted">Focus: {previewTracks[0].skills}</p>
              <p className="muted">Level: {previewTracks[0].level}</p>
              <div className="featured-cta">
                <Link to="/courses" className="btn btn-outline">Explore Courses</Link>
              </div>
            </article>
          ) : null}

          <div className="preview-list">
            {previewTracks.slice(1).map((track) => (
              <article className="card preview-item" key={track.id}>
                <div>
                  <p className="kicker">Track</p>
                  <h3>{track.title}</h3>
                  <p className="muted">Focus: {track.skills}</p>
                  <p className="muted">Level: {track.level}</p>
                </div>
                <Link to="/courses" className="btn btn-outline">Details</Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
