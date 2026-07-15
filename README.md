# Hospital Appointment & Electronic Medical Record System

Hospital appointment registration and electronic medical record (EMR) management system built with **Spring Boot** + **React** (frontend/backend separation).

> Chinese product name used in the UI: **慧医通**

## Features

- **Patient**: register/login, browse departments/doctors, book/cancel appointments, view EMR
- **Doctor**: consultation list, write medical records, schedules, history records
- **Admin**: dashboard, department/doctor/schedule/appointment/user management

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Spring Boot 3 + Spring Security + JWT + MyBatis-Plus |
| Database | H2 (default file DB) / optional MySQL 8 via Docker |

## Quick Start (H2, recommended)

Requirements: **JDK 21+**, **Node.js 18+**, **Maven**.

```bash
# Terminal 1 — backend
cd backend
mvn -DskipTests package
java -jar target/hospital-backend-1.0.0.jar

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Windows helper scripts (optional):

```powershell
powershell -File scripts/start-backend.ps1
powershell -File scripts/start-frontend.ps1
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

## Optional: MySQL + Docker

```powershell
powershell -File scripts/start-mysql.ps1
powershell -File scripts/start-backend.ps1 mysql
powershell -File scripts/start-frontend.ps1
```

Default local MySQL (change in production):

- Host: `localhost:3306`
- Database: `hospital`
- User/password: configure via env (see `.env.example`)

## Demo Accounts

| Username | Password | Role |
|----------|----------|------|
| patient | 123456 | Patient |
| doctor | 123456 | Doctor |
| admin | 123456 | Admin |

> Demo credentials only. Change passwords before any real deployment.

## Suggested Demo Flow

1. Login as `patient` → choose department/doctor → book appointment
2. Login as `doctor` → open consultation list → write EMR
3. Login as `patient` again → view medical record
4. Login as `admin` → open dashboard and management pages

More detail: `docs/DEFENSE_DEMO.md`

## Configuration / Secrets

Do **not** commit real secrets. Copy `.env.example` and override:

| Variable | Purpose |
|----------|---------|
| `APP_JWT_SECRET` | JWT signing key (use a long random string) |
| `APP_CORS_ORIGINS` | Allowed frontend origins |
| `SPRING_DATASOURCE_*` | Database URL/username/password |

Default config uses local/dev-friendly values only.

## Project Structure

```text
.
├── backend/          # Spring Boot API
├── frontend/         # React SPA
├── docs/             # Design notes, demo script, screenshots
├── docker/           # MySQL init SQL
├── scripts/          # Local start helpers
├── docker-compose.yml
└── README.md
```

## Tests

```bash
cd backend
mvn test
```

Core API integration tests cover login, authorization, data isolation, appointment→EMR flow, and admin stats.

## License

For educational / demo purposes. Add a license file if you redistribute commercially.
