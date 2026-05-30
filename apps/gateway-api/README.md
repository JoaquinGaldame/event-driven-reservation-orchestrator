# Gateway API

Gateway HTTP del sistema `Event-Driven Reservation Orchestrator`.

Este servicio expone endpoints REST para:

- health check
- autenticacion (`/auth/login`)
- contexto autenticado (`/auth/me`)
- ingreso de reservas por canal (`/channels/:channel/reservations`)

La implementacion actual sigue una base de Clean Architecture + Ports and Adapters:

- `interfaces/http` recibe requests HTTP y traduce errores a respuestas
- `application` contiene commands, handlers, DTOs, puertos y errores de aplicacion
- `infrastructure` implementa adapters concretos como JWT, bcrypt, Kafka y repository de usuario
- `domain` contiene reglas y conceptos del dominio de gateway


## Endpoints actuales

### Health

- `GET /health`

Respuesta esperada:

```json
{
  "status": "ok",
  "service": "gateway-api",
  "timestamp": "2026-05-30T00:00:00.000Z"
}
```

### Auth

- `POST /auth/login`
- `GET /auth/me`

Body de login:

```json
{
  "email": "admin@test.com",
  "password": "Admin123!"
}
```

### Channel Reservations

- `POST /channels/:channel/reservations`

Canales soportados actualmente:

- `airbnb`
- `booking`
- `vrbo`
- `direct`

Body:

```json
{
  "propertyId": "1",
  "unitId": "101",
  "guestId": "guest-1",
  "currencyCode": "USD",
  "checkIn": "2026-06-10",
  "checkOut": "2026-06-12",
  "idempotencyKey": "req-123"
}
```

## Scripts

- `pnpm --filter @reservation/gateway-api dev`
- `pnpm --filter @reservation/gateway-api typecheck`

## Estructura actual en src

```text
apps/gateway-api/
└─ src/
   ├─ main.ts
   ├─ config.ts
   ├─ domain/
   │  ├─ channel-code.ts
   │  ├─ gateway.errors.ts
   │  ├─ reservation-request-rules.ts
   │  ├─ user-role.ts
   │  └─ auth.errors.ts
   ├─ application/
   │  ├─ commands/
   │  │  ├─ submit-reservation.command.ts
   │  │  └─ login-user.command.ts
   │  ├─ handlers/
   │  │  ├─ submit-reservation.handler.ts
   │  │  └─ login-user.handler.ts
   │  ├─ ports/
   │  │  ├─ reservation-event.publisher.ts
   │  │  ├─ idempotency.repository.ts
   │  │  ├─ reference-data.repository.ts
   │  │  ├─ user.repository.ts
   │  │  ├─ token.service.ts
   │  │  ├─ password-hasher.ts
   │  │  └─ clock.ts
   │  ├─ dto/
   │  │  ├─ submit-reservation-result.dto.ts
   │  │  └─ login-result.dto.ts
   │  └─ errors/
   │     └─ application.error.ts
   ├─ interfaces/
   │  └─ http/
   │     ├─ server.ts
   │     ├─ routes.ts
   │     ├─ controllers/
   │     │  ├─ auth.controller.ts
   │     │  ├─ me.controller.ts
   │     │  ├─ channel-reservations.controller.ts
   │     │  └─ health.controller.ts
   │     ├─ schemas/
   │     │  ├─ login.schema.ts
   │     │  └─ channel-reservation.schema.ts
   │     └─ middleware/
   │        ├─ auth.middleware.ts
   │        ├─ require-role.middleware.ts
   │        └─ error-handler.ts
   ├─ infrastructure/
   │  ├─ db/
   │  │  └─ drizzle-user.repository.ts
   │  ├─ publishers/
   │  │  └─ kafka-reservation-event.publisher.ts
   │  └─ security/
   │     ├─ jwt-token.service.ts
   │     └─ bcrypt-password-hasher.ts
   └─ shared/
      └─ types/
         └─ actor-context.ts
```

## Estructura final objetivo

Esta se conserva como referencia de la estructura final que queres alcanzar. No representa necesariamente el estado actual implementado.

```text
apps/gateway-api/
├─ src/
│  ├─ main.ts
│  ├─ config.ts
│
│  ├─ domain/
│  │  ├─ channel-code.ts
│  │  ├─ gateway.errors.ts
│  │  ├─ reservation-request-rules.ts
│  │  ├─ user-role.ts
│  │  └─ auth.errors.ts
│
│  ├─ application/
│  │  ├─ commands/
│  │  │  ├─ submit-reservation.command.ts
│  │  │  └─ login-user.command.ts
│  │  ├─ handlers/
│  │  │  ├─ submit-reservation.handler.ts
│  │  │  └─ login-user.handler.ts
│  │  ├─ ports/
│  │  │  ├─ reservation-event-publisher.ts
│  │  │  ├─ idempotency.repository.ts
│  │  │  ├─ reference-data.repository.ts
│  │  │  ├─ user.repository.ts
│  │  │  ├─ token.service.ts
│  │  │  ├─ password-hasher.ts
│  │  │  └─ clock.ts
│  │  └─ dto/
│  │     ├─ submit-reservation-result.dto.ts
│  │     └─ login-result.dto.ts
│  │
│  ├─ interfaces/
│  │  ├─ http/
│  │  │  ├─ server.ts
│  │  │  ├─ routes.ts
│  │  │  ├─ controllers/
│  │  │  │  ├─ auth.controller.ts
│  │  │  │  ├─ me.controller.ts
│  │  │  │  ├─ channel-reservations.controller.ts
│  │  │  │  ├─ backoffice-reservations.controller.ts
│  │  │  │  ├─ availability.controller.ts
│  │  │  │  └─ health.controller.ts
│  │  │  ├─ schemas/
│  │  │  │  ├─ login.schema.ts
│  │  │  │  ├─ channel-reservation.schema.ts
│  │  │  │  └─ backoffice-reservation.schema.ts
│  │  │  └─ middleware/
│  │  │     ├─ auth.middleware.ts
│  │  │     ├─ require-role.middleware.ts
│  │  │     ├─ channel-auth.middleware.ts
│  │  │     ├─ request-id.middleware.ts
│  │  │     └─ error-handler.ts
│  │  └─ mappers/
│  │
│  ├─ infrastructure/
│  │  ├─ db/
│  │  │  ├─ drizzle-user.repository.ts
│  │  │  ├─ drizzle-idempotency.repository.ts
│  │  │  └─ drizzle-reference-data.repository.ts
│  │  ├─ publishers/
│  │  │  └─ kafka-reservation-event.publisher.ts
│  │  ├─ security/
│  │  │  ├─ jwt-token.service.ts
│  │  │  └─ bcrypt-password-hasher.ts
│  │  ├─ time/
│  │  │  └─ system-clock.ts
│  │  └─ observability/
│  │     └─ gateway-logger.ts
│  │
│  └─ shared/
│     ├─ types/
│     │  └─ actor-context.ts
│     └─ utils/
│        └─ create-correlation-id.ts
```
