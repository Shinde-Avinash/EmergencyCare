# 🚑 EmergencyCare — Intelligent Emergency Response & Care Continuity Platform

> Privacy-first emergency healthcare coordination platform connecting **patients, bystanders, first responders, emergency caregivers, ambulances, and hospital ERs** during critical medical situations.

---

## 🌟 Key Platform Features
<img width="1458" height="813" alt="image" src="https://github.com/user-attachments/assets/c52a6de4-abc0-419b-8d31-98e7d03320de" />

### 1. 🚨 Controlled Break-Glass Emergency Access
- **Privacy-First Emergency Identity**: Patients carry a unique QR/NFC token. Raw medical records are **never stored directly on the physical code**.
- **Role-Scoped Access Tiers**:
  - **Bystander**: Reveals only Blood Group & Severe Allergy Contraindications.
  - **Paramedic**: Reveals Blood Group, Allergies, & Active Daily Medications.
  - **Hospital ER Doctor**: Full Medical History, Spirometry Reports, & Past Surgery History.
- **Time-Limited Sessions**: Emergency access automatically expires after 15 minutes.

### 2. 🗺️ Real-Time OpenStreetMap Leaflet Dispatch Engine
- Live OpenStreetMap GPS Map rendering real hospital locations (`Apex Level-1 Trauma Center`, `Ruby Hall ER`, `Jehangir Specialty Hospital`).
- Animated GPS Polyline Route connecting **Patient Incident Spot → Ambulance → Selected Receiving ER**.
- One-click ER Handoff Transmission & Doctor Acknowledgment.

### 3. 🔒 Tamper-Evident SHA-256 Audit Ledger
- Every Break-Glass request generates an immutable cryptographic block hash (`SHA-256`).
- Integrated DB Tamper Detection Engine to verify database record integrity.

### 4. 📝 3-Step Patient Registration Wizard & Progress Tracker
- **Step 1**: Basic Account Identity & Credentials
- **Step 2**: Critical Medical Baseline Profile
- **Step 3**: Emergency Contacts & Resuscitation Instructions
- Dynamic 0% to 100% real-time progress bar.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | ReactJS, TypeScript, Vite, Tailwind CSS, Lucide Icons, OpenStreetMap Leaflet |
| **Backend** | Python 3, FastAPI, SQLite3, SQLAlchemy ORM, Pydantic |
| **Security** | JWT Tokens (`HS256`), SHA-256 Cryptographic Hash Chain, Role-Based Access Control |

---

## 🚀 Getting Started & Installation Guide

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Start Backend API Server
```powershell
cd backend
python -m venv venv
# Activate venv if needed
pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib
python seed_data.py
python -m uvicorn main:app --port 8000 --reload
```
The FastAPI backend server will run on `http://localhost:8000`. Swagger API docs are available at `http://localhost:8000/docs`.

### 2. Start Frontend Application
```powershell
cd frontend
npm install
npm run dev
```
The React frontend application will run on `http://localhost:3000`.

---

## 👥 Testing Accounts (Demo Credentials)

Refer to [`USER.md`](./USER.md) for pre-seeded demo user credentials across all role types:

- **Patient**: `rahul.sharma@emergencycare.org` / `password123`
- **Bystander**: `bystander@emergencycare.org` / `password123`
- **Paramedic**: `officer.patil@ambulance.org` / `password123`
- **ER Doctor**: `dr.deshmukh@traumaer.org` / `password123`
- **Security Auditor**: `auditor@emergencycare.org` / `password123`

---

## 📄 License
This project is licensed under the MIT License.
