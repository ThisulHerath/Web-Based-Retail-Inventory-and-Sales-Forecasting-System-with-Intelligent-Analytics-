<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Shopping%20Cart.png" alt="Shopping Cart" width="40" height="40" /> 

# 7 Super City - Retail Inventory and Sales Forecasting System

A modern, full-stack retail management system built with **Supabase (PostgreSQL)**, Express.js, React.js, and Node.js.

---

## Features

- Secure JWT-based authentication with role-based access (Admin, Manager, Cashier)
- Real-time dashboard with sales statistics
- Full CRUD for Sales, Products, Categories, Suppliers, Purchases, Users
- Inventory & stock management with transaction history
- Customer portal with loyalty points & coupons
- Professional printable invoices

---

## Prerequisites

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **npm** package manager (comes with Node.js)
- **Supabase account** (free tier works) — [supabase.com](https://supabase.com)

---

## Database Setup (Supabase)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `7supercity` (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Pick the closest to you
4. Click **"Create new project"** and wait for it to finish provisioning

### Step 2: Get Your Credentials

Once the project is ready, go to **Project Settings → API** and copy:

| Setting | Where to find it |
|---|---|
| **Project URL** | `Settings → API → Project URL` |
| **anon (public) key** | `Settings → API → Project API keys → anon public` |
| **service_role key** | `Settings → API → Project API keys → service_role secret` |

### Step 3: Run the Database Migration

1. In your Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Open the file `backend/supabase_migration.sql` from this project
4. **Copy the entire contents** and paste it into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)
6. You should see "Success. No rows returned" — this means all tables were created

> **What this creates:** 15 tables including users, products, categories, sales, inventory, stock_transactions, customers, coupons, suppliers, purchases, and their relationship tables, plus indexes and triggers.

---

## Installation & Setup

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create/edit the file `backend/.env` with your Supabase credentials:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CUSTOMER_JWT_SECRET=customer_portal_secret_key_change_this
NODE_ENV=development

# Supabase Configuration (replace with YOUR values from Step 2 above)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
DATABASE_URL=postgresql://postgres:YOUR-PASSWORD@db.your-project-id.supabase.co:5432/postgres
```

**Important:**
- Replace `your-project-id` with your actual Supabase project ID
- Replace `your-service-role-key-here` with the service_role key from Supabase
- Replace `YOUR-PASSWORD` with the database password you set when creating the project
- Change `JWT_SECRET` and `CUSTOMER_JWT_SECRET` to unique random strings in production

### Step 3: Seed the Admin User

```powershell
cd backend
npm run seedAdmin
```

You should see:
```
 Admin user created successfully
 Email: admin@7supercity.com
 Password: admin123
```

> **Optional:** Run `npm run seedData` to also create sample Manager and Cashier users.

### Step 4: Install Frontend Dependencies

Open a **new terminal**:

```powershell
cd frontend
npm install
```

---

## Running the Application

You need **two terminals** — one for backend, one for frontend.

### Terminal 1: Start Backend

```powershell
cd backend
npm run dev
```

You should see:
```
 Supabase Connected: https://your-project-id.supabase.co
 Server running on port 5000
 http://localhost:5000
```

### Terminal 2: Start Frontend

```powershell
cd frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Open the App

Go to **http://localhost:5173** in your browser.

---

##  Login Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@7supercity.com` | `admin123` |
| **Manager** | `manager@7supercity.com` | `manager123` |
| **Cashier** | `cashier@7supercity.com` | `cashier123` |

> Manager and Cashier accounts are only available if you ran `npm run seedData`.

---

##  API Endpoints

### Authentication
- `POST /api/auth/login` — User login

### Products
- `GET /api/products` — List all products
- `POST /api/products` — Create product
- `PUT /api/products/:id` — Update product
- `DELETE /api/products/:id` — Delete product

### Categories
- `GET /api/categories` — List categories
- `POST /api/categories` — Create category
- `PUT /api/categories/:id` — Update category
- `DELETE /api/categories/:id` — Delete category

### Sales
- `GET /api/sales` — List sales (pagination, search, date filter)
- `GET /api/sales/stats/summary` — Dashboard statistics
- `GET /api/sales/:id` — Single sale with items
- `POST /api/sales` — Create sale
- `PUT /api/sales/:id` — Update sale
- `DELETE /api/sales/:id` — Delete sale

### Inventory
- `GET /api/inventory` — All inventory records
- `GET /api/inventory/stats/summary` — Inventory stats

### Stock
- `POST /api/stock/in` — Stock in
- `POST /api/stock/out` — Stock out
- `GET /api/stock/transactions` — Transaction history
- `GET /api/stock/history/:productId` — Product stock history

### Suppliers & Purchases
- `GET /api/suppliers` — List suppliers
- `GET /api/purchases` — List purchases

### Customers & Coupons
- `GET /api/customers` — List customers
- `POST /api/customers/login` — Customer portal login
- `POST /api/coupons/validate` — Validate coupon
- `POST /api/coupons/generate` — Generate coupon

---

## 🛠️ Troubleshooting

### "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"

Your `.env` file is missing or has incorrect values. Double-check:
1. The file is at `backend/.env` (not the project root)
2. `SUPABASE_URL` starts with `https://`
3. `SUPABASE_SERVICE_ROLE_KEY` is the **service_role** key (not the anon key)

### "Supabase Connection Error"

1. Check your internet connection
2. Verify your Supabase project is active (not paused) at [supabase.com/dashboard](https://supabase.com/dashboard)
3. Confirm you ran the SQL migration (Step 3 of Database Setup)

### "relation does not exist" errors

You haven't run the migration SQL. Go to Supabase SQL Editor and run `backend/supabase_migration.sql`.

### Port 5000 Already in Use

Change the port in `backend/.env`:
```env
PORT=5001
```
Then update `frontend/src/services/api.js` — change `http://localhost:5000/api` to `http://localhost:5001/api`.

### Frontend Build/Install Errors

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

##  Production Build

### Backend
```powershell
cd backend
npm start
```

### Frontend
```powershell
cd frontend
npm run build
npm run preview
```

---

##  Security Features

- Password hashing with bcrypt
- JWT token authentication (30-day expiry)
- Role-based access control (Admin/Manager/Cashier)
- Protected API routes
- CORS enabled
- Input validation
- Error handling middleware
- Supabase Row Level Security compatible

---

##  Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons |
| **Backend** | Node.js, Express.js, JWT, bcryptjs |
| **Database** | Supabase (PostgreSQL) |
| **Hosting** | Supabase Cloud (database), local dev server |

---

##  License

This project is created for 7 Super City organization.

---

**Built with  for 7 Super City**
