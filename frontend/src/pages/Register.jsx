
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

const branchOptions = {
  BTECH: [
    { value: "CSE", label: "Computer Science (CSE)" },
    { value: "EEE", label: "Electrical (EEE)" },
    { value: "ECE", label: "Electronics (ECE)" },
    { value: "AI_ML", label: "AI / Machine Learning" },
    { value: "IT", label: "Information Technology (IT)" },
    { value: "CIVIL", label: "Civil Engineering" },
    { value: "MECHANICAL", label: "Mechanical Engineering" },
  ],
  PG: [
    { value: "MCA", label: "Master of Computer Applications (MCA)" },
    { value: "MBA", label: "Master of Business Administration (MBA)" },
  ],
  DEGREE: [
    { value: "BSC", label: "B.Sc" },
    { value: "BCA", label: "BCA" },
    { value: "BBA", label: "BBA" },
  ],
  POLYTECHNIC: [
    { value: "CSE", label: "Computer Engineering (CSE)" },
    { value: "EEE", label: "Electrical Engineering (EEE)" },
    { value: "ECE", label: "Electronics Engineering (ECE)" },
    { value: "CIVIL", label: "Civil Engineering" },
    { value: "MECHANICAL", label: "Mechanical Engineering" },
  ],
};

const initialForm = {
  studentId: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  educationLevel: "",
  branch: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: name === "studentId" ? value.toUpperCase() : value,
      ...(name === "educationLevel" ? { branch: "" } : {}),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (form.password !== form.confirmPassword) {
      setMessageType("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (!/^[6-9][0-9]{9}$/.test(form.phoneNumber)) {
      setMessageType("error");
      setMessage("Enter a valid 10-digit Indian phone number.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        ...form,
        studentId: form.studentId.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
      });

      setMessageType("success");
      setMessage("Account created successfully! Redirecting to login...");

      window.setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: location.state,
        });
      }, 1000);
    } catch (error) {
      const status = error.response?.status;
      const serverMessage =
        error.response?.data?.message ||
        error.response?.data?.detail;

      setMessageType("error");

      if (status === 409) {
        setMessage(serverMessage || "Email or Student ID is already registered.");
      } else if (status === 400) {
        setMessage(serverMessage || "Please check the details you entered.");
      } else if (!error.response) {
        setMessage("Cannot connect to the backend. Please try again.");
      } else {
        setMessage(serverMessage || "Registration failed. Please try again.");
      }

      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  }

  const availableBranches = branchOptions[form.educationLevel] || [];

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-icon">🎓</div>

        <p className="eyebrow">JOIN YOUR CAMPUS COMMUNITY</p>
        <h1>Create Account</h1>

        <p className="auth-description">
          Create your student profile to help reunite lost belongings.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Student ID *
            <input
              type="text"
              name="studentId"
              placeholder="Example: 22J21A0501"
              value={form.studentId}
              onChange={handleChange}
              maxLength={30}
              required
            />
          </label>

          <label>
            Full Name *
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={handleChange}
              maxLength={100}
              required
            />
          </label>

          <label>
            Email Address *
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              maxLength={150}
              required
            />
          </label>

          <label>
            Phone Number *
            <input
              type="tel"
              name="phoneNumber"
              placeholder="10-digit mobile number"
              inputMode="numeric"
              pattern="[6-9][0-9]{9}"
              maxLength={10}
              value={form.phoneNumber}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Education Level *
            <select
              name="educationLevel"
              value={form.educationLevel}
              onChange={handleChange}
              required
            >
              <option value="">Select education level</option>
              <option value="BTECH">B.Tech</option>
              <option value="PG">Postgraduate (PG)</option>
              <option value="DEGREE">Degree</option>
              <option value="POLYTECHNIC">Polytechnic</option>
            </select>
          </label>

          <label>
            Branch / Course *
            <select
              name="branch"
              value={form.branch}
              onChange={handleChange}
              disabled={!form.educationLevel}
              required
            >
              <option value="">
                {form.educationLevel
                  ? "Select branch or course"
                  : "Select education level first"}
              </option>

              {availableBranches.map((branch) => (
                <option key={branch.value} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Password *
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={6}
              maxLength={100}
              value={form.password}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Confirm Password *
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              minLength={6}
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

          {message && (
            <div
              className={
                messageType === "error"
                  ? "error-message"
                  : messageType === "success"
                    ? "success-message"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered?{" "}
          <Link to="/login" state={location.state}>
            Sign in
          </Link>
        </p>

        <Link className="back-link auth-back" to="/">
          ← Back to Home
        </Link>
      </section>
    </main>
  );
}

export default Register;
