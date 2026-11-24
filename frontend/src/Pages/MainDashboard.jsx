import { useNavigate } from "react-router-dom";
import "./MainDashboard.css";

export default function MainDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");
  const role = user.role;

  const departments = [
    {
      name: "Sales",
      description: "Manage leads, customers and sales activities.",
      icon: "📊",
      path: "/leads",
      roles: ["Admin", "Sales"],
    },
    {
      name: "Human Resources",
      description: "Manage employees, recruitment and attendance.",
      icon: "👥",
      path: "/hr",
      roles: ["Admin", "HR"],
    },
    {
      name: "Finance",
      description: "Manage invoices, payments and expenses.",
      icon: "💰",
      path: "/finance",
      roles: ["Admin", "Finance"],
    },
  ];

  const logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="main-dashboard">
      <header className="main-header">
        <div className="brand">
          <h1>OmniOS</h1>
          <p>Business Operations Platform</p>
        </div>

        <div className="header-user">
          <span>
            {user.name || "User"} · {role || "Guest"}
          </span>
          <button className="logout-btn" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <span className="welcome-label">WORKSPACE</span>
          <h2>Welcome, {user.name || "User"}!</h2>
          <p>Select a department to manage your business operations.</p>
        </div>

        <div className="department-grid">
          {departments
            .filter((department) => department.roles.includes(role))
            .map((department) => (
              <div className="department-card" key={department.name}>
                <div className="department-icon">{department.icon}</div>

                <h3>{department.name}</h3>
                <p>{department.description}</p>

                <button
                  className="open-btn"
                  onClick={() => navigate(department.path)}
                >
                  Open Department <span>→</span>
                </button>
              </div>
            ))}
        </div>
      </main>

      <footer className="dashboard-footer">
        OmniOS © 2026 · Business Operations Platform
      </footer>
    </div>
  );
}
