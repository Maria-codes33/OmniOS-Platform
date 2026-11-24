import { useEffect, useState } from "react";
import "./Leads.css";

function Leads() {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [sortBy, setSortBy] = useState("company");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState("");
  const handleShowTasks = async (leadId) => {
    setSelectedLeadId(leadId);
    setTasks([]);
    setTaskError("");
    setTaskLoading(true);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/leads/${leadId}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load tasks");
      }

      setTasks(data);
    } catch (err) {
      setTaskError(err.message);
    } finally {
      setTaskLoading(false);
    }
  };
  const handleCreateTask = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/leads/${selectedLeadId}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: taskTitle,
            due_date: taskDueDate,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to create task");
      }

      setTasks((previousTasks) => [...previousTasks, data]);
      setTaskTitle("");
      setTaskDueDate("");
      alert("Follow-up task created successfully!");
    } catch (err) {
      alert(err.message);
    }
  };
  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: "Completed" }),
      });

      const data = await response.json();
      console.log("Complete task response:", response.status);
      console.log("Updated task:", data);

      if (!response.ok) {
        throw new Error(data.detail || "Failed to complete task");
      }

      setTasks((previousTasks) =>
        previousTasks.map((task) => (task.id === taskId ? data : task)),
      );
    } catch (err) {
      alert(err.message);
    }
  };
  const handleUpdateStatus = async (leadId, newStatus) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to update lead",
        );
      }

      setLeads((previousLeads) =>
        previousLeads.map((lead) => (lead.id === leadId ? data : lead)),
      );

      alert("Lead stage updated successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateLead = async (e) => {
    e.preventDefault();
  };

  const handleDeleteLead = async (leadId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/leads/${leadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Failed to delete lead");
      }

      setLeads((previousLeads) =>
        previousLeads.filter((lead) => lead.id !== leadId),
      );

      if (selectedLead?.id === leadId) {
        setSelectedLead(null);
      }

      alert("Lead deleted successfully!");
    } catch (err) {
      alert(err.message);
    }

    const formData = new FormData(e.target);

    const updatedLead = {
      company: formData.get("company"),
      contact: formData.get("contact"),
      email: formData.get("email"),
      phone: formData.get("phone") || null,
      source: formData.get("source"),
      estimated_value: Number(formData.get("estimated_value")),
    };

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/leads/${editingLead.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
          body: JSON.stringify(updatedLead),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to update lead");
      }

      setLeads((previousLeads) =>
        previousLeads.map((lead) => (lead.id === editingLead.id ? data : lead)),
      );

      setEditingLead(null);
      alert("Lead updated successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);

    const newLead = {
      company: formData.get("company"),
      contact: formData.get("contact"),
      email: formData.get("email"),
      phone: formData.get("phone") || null,
      source: formData.get("source"),
      assigned_owner: "",
      estimated_value: Number(formData.get("estimated_value")),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify(newLead),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(data.detail)
          ? data.detail
              .map((item) => `${item.loc.join(".")}: ${item.msg}`)
              .join("\n")
          : data.detail || "Failed to create lead";

        throw new Error(errorMessage);
      }

      setLeads((previousLeads) => [...previousLeads, data]);
      setShowForm(false);
      alert("Lead created successfully!");
    } catch (err) {
      alert(err.message);
    }
  };
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/leads", {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Failed to load leads");
        }

        setLeads(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading) return <p>Loading leads...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="leads-container">
      <div className="leads-header">
        <div>
          <h1>Sales Leads</h1>
          <p>Manage and track your sales opportunities</p>
        </div>
      </div>
      <button onClick={() => setShowForm(!showForm)}>+ Create New Lead</button>

      {showForm && (
        <form className="lead-form" onSubmit={handleCreateLead}>
          <h2>Create New Lead</h2>

          <input
            type="text"
            name="company"
            placeholder="Company Name"
            required
          />

          <input
            type="text"
            name="contact"
            placeholder="Contact Name"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
          />

          <input type="text" name="phone" placeholder="Phone Number" />

          <select name="source" required>
            <option value="">Select Source</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Advertisement">Advertisement</option>
          </select>

          <input
            type="number"
            name="estimated_value"
            placeholder="Estimated Value"
            min="0"
            required
          />

          <div>
            <button type="submit">Save Lead</button>
            <button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {editingLead && (
        <form className="lead-form" onSubmit={handleUpdateLead}>
          <h2>Edit Lead</h2>

          <input name="company" defaultValue={editingLead.company} required />

          <input name="contact" defaultValue={editingLead.contact} required />

          <input
            type="email"
            name="email"
            defaultValue={editingLead.email}
            required
          />

          <input
            name="phone"
            defaultValue={editingLead.phone || ""}
            placeholder="Phone Number"
          />

          <select name="source" defaultValue={editingLead.source} required>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Advertisement">Advertisement</option>
          </select>

          <input
            type="number"
            name="estimated_value"
            defaultValue={editingLead.estimated_value}
            min="0"
            required
          />

          <button type="submit">Save Changes</button>

          <button type="button" onClick={() => setEditingLead(null)}>
            Cancel
          </button>
        </form>
      )}
      <div className="leads-table-wrapper">
        <input
          type="text"
          placeholder="Search by company, contact, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Proposal">Proposal</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
        >
          <option value="All">All Owners</option>
          {[...new Set(leads.map((lead) => lead.assigned_owner))].map(
            (owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ),
          )}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="company">Sort by Company</option>
          <option value="value">Sort by Estimated Value</option>
        </select>

        <table className="leads-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Company</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Source</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Estimated Value</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads
              .filter((lead) => {
                const matchesSearch =
                  `${lead.company} ${lead.contact} ${lead.email}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());

                const matchesStatus =
                  statusFilter === "All" || lead.status === statusFilter;

                const matchesOwner =
                  ownerFilter === "All" || lead.assigned_owner === ownerFilter;

                return matchesSearch && matchesStatus && matchesOwner;
              })
              .sort((a, b) => {
                if (sortBy === "company") {
                  return a.company.localeCompare(b.company);
                }

                return a.estimated_value - b.estimated_value;
              })
              .map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.id}</td>
                  <td>{lead.company}</td>
                  <td>{lead.contact}</td>
                  <td>{lead.email}</td>
                  <td>{lead.phone || "-"}</td>
                  <td>{lead.source}</td>
                  <td>{lead.assigned_owner}</td>
                  <td>
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleUpdateStatus(lead.id, e.target.value)
                      }
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </td>
                  <td>${lead.estimated_value.toLocaleString()}</td>
                  <td>
                    <button onClick={() => setSelectedLead(lead)}>
                      View Details
                    </button>

                    <button
                      onClick={() => {
                        alert("Delete button clicked!");
                        handleDeleteLead(lead.id);
                      }}
                    >
                      Delete
                    </button>

                    <button onClick={() => setEditingLead(lead)}>Edit</button>

                    <button onClick={() => handleShowTasks(lead.id)}>
                      View Tasks
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {selectedLead && (
          <div className="task-section">
            <h2>Lead Details</h2>
            <p>
              <strong>Company:</strong> {selectedLead.company}
            </p>
            <p>
              <strong>Contact:</strong> {selectedLead.contact}
            </p>
            <p>
              <strong>Email:</strong> {selectedLead.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedLead.phone || "-"}
            </p>
            <p>
              <strong>Source:</strong> {selectedLead.source}
            </p>
            <p>
              <strong>Owner:</strong> {selectedLead.assigned_owner}
            </p>
            <p>
              <strong>Status:</strong> {selectedLead.status}
            </p>
            <p>
              <strong>Estimated Value:</strong> ${selectedLead.estimated_value}
            </p>

            <button onClick={() => setSelectedLead(null)}>Close Details</button>
          </div>
        )}
        {selectedLeadId !== null && (
          <div className="task-section">
            <h2>Follow-up Tasks — Lead #{selectedLeadId}</h2>
            <form onSubmit={handleCreateTask}>
              <input
                type="text"
                placeholder="Task title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                required
              />

              <input
                type="date"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                required
              />

              <button type="submit">Create Task</button>
            </form>

            {taskLoading && <p>Loading tasks...</p>}

            {taskError && <p>{taskError}</p>}

            {!taskLoading && !taskError && tasks.length === 0 && (
              <p>No follow-up tasks yet.</p>
            )}

            {!taskLoading &&
              tasks.map((task) => (
                <div key={task.id}>
                  <p>Task: {task.title}</p>
                  <p>Due date: {task.due_date}</p>
                  <p>Status: {task.status}</p>
                  {task.status === "Open" && (
                    <button onClick={() => handleCompleteTask(task.id)}>
                      Mark Completed
                    </button>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {leads.length === 0 && <p>No leads found.</p>}
    </div>
  );
}

export default Leads;
