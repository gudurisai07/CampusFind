import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-icon">🎓</div>

        <p className="eyebrow">STUDENT PORTAL</p>
        <h1>My Dashboard</h1>

        <p className="auth-description">
          Welcome back, {user?.fullName || "Student"}!
        </p>

        <p>
          <strong>Email:</strong> {user?.email || "Not available"}
        </p>

        <p>
          <strong>Role:</strong> {user?.role || "STUDENT"}
        </p>

        <Link to="/report" className="primary-button full-button">
          + Report an Item
        </Link>

        <Link to="/" className="back-link auth-back">
          Back to Home
        </Link>
      </section>
    </main>
  );
}

export default Dashboard;