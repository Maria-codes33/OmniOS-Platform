import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function HR() {
  const [section, setSection] = useState("Dashboard");

  const [dashboard, setDashboard] = useState({});
  const [employees, setEmployees] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const [employeeForm, setEmployeeForm] = useState({
    employee_id: "",
    name: "",
    department: "",
    job_title: "",
    employment_status: "Active",
    joining_date: today,
    email: "",
  });

  const [candidateForm, setCandidateForm] = useState({
    name: "",
    email: "",
    role: "",
    application_date: today,
    stage: "Applied",
  });

  const [onboardingForm, setOnboardingForm] = useState({
    employee_id: "",
    item: "Contract",
  });

  const [leaveForm, setLeaveForm] = useState({
    employee: "",
    start_date: today,
    end_date: "",
    leave_type: "Annual Leave",
    reason: "",
  });

  const [attendanceForm, setAttendanceForm] = useState({
    employee: "",
    attendance_date: today,
    status: "Present",
  });

  // API request helper
  async function request(path, options = {}) {
    const token = sessionStorage.getItem("token");

    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = data.detail;

      if (Array.isArray(detail)) {
        throw new Error(
          detail
            .map(
              (item) =>
                `${item.loc?.join(".") || "Field"}: ${item.msg || "Invalid value"}`,
            )
            .join("; "),
        );
      }

      if (typeof detail === "object" && detail !== null) {
        throw new Error(detail.message || JSON.stringify(detail));
      }

      throw new Error(detail || "Something went wrong");
    }

    return data;
  }

  // Handle API arrays
  function getArray(data, key) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data[key])) return data[key];
    return [];
  }

  // Load HR information
  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [
        employeeData,
        recruitmentData,
        leaveData,
        onboardingData,
        attendanceData,
        dashboardData,
      ] = await Promise.all([
        request("/employees"),
        request("/recruitment"),
        request("/leave-requests"),
        request("/onboarding"),
        request("/attendance"),
        request("/hr/dashboard"),
      ]);

      setEmployees(getArray(employeeData, "employees"));
      setCandidates(getArray(recruitmentData, "candidates"));
      setLeaveRequests(getArray(leaveData, "leave_requests"));
      setOnboarding(getArray(onboardingData, "onboarding"));
      setAttendance(getArray(attendanceData, "attendance"));
      setDashboard(dashboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Create employee
  async function createEmployee(e) {
    e.preventDefault();

    try {
      setError("");
      await request("/employees", {
        method: "POST",
        body: JSON.stringify({
          ...employeeForm,
          employee_id: employeeForm.employee_id,
        }),
      });

      setMessage("Employee added successfully!");

      setEmployeeForm({
        employee_id: "",
        name: "",
        department: "",
        job_title: "",
        employment_status: "Active",
        joining_date: today,
        email: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Create candidate
  async function createCandidate(e) {
    e.preventDefault();

    try {
      setError("");

      await request("/recruitment", {
        method: "POST",
        body: JSON.stringify(candidateForm),
      });

      setMessage("Candidate added successfully!");

      setCandidateForm({
        name: "",
        email: "",
        role: "",
        application_date: today,
        stage: "Applied",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Update recruitment stage
  async function updateCandidate(id, stage) {
    try {
      setError("");

      await request(`/recruitment/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ stage }),
      });

      setMessage("Candidate stage updated successfully!");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Create onboarding item
  async function createOnboarding(e) {
    e.preventDefault();

    try {
      setError("");

      await request("/onboarding", {
        method: "POST",
        body: JSON.stringify({
          employee_id: Number(onboardingForm.employee_id),
          item: onboardingForm.item,
          completed: false,
        }),
      });

      setMessage("Onboarding task added successfully!");

      setOnboardingForm({
        employee_id: "",
        item: "Contract",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Complete onboarding item
  async function completeOnboarding(id) {
    try {
      setError("");

      await request(`/onboarding/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: true }),
      });

      setMessage("Onboarding task completed!");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Create leave request
  async function createLeave(e) {
    e.preventDefault();

    try {
      setError("");

      await request("/leave-requests", {
        method: "POST",
        body: JSON.stringify(leaveForm),
      });

      setMessage("Leave request submitted successfully!");

      setLeaveForm({
        employee: "",
        start_date: today,
        end_date: "",
        leave_type: "Annual Leave",
        reason: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Approve or reject leave
  async function updateLeave(id, status) {
    try {
      setError("");

      await request(`/leave-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage(`Leave request ${status.toLowerCase()} successfully!`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Record attendance
  async function createAttendance(e) {
    e.preventDefault();

    try {
      setError("");

      await request("/attendance", {
        method: "POST",
        body: JSON.stringify(attendanceForm),
      });

      setMessage("Attendance recorded successfully!");

      setAttendanceForm({
        employee: "",
        attendance_date: today,
        status: "Present",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Update employee status
  async function updateEmployee(id, status) {
    try {
      setError("");

      await request(`/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ employment_status: status }),
      });

      setMessage("Employee status updated successfully!");
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const sections = [
    "Dashboard",
    "Employees",
    "Recruitment",
    "Onboarding",
    "Leave",
    "Attendance",
  ];

  const cardStyle = {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #eeeeee",
  };

  const buttonStyle = {
    padding: "10px 16px",
    border: "none",
    borderRadius: "7px",
    cursor: "pointer",
    background: "#5b3cc4",
    color: "white",
    fontWeight: "600",
  };

  const inputStyle = {
    width: "100%",
    padding: "11px",
    border: "1px solid #ddd",
    borderRadius: "7px",
    boxSizing: "border-box",
    marginTop: "6px",
    marginBottom: "12px",
  };

  const cellStyle = {
    padding: "13px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  };

  const money = (value) => Number(value || 0).toLocaleString();

  function MetricCard({ title, value, description }) {
    return (
      <div style={cardStyle}>
        <p style={{ color: "#777", margin: "0 0 10px" }}>{title}</p>
        <h2 style={{ margin: "0 0 8px", color: "#30205e" }}>{value}</h2>
        <small style={{ color: "#888" }}>{description}</small>
      </div>
    );
  }

  function Status({ value }) {
    const colors = {
      Active: "#15803d",
      Present: "#15803d",
      Approved: "#15803d",
      Completed: "#15803d",
      Applied: "#2563eb",
      Pending: "#d97706",
      Rejected: "#dc2626",
      Inactive: "#777",
      Absent: "#dc2626",
      Interview: "#2563eb",
      Hired: "#15803d",
    };

    return (
      <span
        style={{
          color: colors[value] || "#555",
          background: "#f3f4f6",
          padding: "5px 10px",
          borderRadius: "15px",
          fontSize: "12px",
          fontWeight: "600",
        }}
      >
        {String(value ?? "N/A")}
      </span>
    );
  }

  function Table({ headers, children }) {
    return (
      <div style={{ overflowX: "auto", ...cardStyle }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
            minWidth: "650px",
          }}
        >
          <thead>
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  style={{
                    padding: "13px",
                    borderBottom: "1px solid #eee",
                    color: "#666",
                    fontSize: "13px",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "25px",
        background: "#f7f6fb",
        minHeight: "100vh",
        color: "#29243b",
      }}
    >
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ marginBottom: "6px" }}>HR Department</h1>
        <p style={{ color: "#777", margin: 0 }}>
          Manage employees, recruitment, onboarding, leave and attendance.
        </p>
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "25px",
        }}
      >
        {sections.map((item) => (
          <button
            key={item}
            onClick={() => {
              setSection(item);
              setError("");
              setMessage("");
            }}
            style={{
              ...buttonStyle,
              background: section === item ? "#5b3cc4" : "#e9e5f5",
              color: section === item ? "white" : "#4c388c",
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            background: "#dcfce7",
            color: "#166534",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
          }}
        >
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading HR information...</p>
      ) : (
        <>
          {/* DASHBOARD */}
          {section === "Dashboard" && (
            <>
              <h2>HR Overview</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "18px",
                  marginTop: "20px",
                }}
              >
                <MetricCard
                  title="Active Employees"
                  value={dashboard.headcount || 0}
                  description="Current employee headcount"
                />

                <MetricCard
                  title="Pending Leave Requests"
                  value={dashboard.pending_leave || 0}
                  description="Waiting for approval"
                />

                <MetricCard
                  title="Active Candidates"
                  value={dashboard.active_candidates || 0}
                  description="Candidates in recruitment"
                />

                <MetricCard
                  title="Onboarding Completion"
                  value={`${dashboard.onboarding_completion || 0}%`}
                  description="Completed onboarding tasks"
                />
              </div>

              <div style={{ ...cardStyle, marginTop: "22px" }}>
                <h3>HR Records</h3>
                <p>Total employees: {employees.length}</p>
                <p>Total candidates: {candidates.length}</p>
                <p>Total leave requests: {leaveRequests.length}</p>
                <p>Total attendance records: {attendance.length}</p>

                <button style={buttonStyle} onClick={loadData}>
                  Refresh Dashboard
                </button>
              </div>
            </>
          )}

          {/* EMPLOYEES */}
          {section === "Employees" && (
            <>
              <h2>Employees</h2>

              <form
                onSubmit={createEmployee}
                style={{
                  ...cardStyle,
                  maxWidth: "650px",
                  marginBottom: "22px",
                }}
              >
                <h3>Add New Employee</h3>

                <label>Employee ID</label>
                <input
                  style={inputStyle}
                  type="number"
                  required
                  value={employeeForm.employee_id}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      employee_id: e.target.value,
                    })
                  }
                  placeholder="Enter employee ID"
                />

                <label>Full Name</label>
                <input
                  style={inputStyle}
                  required
                  value={employeeForm.name}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Employee name"
                />

                <label>Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  required
                  value={employeeForm.email}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="employee@example.com"
                />

                <label>Department</label>
                <input
                  style={inputStyle}
                  required
                  value={employeeForm.department}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      department: e.target.value,
                    })
                  }
                  placeholder="Department"
                />

                <label>Job Title</label>
                <input
                  style={inputStyle}
                  required
                  value={employeeForm.job_title}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      job_title: e.target.value,
                    })
                  }
                  placeholder="Job title"
                />

                <label>Employment Status</label>
                <select
                  style={inputStyle}
                  value={employeeForm.employment_status}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      employment_status: e.target.value,
                    })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <label>Joining Date</label>
                <input
                  style={inputStyle}
                  type="date"
                  required
                  value={employeeForm.joining_date}
                  onChange={(e) =>
                    setEmployeeForm({
                      ...employeeForm,
                      joining_date: e.target.value,
                    })
                  }
                />

                <button
                  type="submit"
                  style={{ ...buttonStyle, marginTop: "8px" }}
                >
                  Add Employee
                </button>
              </form>

              <h3>Employee Records</h3>

              <Table
                headers={[
                  "Employee ID",
                  "Name",
                  "Email",
                  "Department",
                  "Job Title",
                  "Joining Date",
                  "Status",
                  "Action",
                ]}
              >
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td style={cellStyle}>{employee.employee_id}</td>
                    <td style={cellStyle}>{employee.name}</td>
                    <td style={cellStyle}>{employee.email}</td>
                    <td style={cellStyle}>{employee.department}</td>
                    <td style={cellStyle}>{employee.job_title}</td>
                    <td style={cellStyle}>{employee.joining_date}</td>
                    <td style={cellStyle}>
                      <Status value={employee.employment_status} />
                    </td>
                    <td style={cellStyle}>
                      {employee.employment_status === "Active" ? (
                        <button
                          style={{
                            ...buttonStyle,
                            background: "#777",
                          }}
                          onClick={() =>
                            updateEmployee(employee.id, "Inactive")
                          }
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          style={buttonStyle}
                          onClick={() => updateEmployee(employee.id, "Active")}
                        >
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>

              {employees.length === 0 && <p>No employees found.</p>}
            </>
          )}

          {/* RECRUITMENT */}
          {section === "Recruitment" && (
            <>
              <h2>Recruitment</h2>

              <form
                onSubmit={createCandidate}
                style={{
                  ...cardStyle,
                  maxWidth: "650px",
                  marginBottom: "22px",
                }}
              >
                <h3>Add Candidate</h3>

                <label>Candidate Name</label>
                <input
                  style={inputStyle}
                  required
                  value={candidateForm.name}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Full name"
                />

                <label>Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  required
                  value={candidateForm.email}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      email: e.target.value,
                    })
                  }
                  placeholder="candidate@example.com"
                />

                <label>Position</label>
                <input
                  style={inputStyle}
                  required
                  value={candidateForm.role}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      role: e.target.value,
                    })
                  }
                  placeholder="Job position"
                />

                <label>Application Date</label>
                <input
                  style={inputStyle}
                  type="date"
                  required
                  value={candidateForm.application_date}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      application_date: e.target.value,
                    })
                  }
                />

                <label>Recruitment Stage</label>
                <select
                  style={inputStyle}
                  value={candidateForm.stage}
                  onChange={(e) =>
                    setCandidateForm({
                      ...candidateForm,
                      stage: e.target.value,
                    })
                  }
                >
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Hired">Hired</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  type="submit"
                  style={{ ...buttonStyle, marginTop: "8px" }}
                >
                  Add Candidate
                </button>
              </form>

              <h3>Candidate Records</h3>

              <Table
                headers={[
                  "Name",
                  "Email",
                  "Position",
                  "Application Date",
                  "Stage",
                  "Update Stage",
                ]}
              >
                {candidates.map((candidate) => (
                  <tr key={candidate.id}>
                    <td style={cellStyle}>{candidate.name}</td>
                    <td style={cellStyle}>{candidate.email}</td>
                    <td style={cellStyle}>{candidate.role}</td>
                    <td style={cellStyle}>{candidate.application_date}</td>
                    <td style={cellStyle}>
                      <Status value={candidate.stage} />
                    </td>
                    <td style={cellStyle}>
                      <select
                        style={{
                          ...inputStyle,
                          minWidth: "130px",
                          margin: 0,
                        }}
                        value={candidate.stage}
                        onChange={(e) =>
                          updateCandidate(candidate.id, e.target.value)
                        }
                      >
                        <option value="Applied">Applied</option>
                        <option value="Screening">Screening</option>
                        <option value="Interview">Interview</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </Table>

              {candidates.length === 0 && <p>No candidates found.</p>}
            </>
          )}

          {/* ONBOARDING */}
          {section === "Onboarding" && (
            <>
              <h2>Employee Onboarding</h2>

              <form
                onSubmit={createOnboarding}
                style={{
                  ...cardStyle,
                  maxWidth: "650px",
                  marginBottom: "22px",
                }}
              >
                <h3>Add Onboarding Task</h3>

                <label>Employee</label>
                <select
                  style={inputStyle}
                  required
                  value={onboardingForm.employee_id}
                  onChange={(e) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      employee_id: e.target.value,
                    })
                  }
                >
                  <option value="">Select employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} - {employee.employee_id}
                    </option>
                  ))}
                </select>

                <label>Onboarding Item</label>
                <select
                  style={inputStyle}
                  value={onboardingForm.item}
                  onChange={(e) =>
                    setOnboardingForm({
                      ...onboardingForm,
                      item: e.target.value,
                    })
                  }
                >
                  <option value="Contract">Contract</option>
                  <option value="NDA">NDA</option>
                  <option value="Orientation">Orientation</option>
                  <option value="Training">Training</option>
                </select>

                <button
                  type="submit"
                  style={{ ...buttonStyle, marginTop: "8px" }}
                >
                  Add Task
                </button>
              </form>

              <h3>Onboarding Checklist</h3>

              <Table
                headers={["Employee ID", "Onboarding Item", "Status", "Action"]}
              >
                {onboarding.map((item) => (
                  <tr key={item.id}>
                    <td style={cellStyle}>{item.employee_id}</td>
                    <td style={cellStyle}>{item.item}</td>
                    <td style={cellStyle}>
                      <Status
                        value={item.completed ? "Completed" : "Pending"}
                      />
                    </td>
                    <td style={cellStyle}>
                      {!item.completed && (
                        <button
                          style={buttonStyle}
                          onClick={() => completeOnboarding(item.id)}
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>

              {onboarding.length === 0 && <p>No onboarding tasks found.</p>}
            </>
          )}

          {/* LEAVE */}
          {section === "Leave" && (
            <>
              <h2>Leave Management</h2>

              <form
                onSubmit={createLeave}
                style={{
                  ...cardStyle,
                  maxWidth: "650px",
                  marginBottom: "22px",
                }}
              >
                <h3>Submit Leave Request</h3>

                <label>Employee Name</label>
                <input
                  style={inputStyle}
                  required
                  value={leaveForm.employee}
                  onChange={(e) =>
                    setLeaveForm({
                      ...leaveForm,
                      employee: e.target.value,
                    })
                  }
                  placeholder="Employee name"
                />

                <label>Leave Type</label>
                <select
                  style={inputStyle}
                  value={leaveForm.leave_type}
                  onChange={(e) =>
                    setLeaveForm({
                      ...leaveForm,
                      leave_type: e.target.value,
                    })
                  }
                >
                  <option value="Annual Leave">Annual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Personal Leave">Personal Leave</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>

                <label>Start Date</label>
                <input
                  style={inputStyle}
                  type="date"
                  required
                  value={leaveForm.start_date}
                  onChange={(e) =>
                    setLeaveForm({
                      ...leaveForm,
                      start_date: e.target.value,
                    })
                  }
                />

                <label>End Date</label>
                <input
                  style={inputStyle}
                  type="date"
                  required
                  min={leaveForm.start_date}
                  value={leaveForm.end_date}
                  onChange={(e) =>
                    setLeaveForm({
                      ...leaveForm,
                      end_date: e.target.value,
                    })
                  }
                />

                <label>Reason</label>
                <textarea
                  style={{
                    ...inputStyle,
                    minHeight: "90px",
                    fontFamily: "inherit",
                  }}
                  required
                  value={leaveForm.reason}
                  onChange={(e) =>
                    setLeaveForm({
                      ...leaveForm,
                      reason: e.target.value,
                    })
                  }
                  placeholder="Explain the reason for leave"
                />

                <button
                  type="submit"
                  style={{ ...buttonStyle, marginTop: "8px" }}
                >
                  Submit Request
                </button>
              </form>

              <h3>Leave Requests</h3>

              <Table
                headers={[
                  "Employee",
                  "Leave Type",
                  "Start Date",
                  "End Date",
                  "Reason",
                  "Status",
                  "Actions",
                ]}
              >
                {leaveRequests.map((leave) => (
                  <tr key={leave.id}>
                    <td style={cellStyle}>{leave.employee}</td>
                    <td style={cellStyle}>{leave.leave_type}</td>
                    <td style={cellStyle}>{leave.start_date}</td>
                    <td style={cellStyle}>{leave.end_date}</td>
                    <td style={cellStyle}>{leave.reason}</td>
                    <td style={cellStyle}>
                      <Status value={leave.status} />
                    </td>
                    <td style={cellStyle}>
                      {leave.status === "Pending" && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={{
                              ...buttonStyle,
                              background: "#15803d",
                            }}
                            onClick={() => updateLeave(leave.id, "Approved")}
                          >
                            Approve
                          </button>

                          <button
                            style={{
                              ...buttonStyle,
                              background: "#dc2626",
                            }}
                            onClick={() => updateLeave(leave.id, "Rejected")}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>

              {leaveRequests.length === 0 && <p>No leave requests found.</p>}
            </>
          )}

          {/* ATTENDANCE */}
          {section === "Attendance" && (
            <>
              <h2>Employee Attendance</h2>

              <form
                onSubmit={createAttendance}
                style={{
                  ...cardStyle,
                  maxWidth: "650px",
                  marginBottom: "22px",
                }}
              >
                <h3>Record Attendance</h3>

                <label>Employee Name</label>
                <input
                  style={inputStyle}
                  required
                  value={attendanceForm.employee}
                  onChange={(e) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      employee: e.target.value,
                    })
                  }
                  placeholder="Employee name"
                />

                <label>Date</label>
                <input
                  style={inputStyle}
                  type="date"
                  required
                  value={attendanceForm.attendance_date}
                  onChange={(e) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      attendance_date: e.target.value,
                    })
                  }
                />

                <label>Attendance Status</label>
                <select
                  style={inputStyle}
                  value={attendanceForm.status}
                  onChange={(e) =>
                    setAttendanceForm({
                      ...attendanceForm,
                      status: e.target.value,
                    })
                  }
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Leave">Leave</option>
                </select>

                <button
                  type="submit"
                  style={{ ...buttonStyle, marginTop: "8px" }}
                >
                  Record Attendance
                </button>
              </form>

              <h3>Attendance Records</h3>

              <Table headers={["Employee", "Date", "Status"]}>
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td style={cellStyle}>{record.employee}</td>
                    <td style={cellStyle}>{record.attendance_date}</td>
                    <td style={cellStyle}>
                      <Status value={record.status} />
                    </td>
                  </tr>
                ))}
              </Table>

              {attendance.length === 0 && <p>No attendance records found.</p>}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default HR;
