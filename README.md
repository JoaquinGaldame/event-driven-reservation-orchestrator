# Event-Driven Reservation Orchestrator

A distributed reservation platform designed to simulate real-world multi-channel booking workflows, prevent overbooking, coordinate asynchronous business processes, and demonstrate event-driven systems architecture.

---

## Overview

This project is a systems engineering project focused on designing and operating a realistic distributed booking platform.

It simulates how reservation platforms receive booking requests from multiple external channels (such as Airbnb, Booking.com, Vrbo, direct websites, and internal admin systems), normalize incoming traffic, coordinate inventory availability, process payment workflows, trigger notifications, and maintain full operational traceability.

The project is intentionally built around real architectural concerns:

- concurrent reservations
- overbooking prevention
- idempotent processing
- eventual consistency
- asynchronous workflows
- retry handling
- failure recovery
- observability
- operational tooling
- automated testing
- reproducible traffic simulation

---

## Architecture Goals

This project is designed to demonstrate practical software architecture capabilities, including:

- Distributed systems design
- Event-driven architecture
- Microservices communication
- Concurrency control
- Resilient workflow orchestration
- Failure compensation
- Contract-driven integration
- Infrastructure automation
- System observability
- Production-inspired operational workflows

---

## Problem Statement

Reservation systems are deceptively complex.

When multiple booking channels interact with the same inventory, the platform must solve problems such as:

- two customers booking the same room simultaneously
- duplicate webhooks from external providers
- delayed or failed payment confirmations
- notification delivery failures
- service outages during critical workflows
- eventual consistency across asynchronous components
- preserving auditability across distributed operations

This project exists to model and solve those challenges.

---

## High-Level Architecture

```text
Airbnb Simulator
Booking Simulator
Direct Website Simulator
Admin Simulator
        |
        v
+----------------------+
|     Gateway API      |
+----------------------+
        |
        v
+----------------------+
| Reservation Service  |
+----------------------+
        |
        v
      Redpanda
(Kafka-compatible broker)
        |
        +-----------------------------+
        |                             |
        v                             v
+----------------------+     +----------------------+
| Inventory Service    |     | Payment Service      |
+----------------------+     +----------------------+
        |                             |
        +-------------+---------------+
                      |
                      v
             +----------------------+
             | Notification Service |
             +----------------------+
                      |
                      v
             +----------------------+
             | Audit Service        |
             +----------------------+

Supporting Infrastructure:
- PostgreSQL
- Redis
- Prometheus
- Grafana
- Docker Compose
```

---

## Tech Stack

### Backend

- Node.js
- TypeScript
- Fastify
- Drizzle ORM
- PostgreSQL
- Redis
- Redpanda (Kafka-compatible event broker)

### Frontend

- React
- Vite

### Observability

- Prometheus
- Grafana

### Testing

- Vitest
- Testcontainers (where applicable)
- Contract testing
- End-to-end testing

### Infrastructure

- Docker Compose
- Bash operational tooling

---

## Monorepo Structure

```text
event-driven-reservation-orchestrator/
├── apps/
│   ├── gateway-api/
│   ├── reservation-service/
│   ├── inventory-service/
│   ├── payment-service/
│   ├── notification-service/
│   ├── audit-service/
│   └── backoffice-web/
│
├── packages/
│   ├── contracts/
│   ├── event-bus/
│   ├── logger/
│   ├── database/
│   ├── config/
│   ├── errors/
│   └── testing/
│
├── simulators/
│   ├── bots/
│   ├── scenarios/
│   ├── data/
│   └── runner.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── contract/
│   └── e2e/
│
├── infra/
│   ├── docker-compose.yml
│   ├── prometheus/
│   ├── grafana/
│   ├── postgres/
│   └── redpanda/
│
├── scripts/
│   ├── dev-up.sh
│   ├── dev-down.sh
│   ├── test-up.sh
│   ├── test-down.sh
│   ├── db-migrate.sh
│   ├── db-seed.sh
│   ├── reset-local.sh
│   ├── create-topics.sh
│   ├── health-check.sh
│   ├── simulate-demo.sh
│   ├── logs.sh
│   └── chaos-stop-service.sh
│
├── docs/
│   ├── architecture.md
│   ├── event-catalog.md
│   ├── failure-scenarios.md
│   ├── testing-strategy.md
│   └── adr/
│
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Core Services

### Gateway API

Entry point for external booking channels.

Responsibilities:

- request validation
- authentication
- payload normalization
- idempotency headers
- channel abstraction
- forwarding booking commands internally

---

### Reservation Service

Core orchestration service.

Responsibilities:

- reservation lifecycle management
- state transitions
- command handling
- event publishing
- workflow coordination

Example states:

- PENDING
- CONFIRMED
- REJECTED
- CANCELLED
- PAYMENT_REQUIRED
- PAYMENT_FAILED

---

### Inventory Service

Responsible for availability control.

Responsibilities:

- inventory locking
- overlap detection
- overbooking prevention
- reservation conflict handling
- inventory release on compensation flows

---

## Testing Strategy

### Unit Tests

Validate business rules.

Examples:

- date overlap detection
- reservation state transitions
- idempotency logic
- payment decision rules

---

### Integration Tests

Validate infrastructure interactions.

Examples:

- repository persistence
- transactional locking
- event publishing
- outbox persistence

---

### Contract Tests

Validate service integration contracts.

Examples:

- ReservationRequested event schema
- InventoryLocked event schema
- PaymentAuthorized event schema

---

### End-to-End Tests

Validate full workflows.

Examples:

- successful booking flow
- overbooking prevention
- duplicate request handling
- payment compensation
- service recovery

---

## Operational Tooling

This project includes operational scripts for reproducible local environments.

### Start Development Environment

```bash
pnpm dev:up
```

---

### Stop Development Environment

```bash
pnpm dev:down
```

---

### Run Database Migrations

```bash
pnpm db:migrate
```

---

### Seed Demo Data

```bash
pnpm db:seed
```

---

## Running the Project

Install dependencies:

```bash
pnpm install
```

Start infrastructure:

```bash
pnpm dev:up
```

Run migrations:

```bash
pnpm db:migrate
```

Seed data:

```bash
pnpm db:seed
```

---

## Architecture Decisions

Architectural decision records are documented under:

```text
/docs/adr
```

Examples:

- why microservices
- why event-driven communication
- why Redpanda instead of Kafka
- why Fastify over NestJS
- why idempotency-first design
- why outbox/event consistency patterns

---

## Design Philosophy

This project intentionally treats failure as a first-class concern.

Rather than assuming ideal infrastructure, it is designed around realistic operational failure modes:

- duplicate events
- network delays
- partial service outages
- failed downstream consumers
- asynchronous recovery
- concurrent contention

The objective is not merely to "make reservations work".

The objective is to demonstrate how resilient distributed systems are designed.

---

## Portfolio

This project is intentionally built as a portfolio demonstration of:

- backend architecture
- distributed systems thinking
- cloud-native engineering mindset
- operational tooling
- observability practices
- resilient workflow design