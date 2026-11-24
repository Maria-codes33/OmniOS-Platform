
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import secrets
import hmac

app = FastAPI(title="OmniOS API")

# Allow React to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo users
users = [
    {
        "id": 1,
        "name": "Admin User",
        "email": "admin@omnios.com",
        "password": "Admin123",
        "role": "Admin",
    },
    {
        "id": 2,
        "name": "Sales User",
        "email": "sales@omnios.com",
        "password": "Sales123",
        "role": "Sales",
    },
    {
        "id": 3,
        "name": "HR User",
        "email": "hr@omnios.com",
        "password": "HR123",
        "role": "HR",
    },
    {
        "id": 4,
        "name": "Finance User",
        "email": "finance@omnios.com",
        "password": "Finance123",
        "role": "Finance",
    },
]

# Store active demo tokens
active_tokens = {}
security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    user = active_tokens.get(token)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return user


def require_role(*allowed_roles):
    def role_checker(user=Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to access this resource"
            )

        return user

    return role_checker

leads = [
    {
        "id": 1,
        "company": "Horizon Technologies",
        "contact": "Ahmed Hassan",
        "email": "ahmed@horizon.com",
        "phone": "0612345001",
        "source": "Website",
        "assigned_owner": "Sales User",
        "status": "New",
        "estimated_value": 5000,
        "created_at": "2026-11-01",
        "updated_at": "2026-11-01"
    },
    {
        "id": 2,
        "company": "Blue Ocean Ltd",
        "contact": "Fatima Ali",
        "email": "fatima@blueocean.com",
        "phone": "0612345002",
        "source": "Referral",
        "assigned_owner": "Sales User",
        "status": "Contacted",
        "estimated_value": 7500,
        "created_at": "2026-11-02",
        "updated_at": "2026-11-03"
    },
    {
        "id": 3,
        "company": "SomTech Solutions",
        "contact": "Mohamed Omar",
        "email": "mohamed@somtech.com",
        "phone": "0612345003",
        "source": "Social Media",
        "assigned_owner": "Sales User",
        "status": "Qualified",
        "estimated_value": 12000,
        "created_at": "2026-11-03",
        "updated_at": "2026-11-05"
    },
    {
        "id": 4,
        "company": "Green Future",
        "contact": "Amina Yusuf",
        "email": "amina@greenfuture.com",
        "phone": "0612345004",
        "source": "Website",
        "assigned_owner": "Sales User",
        "status": "Proposal",
        "estimated_value": 9000,
        "created_at": "2026-11-04",
        "updated_at": "2026-11-06"
    },
    {
        "id": 5,
        "company": "Global Trade",
        "contact": "Abdi Noor",
        "email": "abdi@globaltrade.com",
        "phone": "0612345005",
        "source": "Referral",
        "assigned_owner": "Sales User",
        "status": "Won",
        "estimated_value": 15000,
        "created_at": "2026-11-05",
        "updated_at": "2026-11-08"
    },
    {
        "id": 6,
        "company": "Smart Office",
        "contact": "Hodan Ahmed",
        "email": "hodan@smartoffice.com",
        "phone": "0612345006",
        "source": "Advertisement",
        "assigned_owner": "Sales User",
        "status": "Lost",
        "estimated_value": 4000,
        "created_at": "2026-11-06",
        "updated_at": "2026-11-07"
    },
    {
        "id": 7,
        "company": "Digital World",
        "contact": "Ali Mohamed",
        "email": "ali@digitalworld.com",
        "phone": "0612345007",
        "source": "Website",
        "assigned_owner": "Sales User",
        "status": "New",
        "estimated_value": 6500,
        "created_at": "2026-11-07",
        "updated_at": "2026-11-07"
    },
    {
        "id": 8,
        "company": "Bright Solutions",
        "contact": "Sahra Hassan",
        "email": "sahra@bright.com",
        "phone": "0612345008",
        "source": "Social Media",
        "assigned_owner": "Sales User",
        "status": "Contacted",
        "estimated_value": 8500,
        "created_at": "2026-11-08",
        "updated_at": "2026-11-09"
    },
    {
        "id": 9,
        "company": "Prime Logistics",
        "contact": "Abdullahi Farah",
        "email": "abdullahi@prime.com",
        "phone": "0612345009",
        "source": "Referral",
        "assigned_owner": "Sales Representative 2",
        "status": "Qualified",
        "estimated_value": 11000,
        "created_at": "2026-11-09",
        "updated_at": "2026-11-10"
    },
    {
        "id": 10,
        "company": "NextGen Systems",
        "contact": "Maryan Ismail",
        "email": "maryan@nextgen.com",
        "phone": "0612345010",
        "source": "Website",
        "assigned_owner": "Sales Representative 2",
        "status": "Proposal",
        "estimated_value": 13000,
        "created_at": "2026-11-10",
        "updated_at": "2026-11-11"
    },
    {
        "id": 11,
        "company": "Eastern Supplies",
        "contact": "Omar Said",
        "email": "omar@eastern.com",
        "phone": "0612345011",
        "source": "Advertisement",
        "assigned_owner": "Sales User",
        "status": "New",
        "estimated_value": 5500,
        "created_at": "2026-11-11",
        "updated_at": "2026-11-11"
    },
    {
        "id": 12,
        "company": "Unity Consulting",
        "contact": "Nimco Ali",
        "email": "nimco@unity.com",
        "phone": "0612345012",
        "source": "Social Media",
        "assigned_owner": "Sales User",
        "status": "Won",
        "estimated_value": 18000,
        "created_at": "2026-11-12",
        "updated_at": "2026-11-13"
    }
]

