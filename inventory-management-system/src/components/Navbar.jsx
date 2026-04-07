export default function Navbar({ currentPage }) {
  return (
    <nav className="navbar">
      <h1>{currentPage}</h1>
      <div className="navbar-actions">
        <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
        <button className="btn btn-primary btn-sm">
          👤 Profile
        </button>
      </div>
    </nav>
  );
}
