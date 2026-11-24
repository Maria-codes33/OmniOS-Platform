import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed. Please try again.");
      }

      sessionStorage.setItem("token", data.access_token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "Admin") {
        navigate("/home");
      } else if (data.user.role === "Sales") {
        navigate("/leads");
      } else if (data.user.role === "HR") {
        navigate("/hr");
      } else if (data.user.role === "Finance") {
        navigate("/finance");
      } else {
        setError("Your account role is not recognized.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="brand">
          <div className="brand-icon">O</div>
          <span>OmniOS</span>
        </div>

        <div className="welcome-content">
          <span className="welcome-label">BUSINESS MANAGEMENT PLATFORM</span>
          <h1>Everything your business needs, in one place.</h1>
          <p>
            Manage your teams, sales, and finances through one connected
            workspace designed to help your business grow.
          </p>

          <div className="feature-list">
            <div>✓ &nbsp; Connected departments</div>
            <div>✓ &nbsp; Organized business operations</div>
            <div>✓ &nbsp; Real-time business insights</div>
          </div>
        </div>

        <div className="left-footer">© 2026 OmniOS. All rights reserved.</div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="mobile-brand">
            <div className="brand-icon">O</div>
            <span>OmniOS</span>
          </div>

          <div className="login-heading">
            <span className="login-tag">WELCOME BACK</span>
            <h2>Sign in to your account</h2>
            <p>Enter your details to access your workspace.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <p className="login-security">
            Secure access to your OmniOS workspace
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