tasks = []

class TaskCreate(BaseModel):
    title: str
    due_date: str


@app.get("/leads/{lead_id}/tasks")
def get_tasks(
    lead_id: int,
    user=Depends(require_role("Admin", "Sales"))
):
    lead = next((item for item in leads if item["id"] == lead_id), None)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if user["role"] == "Sales" and lead["assigned_owner"] != user["name"]:
        raise HTTPException(status_code=403, detail="You cannot access this lead")

    return [task for task in tasks if task["lead_id"] == lead_id]

@app.post("/leads/{lead_id}/tasks")
def create_task(
    lead_id: int,
    data: TaskCreate,
    user=Depends(require_role("Admin", "Sales"))
):

    lead = next((item for item in leads if item["id"] == lead_id), None)

    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if user["role"] == "Sales" and lead["assigned_owner"] != user["name"]:
        raise HTTPException(status_code=403, detail="You cannot access this lead")

    new_task = {
        "id": len(tasks) + 1,
        "lead_id": lead_id,
        "title": data.title,
        "due_date": data.due_date,
        "status": "Open"
    }

    tasks.append(new_task)
    return new_task

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
class LeadCreate(BaseModel):
    company: str
    contact: str
    email: EmailStr
    phone: str | None = None
    source: str
    assigned_owner: str
    status: str = "New"
    estimated_value: float = Field(ge=0)


@app.get("/")
def home():
    return {"message": "Welcome to OmniOS Platform API"}


@app.post("/auth/login")
def login(data: LoginRequest):

    for user in users:
        if (
            user["email"].lower() == data.email.lower()
            and hmac.compare_digest(user["password"], data.password)
        ):
            token = secrets.token_urlsafe(32)

            active_tokens[token] = {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            }

            return {
                "access_token": token,
                "token_type": "bearer",
                "user": active_tokens[token],
            }

    raise HTTPException(
        status_code=401,
        detail="Invalid email or password"
    )


@app.get("/leads")
def get_leads(user=Depends(require_role("Admin", "Sales"))):
    print("CURRENT USER:", user)

    if user["role"] == "Admin":
        return leads

    return [
        lead for lead in leads
        if lead["assigned_owner"] == user["name"]
    ]

@app.post("/leads")
def create_lead(
    data: LeadCreate,
    user=Depends(require_role("Admin", "Sales"))
):
    if user["role"] == "Sales":
        data = data.model_copy(
            update={"assigned_owner": user["name"]}
        )

    new_lead = data.model_dump()
    new_lead["id"] = max(
        [lead["id"] for lead in leads], default=0
    ) + 1

    new_lead["created_at"] = "2026-11-23"
    new_lead["updated_at"] = "2026-11-23"

    leads.append(new_lead)

    record_finance_action(
        user, "Created lead", "Lead", new_lead["id"]
    )

    return new_lead

