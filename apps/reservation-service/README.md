# Reservation Service

`reservation-service` es el microservicio que administra el ciclo inicial de una reserva dentro del orquestador. Su responsabilidad es recibir eventos de negocio relacionados con reservas, persistir el estado de la reserva en PostgreSQL y coordinar el siguiente paso del flujo mediante eventos.

En la practica, este servicio hace cuatro cosas principales: escucha `ReservationRequested` desde Kafka, crea la reserva con control de idempotencia, genera el evento `InventoryLockRequested` en outbox dentro de la misma transaccion, y luego reacciona a `InventoryLocked` o `InventoryRejected` para actualizar el estado de la reserva. No confirma pagos ni bloquea inventario por si mismo: solo orquesta el estado de la reserva y deja trazabilidad consistente.

## Responsabilidad funcional

Flujo principal:

1. Llega `ReservationRequested`.
2. El servicio lo traduce a `RequestReservationCommand`.
3. Crea la reserva en `reservations` con estado inicial `PENDING`.
4. En la misma transaccion crea un `outbox_event` de tipo `InventoryLockRequested`.
5. Publica ese outbox a Kafka.
6. Si llega `InventoryLocked`, mueve la reserva a `INVENTORY_LOCKED`.
7. Si llega `InventoryRejected`, mueve la reserva a `REJECTED` y guarda `rejectionReason`.

## Arquitectura

El servicio sigue una arquitectura por capas ligera, con separacion entre:

- `domain`: reglas y comportamiento del agregado `Reservation`.
- `application`: commands, handlers y puertos usados por los casos de uso.
- `interfaces`: adaptadores de entrada. Hoy la entrada real es mensajeria Kafka.
- `infrastructure`: persistencia PostgreSQL/Drizzle y publicacion de eventos.

La idea es simple: Kafka entrega eventos externos, `interfaces/messaging` los traduce a commands internos, `application` ejecuta el caso de uso, `domain` valida reglas, e `infrastructure` persiste y publica.

## Estructura actual

```text
apps/reservation-service/
├─ package.json
├─ README.md
├─ tsconfig.json
└─ src/
   ├─ config.ts
   ├─ main.ts
   ├─ application/
   │  ├─ commands/
   │  │  ├─ confirm-reservation.command.ts
   │  │  ├─ reject-reservation.command.ts
   │  │  └─ request-reservation.command.ts
   │  ├─ handlers/
   │  │  ├─ confirm-reservation.handler.ts
   │  │  ├─ reject-reservation.handler.ts
   │  │  └─ request-reservation.handler.ts
   │  └─ ports/
   │     ├─ event-publisher.ts
   │     └─ reservation.repository.ts
   ├─ domain/
   │  ├─ mappers/
   │  │  └─ reservation.mapper.ts
   │  ├─ reservation.entity.ts
   │  ├─ reservation.errors.ts
   │  ├─ reservation-rules.ts
   │  └─ reservation-status.ts
   ├─ infrastructure/
   │  ├─ db/
   │  │  └─ drizzle-reservation.repository.ts
   │  └─ publishers/
   │     └─ kafka-event.publisher.ts
   └─ interfaces/
      └─ messaging/
         ├─ reservation-events.consumer.ts
         └─ reservation-message-router.ts
```

## Archivos principales

### `src/main.ts`

Es el punto de arranque del servicio.

- Carga configuracion.
- Loguea los datos basicos del proceso.
- Inicia los consumers de Kafka.
- Si el bootstrap falla, corta el proceso.

No contiene logica de negocio. Solo hace bootstrap.

### `src/config.ts`

Centraliza la configuracion del microservicio.

- `DATABASE_URL`
- `KAFKA_BROKER`
- `KAFKA_CLIENT_ID`
- `KAFKA_GROUP_ID`
- `OUTBOX_BATCH_SIZE`

Tambien valida enteros positivos y asegura que no falten valores requeridos.

## Capa `interfaces`

### `src/interfaces/messaging/reservation-events.consumer.ts`

Es la puerta de entrada del servicio desde Kafka.

- Crea el `KafkaEventBus`.
- Instancia repository, publisher y handlers.
- Hace `flush` de eventos pendientes del outbox al iniciar.
- Se subscribe a:
  - `ReservationRequested`
  - `InventoryLocked`
  - `InventoryRejected`
- Traduce cada evento a un command interno antes de invocar application.

En otras palabras: recibe mensajes externos y los enruta al caso de uso correcto.

### `src/interfaces/messaging/reservation-message-router.ts`

Hace el mapeo entre eventos externos y commands internos.

- `ReservationRequested` -> `RequestReservationCommand`
- `InventoryLocked` -> `ConfirmReservationCommand`
- `InventoryRejected` -> `RejectReservationCommand`

Esta separacion evita que la capa de aplicacion dependa directamente del formato del evento Kafka.

## Capa `application`

### `src/application/commands/*`

Representan la intencion interna del servicio.

