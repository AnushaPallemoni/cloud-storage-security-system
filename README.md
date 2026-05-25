# Cloud Storage Security & Auditing System

A full-stack web application for secure cloud file storage with identity-based authentication, remote integrity auditing, and sensitive data sanitization.

## Tech Stack

- **Backend** — Java 17, Spring Boot 3.2, Spring Security
- **Frontend** — React JS 18, React Router, JavaScript
- **Database** — PostgreSQL 14, Spring Data JPA, Hibernate
- **Security** — JWT Authentication, BCrypt, SHA-256
- **Build** — Maven, npm

## Features

- **PKG Module** — generates identity-based cryptographic keys from username and email using SHA-256
- **Sanitizer Module** — auto-detects and redacts 8 PII types before file sharing (Email, Phone, Aadhaar, PAN, Credit Card, SSN, Password, IP)
- **TPA Module** — Third Party Auditor verifies file integrity using challenge-response protocol without reading the file
- **JWT Authentication** — stateless token-based login with BCrypt password hashing
- **Role-Based Access** — 5 roles: USER, CLOUD_ADMIN, TPA, SANITIZER, PKG_ADMIN
- **Secure File Sharing** — sanitized version shared with unique token per share

## How to Run

### 1. Create Database
```sql
CREATE DATABASE cloudsec_db;
```

### 2. Configure Backend
Open `backend/src/main/resources/application.properties` and set your PostgreSQL password:
```
spring.datasource.password=YOUR_PASSWORD
```

### 3. Run Backend
```
Eclipse → Import → Maven → Existing Maven Projects → select backend folder
Right-click CloudSecApplication.java → Run As → Java Application
Runs at http://localhost:8080
```

### 4. Run Frontend
```bash
cd frontend
npm install
npm start
```
Opens at http://localhost:3000

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT token |
| POST | /api/files/upload | Upload a file |
| GET | /api/files/my | Get my files |
| POST | /api/sanitizer/sanitize/{id} | Sanitize a file |
| GET | /api/sanitizer/preview/{id} | Preview PII detection |
| POST | /api/tpa/request/{fileId} | Request audit |
| POST | /api/tpa/verify/{auditId} | Verify file integrity |
| GET | /api/pkg/my-key | Get my identity key |
| POST | /api/share/send | Share file with user |
| GET | /api/share/received | Files shared with me |

## Project Structure

```
cloudsec3/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/cloudsec/
│       ├── CloudSecApplication.java
│       ├── entity/
│       ├── repository/
│       ├── service/
│       ├── controller/
│       ├── security/
│       └── config/
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.js
│       ├── api.js
│       └── pages/
├── database_setup.sql
└── HOW_TO_RUN.txt
```

## Author

- GitHub:https://github.com/AnushaPallemoni
- LinkedIn:https://linkedin.com/in/anusha-pallemoni-mca19