class LeadUpdate(BaseModel):
    company: str | None = None
    contact: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    source: str | None = None
    assigned_owner: str | None = None
    status: str | None = None
    estimated_value: float | None = Field(default=None, ge=0)
     


@app.patch("/tasks/{task_id}")
def update_task(
    task_id: int,
    user=Depends(require_role("Admin", "Sales"))
):
    for task in tasks:
        if task["id"] == task_id:
            lead = next(
                (item for item in leads if item["id"] == task["lead_id"]),
                None
            )

            if not lead:
                raise HTTPException(status_code=404, detail="Lead not found")

            if user["role"] == "Sales" and lead["assigned_owner"] != user["name"]:
                raise HTTPException(status_code=403, detail="You cannot update this task")

            task["status"] = "Completed"
            return task

    raise HTTPException(status_code=404, detail="Task not found")

@app.get("/leads/{lead_id}")
def get_lead(
    lead_id: int,
    user=Depends(require_role("Admin", "Sales"))
):
    for lead in leads:
        if lead["id"] == lead_id:

            if user["role"] == "Sales":
                if lead["assigned_owner"] != user["name"]:
                    raise HTTPException(
                        status_code=403,
                        detail="You cannot access this lead"
                    )

            return lead

    raise HTTPException(
        status_code=404,
        detail="Lead not found"
    )   

@app.patch("/leads/{lead_id}")
def update_lead(
    lead_id: int,
    data: LeadUpdate,
    user=Depends(require_role("Admin", "Sales"))
):
    for lead in leads:
        if lead["id"] == lead_id:

            if user["role"] == "Sales":
                if lead["assigned_owner"] != user["name"]:
                    raise HTTPException(
                        status_code=403,
                        detail="You cannot update this lead"
                    )

            updates = data.model_dump(exclude_unset=True)

            if lead["status"] in ["Won", "Lost"]:
                if "status" in updates and updates["status"] != lead["status"]:
                    if user["role"] != "Admin":
                        raise HTTPException(
                            status_code=403,
                            detail="Only Admin can reopen a closed lead"
                        )

            lead.update(updates)
            lead["updated_at"] = "2026-11-23"

            record_finance_action(
                user, "Updated lead", "Lead", lead_id
            )

            return lead

    raise HTTPException(
        status_code=404,
        detail="Lead not found"
    )



@app.delete("/leads/{lead_id}")
def delete_lead(
    lead_id: int,
    user=Depends(require_role("Admin", "Sales"))
):
    for index, lead in enumerate(leads):
        if lead["id"] == lead_id:

            if user["role"] == "Sales":
                if lead["assigned_owner"] != user["name"]:
                    raise HTTPException(
                        status_code=403,
                        detail="You cannot delete this lead"
                    )

            deleted_lead = leads.pop(index)

            record_finance_action(
                user, "Deleted lead", "Lead", lead_id
            )

            return {
                "message": "Lead deleted successfully",
                "lead": deleted_lead
            }

    raise HTTPException(
        status_code=404,
        detail="Lead not found"
    )

@app.get("/dashboard/summary")
def get_dashboard_summary(
    user=Depends(require_role("Admin", "Sales"))
):
    visible_leads = leads

    if user["role"] == "Sales":
        visible_leads = [
            lead for lead in leads
            if lead["assigned_owner"] == user["name"]
        ]

    total_leads = len(visible_leads)

    qualified_leads = sum(
        1 for lead in visible_leads
        if lead["status"] == "Qualified"
    )

    won_deals = sum(
        1 for lead in visible_leads
        if lead["status"] == "Won"
    )

    pipeline_value = sum(
        lead["estimated_value"]
        for lead in visible_leads
        if lead["status"] not in ["Won", "Lost"]
    )

    today = "2026-11-23"

    overdue_tasks = sum(
        1 for task in tasks
        if task["status"] == "Open"
        and task["due_date"] < today
        and any(
            lead["id"] == task["lead_id"]
            for lead in visible_leads
        )
    )

    status_breakdown = {}

    for lead in visible_leads:
        status = lead["status"]
        status_breakdown[status] = status_breakdown.get(status, 0) + 1

    return {
        "total_leads": total_leads,
        "qualified_leads": qualified_leads,
        "won_deals": won_deals,
        "pipeline_value": pipeline_value,
        "overdue_tasks": overdue_tasks,
        "status_breakdown": status_breakdown
    }

    # =========================
