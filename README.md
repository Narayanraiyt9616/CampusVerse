# CampusVerse AI — Intelligent University Management Ecosystem

[![Part 1 Complete](https://img.shields.io/badge/Status-Part%201%20Complete-teal)](docs/architecture-and-roadmap.md)
[![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%208-blue)](frontend)
[![Design System](https://img.shields.io/badge/Styling-Tailwind%20CSS%20v3-06B6D4)](docs/design-system.md)
[![License](https://img.shields.io/badge/Project-CSE%20Capstone-navy)](docs)

> **Final Year Computer Science Engineering Capstone Project**  
> A unified, role-governed digital operating system for higher education institutions, integrating 15 planned modules across academics, administration, student finance, and campus facilities.

---

## 1. Project Overview & Part 1 Scope

This repository contains **Part 1 — Foundation, Design System, and Frontend Architecture** of the CampusVerse AI platform.

To guarantee modularity, maintainability, and clean separation of concerns, the project is structured across sequential implementation parts:
- **Part 1 (Current)**: Core Foundation, Enterprise Design System, Public Landing Page, Responsive Application Layouts, 7 Unified Role Dashboards (Student, Faculty, Admin, Parent, Placement, Staff, Super Admin), and Axios Service Layer.
- **Part 2 (Next)**: Node.js, Express REST API, MongoDB Database Schemas, JSON Web Token (JWT) Authentication, and Role-Based Access Control (RBAC).
- **Part 3**: Python & FastAPI AI Microservice (Predictive Attendance Early Warning, Timetable Constraint Solver, Resume-Job Matcher).
- **Part 4**: Real-time WebSockets, Campus Bus Telemetry, and Push Notifications.
- **Part 5**: Production Hardening, Docker Containerization, and Final Capstone Evaluation.

---

## 2. Technology Stack

### Frontend (Part 1 Active)
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vite.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **CSS / Design System**: [Tailwind CSS v3](https://tailwindcss.com/) with custom Navy & Teal design tokens in `frontend/src/index.css`
- **Typography**: Google Fonts (*Inter* for high-density data, *Plus Jakarta Sans* for institutional display headings)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: [Axios](https://axios-http.com/) configured with interceptors and service skeletons

### Backend (Part 2 Staged)
- **Runtime**: Node.js v20+ LTS / v22
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM
- **Security**: JWT & bcryptjs password hashing

### AI Service (Part 3 Staged)
- **Language**: Python 3.11
- **Framework**: FastAPI & Uvicorn
- **Machine Learning**: Scikit-Learn, PyTorch, NumPy, Pandas

---

## 3. Directory Structure

```text
CampusVerseAI/
├── frontend/                     # React 19 + Vite frontend application
│   ├── public/                   # Static favicon and assets
│   ├── src/
│   │   ├── assets/               # Branding assets
│   │   ├── components/
│   │   │   ├── common/           # 14 Reusable UI design system components
│   │   │   │   ├── AlertBanner.jsx
│   │   │   │   ├── Badge.jsx
│   │   │   │   ├── Breadcrumbs.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── DemoNotice.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── PageHeader.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   └── Table.jsx
│   │   │   └── navigation/       # Navigation system
│   │   │       ├── Footer.jsx
│   │   │       ├── LandingNavbar.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Topbar.jsx
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── PublicLayout.jsx
│   │   ├── pages/
│   │   │   ├── dashboards/       # 7 Role Dashboard Views
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── FacultyDashboard.jsx
│   │   │   │   ├── ParentDashboard.jsx
│   │   │   │   ├── PlacementDashboard.jsx
│   │   │   │   ├── StaffDashboard.jsx
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   └── SuperAdminDashboard.jsx
│   │   │   └── public/           # Public Pages
│   │   │       ├── LandingPage.jsx
│   │   │       ├── LoginPage.jsx
│   │   │       └── NotFoundPage.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx     # Central route definitions
│   │   ├── services/
│   │   │   └── api.js            # Axios client with staged service methods
│   │   ├── utils/
│   │   │   ├── demoData.js       # Realistic demonstration datasets
│   │   │   └── formatters.js     # Currency, date, and badge helpers
│   │   ├── App.jsx
│   │   ├── index.css             # Design system CSS variables & tokens
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/                      # Staged for Part 2 (Node/Express + MongoDB)
│   └── README.md
├── ai-service/                   # Staged for Part 3 (Python/FastAPI)
│   ├── requirements.txt
│   └── README.md
├── docs/                         # Architecture and design specifications
│   ├── architecture-and-roadmap.md
│   └── design-system.md
├── README.md                     # Root project documentation
└── .gitignore
```

---

## 4. Getting Started & Installation

### Prerequisites
- **Node.js**: v20+ LTS or v22 (v22.23.1 verified)
- **npm**: v10+ (v10.9.8 verified)

### Installation Steps

1. **Clone or Navigate to the Workspace**:
   ```bash
   cd d:/FYP/frontend
   ```

2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will launch at `http://localhost:5173/`.

4. **Verify the Production Build**:
   ```bash
   npm run build
   ```

---

## 5. Available Application Routes

| Path | Description | Access / Role |
| :--- | :--- | :--- |
| `/` | Public Landing Page with Platform Features & AI Roadmap | Public |
| `/login` | SSO Login Gateway Placeholder (Explains Part 2 JWT backend) | Public |
| `/student` | Student Dashboard (Attendance, Timetable, Courses, Fees, Marks) | Student Role |
| `/faculty` | Faculty Dashboard (Assigned Courses, Biometric Roster, Grading) | Faculty Role |
| `/admin` | Administrator Console (Campus Headcounts, Approvals, Grievances)| Admin Role |
| `/parent` | Parent Portal (Ward Telemetry, Biometric Alerts, Fee Receipts) | Parent Role |
| `/placement` | Placement Cell (Recruiter Drives, CTC Stats, Eligibility) | Placement Officer |
| `/staff` | Estate & Logistics (Hostel Blocks, Transit Bus Fleet Routes) | Staff Role |
| `/super-admin` | Super Admin Console (15-Module Matrix, System Health Diagnostics)| Super Admin |
| `/*` | 404 Page for Undefined Routes | Public |

---

## 6. Features Implemented in Part 1

1. **Enterprise Design System**: Navy blue primary palette (`#0F2744`, `#0B132B`), teal accent (`#0D9488`), clean neutral cards, custom badge tokens, and accessible form controls.
2. **Public Landing Page**: Hero section, 15 campus modules preview, stakeholder benefits (Students, Faculty, Leadership), AI intelligence roadmap, 7-role interactive preview cards, and comprehensive footer.
3. **SSO / Login Gateway Placeholder**: Transparent notice informing users that real authentication with bcrypt and JWT is scheduled for Part 2; provides 1-click architecture exploration into all 7 role dashboards.
4. **Student Dashboard**: Real-time attendance percentage breakdown table (<75% alerts), interactive Monday-Friday timetable tabs, assignment submission tracker, semester SGPA history, and fee invoices with receipt view modal.
5. **Faculty Dashboard**: Assigned courses roster, attendance session recording modal simulation, and continuous assessment grading rubric modal.
6. **Administrator Dashboard**: Multi-department student/faculty statistics, pending approvals review modal, and grievance ticket redressal.
7. **Parent, Placement, Staff & Super Admin Dashboards**: Complete responsive dashboard views with realistic data and clear demonstration notices.
8. **Responsive Navigation Chrome**: Mobile drawer with backdrop blur, role switcher dropdown in topbar, notifications menu, and keyboard shortcuts.
9. **Central Axios Service Layer**: Configured with request/response interceptors ready to attach JWT headers and handle 401/403 status codes in Part 2.

---

## 7. Features Planned for Later Parts

- **Part 2**: Node.js & Express.js REST API, MongoDB database collections, Mongoose schemas, JWT cryptographic authentication, bcrypt password hashing, role-based middleware guards, and CRUD routes for all modules.
- **Part 3**: Python & FastAPI microservice with Scikit-learn attendance risk predictor, constraint-satisfaction timetable generator, and placement resume matcher.
- **Part 4**: WebSockets for real-time notification push and campus bus GPS telemetry.
- **Part 5**: Docker multi-container compose configuration and production deployment.

---

## 8. Known Limitations (Part 1)
- Data displayed across dashboards is simulated demonstration data strictly for architectural verification and design review.
- Direct form submission on `/login` displays an informational notice because backend authentication endpoints will be connected in Part 2.
- Receipt and transcript downloads show demonstration dialogs; backend PDF generation connects in Part 2.

---

## 9. Verification & Self-Testing Results

| Test Category | Item Tested | Status | Observations |
| :--- | :--- | :---: | :--- |
| **Workspace Inspection** | Clean root directory setup (`frontend`, `backend`, `ai-service`, `docs`) | **PASS** | Structure aligns with project guidelines. |
| **Dependencies** | React 19, Vite 8, Tailwind CSS v3, React Router v7, Lucide Icons, Axios | **PASS** | 0 build-blocking dependency conflicts. |
| **Production Build** | `npm run build` executed in `frontend/` | **PASS** | 1,959 modules transformed; built in 2.65s without errors. |
| **Dev Server** | `npm run dev` started on `http://localhost:5173/` | **PASS** | Dev server boots with instant HMR. |
| **Landing Page** | Hero, features, AI roadmap, benefits, roles, footer | **PASS** | All sections render with correct typography and spacing. |
| **Login Placeholder** | Form controls, disclosure notice, role preview buttons | **PASS** | No fake authentication claims; role links work cleanly. |
| **Role Dashboards** | Student, Faculty, Admin, Parent, Placement, Staff, Super Admin | **PASS** | All 7 dashboard views render without console errors. |
| **Mobile Drawer** | Hamburger menu toggle, backdrop overlay, mobile drawer slide-in | **PASS** | Tested on mobile viewport; closes smoothly. |
| **Interactive Modals** | Attendance modal, Rubric modal, Fee Receipt modal, Approval modal | **PASS** | Open, render data, escape/close listeners function properly. |
| **404 Handling** | Arbitrary URL path `/random-invalid-route` | **PASS** | Renders NotFoundPage with return links. |
