import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          CampusFind
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>

          {!loading && !user && (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/register">Register</NavLink>
            </>
          )}

          {!loading && user && user.role === "STUDENT" && (
            <>
              <NavLink to="/report">Report Item</NavLink>
              <NavLink to="/dashboard">My Dashboard</NavLink>
            </>
          )}

          {!loading && user && user.role === "ADMIN" && (
            <NavLink to="/admin">Admin Dashboard</NavLink>
          )}

          {!loading && user && (
            <button
              type="button"
              className="primary-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;