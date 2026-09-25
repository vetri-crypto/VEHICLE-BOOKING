# Use Case Diagram & Specification — Online Vehicle Booking System

## Overview
The Use Case Diagram describes the functional requirements of the Online Vehicle Booking System from the perspective of two primary actors:
1. **CUSTOMER**
2. **ADMINISTRATOR**

---

## 1. Actors
- **Customer**: Registered user who searches vehicles, verifies availability date ranges, reserves vehicles, cancels bookings, and submits reviews.
- **Admin**: System administrator who manages vehicle catalog, user accounts, updates booking status flow, and views analytics reports.

---

## 2. Mermaid Use Case Diagram

```mermaid
graph TD
    subgraph Online Vehicle Booking System
        UC1(Register Account)
        UC2(Login)
        UC3(Manage Profile)
        UC4(Search & Filter Vehicles)
        UC5(View Vehicle Details)
        UC6(Check Date Availability)
        UC7(Book Vehicle)
        UC8(View Booking Details & History)
        UC9(Cancel Booking)
        UC10(Submit Vehicle Review)
        UC11(Admin Login)
        UC12(View Admin Dashboard)
        UC13(Add / Edit / Delete Vehicle)
        UC14(View All Users)
        UC15(Update Booking Status)
        UC16(View System Reports)
    end

    Customer --> UC1
    Customer --> UC2
    Customer --> UC3
    Customer --> UC4
    Customer --> UC5
    Customer --> UC6
    Customer --> UC7
    Customer --> UC8
    Customer --> UC9
    Customer --> UC10

    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15
    Admin --> UC16

    UC7 -.->|<<include>>| UC6
    UC7 -.->|<<include>>| UC2
    UC10 -.->|<<extend>>| UC8
```

---

## 3. ArgoUML Export Specification

### Use Case Descriptions:
- **UC-01: Check Availability**: Customer selects startDate and endDate. System queries active date ranges in MongoDB for double-booking overlaps.
- **UC-02: Confirm Booking**: System calculates `totalAmount = days * pricePerDay` on backend and creates Booking & Payment records.
- **UC-03: Update Status**: Admin changes booking state from `PENDING` -> `CONFIRMED` -> `ACTIVE` -> `COMPLETED` or `CANCELLED`.
