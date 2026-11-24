import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem("user") || "null");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          "http://127.0.0.1:8000/dashboard/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Could not load dashboard");
        }

        setSummary(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && user && ["Admin", "Sales"].includes(user.role)) {
      fetchDashboard();
    } else {
      setError("Please log in with an authorized account.");
      setLoading(false);
    }
  }, [token]);

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>OmniOS</h1>
          <p>Business Management Platform</p>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-title">
          <h2>Welcome, {user.name}</h2>
          <p>Role: {user.role} | Your Sales Overview</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p>Total Leads</p>
            <h2>{summary.total_leads}</h2>
          </div>

          <div className="stat-card">
            <p>Qualified Leads</p>
            <h2>{summary.qualified_leads}</h2>
          </div>

          <div className="stat-card">
            <p>Won Deals</p>
            <h2>{summary.won_deals}</h2>
          </div>

          <div className="stat-card">
            <p>Pipeline Value</p>
            <h2>${summary.pipeline_value.toLocaleString()}</h2>
          </div>

          <div className="stat-card">
            <p>Overdue Tasks</p>
            <h2>{summary.overdue_tasks}</h2>
          </div>
        </div>

        <section className="status-section">
          <h3>Leads by Status</h3>

          {Object.entries(summary.status_breakdown).map(([status, count]) => (
            <div className="status-row" key={status}>
              <span>{status}</span>
              <span className="status-count">{count}</span>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
