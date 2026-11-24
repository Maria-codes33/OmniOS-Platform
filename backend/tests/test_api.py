from fastapi.testclient import TestClient
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app

client = TestClient(app)

USERS = [
    ("admin@omnios.com", "Admin123", "Admin"),
    ("sales@omnios.com", "Sales123", "Sales"),
    ("hr@omnios.com", "HR123", "HR"),
    ("finance@omnios.com", "Finance123", "Finance"),
]


def get_token(email, password):
    response = client.post(
        "/auth/login",
        json={"email": email, "password": password}
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_all_demo_users_can_login():
    for email, password, role in USERS:
        response = client.post(
            "/auth/login",
            json={"email": email, "password": password}
        )

        assert response.status_code == 200
        assert response.json()["user"]["role"] == role
        assert "access_token" in response.json()


def test_invalid_login_is_rejected():
    response = client.post(
        "/auth/login",
        json={
            "email": "wrong@omnios.com",
            "password": "Wrong123"
        }
    )

    assert response.status_code == 401


def test_sales_cannot_access_hr():
    token = get_token("sales@omnios.com", "Sales123")

    response = client.get(
        "/hr/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403


def test_sales_cannot_access_finance():
    token = get_token("sales@omnios.com", "Sales123")

    response = client.get(
        "/finance/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403


def test_hr_cannot_access_finance():
    token = get_token("hr@omnios.com", "HR123")

    response = client.get(
        "/finance/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403


def test_finance_cannot_access_hr():
    token = get_token("finance@omnios.com", "Finance123")

    response = client.get(
        "/hr/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 403


def test_sales_cannot_access_without_token():
    response = client.get("/leads")

    assert response.status_code in [401, 403]


def test_admin_can_view_all_leads():
    token = get_token("admin@omnios.com", "Admin123")

    response = client.get(
        "/leads",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_sales_only_sees_assigned_leads():
    token = get_token("sales@omnios.com", "Sales123")

    response = client.get(
        "/leads",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200

    for lead in response.json():
        assert lead["assigned_owner"] == "Sales User"


def test_sales_cannot_access_another_users_lead():
    admin_token = get_token("admin@omnios.com", "Admin123")
    sales_token = get_token("sales@omnios.com", "Sales123")

    all_leads = client.get(
        "/leads",
        headers={"Authorization": f"Bearer {admin_token}"}
    ).json()

    other_lead = next(
        (lead for lead in all_leads
         if lead["assigned_owner"] != "Sales User"),
        None
    )

    assert other_lead is not None

    response = client.get(
        f"/leads/{other_lead['id']}",
        headers={"Authorization": f"Bearer {sales_token}"}
    )

    assert response.status_code == 403


def test_sales_can_create_and_update_own_lead():
    token = get_token("sales@omnios.com", "Sales123")
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/leads",
        headers=headers,
        json={
            "company": "Test Company",
            "contact": "Test Contact",
            "email": "test@example.com",
            "phone": "0612345678",
            "source": "Website",
            "assigned_owner": "Someone Else",
            "status": "New",
            "estimated_value": 2500
        }
    )

    assert response.status_code == 200

    lead = response.json()

    assert lead["assigned_owner"] == "Sales User"

    update_response = client.patch(
        f"/leads/{lead['id']}",
        headers=headers,
        json={"status": "Qualified"}
    )

    assert update_response.status_code == 200
    assert update_response.json()["status"] == "Qualified"


def test_sales_dashboard_returns_summary():
    token = get_token("sales@omnios.com", "Sales123")

    response = client.get(
        "/dashboard/summary",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200

    data = response.json()

    assert "total_leads" in data
    assert "qualified_leads" in data
    assert "won_deals" in data
    assert "pipeline_value" in data
    assert "overdue_tasks" in data


def test_negative_lead_value_is_rejected():
    token = get_token("sales@omnios.com", "Sales123")

    response = client.post(
        "/leads",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "company": "Invalid Company",
            "contact": "Test Contact",
            "email": "invalid@example.com",
            "source": "Website",
            "assigned_owner": "Sales User",
            "status": "New",
            "estimated_value": -500
        }
    )

    assert response.status_code == 422 

def test_sales_can_create_view_and_complete_task():
    token = get_token("sales@omnios.com", "Sales123")
    headers = {"Authorization": f"Bearer {token}"}

    leads_response = client.get("/leads", headers=headers)
    lead_id = leads_response.json()[0]["id"]

    create_response = client.post(
        f"/leads/{lead_id}/tasks",
        headers=headers,
        json={
            "title": "Follow up with customer",
            "due_date": "2026-11-25"
        }
    )

    assert create_response.status_code == 200
    task = create_response.json()
    assert task["status"] == "Open"

    view_response = client.get(
        f"/leads/{lead_id}/tasks",
        headers=headers
    )

    assert view_response.status_code == 200
    assert any(item["id"] == task["id"] for item in view_response.json())

    complete_response = client.patch(
        f"/tasks/{task['id']}",
        headers=headers
    )

    assert complete_response.status_code == 200
    assert complete_response.json()["status"] == "Completed"


def test_sales_cannot_create_or_complete_another_users_task():
    admin_token = get_token("admin@omnios.com", "Admin123")
    sales_token = get_token("sales@omnios.com", "Sales123")

    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    sales_headers = {"Authorization": f"Bearer {sales_token}"}

    all_leads = client.get("/leads", headers=admin_headers).json()

    other_lead = next(
        lead for lead in all_leads
        if lead["assigned_owner"] != "Sales User"
    )

    create_response = client.post(
        f"/leads/{other_lead['id']}/tasks",
        headers=admin_headers,
        json={
            "title": "Admin follow-up",
            "due_date": "2026-11-25"
        }
    )

    assert create_response.status_code == 200
    task_id = create_response.json()["id"]

    forbidden_create = client.post(
        f"/leads/{other_lead['id']}/tasks",
        headers=sales_headers,
        json={
            "title": "Unauthorized follow-up",
            "due_date": "2026-11-25"
        }
    )

    assert forbidden_create.status_code == 403

    forbidden_view = client.get(
        f"/leads/{other_lead['id']}/tasks",
        headers=sales_headers
    )

    assert forbidden_view.status_code == 403

    forbidden_update = client.patch(
        f"/tasks/{task_id}",
        headers=sales_headers
    )

    assert forbidden_update.status_code == 403

  

    