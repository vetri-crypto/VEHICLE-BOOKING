# Activity Diagram — Online Vehicle Booking System

## Overview
The Activity Diagram illustrates the operational control flow of a vehicle reservation from initial vehicle selection to final booking confirmation.

---

## Activity Flow Diagram (Mermaid)

```mermaid
flowchart TD
    A([START]) --> B[Browse / Search Vehicles]
    B --> C[Select Vehicle & View Details]
    C --> D[Select Pickup & Drop-off Dates]
    D --> E[System Executes Availability Query]

    E --> F{Vehicle Available?}
    F -- NO --> G[Display Conflict Warning Alert]
    G --> D

    F -- YES --> H[Display Booking Price Summary]
    H --> I[Enter Pickup / Drop Locations & Payment Method]
    I --> J[Click Confirm & Pay]
    
    J --> K[Backend Validates Token & Input]
    K --> L[Backend Re-calculates Price & Checks Overlaps]
    
    L --> M{Backend Overlap Found?}
    M -- YES --> N[Return 409 CONFLICT Error Response]
    N --> G

    M -- NO --> O[Generate Unique Booking Reference]
    O --> P[Save Booking to MongoDB]
    P --> Q[Create Simulated Payment Record]
    Q --> R[Return 201 CREATED Response]
    R --> S[Display Confirmation Modal]
    S --> T([END])
```
