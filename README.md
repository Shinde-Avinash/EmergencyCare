# 🚑 EmergencyCare — Intelligent Emergency Response & Care Continuity Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-61DAFB.svg?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Build-Vite-646CFF.svg?style=flat&logo=vite)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/Audit%20Ledger-SHA--256%20Cryptographic-red.svg)](#-tamper-evident-sha-256-audit-ledger)

> **Privacy-First Emergency Healthcare Coordination & Care Continuity Platform** connecting **Patients, Bystanders, Paramedics, Emergency Caregivers, Ambulances, and Hospital ERs** during critical medical situations.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture & Key Modules](#-system-architecture--key-modules)
- [Role-Based Access Control (RBAC) Matrix](#-role-based-access-control-rbac-matrix)
- [System Requirements & Prerequisites](#-system-requirements--prerequisites)
- [Step-by-Step Installation & Run Guide](#-step-by-step-installation--run-guide)
  - [1. Backend Setup (FastAPI & SQLite)](#1-backend-setup-fastapi--sqlite)
  - [2. Frontend Setup (React, TypeScript & Vite)](#2-frontend-setup-react-typescript--vite)
- [Environment Configuration](#-environment-configuration)
- [Demo Credentials & Quick Testing](#-demo-credentials--quick-testing)
- [REST API Architecture & Endpoints](#-rest-api-architecture--endpoints)
- [Cryptographic Audit Ledger & Security Engine](#-cryptographic-audit-ledger--security-engine)
- [Directory Layout](#-directory-layout)
- [Troubleshooting & FAQ](#-troubleshooting--faq)
- [License](#-license)

---

## 🌟 Overview

**EmergencyCare** solves critical emergency healthcare handoff delays and data privacy challenges during life-threatening incidents. In traditional emergency scenarios, first responders lack access to vital medical histories (e.g., severe drug allergies, Spirometry status, blood group, resuscitation preferences), while patients risk catastrophic privacy leaks if raw health records are stored directly on physical tags.

EmergencyCare introduces a **Controlled Break-Glass Emergency Access Model**:
1. **Zero-Data Physical Tokens**: Physical QR/NFC identity cards store **only anonymous cryptographic tokens**, never raw medical records.
2. **Role-Scoped Access Tiers**: Medical disclosure is strictly bounded by the credential tier of the requester (`BYSTANDER`, `PARAMEDIC`, or `HOSPITAL_STAFF`).
3. **Time-Limited Sessions**: Access sessions automatically terminate after 15 minutes.
4. **Immutable Audit Ledger**: Every access attempt generates a tamper-evident **SHA-256 cryptographic hash block** stored in an append-only ledger.

---

## 🏗️ System Architecture & Key Modules

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            REACT FRONTEND                               │
 │   ┌──────────────┐   ┌────────────────┐   ┌─────────────────────────┐   │
 │   │ Patient View │   │ Bystander Scan │   │ Paramedic / ER Dispatch │   │
 │   └──────┬───────┘   └───────┬────────┘   └────────────┬────────────┘   │
 └──────────┼───────────────────┼─────────────────────────┼────────────────┘
            │ REST              │ Break-Glass             │ Live Dispatch
            ▼                   ▼                         ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                         FASTAPI BACKEND SERVICE                         │
 │   ┌──────────────┐   ┌────────────────┐   ┌─────────────────────────┐   │
 │   │ Auth & RBAC  │   │ Break-Glass    │   │ Routing & Dispatch      │   │
 │   │ JWT Engine   │   │ Scope Resolver │   │ OSM Distance Matrix     │   │
 │   └──────┬───────┘   └───────┬────────┘   └────────────┬────────────┘   │
 │          │                   │                         │                │
 │          ▼                   ▼                         ▼                │
 │   ┌─────────────────────────────────────────────────────────────────┐   │
 │   │           SHA-256 Cryptographic Audit Ledger Engine             │   │
 │   └──────────────────────────┬──────────────────────────────────────┘   │
 └──────────────────────────────┼──────────────────────────────────────────┘
                                ▼
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                      SQLITE3 RELATIONAL DATABASE                        │
 └─────────────────────────────────────────────────────────────────────────┘
```

### 1. 🚨 Controlled Break-Glass Emergency Access
- **Privacy-First Emergency Identity**: Patients generate unique QR identity tokens.
- **3-Tier Role Disclosure**:
  - **Bystander**: Reveals only Blood Group & Severe Allergy Contraindications.
  - **Paramedic**: Reveals Blood Group, Severe Allergies, & Active Daily Medications.
  - **Hospital ER Doctor**: Full Medical History, Spirometry Reports, Spirometry PDF download, & Surgery History.
- **Auto-Expiration**: Session tokens expire after 15 minutes.

### 2. 🗺️ Real-Time OpenStreetMap GPS Dispatch Engine
- Interactive map powered by Leaflet rendering real-time trauma centers (`Apex Level-1 Trauma Center`, `Ruby Hall ER`, `Jehangir Specialty Hospital`).
- GPS polyline calculation connecting **Incident Location → Ambulance → Receiving Hospital**.
- One-click ER Handoff Packet transmission and ER doctor acknowledgment.

### 3. 🔒 Tamper-Evident SHA-256 Audit Ledger
- Cryptographic hash chaining (`SHA-256`) for every access attempt: `Hash(Previous_Hash + Timestamp + User + Role + Access_Reason)`.
- Database Tamper Scanner engine detecting modified or forged audit records.

### 4. 📝 3-Step Patient Profile Wizard & Readiness Tracker
- Complete profile completion engine calculating a real-time **0% to 100% Readiness Score**.
- Basic Identity, Critical Baseline Medical Data, Emergency Contacts, and Resuscitation Instructions.

### 5. 👑 System Admin Patient Management Portal
- Full CRUD management interface allowing authorized System Administrators to view, register, edit, and archive patient profiles.

---

## 👥 Role-Based Access Control (RBAC) Matrix

| Feature / Module | Patient | Bystander | Paramedic | ER Doctor | Auditor | System Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Personal Profile & QR Token** | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Break-Glass Scan (Critical Tier)** | ❌ | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Break-Glass Scan (Important Tier)** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Break-Glass Scan (Full Medical Tier)** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Ambulance GPS Dispatch & Handoff** | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **ER Triage & Acknowledgment** | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **SHA-256 Audit Ledger Inspection** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **DB Tamper Detection Engine** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Admin Patient Management (CRUD)** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 💻 System Requirements & Prerequisites

Ensure your system meets the following requirements before installation:

### Software Requirements
- **Node.js**: `v18.0.0` or higher (LTS recommended)
- **npm**: `v9.0.0` or higher
- **Python**: `v3.10.0` or higher
- **Git**: `v2.30.0` or higher

### Supported Operating Systems
- **Windows**: Windows 10 / 11 (PowerShell or CMD)
- **macOS**: macOS Monterey (12.0) or higher
- **Linux**: Ubuntu 20.04+, Debian 11+, Fedora 34+

---

## 🚀 Step-by-Step Installation & Run Guide

### 1. Backend Setup (FastAPI & SQLite)

The backend is built with Python 3, FastAPI, SQLAlchemy ORM, and SQLite3.

#### Step 1.1: Navigate to the Backend Directory
```powershell
cd backend
```

#### Step 1.2: Create & Activate Virtual Environment
- **Windows (PowerShell)**:
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
- **macOS / Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

#### Step 1.3: Install Backend Dependencies
```powershell
pip install -r requirements.txt
```
*(Optionally install full auth dependencies: `pip install fastapi uvicorn sqlalchemy pydantic python-multipart python-jose passlib`)*

#### Step 1.4: Seed Database with Initial Demo Records
Run the database seeder script to populate default patient profiles, emergency records, hospital trauma centers, and audit logs:
```powershell
python seed_data.py
```
*Output confirm message: `✓ Database seeded successfully with demo records!`*

#### Step 1.5: Start FastAPI Server
```powershell
python -m uvicorn main:app --port 8000 --reload
```
- **Backend Service URL**: `http://localhost:8000`
- **Interactive API Documentation (Swagger)**: `http://localhost:8000/docs`
- **Alternative API Docs (ReDoc)**: `http://localhost:8000/redoc`

---

### 2. Frontend Setup (React, TypeScript & Vite)

The frontend is built with React 18, TypeScript, Tailwind CSS, Lucide Icons, and Vite.

#### Step 2.1: Open a New Terminal & Navigate to Frontend Directory
```powershell
cd frontend
```

#### Step 2.2: Install Node Dependencies
```powershell
npm install
```

#### Step 2.3: Start Frontend Development Server
```powershell
npm run dev
```
- **Frontend Web App URL**: `http://localhost:3000` (or `http://localhost:5173`)

#### Step 2.4: Production Build (Optional)
To verify or bundle the frontend application for production deployment:
```powershell
npm run build
```
The compiled static production bundle will be generated in the `frontend/dist/` directory.

---

## ⚙️ Environment Configuration

### Backend Environment Variables (`backend/.env`)
Create a `.env` file inside the `backend` directory if custom overrides are needed:

```env
PORT=8000
HOST=0.0.0.0
DATABASE_URL=sqlite:///./emergencycare.db
SECRET_KEY=emergencycare_super_secret_jwt_key_2026_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend Environment Variables (`frontend/.env`)
Create a `.env` file inside the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 🔑 Demo Credentials & Quick Testing

Refer to [`USER.md`](./USER.md) for full credential cheatsheet.

| Role | Email Address | Password | Primary Feature View |
| :--- | :--- | :--- | :--- |
| **Patient** | `rahul.sharma@emergencycare.org` | `password123` | Personal Medical Profile & QR Card |
| **Bystander** | `bystander@emergencycare.org` | `password123` | Scoped Break-Glass Scan (Blood Group & Allergies) |
| **Paramedic** | `officer.patil@ambulance.org` | `password123` | Field Break-Glass & Ambulance GPS Dispatch |
| **ER Doctor** | `dr.deshmukh@traumaer.org` | `password123` | Hospital ER Triage & Handoff Acknowledgment |
| **Security Auditor** | `auditor@emergencycare.org` | `password123` | SHA-256 Audit Chain Verification & DB Tamper Engine |
| **System Admin** | `admin@emergencycare.org` | `password123` | Admin Patient Management (Full CRUD Portal) |

---

## 🌐 REST API Architecture & Endpoints

| Category | Endpoint | Method | Description |
| :--- | :--- | :---: | :--- |
| **Auth** | `/api/auth/login` | `POST` | Authenticate user and issue JWT token |
| **Auth** | `/api/auth/me` | `GET` | Retrieve current authenticated user profile |
| **Break-Glass** | `/api/break-glass/request` | `POST` | Request time-bound emergency access token |
| **Break-Glass** | `/api/break-glass/scan/{token}` | `GET` | Retrieve role-scoped emergency medical payload |
| **Hospitals** | `/api/hospitals` | `GET` | Fetch list of nearby trauma centers & real-time ER bed status |
| **Hospitals** | `/api/hospitals/handoff` | `POST` | Transmit incoming ambulance handoff packet to ER |
| **Patients** | `/api/patients` | `GET` | List all registered patient profiles (Admin/Staff) |
| **Patients** | `/api/patients/{id}` | `PUT` | Update patient medical baseline & resuscitation preferences |
| **Audit** | `/api/audit/logs` | `GET` | Retrieve cryptographic SHA-256 audit ledger blocks |
| **Audit** | `/api/audit/verify` | `GET` | Execute integrity scanner across the entire hash chain |

---

## 🔒 Cryptographic Audit Ledger & Security Engine

EmergencyCare implements a blockchain-inspired **SHA-256 cryptographic audit chain** to eliminate unauthorized record tampering:

$$\text{Block\_Hash} = \text{SHA256}(\text{Previous\_Hash} \parallel \text{Timestamp} \parallel \text{User\_Name} \parallel \text{User\_Role} \parallel \text{Access\_Type} \parallel \text{Reason})$$

- **Append-Only Structure**: Each access record locks into a chain where any manual modification breaks downstream hash references.
- **Automated Audit Verification**: Clicking **"Verify Chain Signatures"** checks block consistency across all historical events.
- **Tamper Simulation**: Testing DB tampering demonstrates how the platform flags unauthorized backend edits instantly.

---

## 📁 Directory Layout

```
EmergencyCare/
├── backend/
│   ├── main.py                # FastAPI application entrypoint & API endpoints
│   ├── database.py            # SQLite SQLAlchemy connection & session maker
│   ├── models.py              # ORM database models (User, Patient, Incident, AuditLog)
│   ├── schemas.py             # Pydantic schemas for request/response validation
│   ├── auth_service.py        # Password hashing & JWT token handling
│   ├── seed_data.py           # Database seeder script for demo environments
│   ├── requirements.txt       # Python package dependencies
│   └── services/              # Business logic modules
│       ├── ai_engine.py       # Triage & spirometry analysis engine
│       ├── audit_chain.py     # SHA-256 cryptographic ledger engine
│       ├── break_glass.py     # Time-bounded role-scoped access tier engine
│       ├── hospital_routing.py# OSM route & distance calculation engine
│       └── readiness.py       # Patient profile completeness calculator (0-100%)
│
├── frontend/
│   ├── index.html             # Main HTML entrypoint
│   ├── package.json           # Node.js dependencies & NPM scripts
│   ├── tsconfig.json          # TypeScript configuration
│   ├── vite.config.ts         # Vite build bundler configuration
│   ├── tailwind.config.js     # Tailwind CSS styling configuration
│   └── src/
│       ├── main.tsx           # React app mount script
│       ├── App.tsx            # Main application router component
│       ├── types.ts           # Shared TypeScript interfaces & types
│       ├── context/
│       │   └── EmergencyContext.tsx # Global state provider & API client methods
│       └── components/
│           ├── Navbar.tsx                   # Top/sidebar navigation & role switcher
│           ├── AuthView.tsx                 # Login & Registration wizard UI
│           ├── DashboardView.tsx            # Overview dashboard & quick action panel
│           ├── EmergencyIdentityView.tsx    # QR code generator & identity card
│           ├── BreakGlassScannerView.tsx    # Emergency QR scan & data disclosure
│           ├── HospitalRoutingView.tsx      # OpenStreetMap ambulance dispatch & handoff
│           ├── AdminPatientManagementView.tsx # Admin CRUD patient management portal
│           ├── AuditLedgerView.tsx          # Cryptographic audit ledger & tamper engine
│           ├── CareCircleView.tsx           # Emergency contacts & caregiver list
│           └── MedicalRecordsView.tsx       # Health records, prescriptions & lab reports
│
├── README.md                  # System documentation guide
└── USER.md                    # Demo user credentials cheatsheet
```

---

## ❓ Troubleshooting & FAQ

#### Q1: Port 8000 or 3000 is already in use
If Uvicorn fails with `[Errno 10048] address already in use`:
- Change the backend port: `python -m uvicorn main:app --port 8001 --reload`
- Update `VITE_API_BASE_URL` in `frontend/.env` to match `http://localhost:8001`.

#### Q2: How do I reset the database?
Delete `backend/emergencycare.db` and re-run the seed script:
```powershell
cd backend
Remove-Item emergencycare.db -ErrorAction Ignore
python seed_data.py
```

#### Q3: QR Code scanner doesn't open camera
The demo scanner includes a **"Simulate QR Token Scan"** button to allow instant testing on desktop environments without requiring a physical camera device.

---

## 📄 License

This project is open-source software licensed under the **[MIT License](LICENSE)**.
