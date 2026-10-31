# 🏋️ GYM System

A full gym management web application built with **Node.js + Express + SQLite**.
Manage members, membership plans, classes & bookings, trainers, workout/diet plans,
payments, and daily check-ins — all from one dashboard.

## Features

| Area | What you can do |
|---|---|
| 📊 **Dashboard** | Live stats: members, revenue, check-ins today, today's classes, memberships expiring soon |
| 👥 **Members** | Add/edit/delete members, assign plans, search, renew membership, track expiry date |
| 📅 **Classes** | Weekly class schedule with capacity, book/unbook members, full/partial badges |
| 🧑‍🏫 **Trainers** | Trainer profiles with specialty, assigned classes count |
| 🏋️ **Plans** | Membership plans (price + duration) and per-member workout & diet plans |
| 💰 **Payments** | Record payments (cash/card/bKash/bank), filter by month, totals |
| ✅ **Check-ins** | Daily check-in per member with membership validity enforcement |

## Tech stack

- **Backend:** Node.js, Express REST API (`/api/...`)
- **Database:** SQLite via `better-sqlite3` (file: `data/gym.db`)
- **Frontend:** Vanilla HTML/CSS/JS (no build step), served from `public/`

## Project structure

```
GYM-system/
├── server.js            # Express app & entry point
├── config/db.js         # SQLite connection + schema
├── routes/              # REST routers (members, classes, trainers, plans, payments, checkins, dashboard)
├── public/              # Frontend (index.html, css, js)
├── scripts/seed.js      # Demo data seeder
├── data/                # SQLite database (auto-created)
└── package.json
```

## Getting started

```bash
npm install        # install dependencies
npm run seed       # optional: load demo data
npm start          # start the server on http://localhost:3000
```

For development with auto-reload:

```bash
npm run dev
```

## API overview

| Endpoint | Methods |
|---|---|
| `/api/members` | GET, POST · `/:id` GET, PUT, DELETE · `/:id/renew` POST |
| `/api/trainers` | GET, POST · `/:id` GET, PUT, DELETE |
| `/api/classes` | GET, POST · `/:id` GET, PUT, DELETE · `/:id/book` POST · `/:id/book/:memberId` DELETE |
| `/api/plans/membership` | GET, POST · `/membership/:id` PUT, DELETE |
| `/api/plans/workout` · `/api/plans/diet` | GET, POST · `/:id` PUT, DELETE |
| `/api/payments` | GET (`?month=YYYY-MM`), POST · `/:id` DELETE |
| `/api/checkins` | GET (`?date=YYYY-MM-DD`), POST · `/:id` DELETE |
| `/api/dashboard` | GET — aggregated stats |

## Notes

- Membership expiry is computed from `join_date + plan duration`.
- Check-ins are rejected for suspended or expired members.
- Class bookings are rejected when the class is full or already booked.
- The database file lives in `data/` and is git-ignored; delete it and re-run `npm run seed` to reset.
