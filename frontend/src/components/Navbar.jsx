import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="container nav-shell">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span>
          <div>
            <strong>CampusCare</strong>
            <small>Smart Campus Service Management</small>
          </div>
        </Link>

        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/">Home</NavLink>
          <a href="#how-it-works">How It Works</a>
          {user ? (
            <>
              <NavLink to={user.role === 'admin' ? '/admin' : '/student'}>Dashboard</NavLink>
              <button type="button" onClick={logout} className="ghost-button small-button">
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
