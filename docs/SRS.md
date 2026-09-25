# Software Requirements Specification (SRS)
## Online Vehicle Booking System — MERN Stack

**Document Version:** 1.0  
**Subject:** Object Oriented Analysis and Software Engineering (OOASE)  

---

### 1. Introduction
The **Online Vehicle Booking System** is an enterprise-grade academic web application designed to facilitate seamless vehicle rentals for customers while providing robust management controls for administrators. Built on the modern MERN stack (MongoDB, Express.js, React.js, Node.js), the system automates vehicle discovery, date-range availability calculations, double-booking prevention, price calculation, and reservation lifecycles.

### 2. Problem Statement
Traditional manual or file-based vehicle rental systems suffer from:
- Double-booking conflicts caused by manual record keeping.
- Inaccurate price calculations due to human oversight.
- Lack of real-time availability checking for requested date ranges.
- Insecure storage of user credentials.
- Absence of centralized dashboard reporting for vehicle fleets.

### 3. Proposed System & Objectives
The proposed system addresses these shortcomings by delivering:
1. **Real-time Date Range Availability Verification**: Algorithmic query ensuring `$lt endDate AND $gt startDate` overlap rejection.
2. **Authoritative Backend Price Calculation**: Final total price computed as `numberOfBookingDays × pricePerDay` on the server.
3. **Role-Based Security**: JWT-based authentication and role-based backend authorization for CUSTOMER and ADMIN actors.
4. **Interactive Portals**: Responsive React user interface for customers and an operation management dashboard for admins.

### 4. Functional Requirements

#### 4.1 Customer Features
- **FR-C01: User Registration**: Register with name, unique email, phone, password (hashed with bcrypt), and address.
- **FR-C02: User Authentication**: Login via email/password to obtain JWT token.
- **FR-C03: Profile Management**: View and update profile details (name, phone, address, password).
- **FR-C04: Vehicle Search & Filtering**: Search vehicles by brand, model, type, category, fuel type, transmission, and max price.
- **FR-C05: Date Range Availability Check**: Select start/end dates and receive immediate availability verification.
- **FR-C06: Vehicle Reservation**: Confirm booking with pickup/drop locations and simulated payment choice.
- **FR-C07: Booking History**: View past, active, and pending bookings with unique booking references (`BK-XXXXXX-XXXX`).
- **FR-C08: Cancellation**: Cancel eligible reservations in `PENDING` or `CONFIRMED` states.
- **FR-C09: Reviews**: Submit ratings (1-5 stars) and comments after completing a booking.

#### 4.2 Admin Features
- **FR-A01: Operation Dashboard**: View high-level metrics (total users, vehicles, available vehicles, revenue, recent bookings).
- **FR-A02: Fleet Management (CRUD)**: Add, edit, delete, and update vehicle details and status (`AVAILABLE`, `BOOKED`, `MAINTENANCE`, `INACTIVE`).
- **FR-A03: User Management**: View registered customer profiles.
- **FR-A04: Reservation Status Control**: Enforce state transition flow (`PENDING` → `CONFIRMED` → `ACTIVE` → `COMPLETED`).
- **FR-A05: Analytics & Reports**: View category distributions, status breakdowns, and top revenue vehicles.

### 5. Non-Functional Requirements
- **NFR-01 Security**: Passwords hashed using `bcryptjs` with salt factor 10. JWT authorization headers required for protected routes.
- **NFR-02 Reliability**: Double-booking prevention validated at database level to eliminate overlapping period reservations.
- **NFR-03 Usability**: Modern glassmorphic dark-theme UI built with clean responsive components.
- **NFR-04 Performance**: API response latency under 200ms for availability and booking operations.

### 6. Hardware & Software Requirements
- **Software**: Node.js v18+, React 18, Express 4.19, MongoDB 6+, Vite, Postman, VS Code.
- **Hardware**: Dual-Core Processor, 8GB RAM, 10GB Available Disk Space.
