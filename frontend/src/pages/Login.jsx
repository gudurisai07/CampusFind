import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const user = await login({
        email: email.trim(),
        password,
      });

      setMessageType("success");
      setMessage(`Welcome back, ${user.fullName || user.email}!`);

      // User originally requested page, if any
      const requestedPath = location.state?.from;

      const validRequestedPath =
        typeof requestedPath === "string" &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//") &&
        (user.role === "ADMIN" ||
          !requestedPath.startsWith("/admin"));

      const destination = validRequestedPath
        ? requestedPath
        : user.role === "ADMIN"
          ? "/admin"
          : "/dashboard";

      window.setTimeout(() => {
        navigate(destination, { replace: true });
      }, 500);

    } catch (error) {
      const status = error.response?.status;
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.detail;

      setMessageType("error");

      if (status === 401) {
        setMessage("Invalid username/email or password.");
      } else if (status === 404) {
        setMessage("Login API not found. Please check the backend.");
      } else if (status === 400) {
        setMessage(
          serverMessage || "Please check your login details."
        );
      } else if (!error.response) {
        setMessage(
          "Cannot connect to the backend. Check port 7204."
        );
      } else {
        setMessage(serverMessage || "Login failed. Please try again.");
      }

      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-icon">🔐</div>

        <p className="eyebrow">WELCOME BACK</p>

        <h1>Student Login</h1>

        <p className="auth-description">
          Sign in to manage your lost and found reports.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username or Email Address
            <input
              type="text"
              name="email"
              placeholder="Enter username or email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {message && (
            <div
              className={
                messageType === "error"
                  ? "error-message"
                  : "info-message"
              }
              role="status"
            >
              {message}
            </div>
          )}

          <button
            className="primary-button full-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register" state={location.state}>
            Create one
          </Link>
        </p>

        <Link className="back-link auth-back" to="/">
          ← Back to Home
        </Link>
      </section>
    </main>
  );
}

export default Login;