# HR MODULE
# =========================

from datetime import date

employees = [
    {
        "id": 1,
        "employee_id": "EMP001",
        "name": "Amina Hassan",
        "department": "Sales",
        "job_title": "Sales Executive",
        "employment_status": "Active",
        "joining_date": "2025-03-01",
        "email": "amina@omnios.com"
    },
    {
        "id": 2,
        "employee_id": "EMP002",
        "name": "Mohamed Ali",
        "department": "IT",
        "job_title": "Software Developer",
        "employment_status": "Active",
        "joining_date": "2025-05-10",
        "email": "mohamed@omnios.com"
    },
    {
        "id": 3,
        "employee_id": "EMP003",
        "name": "Fatima Omar",
        "department": "Finance",
        "job_title": "Accountant",
        "employment_status": "Active",
        "joining_date": "2025-08-15",
        "email": "fatima@omnios.com"
    }
]

candidates = [
    {
        "id": 1,
        "name": "Abdi Yusuf",
        "email": "abdi@example.com",
        "role": "HR Assistant",
        "application_date": "2026-11-10",
        "stage": "Interview",
        "assigned_owner": "HR User"
    },
    {
        "id": 2,
        "name": "Hodan Ahmed",
        "email": "hodan@example.com",
        "role": "Developer",
        "application_date": "2026-11-15",
        "stage": "Applied",
        "assigned_owner": "HR User"
    }
]

onboarding = []

leave_requests = [
    {
        "id": 1,
        "employee": "Amina Hassan",
        "start_date": "2026-12-01",
        "end_date": "2026-12-03",
        "leave_type": "Annual",
        "reason": "Personal matters",
        "status": "Pending"
    }
]

attendance = []


# HR request models

class EmployeeCreate(BaseModel):
    employee_id: str
    name: str
    department: str
    job_title: str
    employment_status: str = "Active"
    joining_date: str
    email: EmailStr


class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    role: str
    application_date: str
    stage: str = "Applied"


class CandidateUpdate(BaseModel):
    stage: str


class OnboardingCreate(BaseModel):
    employee_id: int
    item: str
    completed: bool = False


class LeaveCreate(BaseModel):
    employee: str
    start_date: str
    end_date: str
    leave_type: str
    reason: str


class LeaveUpdate(BaseModel):
    status: str


class AttendanceCreate(BaseModel):
    employee: str
    attendance_date: str
    status: str


# Employee directory

@app.get("/employees")
def get_employees(user=Depends(require_role("Admin", "HR"))):
    return employees

@app.post("/employees")
def create_employee(
    data: EmployeeCreate,
    user=Depends(require_role("Admin", "HR"))
):
    if any(e["employee_id"] == data.employee_id for e in employees):
        raise HTTPException(400, "Employee ID already exists")

    if any(e["email"] == data.email for e in employees):
        raise HTTPException(400, "Employee email already exists")

    new_employee = data.model_dump()
    new_employee["id"] = max(
        [e["id"] for e in employees], default=0
    ) + 1

    employees.append(new_employee)

    record_finance_action(
        user, "Created employee", "Employee", new_employee["id"]
    )

    return new_employee


@app.patch("/employees/{employee_id}")
def update_employee(
    employee_id: int,
    data: EmployeeCreate,
    user=Depends(require_role("Admin", "HR"))
):
    for employee in employees:
        if employee["id"] == employee_id:
            employee.update(data.model_dump())

            record_finance_action(
                user, "Updated employee", "Employee", employee_id
            )

            return employee

    raise HTTPException(404, "Employee not found")

# Recruitment

@app.get("/recruitment")
def get_candidates(user=Depends(require_role("Admin", "HR"))):
    return candidates



@app.post("/recruitment")
def create_candidate(
    data: CandidateCreate,
    user=Depends(require_role("Admin", "HR"))
):
    new_candidate = data.model_dump()
    new_candidate["id"] = max(
        [c["id"] for c in candidates], default=0
    ) + 1

    new_candidate["assigned_owner"] = user["name"]

    candidates.append(new_candidate)

    record_finance_action(
        user, "Created candidate", "Candidate", new_candidate["id"]
    )

    return new_candidate

