import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Raise Requests Quickly',
    description: 'Students can report classroom, library, networking, and maintenance issues within seconds.',
  },
  {
    title: 'Track Every Update',
    description: 'Monitor who is assigned the issue and how the request is progressing in real time.',
  },
  {
    title: 'Smart Campus Oversight',
    description: 'Staff and admins can filter, search, and manage service requests from one dashboard.',
  },
];

const stats = [
  { label: 'Active Requests', value: '240+' },
  { label: 'Campus Blocks', value: '12' },
  { label: 'Resolution Rate', value: '94%' },
];

function LandingPage() {
  return (
    <div className="page-shell landing-page">
      <main>
        <section className="hero-section container">
          <div className="hero-copy">
            <span className="eyebrow">Smart Campus. Faster Solutions.</span>
            <h1>Smarter Campus. Faster Solutions.</h1>
            <p>
              Report campus issues, track their progress, and help keep your campus running smoothly.
            </p>
            <div className="cta-row">
              <Link to="/register" className="primary-button">
                Report an Issue
              </Link>
              <Link to="/login" className="secondary-button">
                Login
              </Link>
            </div>

            <div className="mini-stats">
              {stats.map((item) => (
                <div key={item.label} className="mini-stat-card">
                  <strong>{item.value}</strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-card request-preview">
              <div className="panel-header">
                <span className="dot dot-green" />
                <span className="dot dot-yellow" />
                <span className="dot dot-red" />
              </div>
              <div className="panel-body">
                <h3>Campus Service Queue</h3>
                <ul>
                  <li>
                    <span className="status-pill status-open">Open</span>
                    <strong>Library Wi-Fi issue</strong>
                  </li>
                  <li>
                    <span className="status-pill status-progress">In Progress</span>
                    <strong>Water leakage in hostel</strong>
                  </li>
                  <li>
                    <span className="status-pill status-resolved">Resolved</span>
                    <strong>Projector repair complete</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="features-section container">
          <div className="section-heading">
            <span className="eyebrow">How it works</span>
            <h2>Simple service management for everyday campus needs</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article key={feature.title} className="feature-card">
                <div className="feature-icon">✓</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
