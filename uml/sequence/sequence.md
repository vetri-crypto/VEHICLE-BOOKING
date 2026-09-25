# Sequence Diagrams — Online Vehicle Booking System

## Overview
Sequence Diagrams trace the exact step-by-step object interactions and message exchanges across the layers during core workflows.

---

## 1. Vehicle Booking Sequence Diagram (Main Workflow)

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant React as React Frontend
    participant Route as Express Booking Route
    participant Ctrl as Booking Controller
    participant Service as Booking Service
    participant VehicleModel as Vehicle Model
    participant BookingModel as Booking Model
    participant Mongo as MongoDB

    Customer->>React: Fill pickup/drop locations & select dates
    Customer->>React: Click "Confirm & Pay"
    React->>Route: POST /api/bookings (Bearer Token, Payload)
    Route->>Ctrl: createBooking(req, res)
    Ctrl->>Service: createBooking(userId, bookingData)
    
    Service->>VehicleModel: findById(vehicleId)
    VehicleModel->>Mongo: Query Vehicle Document
    Mongo-->>VehicleModel: Vehicle Data
    VehicleModel-->>Service: Vehicle Object

    Service->>BookingModel: checkAvailability(vehicleId, startDate, endDate)
    BookingModel->>Mongo: Query Overlapping Bookings ($lt endDate AND $gt startDate)
    Mongo-->>BookingModel: Overlapping Records
    BookingModel-->>Service: Overlap Result (0 conflicts)

    Service->>Service: calculatePrice(days, pricePerDay)
    Service->>Service: generateBookingReference()

    Service->>BookingModel: create(bookingPayload)
    BookingModel->>Mongo: Save Booking Document
    Mongo-->>BookingModel: Saved Booking

    Service-->>Ctrl: Populated Booking & Payment
    Ctrl-->>Route: 201 CREATED (JSON Success Response)
    Route-->>React: JSON Response with bookingReference
    React-->>Customer: Display Booking Confirmation Modal
```

---

## 2. Vehicle Availability Verification Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant React as React Frontend
    participant Route as Vehicle Route
    participant Service as Vehicle Service
    participant Mongo as MongoDB

    Customer->>React: Select Start Date & End Date
    React->>Route: GET /api/vehicles/:id/availability?startDate=...&endDate=...
    Route->>Service: checkAvailability(id, startDate, endDate)
    Service->>Mongo: find({ vehicleId, status: {$nin:['CANCELLED']}, startDate: {$lt: endDate}, endDate: {$gt: startDate} })
    Mongo-->>Service: Overlapping Array
    Service-->>Route: { available: true/false, count }
    Route-->>React: 200 OK (JSON Data)
    React-->>Customer: Update Availability Badge & Enable "Proceed to Booking"
```
