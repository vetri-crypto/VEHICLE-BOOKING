# Component Diagram — Online Vehicle Booking System

## Overview
The Component Diagram shows the physical structural components of the system and their dependencies.

---

## Component Diagram (Mermaid)

```mermaid
graph TD
    subgraph Client Tier [React Single Page Application]
        UI[React UI Components / Pages]
        AuthCtx[AuthContext / State Management]
        APILayer[Centralized Axios API Service Layer]
    end

    subgraph Server Tier [Express.js / Node.js Application Server]
        REST[Express REST API Endpoints]
        AuthMW[JWT Auth & Role Middleware]
        Ctrl[Controllers Layer]
        Svc[Services & Business Logic Layer]
        Mongoose[Mongoose ORM Models Layer]
    end

    subgraph Database Tier [MongoDB]
        DB[(MongoDB Database)]
    end

    UI --> AuthCtx
    UI --> APILayer
    APILayer -->|HTTP / REST JSON| REST
    REST --> AuthMW
    AuthMW --> Ctrl
    Ctrl --> Svc
    Svc --> Mongoose
    Mongoose -->|TCP Port 27017| DB
```
