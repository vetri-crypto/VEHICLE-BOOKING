# Class Diagram & Domain Model — Online Vehicle Booking System

## Overview
The Class Diagram maps directly to the Mongoose schemas and domain models implemented in the Express backend.

---

## 1. Domain Class Diagram (Mermaid)

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String phone
        +String password
        +String address
        +String role
        +String status
        +Date createdAt
        +Date updatedAt
        +matchPassword(enteredPassword) Boolean
    }

    class Vehicle {
        +ObjectId _id
        +String vehicleNumber
        +String brand
        +String model
        +String type
        +String category
        +String description
        +Number pricePerDay
        +String fuelType
        +String transmission
        +Number seatingCapacity
        +String imageUrl
        +String status
        +Date createdAt
        +Date updatedAt
    }

    class Booking {
        +ObjectId _id
        +String bookingReference
        +ObjectId userId
        +ObjectId vehicleId
        +Date startDate
        +Date endDate
        +String pickupLocation
        +String dropLocation
        +Number totalAmount
        +String status
        +Date createdAt
        +Date updatedAt
    }

    class Payment {
        +ObjectId _id
        +ObjectId bookingId
        +Number amount
        +String paymentMethod
        +String paymentStatus
        +String transactionReference
        +Date paidAt
    }

    class Review {
        +ObjectId _id
        +ObjectId userId
        +ObjectId vehicleId
        +ObjectId bookingId
        +Number rating
        +String comment
        +Date createdAt
    }

    User "1" -- "0..*" Booking : places >
    Vehicle "1" -- "0..*" Booking : reserved in >
    Booking "1" -- "1" Payment : generates >
    User "1" -- "0..*" Review : writes >
    Vehicle "1" -- "0..*" Review : receives >
    Booking "1" -- "0..1" Review : verified by >
```

---

## 2. Multiplicity & Relationships
- **User to Booking**: 1 to Many (`1` -> `0..*`). A customer can place multiple bookings.
- **Vehicle to Booking**: 1 to Many (`1` -> `0..*`). A vehicle can be reserved in multiple non-overlapping booking periods.
- **Booking to Payment**: 1 to 1 (`1` -> `1`). Every booking generates a payment transaction record.
- **Review to Booking/Vehicle**: 1 to 1 (`1` -> `0..1`). A review is verified against a specific booking ID.
