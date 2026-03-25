<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=0:0ea5e9,50:22c55e,100:f59e0b&text=7%20Super%20City&fontAlign=50&fontAlignY=34&fontSize=52&desc=Retail%20Inventory%20%7C%20Sales%20Forecasting%20%7C%20Intelligent%20Analytics&descAlign=50&descAlignY=56&animation=fadeIn" alt="7 Super City Banner"/>

<h2>Retail Inventory & Sales Forecasting System</h2>

<p>
  <strong>A full-stack retail platform that combines operations, finance, and AI forecasting in one experience.</strong>
</p>

[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Express](https://img.shields.io/badge/API-Express.js-90C53F?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![AI Enabled](https://img.shields.io/badge/AI-Forecasting-F59E0B?style=for-the-badge&logo=scikitlearn&logoColor=white)](#-key-features)
[![Tests](https://img.shields.io/badge/Tested-Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)](#-testing)
[![Status](https://img.shields.io/badge/Status-Active-16A34A?style=for-the-badge)](#-quick-start-guide)

<p>
  <a href="#-quick-start-guide"><strong>Get Started</strong></a> •
  <a href="#-key-features"><strong>Features</strong></a> •
  <a href="#-api-endpoints-overview"><strong>API</strong></a> •
  <a href="#-project-structure"><strong>Architecture</strong></a>
</p>

<table>
  <tr>
    <td align="center"><strong>Inventory Accuracy</strong><br/>Real-time stock visibility</td>
    <td align="center"><strong>Sales Intelligence</strong><br/>Trend-aware business decisions</td>
    <td align="center"><strong>Operational Speed</strong><br/>From purchase to invoice</td>
  </tr>
</table>

---

</div>

## 📌 About 7 Super City

7 Super City is a **comprehensive retail management system** designed specifically for retail businesses that need:
- ✅ Complete inventory control
- ✅ Real-time sales analytics
- ✅ AI-powered sales forecasting
- ✅ Customer loyalty management
- ✅ Multi-user role-based access

Perfect for **supermarkets, convenience stores, and retail chains** that want to scale their operations with confidence.

<details>
<summary><strong>Why teams choose this system</strong></summary>

- Centralizes products, suppliers, stock flow, customer loyalty, and sales in one platform
- Reduces manual reporting with ready-to-use dashboards and summaries
- Supports role-specific workflows for admin, manager, and cashier users
- Adds forecasting support via Python + scikit-learn without changing your core stack

</details>

---

## ⭐ Key Features

<table>
<tr>
<td>

### 🔐 Security & Access
- JWT-based authentication
- Role-based access control
- Admin/Manager/Cashier roles
- Secure password hashing
- Protected API routes

</td>
<td>

### 📊 Business Intelligence
- Real-time dashboard
- Sales analytics & reports
- Inventory forecasting
- Sales predictions (AI)
- Performance metrics

</td>
<td>

### 📦 Inventory Management
- Product CRUD operations
- Stock tracking
- Transaction history
- Low stock alerts
- Supplier management

</td>
</tr>
<tr>
<td>

### 💰 Sales & Finance
- Point of Sale (POS)
- Invoice generation
- Payment tracking
- Sales reports
- Revenue analytics

</td>
<td>

### 👥 Customer Management
- Customer profiles
- Loyalty points system
- Coupon management
- Customer analytics
- Portal login

</td>
<td>

### 🚀 Enterprise Features
- Multi-user support
- Audit logging
- Data export (CSV/PDF)
- Supabase RLS
- Scalable architecture

</td>
</tr>
</table>

---

## 🏗️ Tech Stack

<div align="center">

| Category | Technologies |
|---|---|
| **Frontend** | <img src="https://img.shields.io/badge/React%2018-61DAFB?logo=react&logoColor=white" alt="React"/> <img src="https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white" alt="Vite"/> <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind"/> |
| **Backend** | <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white" alt="Node.js"/> <img src="https://img.shields.io/badge/Express.js-90C53F?logo=express&logoColor=white" alt="Express"/> <img src="https://img.shields.io/badge/JWT-000000?logo=JSON%20web%20tokens&logoColor=white" alt="JWT"/> |
| **Database** | <img src="https://img.shields.io/badge/PostgreSQL-336791?logo=postgresql&logoColor=white" alt="PostgreSQL"/> <img src="https://img.shields.io/badge/Supabase-3ecf8e?logo=supabase&logoColor=white" alt="Supabase"/> |
| **AI/ML** | <img src="https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white" alt="Python"/> <img src="https://img.shields.io/badge/scikit--learn-F7931E?logo=scikit-learn&logoColor=white" alt="scikit-learn"/> <img src="https://img.shields.io/badge/Flask-000000?logo=flask&logoColor=white" alt="Flask"/> |

</div>

## 🧭 System Flow

```mermaid
flowchart LR
  A[Cashier / Manager / Admin] --> B[React Frontend]
  B --> C[Express API Layer]
  C --> D[(Supabase PostgreSQL)]
  C --> E[AI Forecast Service\nFlask + scikit-learn]
  E --> C
  C --> F[Dashboards, Reports, Invoices]
```

---

## 🚀 Quick Start Guide

### ⚙️ Prerequisites

Before you begin, make sure you have:

- **Node.js v18+** → [Download Here](https://nodejs.org/)
- **Git** → [Download Here](https://git-scm.com/)
- **Supabase Account** → [Free Tier](https://supabase.com) (takes 2 minutes!)
- **Python 3.9+** (optional, for AI forecasting)

> 💡 **Tip:** Supabase free tier is perfect for development and small businesses!

---

### 📦 Step-by-Step Installation

#### **Step 1️⃣: Clone the Project**

```bash
git clone <repository-url>
cd Web-Based-Retail-Inventory-and-Sales-Forecasting-System-with-Intelligent-Analytics
```

#### **Step 2️⃣: Set Up Supabase Database**

1. **Create a Project** at [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Get Your Credentials:**
   - Project URL → `Settings → API → Project URL`
   - Service Role Key → `Settings → API → Project API keys → service_role`
   - Anon Key → `Settings → API → Project API keys → anon public`

3. **Run the Database Migration:**
   - Go to **SQL Editor** in Supabase
   - Create a **New Query**
   - Open `backend/supabase_migration.sql` and copy-paste the contents
   - Click **Run** (Ctrl+Enter)
   - ✅ You should see "Success. No rows returned"

> Creates: 15 tables with relationships, indexes, triggers, and sample data

#### **Step 3️⃣: Configure Backend**

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secrets (Change in Production!)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CUSTOMER_JWT_SECRET=customer_portal_secret_key_change_this

# Supabase (Replace with YOUR values)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.your-project-id.supabase.co:5432/postgres

# Email Configuration (Optional)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

**Seed Admin User:**

```bash
npm run seedAdmin
```

Output:
```
✓ Admin user created successfully
  Email: admin@7supercity.com
  Password: admin123
```

#### **Step 4️⃣: Configure Frontend**

```bash
cd frontend
npm install
```

#### **Step 5️⃣: Setup Python Environment (Optional - for AI Forecasting)**

```bash
cd backend
python -m venv ..\.venv
..\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

---

### 🎬 Running the Application

You'll need **2-3 terminal windows**:

#### **Terminal 1 - Backend Server**

```bash
cd backend
npm run dev
```

Expected output:
```
✓ Supabase Connected: https://your-project-id.supabase.co
✓ Server running on port 5000
  http://localhost:5000
```

#### **Terminal 2 - Frontend App**

```bash
cd frontend
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

#### **Terminal 3 - AI Forecast Server (Optional)**

```bash
cd backend
..\.venv\Scripts\Activate.ps1
python ai_server.py
```

Or use the PowerShell script:

```bash
.\run_ai_server.ps1
```

#### **🌐 Open in Browser**

Navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|---|---|---|
| 👨‍💼 **Admin** | `admin@7supercity.com` | `admin123` |
| 👤 **Manager** | `manager@7supercity.com` | `manager123` |
| 💳 **Cashier** | `cashier@7supercity.com` | `cashier123` |

> 💡 Manager and Cashier accounts only available if you run `npm run seedData`

---

## 📡 API Endpoints Overview

### Authentication
```
POST   /api/auth/login                    User login
```

### Products & Categories
```
GET    /api/products                      List products
POST   /api/products                      Create product
PUT    /api/products/:id                  Update product
DELETE /api/products/:id                  Delete product

GET    /api/categories                    List categories
POST   /api/categories                    Create category
```

### Sales
```
GET    /api/sales                         List all sales (with filters)
POST   /api/sales                         Create new sale
GET    /api/sales/:id                     Get sale details
PUT    /api/sales/:id                     Update sale
GET    /api/sales/stats/summary           Dashboard statistics
```

### Inventory & Stock
```
GET    /api/inventory                     Inventory records
GET    /api/stock/transactions            Stock transaction history
POST   /api/stock/in                      Stock in (receive)
POST   /api/stock/out                     Stock out (dispense)
```

### Suppliers & Purchases
```
GET    /api/suppliers                     List suppliers
GET    /api/purchases                     List purchases
POST   /api/purchases                     Create purchase order
```

### Customers & Loyalty
```
GET    /api/customers                     List customers
POST   /api/customers/login               Customer portal login
GET    /api/coupons                       Available coupons
POST   /api/coupons/validate              Validate coupon
```

> Full API documentation available in code comments

---

## 🧪 Testing

### Run Backend Tests

```bash
cd backend
npm test
```

Includes tests for:
- ✅ Authentication & Authorization
- ✅ Product & Inventory Management
- ✅ Sales Operations
- ✅ Security Middleware
- ✅ Input Validation

---

## 📦 Production Deployment

### Build Backend
```bash
cd backend
npm run build
npm start
```

### Build Frontend
```bash
cd frontend
npm run build
```

Generates optimized `dist/` folder for deployment.

---

## 🛠️ Troubleshooting

### ❌ "Missing SUPABASE_URL or Key"

**Solution:**
- ✓ Verify `.env` file is in `backend/` directory
- ✓ Check `SUPABASE_URL` starts with `https://`
- ✓ Confirm you copied `service_role` key (not anon key)

### ❌ "Supabase Connection Error"

**Solution:**
- ✓ Check internet connection
- ✓ Verify Supabase project is active (not paused)
- ✓ Ensure SQL migration was completed

### ❌ "relation does not exist"

**Solution:**
- ✓ Go to Supabase SQL Editor
- ✓ Run `backend/supabase_migration.sql` again

### ❌ "Port 5000 Already in Use"

**Solution:**
- ✓ Change `PORT=5001` in `.env`
- ✓ Update `frontend/src/services/api.js` base URL

### ❌ Frontend Build Errors

**Solution:**
```bash
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm run dev
```

---

## 📚 Documentation

| Document | Purpose |
|---|---|
| `EVALUATION_EXECUTION_PACK.md` | Delivery timeline, presentation script, rubric mapping |
| `TEST_CASES_TEMPLATE.csv` | Test evidence sheet (module, validation, security) |
| `IMPLEMENTATION_NOTES.md` | Technical implementation details |
| `backend/supabase_migration.sql` | Database schema & initial setup |

---

## 🔒 Security Features

✅ **Password Security**
- Bcrypt hashing with salt rounds
- Minimum password requirements

✅ **Authentication**
- JWT tokens (30-day expiry)
- Refresh token mechanism
- Secure logout

✅ **Authorization**
- Role-based access control (RBAC)
- Protected API routes
- Middleware validation

✅ **Database**
- Supabase Row Level Security (RLS)
- SQL injection prevention
- Parameterized queries

✅ **Network**
- CORS enabled
- Input validation on all endpoints
- Error handling middleware

---

## 📊 Project Structure

```
7 Super City/
├── backend/
│   ├── controllers/        # Business logic
│   ├── routes/            # API endpoints
│   ├── models/            # Database models
│   ├── middleware/        # Auth, validation
│   ├── tests/             # Jest test suites
│   ├── ai_server.py       # Python forecast engine
│   ├── server.js          # Express app
│   └── .env               # Configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API calls
│   │   ├── context/       # State management
│   │   └── App.jsx        # Main app
│   └── vite.config.js     # Vite configuration
│
└── README.md              # This file
```

---

## 🤝 Contributing

We welcome contributions! To contribute:

1. **Fork** this repository
2. **Create** a feature branch: `git checkout -b feature/your-feature`
3. **Commit** changes: `git commit -m 'Add feature'`
4. **Push** to branch: `git push origin feature/your-feature`
5. **Open** a pull request

---

## 📜 License

This project is created for **7 Super City** organization.

---

## 💡 Quick Tips

> 🚀 **First Time Setup?** Follow the Quick Start Guide above - takes about 10 minutes!

> 🔑 **Password Issues?** For Gmail SMTP, use an **App Password** (16 chars), not your regular password

> 📱 **Mobile Friendly?** Yes! Responsive design works on desktop, tablet, and mobile

> 🌍 **Internationalization?** System includes i18n support for multiple languages

> 🎨 **Customization?** All UI components are built with Tailwind CSS - easy to theme!

---

<div align="center">

### ⭐ If this project helps you, please give it a star! ⭐

**Built with ❤️ for 7 Super City**

[⬆ Back to top](#-7-super-city)

</div>