@app.patch("/recruitment/{candidate_id}")
def update_candidate(
    candidate_id: int,
    data: CandidateUpdate,
    user=Depends(require_role("Admin", "HR"))
):
    allowed_stages = [
        "Applied", "Screening", "Interview",
        "Offer", "Hired", "Rejected"
    ]

    if data.stage not in allowed_stages:
        raise HTTPException(400, "Invalid recruitment stage")

    for candidate in candidates:
        if candidate["id"] == candidate_id:
            candidate["stage"] = data.stage

            record_finance_action(
                user,
                f"Updated candidate stage to {data.stage}",
                "Candidate",
                candidate_id
            )

            return candidate

    raise HTTPException(404, "Candidate not found")


# Onboarding checklist

class OnboardingCreate(BaseModel):
    employee_id: int
    item: str
    completed: bool = False


class OnboardingUpdate(BaseModel):
    completed: bool


@app.get("/onboarding")
def get_onboarding(user=Depends(require_role("Admin", "HR"))):
    return onboarding


@app.post("/onboarding")
def create_onboarding_item(
    data: OnboardingCreate,
    user=Depends(require_role("Admin", "HR"))
):
    if not any(e["id"] == data.employee_id for e in employees):
        raise HTTPException(404, "Employee not found")

    allowed_items = ["Contract", "NDA", "Orientation", "Training"]

    if data.item not in allowed_items:
        raise HTTPException(400, "Invalid onboarding item")

    new_item = data.model_dump()
    new_item["id"] = max(
        [item["id"] for item in onboarding], default=0
    ) + 1

    onboarding.append(new_item)

    record_finance_action(
        user, "Created onboarding item", "Onboarding", new_item["id"]
    )

    return new_item


@app.patch("/onboarding/{item_id}")
def update_onboarding_item(
    item_id: int,
    data: OnboardingUpdate,
    user=Depends(require_role("Admin", "HR"))
):
    for item in onboarding:
        if item["id"] == item_id:
            item["completed"] = data.completed

            record_finance_action(
                user, "Updated onboarding item", "Onboarding", item_id
            )

            return item

    raise HTTPException(404, "Onboarding item not found")


# Leave requests

@app.get("/leave-requests")
def get_leave_requests(user=Depends(require_role("Admin", "HR"))):
    return leave_requests


@app.post("/leave-requests")
def create_leave_request(
    data: LeaveCreate,
    user=Depends(require_role("Admin", "HR"))
):
    if data.end_date < data.start_date:
        raise HTTPException(400, "End date cannot be before start date")

    new_request = data.model_dump()
    new_request["id"] = max(
        [item["id"] for item in leave_requests], default=0
    ) + 1
    new_request["status"] = "Pending"

    leave_requests.append(new_request)
    return new_request


@app.patch("/leave-requests/{request_id}")
def update_leave_request(
    request_id: int,
    data: LeaveUpdate,
    user=Depends(require_role("Admin", "HR"))
):
    if data.status not in ["Approved", "Rejected"]:
        raise HTTPException(400, "Invalid leave status")

    for request in leave_requests:
        if request["id"] == request_id:
            request["status"] = data.status
            return request

    raise HTTPException(404, "Leave request not found")


# Attendance

@app.get("/attendance")
def get_attendance(user=Depends(require_role("Admin", "HR"))):
    return attendance


@app.post("/attendance")
def create_attendance(
    data: AttendanceCreate,
    user=Depends(require_role("Admin", "HR"))
):
    if data.status not in ["Present", "Absent", "Leave"]:
        raise HTTPException(400, "Invalid attendance status")

    new_record = data.model_dump()
    new_record["id"] = max(
        [item["id"] for item in attendance], default=0
    ) + 1

    attendance.append(new_record)
    return new_record


# HR dashboard

