# 🧠 Decision Replay Platform

A modern web application for capturing, managing, and reviewing organizational decisions. The platform enables teams to document important decisions, track their status, and build a searchable knowledge repository for future reference.

---

## 📖 About the Project

Organizations make numerous decisions every day, but the reasoning behind them is often forgotten over time. This results in repeated mistakes, duplicated efforts, and loss of organizational knowledge.

The **Decision Replay Platform** solves this problem by allowing users to record every important decision along with its problem statement, evaluation criteria, risks, categories, and supporting information. Teams can later revisit these decisions, understand the reasoning behind them, and make better decisions in the future.

---

# ✨ Key Features

- 🔐 Secure User Authentication using Supabase
- 👥 Role-Based Access Control
- 📝 Create New Decisions
- 📂 Edit and Delete Decisions
- 📋 Save Decisions as Drafts
- 🔍 Search Decisions
- 🏷️ Filter by Category and Status
- 📊 Interactive Dashboard
- 👤 User Profile Management
- 🛡️ Admin Panel for User & Role Management
- ☁️ Cloud Database Integration using Supabase
- 📱 Responsive User Interface

---

# 👤 User Roles

| Role | Responsibility |
|------|----------------|
| Employee | Create and manage decisions |
| Reviewer | Review submitted decisions |
| Manager | Approve or reject decisions |
| Administrator | Manage users, teams, and system settings |

---

# 🔄 Decision Workflow

```text
Create Decision
       │
       ▼
Save as Draft
       │
       ▼
Review Decision
       │
       ▼
Edit / Update
       │
       ▼
Approve / Finalize
       │
       ▼
Store for Future Reference
```

---

# 🛠️ Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React.js, TypeScript |
| Styling | Tailwind CSS |
| Routing | TanStack Router |
| State Management | React Query |
| Backend | Supabase |
| Database | PostgreSQL (Supabase) |
| Authentication | Supabase Auth |
| Build Tool | Vite |
| Version Control | Git & GitHub |

---

# 🏗️ System Architecture

```text
                     USERS
      ┌───────────────────────────────────┐
      │ Employee • Reviewer • Admin       │
      └───────────────────────────────────┘
                     │
                     ▼
          React + TypeScript Frontend
      ┌───────────────────────────────────┐
      │ Dashboard │ Decisions │ Profile   │
      │ Admin │ Search │ Reports          │
      └───────────────────────────────────┘
                     │
                     ▼
               Supabase Backend
      ┌───────────────────────────────────┐
      │ Authentication                    │
      │ PostgreSQL Database               │
      │ Role Management                   │
      │ CRUD Operations                   │
      └───────────────────────────────────┘
                     │
                     ▼
               PostgreSQL Database
      ┌───────────────────────────────────┐
      │ Profiles                          │
      │ Decisions                         │
      │ Teams                             │
      │ Roles                             │
      └───────────────────────────────────┘
```

---

# 📂 Project Structure

```text
decision-replay-project/
│
├── public/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── layouts/
│   ├── services/
│   ├── lib/
│   └── App.tsx
│
├── supabase/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## Clone the Repository

```bash
git clone https://github.com/your-username/decision-replay-platform.git
```

---

## Navigate to Project

```bash
cd decision-replay-project
```

---

## Install Dependencies

```bash
npm install
```

---

## Run the Application

```bash
npm run dev
```

The application will start at:

```text
http://localhost:5173
```

---

# ⚙️ Environment Variables

Create a `.env` file in the project root.

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

# 📸 Screenshots

Add screenshots here:

- Login Page
- Dashboard
- Create Decision
- Decision List
- Admin Panel
- Profile Page

---

# 📌 Milestone 2 Deliverables

- ✅ User Authentication
- ✅ Dashboard
- ✅ Decision CRUD Operations
- ✅ Search Functionality
- ✅ Category & Status Filters
- ✅ Profile Management
- ✅ Admin Module
- ✅ Supabase Integration
- ✅ Responsive UI
- ✅ GitHub Repository

---

# 🚀 Future Enhancements

- 🤖 AI Decision Recommendations
- 📈 Analytics Dashboard
- 📧 Email Notifications
- 🔔 Real-Time Alerts
- 📄 PDF Report Generation
- 📊 Decision History & Versioning
- 📱 Mobile Application
- 🌐 Multi-language Support

---

# 👩‍💻 Author

**N. Akshitha**

B.Tech – Computer Science Engineering (AI & ML)

Malla Reddy Engineering College for Women

---

# 📄 License

This project was developed for educational purposes as part of the **Infosys Springboard Milestone 2**.
