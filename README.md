# Subscription & Billing Management Platform

A monolithic, full-stack SaaS billing platform built with **Spring Boot** (backend) and **Angular 15** (frontend).

## Sprints Completed (1–5)

| Sprint | User Story | Features |
|--------|-----------|----------|
| 1 | US01 + US02 | JWT Login, RBAC (ADMIN/BILLING_MANAGER/VIEWER), Spring Security, Route Guards |
| 2 | US15 | System Configuration (DB-driven, in-memory cache, instant apply) |
| 3 | US03 | Plan Management (CRUD, activate/deactivate, search/filter, audit logging) |
| 4 | US04 | Customer Management (auto-generated codes, soft delete, CSV export, duplicate detection) |
| 5 | US05 + US11 | Subscription Lifecycle (state machine, price snapshot, suspend/reactivate/cancel with reasons) |

## Tech Stack

**Backend:** Java 17, Spring Boot 3.1, Spring Security + JWT, Spring Data JPA, Hibernate, MySQL, Lombok, ModelMapper, Swagger/OpenAPI, JUnit 5 + Mockito, Spring AOP

**Frontend:** Angular 15, TypeScript, Bootstrap 5, FontAwesome, JWT HTTP Interceptor, Role-based Route Guards

## Project Structure

```
subscription-billing-platform/
├── database/
│   └── schema.sql           # Full DDL for all 15 stories
├── backend/
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/billing/
│       │   ├── config/       # Security, Swagger, AOP, DataSeeder
│       │   ├── controller/   # REST controllers
│       │   ├── service/      # Business logic
│       │   ├── repository/   # Spring Data JPA repos
│       │   ├── entity/       # JPA entities with Lombok
│       │   ├── dto/          # Request/Response DTOs
│       │   ├── enums/        # Status enums
│       │   ├── exception/    # Custom exceptions + GlobalExceptionHandler
│       │   └── security/     # JWT provider, filter, UserDetails
│       └── test/java/com/billing/service/  # Unit tests
└── frontend/
    └── src/app/
        ├── core/             # Guards, interceptors, services, models
        ├── shared/           # Shared components
        └── modules/          # Feature modules (separate .ts/.html/.css)
```

## Setup

### Database
```sql
mysql -u root -p < database/schema.sql
```

### Backend
```bash
cd backend
mvn spring-boot:run
```
API runs at `http://localhost:8080/api`
Swagger UI: `http://localhost:8080/api/swagger-ui.html`

### Frontend
```bash
cd frontend
npm install
ng serve
```
App runs at `http://localhost:4200`

## Default Credentials
- **Email:** admin@billing.com
- **Password:** Admin@123
- **Role:** ADMIN

## Subscription State Machine
```
PENDING → ACTIVE (activate)
ACTIVE → SUSPENDED (suspend — reason mandatory)
ACTIVE → CANCELLED (cancel)
SUSPENDED → ACTIVE (reactivate)
SUSPENDED → CANCELLED (cancel)
CANCELLED → (terminal)
```

## Cross-Cutting Concerns
- **Audit Logging:** Every create/update/delete/transition logged via AOP
- **Validation:** @Valid + custom validators, consistent error format
- **Security:** BCrypt passwords, JWT auth, @PreAuthorize on all endpoints
- **Error Handling:** @ControllerAdvice with consistent JSON response
- **Plan Versioning:** Price/name snapshot at subscription creation time