@app.get("/hr/dashboard")
def get_hr_dashboard(user=Depends(require_role("Admin", "HR"))):
    active_employees = sum(
        1 for employee in employees
        if employee["employment_status"] == "Active"
    )

    pending_leave = sum(
        1 for request in leave_requests
        if request["status"] == "Pending"
    )

    active_candidates = sum(
        1 for candidate in candidates
        if candidate["stage"] not in ["Hired", "Rejected"]
    )

    completed_items = sum(
        1 for item in onboarding if item["completed"]
    )

    total_items = len(onboarding)

    completion = (
        round(completed_items / total_items * 100, 2)
        if total_items else 0
    )

    return {
        "headcount": active_employees,
        "pending_leave": pending_leave,
        "active_candidates": active_candidates,
        "onboarding_completion": completion
    }

# =========================
# FINANCE MODULE
# =========================

from datetime import date

# In-memory Finance records

invoices = [
    {
        "id": 1,
        "invoice_number": "INV-001",
        "client": "Horizon Technologies",
        "issue_date": "2026-11-01",
        "due_date": "2026-11-20",
        "amount": 5000.0,
        "status": "Paid",
        "created_by": "Finance User"
    },
    {
        "id": 2,
        "invoice_number": "INV-002",
        "client": "Blue Ocean Ltd",
        "issue_date": "2026-11-10",
        "due_date": "2026-11-30",
        "amount": 7500.0,
        "status": "Issued",
        "created_by": "Finance User"
    },
    {
        "id": 3,
        "invoice_number": "INV-003",
        "client": "SomTech Solutions",
        "issue_date": "2026-11-05",
        "due_date": "2026-11-15",
        "amount": 3000.0,
        "status": "Issued",
        "created_by": "Finance User"
    }
]

expenses = [
    {
        "id": 1,
        "category": "Office Supplies",
        "description": "Office stationery",
        "amount": 250.0,
        "expense_date": "2026-11-10",
        "submitted_by": "Finance User",
        "status": "Pending"
    },
    {
        "id": 2,
        "category": "Transportation",
        "description": "Business transportation",
        "amount": 150.0,
        "expense_date": "2026-11-12",
        "submitted_by": "Finance User",
        "status": "Approved"
    }
]

# Audit records for Finance actions
finance_audit_log = []


def record_finance_action(user, action, record_type, record_id):
    finance_audit_log.append({
        "id": len(finance_audit_log) + 1,
        "user": user["name"],
        "role": user["role"],
        "action": action,
        "record_type": record_type,
        "record_id": record_id,
        "date": date.today().isoformat()
    })


def validate_finance_date(value, field_name):
    try:
        date.fromisoformat(value)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must be a valid date (YYYY-MM-DD)"
        )


# -------------------------
# Invoice Models
# -------------------------

class InvoiceCreate(BaseModel):
    invoice_number: str = Field(min_length=1)
    client: str = Field(min_length=2)
    issue_date: str
    due_date: str
    amount: float = Field(gt=0)


class InvoiceUpdate(BaseModel):
    status: str


# -------------------------
# Expense Models
# -------------------------

class ExpenseCreate(BaseModel):
    category: str = Field(min_length=2)
    description: str = Field(min_length=3)
    amount: float = Field(gt=0)
    expense_date: str


class ExpenseUpdate(BaseModel):
    status: str


# -------------------------
# Invoice Management
# -------------------------

@app.get("/invoices")
def get_invoices(
    user=Depends(require_role("Admin", "Finance"))
):
    return invoices


@app.post("/invoices")
def create_invoice(
    data: InvoiceCreate,
    user=Depends(require_role("Admin", "Finance"))
):
    validate_finance_date(data.issue_date, "Issue date")
    validate_finance_date(data.due_date, "Due date")

    if data.due_date < data.issue_date:
        raise HTTPException(
            status_code=400,
            detail="Due date cannot be before issue date"
        )

    if any(
        invoice["invoice_number"] == data.invoice_number
        for invoice in invoices
    ):
        raise HTTPException(
            status_code=400,
            detail="Invoice number already exists"
        )

    new_invoice = data.model_dump()

    new_invoice["id"] = max(
        [item["id"] for item in invoices], default=0
    ) + 1

    new_invoice["status"] = "Issued"
    new_invoice["created_by"] = user["name"]

    invoices.append(new_invoice)

    record_finance_action(
        user, "Created invoice", "Invoice", new_invoice["id"]
    )

    return new_invoice


