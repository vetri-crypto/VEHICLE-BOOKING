# ONLINE VEHICLE BOOKING SYSTEM — MERN STACK
> **Object Oriented Analysis and Software Engineering (OOASE) Academic Project**

![DrivePulse Banner](https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80)

---

## 📌 Executive Summary
**DrivePulse — Online Vehicle Booking System** is a full-stack academic project built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It implements an end-to-end vehicle rental platform featuring real-time date-range availability calculations, double-booking prevention, authoritative backend price calculations, role-based JWT authentication, customer management, admin operations, and complete OOASE documentation.

---

## 💻 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite), JavaScript (ES6+), HTML5, CSS3 (Custom Design System), React Router v6, Axios, Lucide React Icons |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ORM |
| **Authentication** | JSON Web Token (JWT), bcryptjs |
| **API Testing** | Postman Collection (`postman/OnlineVehicleBookingSystem.json`) |
| **UML Diagrams** | ArgoUML Specifications & Mermaid Diagrams (`uml/`) |
| **Documentation** | SRS (`docs/SRS.md`), Jira Ticket Architecture |

---

## 🏛️ Core Architecture

```
React Frontend (Port 3000)
       ↓  (Axios REST API Calls with JWT Authorization Header)
Express.js Server (Port 5000)
       ↓  (Auth & Role Middlewares, Validators)
Controller Layer (Thin Controllers)
       ↓  (Business Logic, Price Math, Overlap Checks)
Service Layer (bookingService, vehicleService, authService)
       ↓  (Mongoose ORM Models: User, Vehicle, Booking, Payment, Review)
MongoDB Database (mongodb://127.0.0.1:27017/vehicle_booking)
```

---

## 📁 Directory Structure

```
c:\Users\User\OneDrive\Documents\Desktop\OOASE Assignment\
├── client/                      # React Vite Frontend Application
│   ├── src/
│   │   ├── components/          # Reusable UI Components (Navbar, Cards, Modals, Badges)
│   │   ├── context/             # AuthContext Global Auth State Provider
│   │   ├── hooks/               # Custom Hooks (useAuth)
│   │   ├── pages/               # Customer & Admin Pages
│   │   ├── services/            # Axios API Modules (authApi, vehicleApi, bookingApi, etc.)
│   │   ├── utils/               # Formatting Helpers (Currency, Dates, Day Math)
│   │   ├── App.jsx              # Router Setup & Route Protection Guards
│   │   ├── main.jsx             # React DOM Mounting
│   │   └── index.css            # Glassmorphism Design System CSS
│   ├── package.json
│   └── vite.config.js
│
├── server/                      # Node.js / Express Backend Application
│   ├── config/                  # DB Connection (Mongoose)
│   ├── controllers/             # Express Route Handlers
│   ├── middleware/              # JWT Auth, Role Guard, Central Error Handler
│   ├── models/                  # Mongoose Schemas (User, Vehicle, Booking, Review, Payment)
│   ├── routes/                  # Express Router Endpoints
│   ├── services/                # Business Logic (Double-booking check, Price Math)
│   ├── utils/                   # JWT & DB Seed Script
│   ├── app.js                   # Express Middleware & App Config
│   ├── server.js                # HTTP Server Listener
│   └── package.json
│
├── postman/                     # Postman Test Collection
│   └── OnlineVehicleBookingSystem.json
│
├── uml/                         # ArgoUML Ready Diagrams & Specifications
│   ├── use-case/
│   ├── class/
│   ├── sequence/
│   ├── activity/
│   ├── state-chart/
│   ├── component/
│   └── deployment/
│
├── docs/                        # Software Requirements Specification
│   └── SRS.md
│
├── README.md                    # Main Project Documentation & Viva Guide
└── package.json                 # Root Concurrently Script Runner
```

---

## 🔑 Quick Credentials (Pre-seeded Demo Accounts)

Run `npm run seed` in the `server` directory to populate MongoDB with default data.

| Account Type | Email | Password | Role |
|---|---|---|---|
| **System Administrator** | `admin@vehicle.com` | `admin123` | `ADMIN` |
| **Customer User** | `customer@vehicle.com` | `customer123` | `CUSTOMER` |

---

