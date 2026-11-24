import { useEffect, useState } from "react";

const API = "http://127.0.0.1:8000";

function Finance() {
  const [section, setSection] = useState("Dashboard");

  const [dashboard, setDashboard] = useState({});
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [auditLog, setAuditLog] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const [invoiceForm, setInvoiceForm] = useState({
    invoice_number: "",
    client: "",
    issue_date: today,
    due_date: "",
    amount: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    category: "",
    description: "",
    amount: "",
    expense_date: today,
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Something went wrong");
    }

    return data;
  }

  // Convert API response into an array
  function getArray(data, key) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data[key])) return data[key];
    return [];
  }

  // Load Finance information
  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [dashboardData, invoiceData, paymentData, expenseData, auditData] =
        await Promise.all([
          request("/finance/dashboard"),
          request("/invoices"),
          request("/payments"),
          request("/expenses"),
          request("/finance/audit-log"),
        ]);

      setDashboard(dashboardData);
      setInvoices(getArray(invoiceData, "invoices"));
      setPayments(getArray(paymentData, "payments"));
      setExpenses(getArray(expenseData, "expenses"));
      setAuditLog(getArray(auditData, "audit_log"));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Create invoice
  async function createInvoice(e) {
    e.preventDefault();

    try {
      setMessage("");
      await request("/invoices", {
        method: "POST",
        body: JSON.stringify({
          ...invoiceForm,
          amount: Number(invoiceForm.amount),
        }),
      });

      setMessage("Invoice created successfully!");
      setInvoiceForm({
        invoice_number: "",
        client: "",
        issue_date: today,
        due_date: "",
        amount: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Update invoice status
  async function updateInvoice(id, status) {
    try {
      setMessage("");
      await request(`/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage(`Invoice successfully marked as ${status}.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Create expense
  async function createExpense(e) {
    e.preventDefault();

    try {
      setMessage("");
      await request("/expenses", {
        method: "POST",
        body: JSON.stringify({
          ...expenseForm,
          amount: Number(expenseForm.amount),
        }),
      });

      setMessage("Expense submitted successfully!");
      setExpenseForm({
        category: "",
        description: "",
        amount: "",
        expense_date: today,
      });

      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // Approve or reject expense
  async function updateExpense(id, status) {
    try {
      setMessage("");
      await request(`/expenses/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      setMessage(`Expense ${status.toLowerCase()} successfully.`);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  const money = (value) => `$${Number(value || 0).toLocaleString()}`;

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
  };

  const sections = [
    "Dashboard",
    "Invoices",
    "Payments",
    "Expenses",
    "Audit Log",
  ];

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
      Paid: "#15803d",
      Approved: "#15803d",
      Issued: "#2563eb",
      Pending: "#d97706",
      Rejected: "#dc2626",
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
        {value}
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

  const cellStyle = {
    padding: "13px",
    borderBottom: "1px solid #eee",
    fontSize: "14px",
  };

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
        <h1 style={{ marginBottom: "6px" }}>Finance Department</h1>
        <p style={{ color: "#777", margin: 0 }}>
          Manage invoices, payments, expenses and financial activities.
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
        <p>Loading Finance information...</p>
      ) : (
        <>
          {/* DASHBOARD */}
          {section === "Dashboard" && (
            <>
              <h2>Financial Overview</h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                  gap: "18px",
                  marginTop: "20px",
                }}
              >
                <MetricCard
                  title="Total Invoiced"
                  value={money(dashboard.total_invoiced)}
                  description="Total invoice value"
                />

                <MetricCard
                  title="Payments Received"
                  value={money(dashboard.payments_received)}
                  description="Money received"
                />

                <MetricCard
                  title="Outstanding Balance"
                  value={money(dashboard.outstanding_balance)}
                  description="Unpaid invoice balance"
                />

                <MetricCard
                  title="Total Expenses"
                  value={money(dashboard.total_expenses)}
                  description="Approved expenses"
                />

                <MetricCard
                  title="Pending Expenses"
                  value={dashboard.pending_expenses || 0}
                  description="Waiting for review"
                />

                <MetricCard
                  title="Overdue Invoices"
                  value={dashboard.overdue_invoices || 0}
                  description="Invoices past their due date"
                />
              </div>

              <div style={{ ...cardStyle, marginTop: "22px" }}>
                <h3>Financial Records</h3>
                <p>Total invoices: {dashboard.invoice_count || 0}</p>
                <p>Total expenses: {dashboard.expense_count || 0}</p>
                <button style={buttonStyle} onClick={loadData}>
                  Refresh Dashboard
                </button>
              </div>
            </>
          )}

          {/* INVOICES */}
          {section === "Invoices" && (
            <>
              <h2>Invoices</h2>

              <form
                onSubmit={createInvoice}
                style={{
                  ...cardStyle,
                  marginBottom: "22px",
                  maxWidth: "650px",
                }}
              >
                <h3>Create New Invoice</h3>

                <label>Invoice Number</label>
                <input
                  style={inputStyle}
                  required
                  value={invoiceForm.invoice_number}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      invoice_number: e.target.value,
                    })
                  }
                  placeholder="INV-005"
                />

                <label>Client</label>
                <input
                  style={inputStyle}
                  required
                  value={invoiceForm.client}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      client: e.target.value,
                    })
                  }
                  placeholder="Client name"
                />

                <label>Issue Date</label>
                <input
                  style={inputStyle}
                  type="date"
                  required
                  value={invoiceForm.issue_date}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      issue_date: e.target.value,
                    })
                  }
                />

                <label>Due Date</label>
                <input
                  style={inputStyle}
                  type="date"
                  required
                  min={invoiceForm.issue_date}
                  value={invoiceForm.due_date}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      due_date: e.target.value,
                    })
                  }
                />

                <label>Amount ($)</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={invoiceForm.amount}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                />

                <button
                  type="submit"
                  style={{ ...buttonStyle, marginTop: "18px" }}
                >
                  Create Invoice
                </button>
              </form>

              <h3>Invoice Records</h3>

              <Table
                headers={[
                  "Invoice Number",
                  "Client",
                  "Issue Date",
                  "Due Date",
                  "Amount",
                  "Status",
                  "Action",
                ]}
              >
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td style={cellStyle}>{invoice.invoice_number}</td>
                    <td style={cellStyle}>{invoice.client}</td>
                    <td style={cellStyle}>{invoice.issue_date}</td>
                    <td style={cellStyle}>{invoice.due_date}</td>
                    <td style={cellStyle}>{money(invoice.amount)}</td>
                    <td style={cellStyle}>
                      <Status value={invoice.status} />
                    </td>
                    <td style={cellStyle}>
                      {invoice.status === "Issued" && (
                        <button
                          style={buttonStyle}
                          onClick={() => updateInvoice(invoice.id, "Paid")}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>

              {invoices.length === 0 && <p>No invoices found.</p>}
            </>
          )}

          {/* PAYMENTS */}
          {section === "Payments" && (
            <>
              <h2>Payments Received</h2>

              <Table headers={["Invoice Number", "Client", "Amount", "Status"]}>
                {payments.map((payment, index) => (
                  <tr key={payment.id || index}>
                    <td style={cellStyle}>{payment.invoice_number}</td>
                    <td style={cellStyle}>{payment.client}</td>
                    <td style={cellStyle}>{money(payment.amount)}</td>
                    <td style={cellStyle}>
                      <Status value={payment.status || "Paid"} />
                    </td>
                  </tr>
                ))}
              </Table>

              {payments.length === 0 && <p>No payments found.</p>}
            </>
          )}

          {/* EXPENSES */}
          {section === "Expenses" && (
            <>
              <h2>Expenses</h2>

              <form
                onSubmit={createExpense}
                style={{
                  ...cardStyle,
                  maxWidth: "650px",
                  marginBottom: "22px",
                }}
              >
                <h3>Submit New Expense</h3>

                <label>Category</label>
                <input
                  style={inputStyle}
                  required
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      category: e.target.value,
                    })
                  }
                  placeholder="e.g. Travel"
                />

                <label>Description</label>
                <input
                  style={inputStyle}
                  required
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Expense description"
                />

                <label>Amount ($)</label>
                <input
                  style={inputStyle}
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      amount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                />

                <label>Expense Date</label>
                <input
                  style={inputStyle}
                  type="date"
                  required
                  value={expenseForm.expense_date}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      expense_date: e.target.value,
                    })
                  }
                />

                <button
                  type="submit"
                  style={{ ...buttonStyle, marginTop: "18px" }}
                >
                  Submit Expense
                </button>
              </form>

              <h3>Expense Records</h3>

              <Table
                headers={[
                  "Category",
                  "Description",
                  "Amount",
                  "Date",
                  "Submitted By",
                  "Status",
                  "Actions",
                ]}
              >
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td style={cellStyle}>{expense.category}</td>
                    <td style={cellStyle}>{expense.description}</td>
                    <td style={cellStyle}>{money(expense.amount)}</td>
                    <td style={cellStyle}>{expense.expense_date}</td>
                    <td style={cellStyle}>{expense.submitted_by}</td>
                    <td style={cellStyle}>
                      <Status value={expense.status} />
                    </td>
                    <td style={cellStyle}>
                      {expense.status === "Pending" && (
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            style={{
                              ...buttonStyle,
                              background: "#15803d",
                            }}
                            onClick={() =>
                              updateExpense(expense.id, "Approved")
                            }
                          >
                            Approve
                          </button>

                          <button
                            style={{
                              ...buttonStyle,
                              background: "#dc2626",
                            }}
                            onClick={() =>
                              updateExpense(expense.id, "Rejected")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>

              {expenses.length === 0 && <p>No expenses found.</p>}
            </>
          )}

          {/* AUDIT LOG */}
          {section === "Audit Log" && (
            <>
              <h2>Finance Audit Log</h2>
              <p style={{ color: "#777" }}>
                Review recorded financial activities.
              </p>

              <Table headers={["Activity Details"]}>
                {auditLog.map((entry, index) => (
                  <tr key={entry.id || index}>
                    <td style={cellStyle}>
                      <pre
                        style={{
                          whiteSpace: "pre-wrap",
                          fontSize: "13px",
                          margin: 0,
                        }}
                      >
                        {JSON.stringify(entry, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </Table>

              {auditLog.length === 0 && <p>No audit activities found.</p>}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Finance;