@app.patch("/invoices/{invoice_id}")
def update_invoice(
    invoice_id: int,
    data: InvoiceUpdate,
    user=Depends(require_role("Admin", "Finance"))
):
    if data.status not in ["Paid", "Issued"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid invoice status"
        )

    for invoice in invoices:
        if invoice["id"] == invoice_id:

            if invoice["status"] == "Paid":
                raise HTTPException(
                    status_code=400,
                    detail="Paid invoices cannot be changed"
                )

            invoice["status"] = data.status

            record_finance_action(
                user,
                f"Changed invoice status to {data.status}",
                "Invoice",
                invoice_id
            )

            return invoice

    raise HTTPException(
        status_code=404,
        detail="Invoice not found"
    )


# -------------------------
# Payment Tracking
# -------------------------

@app.get("/payments")
def get_payments(
    user=Depends(require_role("Admin", "Finance"))
):
    return [
        {
            "invoice_id": invoice["id"],
            "invoice_number": invoice["invoice_number"],
            "client": invoice["client"],
            "amount": invoice["amount"],
            "payment_status": invoice["status"]
        }
        for invoice in invoices
    ]


# -------------------------
# Expense Management
# -------------------------

@app.get("/expenses")
def get_expenses(
    user=Depends(require_role("Admin", "Finance"))
):
    return expenses


@app.post("/expenses")
def create_expense(
    data: ExpenseCreate,
    user=Depends(require_role("Admin", "Finance"))
):
    validate_finance_date(data.expense_date, "Expense date")

    new_expense = data.model_dump()

    new_expense["id"] = max(
        [item["id"] for item in expenses], default=0
    ) + 1

    new_expense["submitted_by"] = user["name"]
    new_expense["status"] = "Pending"

    expenses.append(new_expense)

    record_finance_action(
        user, "Submitted expense", "Expense", new_expense["id"]
    )

    return new_expense


@app.patch("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    data: ExpenseUpdate,
    user=Depends(require_role("Admin", "Finance"))
):
    if data.status not in ["Approved", "Rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Expense status must be Approved or Rejected"
        )

    for expense in expenses:
        if expense["id"] == expense_id:

            if expense["status"] != "Pending":
                raise HTTPException(
                    status_code=400,
                    detail="Only pending expenses can be reviewed"
                )

            expense["status"] = data.status

            record_finance_action(
                user,
                f"{data.status} expense",
                "Expense",
                expense_id
            )

            return expense

    raise HTTPException(
        status_code=404,
        detail="Expense not found"
    )


# -------------------------
# Finance Dashboard
# -------------------------

@app.get("/finance/dashboard")
def get_finance_dashboard(
    user=Depends(require_role("Admin", "Finance"))
):
    today = date.today()

    total_invoiced = sum(
        invoice["amount"]
        for invoice in invoices
        if invoice["status"] != "Draft"
    )

    payments_received = sum(
        invoice["amount"]
        for invoice in invoices
        if invoice["status"] == "Paid"
    )

    outstanding_balance = sum(
        invoice["amount"]
        for invoice in invoices
        if invoice["status"] == "Issued"
    )

    total_expenses = sum(
        expense["amount"]
        for expense in expenses
        if expense["status"] == "Approved"
    )

    pending_expenses = sum(
        1 for expense in expenses
        if expense["status"] == "Pending"
    )

    overdue_invoices = sum(
        1 for invoice in invoices
        if invoice["status"] == "Issued"
        and date.fromisoformat(invoice["due_date"]) < today
    )

    return {
        "total_invoiced": total_invoiced,
        "payments_received": payments_received,
        "outstanding_balance": outstanding_balance,
        "total_expenses": total_expenses,
        "pending_expenses": pending_expenses,
        "overdue_invoices": overdue_invoices,
        "invoice_count": len(invoices),
        "expense_count": len(expenses)
    }


# -------------------------
# Finance Audit Log
# -------------------------

@app.get("/finance/audit-log")
def get_finance_audit_log(
    user=Depends(require_role("Admin", "Finance"))
):
    return finance_audit_log

@app.get("/audit")
def get_audit_log(
    user=Depends(require_role("Admin"))
):
    return finance_audit_log