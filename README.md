
# OmniOS Platform

OmniOS is a role-based business management platform built with React and Python FastAPI.

## Technologies
- Frontend: React, JavaScript, CSS
- Backend: Python, FastAPI
- API: REST API with JSON
- Validation: Pydantic
- Testing: Pytest

## Main Modules
- Sales: Lead management, follow-up tasks and sales dashboard.
- HR: Employee management, recruitment, onboarding, leave requests and attendance.
- Finance: Invoices, payments, expenses and financial dashboard.
- Admin: Access to all modules.

## Installation and Setup

### 1. Backend

Open a terminal:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs

### 2. Frontend

Open another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@omnios.com | Admin123 |
| Sales | sales@omnios.com | Sales123 |
| HR | hr@omnios.com | HR123 |
| Finance | finance@omnios.com | Finance123 |

## Main API Endpoints

- POST /login
- GET /leads
- POST /leads
- GET /sales/dashboard
- GET /employees
- POST /employees
- GET /recruitment
- GET /onboarding
- GET /leave-requests
- GET /attendance
- GET /hr/dashboard
- GET /invoices
- GET /expenses
- GET /finance/dashboard
- GET /audit

See the interactive API documentation for available methods and request details.

## Automated Tests

Run from the backend directory:

```powershell
pytest -v
```

## Data Storage and Reset

This demonstration uses seeded in-memory data. It does not use a persistent database.

Records and login tokens reset when the backend is restarted. Log in again after restarting.

## Project Structure

- backend/: FastAPI application and automated tests.
- frontend/: React application and user interface.
