# Deployment Diagram — Online Vehicle Booking System

## Overview
The Deployment Diagram models the hardware nodes, execution environments, and network protocols connecting the software subsystems.

---

## Deployment Diagram (Mermaid)

```mermaid
graph TD
    subgraph Client Device [Client Hardware Node]
        Browser[Web Browser - Chrome / Firefox / Safari]
        ReactApp[React App Bundle / Single Page Application]
    end

    subgraph Application Server [Node.js Execution Node]
        ExpressServer[Express.js Application Server]
        APIRoutes[REST API Services]
    end

    subgraph Database Server [MongoDB Database Node]
        MongoEngine[(MongoDB Server Engine)]
    end

    Browser -- "HTTP / HTTPS (Port 3000 / 443)" --> ExpressServer
    ExpressServer -- "MongoDB Wire Protocol (Port 27017)" --> MongoEngine
```