- `request-reservation.command.ts`: datos necesarios para crear una reserva.
- `confirm-reservation.command.ts`: datos para marcar una reserva como `INVENTORY_LOCKED`.
- `reject-reservation.command.ts`: datos para rechazar una reserva con motivo.

Un command no es un evento externo. Es la forma interna y estable en la que la aplicacion expresa un caso de uso.

### `src/application/handlers/*`

Ejecutan los casos de uso.

- `request-reservation.handler.ts`
  - llama al repository para crear la reserva
  - si hay outbox pendiente, pide publicarlo
- `confirm-reservation.handler.ts`
  - confirma el lock de inventario en la reserva
- `reject-reservation.handler.ts`
  - rechaza la reserva y guarda la razon

Los handlers coordinan. No conocen SQL ni Kafka.

### `src/application/ports/reservation.repository.ts`

Define el contrato de persistencia que necesita la aplicacion.

Expone las operaciones principales del servicio:

- crear reserva desde `RequestReservationCommand`
- confirmar reserva
- rechazar reserva

La aplicacion depende de este contrato, no de Drizzle ni de PostgreSQL directamente.

### `src/application/ports/event-publisher.ts`

Define el contrato para publicar eventos de salida.

- publicar un `InventoryLockRequested` pendiente
- reprocesar pendientes al iniciar

Esto desacopla la aplicacion del mecanismo concreto de publicacion.

## Capa `domain`

### `src/domain/reservation-status.ts`

Define los estados validos de una reserva:

- `PENDING`
- `INVENTORY_LOCKED`
- `PAYMENT_REQUIRED`
- `CONFIRMED`
- `REJECTED`
- `CANCELLED`

Tambien define que estados son terminales.

### `src/domain/reservation-rules.ts`

Contiene reglas puras del dominio.

- valida rango de fechas
- valida transiciones de estado permitidas

Esto evita que las reglas de negocio queden escondidas dentro del repository o de un `if` suelto.

### `src/domain/reservation.errors.ts`

Define errores propios del dominio, por ejemplo:

- rango de fechas invalido
- transicion de estado invalida
- intento de modificar una reserva ya finalizada

### `src/domain/reservation.entity.ts`

Es la entidad principal del servicio.

Modela una reserva con comportamiento, no solo con datos:

- `request()`
- `confirmInventoryLock()`
- `markPaymentRequired()`
- `confirm()`
- `reject()`
- `cancel()`

Cada cambio de estado pasa por las reglas del dominio.

### `src/domain/mappers/reservation.mapper.ts`

Convierte el modelo persistido en base de datos a la entidad de dominio `Reservation`.

Se usa para reconstruir la reserva antes de aplicar reglas de negocio sobre un registro ya guardado.

## Capa `infrastructure`

### `src/infrastructure/db/drizzle-reservation.repository.ts`

Es la implementacion real del puerto `ReservationRepository`.

Responsabilidades principales:

- buscar referencias normalizadas en base (`channels`, `currencies`, `reservation_statuses`)
- crear reservas en PostgreSQL
- aplicar idempotencia por `channelId + idempotencyKey`
- crear el outbox `InventoryLockRequested` dentro de la misma transaccion
- reconstruir entidades desde base con `ReservationMapper`
- aplicar transiciones `INVENTORY_LOCKED` y `REJECTED`
- proteger actualizaciones con control simple de concurrencia por estado previo

Es la pieza que conecta el dominio con el modelo SQL real del monorepo.

### `src/infrastructure/publishers/kafka-event.publisher.ts`

Es la implementacion real del puerto `EventPublisher`.

- lee `outbox_events`
- publica eventos `InventoryLockRequested` a Kafka
- marca estados del outbox como `PROCESSING`, `PUBLISHED` o `FAILED`
- incrementa `retryCount` si falla la publicacion

Esto implementa el patron outbox para no perder eventos si hay fallas entre la escritura en base y la publicacion.

## Relacion con la base de datos

Este servicio trabaja principalmente sobre estas tablas del esquema compartido:

- `reservations`
- `reservation_statuses`
- `channels`
- `currencies`
- `outbox_events`

Puntos importantes:

- La reserva nace en `PENDING`.
- La idempotencia evita duplicados con `channelId + idempotencyKey`.
- `InventoryLocked` no confirma la reserva final: la mueve a `INVENTORY_LOCKED`.
- `InventoryRejected` la mueve a `REJECTED` y guarda `rejectionReason`.

## Eventos que consume y publica

Consume:

- `ReservationRequested`
- `InventoryLocked`
- `InventoryRejected`

Publica:

- `InventoryLockRequested`

## Scripts

En `package.json`:

- `pnpm --filter reservation-service dev`
  - ejecuta el servicio con `tsx`
- `pnpm --filter reservation-service typecheck`
  - valida tipos TypeScript sin emitir build

## Resumen tecnico corto

`reservation-service` es el servicio que convierte una solicitud de reserva en una reserva persistida y trazable. Su trabajo no es resolver todo el negocio de reservas, sino administrar el estado inicial de la reserva, garantizar idempotencia, dejar el evento de salida en outbox y reaccionar correctamente a la respuesta del inventario.
