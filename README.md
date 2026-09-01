# CallFlow — Sales Call Management System

A call-center CRM: admins assign customers to agents, agents call and log outcomes,
and every call rolls up into sales dashboards and targets.

```
Admin → assigns Customer → Agent → calls Customer → logs outcome
      (Interested / Callback / No Answer / Not Interested / Sale)
      → dashboards, targets & reports update
```

## Stack

| Layer     | Tech                                            |
|-----------|-------------------------------------------------|
| Frontend  | React + Vite + Tailwind CSS + Recharts          |
| Backend   | Node.js + Express                               |
| Database  | PostgreSQL via Prisma ORM                       |
| Auth      | JWT (Bearer) + bcrypt, role-based (ADMIN/AGENT) |

## Project layout

```
callflow/
├── server/   Express API + Prisma schema + seed
└── client/   React SPA (Vite dev server proxies /api → :5000)
```

---

## 1. Backend setup

```bash
cd server
npm install
cp .env.example .env          # then edit .env
```

Set `DATABASE_URL` in `server/.env` to your PostgreSQL connection string
(local, Neon, Supabase, Railway — anything). Also set a real `JWT_SECRET`.

Create the tables and seed demo data:

```bash
npm run prisma:migrate        # creates tables (name it "init" when prompted)
npm run db:seed               # admin + 4 agents + 60 customers + call history
npm run dev                   # API on http://localhost:5000
```

### Seeded logins

| Role  | Email                  | Password   |
|-------|------------------------|------------|
| Admin | `admin@callflow.test`  | `admin123` |
| Agent | `hamza@callflow.test`  | `agent123` |
| Agent | `sana@callflow.test`   | `agent123` |
| Agent | `bilal@callflow.test`  | `agent123` |
| Agent | `rabia@callflow.test`  | `agent123` |

(Admin credentials come from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in `.env`.)

---

## 2. Frontend setup

```bash
cd client
npm install
npm run dev                   # app on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000`, so run the
backend first. Open http://localhost:5173 and sign in.

---

## Features

### Admin
- **Dashboard** — total calls, total sales, active agents, team target %,
  30-day sales chart, top agents this month, recent calls
- **Agents** — add / edit / delete, per-agent month stats & target progress,
  drill into an agent for performance chart + full call history
- **Customers** — searchable + filterable table, add / edit / delete,
  inline agent re-assignment, status, last call, next follow-up
- **Call Log** — every call, filterable by agent and outcome

### Agent
- **Dashboard** — my customers, calls today/month, sales this month,
  monthly target progress, upcoming follow-ups, my recent calls
- **My Customers** — only customers assigned to me; add new ones
- **Call Console** — pick a customer, `tel:` dial link, log the outcome
  (radio: Interested / Callback / No Answer / Not Interested / Sale),
  sale amount when it's a sale, optional follow-up date, notes; the
  customer's status and last-call time advance automatically

---

## API summary

| Method | Route                          | Role        | Purpose                        |
|--------|--------------------------------|-------------|--------------------------------|
| POST   | `/api/auth/login`              | public      | Get JWT                        |
| GET    | `/api/auth/me`                 | any         | Current user                   |
| GET    | `/api/dashboard/admin`         | admin       | Admin dashboard payload        |
| GET    | `/api/dashboard/agent`         | agent/admin | Agent dashboard payload        |
| GET/POST | `/api/agents`                | admin       | List / create agents           |
| GET/PUT/DELETE | `/api/agents/:id`      | admin       | Agent detail / update / delete |
| GET/POST | `/api/customers`             | any\*       | List / create customers        |
| GET/PUT  | `/api/customers/:id`         | any\*       | Detail / update                |
| PUT    | `/api/customers/:id/assign`    | admin       | Re-assign to an agent          |
| DELETE | `/api/customers/:id`           | admin       | Delete                         |
| GET/POST | `/api/calls`                | any\*       | List / log calls               |

\* Agents are automatically scoped to their own customers/calls.

## Next steps (not built yet)

- Real telephony (Twilio Voice) so calls dial from the browser
- Socket.IO live updates on the admin dashboard
- CSV import/export for customers
