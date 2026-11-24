
# OmniOS Platform – Architecture Note

## 1. Frontend
The frontend is developed using React and JavaScript. It provides separate interfaces for Admin, Sales, HR and Finance. React components manage user interactions and communicate with the backend through HTTP requests.

## 2. Backend
The backend uses Python FastAPI to provide REST API endpoints. It handles business logic, data validation, authentication and authorization.

## 3. Authentication and Authorization
Users log in using demo accounts. The backend issues authentication tokens. Role-based permissions restrict access to the appropriate modules and records.

## 4. Data Management
The application uses seeded in-memory Python data structures. The backend processes create, read, update and delete operations. Data is reset when the backend restarts.

## 5. Validation and Testing
Pydantic validates incoming API data. HTTP status codes communicate errors and access restrictions. Pytest is used to test API behavior, permissions and validation.

## 6. Communication Flow
React frontend → HTTP/JSON requests → FastAPI backend → validation and authorization → data processing → JSON response → React interface.