## ⚡ Quick Start Guide

### Step 1: Ensure MongoDB is Running
Make sure MongoDB is listening on local port `27017` (`mongodb://127.0.0.1:27017`).

### Step 2: Seed Database
Open terminal in the project root:
```bash
cd server
npm run seed
```

### Step 3: Start Application
You can run both backend (Port 5000) and frontend (Port 3000) simultaneously:
```bash
# In Root Directory
npm run start
```

Or start them individually:
```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm run dev
```

Open browser at: `http://localhost:3000`

---

## 🧮 Critical Business Logic Implementation

### 1. Date-Range Availability & Double Booking Prevention
Vehicles are reserved across date ranges (`startDate` to `endDate`). A vehicle is unavailable if there exists an active reservation where:
$$\text{Existing Booking Start} < \text{Requested End Date} \quad \text{AND} \quad \text{Existing Booking End} > \text{Requested Start Date}$$

MongoDB Query executed in `server/services/vehicleService.js`:
```js
const overlappingBookings = await Booking.find({
  vehicleId,
  status: { $nin: ['CANCELLED'] },
  startDate: { $lt: new Date(endDate) },
  endDate: { $gt: new Date(startDate) }
});
```
If `overlappingBookings.length > 0`, the backend returns HTTP 409 CONFLICT:
`"Vehicle is not available for the selected dates"`.

### 2. Authoritative Price Calculation
The backend calculates the total amount to prevent client-side tampering:
```js
const diffTime = endDate.getTime() - startDate.getTime();
const days = Math.ceil(diffTime / (1000 * 3600 * 24));
const numberOfDays = Math.max(days, 1);
const totalAmount = numberOfDays * vehicle.pricePerDay;
```

---

## 🌐 REST API Endpoints Overview

### Authentication
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Authenticate & receive JWT
- `POST /api/auth/logout` — Logout user
- `GET /api/auth/me` — Fetch current user profile

### Vehicles
- `GET /api/vehicles` — Get fleet list
- `GET /api/vehicles/search` — Search & filter fleet
- `GET /api/vehicles/:id` — Get single vehicle details
- `GET /api/vehicles/:id/availability` — Check date-range availability
- `POST /api/vehicles` — (Admin) Add new vehicle
- `PUT /api/vehicles/:id` — (Admin) Edit vehicle
- `DELETE /api/vehicles/:id` — (Admin) Delete vehicle

### Bookings
- `POST /api/bookings` — Create new reservation
- `GET /api/bookings` — Get customer / admin bookings
- `GET /api/bookings/:id` — Get single booking details
- `PUT /api/bookings/:id/cancel` — Cancel booking

### Admin Operations
- `GET /api/admin/dashboard` — View system stats & recent bookings
- `GET /api/admin/users` — View all registered users
- `GET /api/admin/vehicles` — View all vehicles
- `GET /api/admin/bookings` — View all system bookings
- `PUT /api/admin/bookings/:id/status` — Change booking status flow
- `GET /api/admin/reports` — Generate visual reports & analytics

---

## 📋 Jira Project Tracking Breakdown

| Epic ID | Epic Name | Key Tasks / User Stories |
|---|---|---|
| **EPIC-1** | Requirement Analysis | Create SRS document (`docs/SRS.md`) detailing functional & non-functional requirements. |
| **EPIC-2** | UML Architecture | Design Use Case, Class, Sequence, Activity, State Chart, Component, Deployment diagrams. |
| **EPIC-3** | Authentication & Auth | Implement JWT generator, bcrypt password hashing, authMiddleware, roleMiddleware. |
| **EPIC-4** | Vehicle Catalog | Implement Vehicle Mongoose model, search/filter service, CRUD APIs, and UI cards. |
| **EPIC-5** | Booking Engine | Build date range overlap algorithm, price calculator, booking status state machine. |
| **EPIC-6** | Database Layer | Configure MongoDB connection, write seed script for Admin & Customer default data. |
| **EPIC-7** | React Frontend | Build React Vite SPA, glassmorphic CSS design system, responsive forms & grids. |
| **EPIC-8** | Express Backend | Wire thin controllers, modular services, centralized Express error handling. |
| **EPIC-9** | API Testing | Export complete Postman test suite JSON covering all HTTP endpoints. |
| **EPIC-10** | Quality Verification | Verify double-booking prevention, route security, and end-to-end user workflows. |

---

## 🎓 Viva Voce Preparation Guide (Top 20 Questions & Answers)

### Q1: Why did you choose the MERN Stack for this project?
**Answer:** The MERN stack uses JavaScript across both client and server tiers (React for UI, Node/Express for backend logic, and MongoDB BSON for database storage). This unified language ecosystem minimizes context switching, provides asynchronous non-blocking I/O performance, and enables fast component-driven development.

### Q2: Why MongoDB instead of a Relational Database like MySQL?
**Answer:** MongoDB is a document-oriented NoSQL database that stores data in flexible BSON objects. It seamlessly matches JavaScript objects, scales horizontally, and allows easy modeling of nested reviews and transaction references without complex SQL JOIN queries.

### Q3: How does JWT authentication work in your application?
**Answer:** Upon successful login, the server signs a JWT containing the user's `userId` and `role` using a secret key. The client stores this token in `localStorage` and transmits it in the `Authorization: Bearer <token>` header for subsequent requests. The backend `protect` middleware verifies the signature on every protected route.

### Q4: How is password security ensured?
**Answer:** Passwords are never stored in plain text. Before saving a User document to MongoDB, a Mongoose pre-save hook encrypts the password using `bcryptjs` with 10 salt rounds. During login, `bcrypt.compare()` verifies the entered password against the hashed hash.

### Q5: How is double booking prevented in your system?
**Answer:** Instead of relying solely on a static `vehicle.status`, availability is calculated dynamically over date ranges. The system executes a query for bookings where `startDate < newEndDate` AND `endDate > newStartDate` for non-cancelled bookings. If any overlapping records exist, the reservation is rejected with an HTTP 409 Conflict.

### Q6: Why is price calculation performed on the backend?
**Answer:** Client-side data can be intercepted or manipulated by malicious users. The backend server acts as the final authority, fetching `vehicle.pricePerDay` directly from MongoDB and calculating `totalAmount = Math.max(days, 1) * pricePerDay`.

### Q7: Explain the state transitions in your Booking State Chart Diagram.
**Answer:** A booking starts in `PENDING` state upon creation, transitions to `CONFIRMED` upon verification, moves to `ACTIVE` when the customer picks up the vehicle, and reaches `COMPLETED` when returned. It can transition to `CANCELLED` from `PENDING` or `CONFIRMED` states.

### Q8: What is the purpose of Mongoose in your backend?
**Answer:** Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides schema validation, type casting, relationship population (`.populate()`), middleware hooks (`pre('save')`), and clean query abstractions.

### Q9: How does role-based authorization differ from frontend route protection?
**Answer:** Frontend route protection (`<AdminRoute>`) prevents unauthenticated users from navigating to admin pages in the UI. However, security must be enforced on the backend. The backend `authorize('ADMIN')` middleware inspects the JWT payload and rejects non-admin API calls with HTTP 403 Forbidden.

### Q10: What HTTP status codes are used in your REST API?
**Answer:**
- `200 OK` — Successful GET / PUT requests.
- `201 CREATED` — Successful POST resource creation (Booking / Vehicle / User).
- `400 BAD REQUEST` — Invalid input or invalid date range.
- `401 UNAUTHORIZED` — Missing or invalid JWT token.
- `403 FORBIDDEN` — Insufficient role permissions.
- `404 NOT FOUND` — Resource not found.
- `409 CONFLICT` — Double booking overlap or duplicate email.
- `500 INTERNAL SERVER ERROR` — Unexpected server failure.

---

## 🏆 Final Verification Checklist

- [x] React client starts on port 3000
- [x] Express backend starts on port 5000
- [x] MongoDB database connection verified
- [x] Pre-seeded Admin & Customer accounts working
- [x] JWT authentication & bcrypt hashing verified
- [x] Customer vehicle search & filter working
- [x] Date-range availability verification verified
- [x] Authoritative backend price calculation verified
- [x] Double booking prevention tested and verified
- [x] Admin dashboard & status transition controls verified
- [x] Postman collection JSON exported
- [x] ArgoUML specifications and SRS document completed
