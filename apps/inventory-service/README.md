# Inventory Service

`inventory-service` es el microservicio que administra el bloqueo operativo de disponibilidad dentro del orquestador. Su responsabilidad es recibir solicitudes de lock de inventario, decidir si una unidad puede bloquearse para una reserva y emitir la respuesta correspondiente sin mezclar esa decision con la logica de reservas.

En la practica, este servicio hace cuatro cosas principales: escucha `InventoryLockRequested` desde Kafka, traduce el evento a un command interno, verifica idempotencia y solapamientos reales sobre `inventory_locks`, y deja en outbox el resultado para publicar `InventoryLocked` o `InventoryRejected`. No crea reservas ni confirma pagos: solo decide disponibilidad y registra el lock de inventario cuando corresponde.

## Responsabilidad funcional

Flujo principal:

1. Llega `InventoryLockRequested`.
2. El servicio lo traduce a `LockInventoryCommand`.
3. Verifica si ya existe un lock previo para esa `reservationId`.
4. Si no existe, busca overlap activo en `inventory_locks` para la misma `unitId` y rango de fechas.
5. Si no hay overlap, crea el lock en `inventory_locks` con estado `ACTIVE`.
6. En la misma transaccion crea un `outbox_event` de tipo `InventoryLocked`.
7. Si hay overlap, no crea lock y genera en la misma transaccion un `outbox_event` de tipo `InventoryRejected`.
8. Publica el evento pendiente desde outbox a Kafka.

## Arquitectura

El servicio sigue una arquitectura por capas ligera, con separacion entre:

- `domain`: reglas y comportamiento del agregado `InventoryLock`.
- `application`: commands, handlers y puertos usados por el caso de uso.
- `interfaces`: adaptadores de entrada. Hoy la entrada real es mensajeria Kafka.
- `infrastructure`: persistencia PostgreSQL/Drizzle y publicacion de eventos.

La idea es simple: Kafka entrega eventos externos, `interfaces/messaging` los traduce a commands internos, `application` ejecuta el caso de uso, `domain` valida reglas, e `infrastructure` persiste y publica.

## Estructura actual

```text
apps/inventory-service/
├─ package.json
├─ README.md
├─ tsconfig.json
└─ src/
   ├─ config.ts
   ├─ main.ts
   ├─ application/
   │  ├─ commands/
   │  │  └─ lock-inventory.command.ts
   │  ├─ handlers/
   │  │  └─ lock-inventory.handler.ts
   │  └─ ports/
   │     ├─ event-publisher.ts
   │     └─ inventory-lock.repository.ts
   ├─ domain/
   │  ├─ mappers/
   │  │  └─ inventory-lock.mapper.ts
   │  ├─ inventory-lock.entity.ts
   │  ├─ inventory-lock-rules.ts
   │  ├─ inventory-lock-status.ts
   │  └─ inventory.errors.ts
   ├─ infrastructure/
   │  ├─ db/
   │  │  └─ drizzle-inventory-lock.repository.ts
   │  └─ publishers/
   │     └─ kafka-event.publisher.ts
   └─ interfaces/
      ├─ http/
      └─ messaging/
         ├─ inventory-events.consumer.ts
         └─ inventory-message-router.ts
```

## Archivos principales

### `src/main.ts`

Es el punto de arranque del servicio.

- carga configuracion
- loguea datos basicos del proceso
- inicia los consumers de Kafka
- si el bootstrap falla, corta el proceso

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

### `src/interfaces/messaging/inventory-events.consumer.ts`

Es la puerta de entrada del servicio desde Kafka.

- crea el `KafkaEventBus`
- instancia repository, publisher y handler
- hace `flush` de eventos pendientes del outbox al iniciar
- se subscribe a `InventoryLockRequested`
- traduce el evento a un command interno antes de invocar application

En otras palabras: recibe mensajes externos y los enruta al caso de uso correcto.

### `src/interfaces/messaging/inventory-message-router.ts`

Hace el mapeo entre el evento externo y el command interno.

- `InventoryLockRequested` -> `LockInventoryCommand`

Esta separacion evita que la capa de aplicacion dependa directamente del formato del evento Kafka.

### `src/interfaces/http/`

Hoy no tiene implementacion activa. Queda reservada para una futura interfaz HTTP si el servicio necesitara exponer endpoints operativos o administrativos.

## Capa `application`

### `src/application/commands/lock-inventory.command.ts`

Representa la intencion interna del servicio.

Contiene los datos minimos que necesita el caso de uso para intentar bloquear inventario:

- `reservationId`
- `propertyId`
- `unitId`
- `channelCode`
- `checkIn`
- `checkOut`
- `correlationId`
- `causationId`

Un command no es un evento externo. Es la forma interna y estable en la que la aplicacion expresa un caso de uso.

### `src/application/handlers/lock-inventory.handler.ts`

Ejecuta el caso de uso principal del servicio.

- llama al repository para resolver el lock
- si el repository deja un outbox pendiente, pide publicarlo

El handler coordina. No conoce SQL ni Kafka.

### `src/application/ports/inventory-lock.repository.ts`

Define el contrato de persistencia que necesita la aplicacion.

Expone la operacion principal del servicio:

- resolver un intento de lock desde `LockInventoryCommand`

La aplicacion depende de este contrato, no de Drizzle ni de PostgreSQL directamente.

### `src/application/ports/event-publisher.ts`

Define el contrato para publicar eventos de salida.

- publicar un resultado pendiente del flujo de inventario
- reprocesar pendientes al iniciar

Esto desacopla la aplicacion del mecanismo concreto de publicacion.

## Capa `domain`

### `src/domain/inventory-lock-status.ts`

Define los estados validos de un lock:

- `ACTIVE`
- `RELEASED`
- `EXPIRED`
- `CANCELLED`

Tambien define que estados son terminales.

### `src/domain/inventory-lock-rules.ts`

Contiene reglas puras del dominio.

- valida rango de fechas
- valida transiciones de estado permitidas

Esto evita que las reglas de negocio queden escondidas dentro del repository o de un `if` suelto.

### `src/domain/inventory.errors.ts`

Define errores propios del dominio, por ejemplo:

- rango de fechas invalido
- transicion de estado invalida
- intento de modificar un lock ya finalizado

### `src/domain/inventory-lock.entity.ts`

Es la entidad principal del servicio.

Modela un lock con comportamiento, no solo con datos:

- `request()`
- `release()`
- `expire()`
- `cancel()`

Cada cambio de estado pasa por las reglas del dominio.

### `src/domain/mappers/inventory-lock.mapper.ts`

Convierte el modelo persistido en base de datos a la entidad de dominio `InventoryLock`.

Se usa cuando infraestructura necesita reconstruir el agregado desde un registro ya guardado.

## Capa `infrastructure`

### `src/infrastructure/db/drizzle-inventory-lock.repository.ts`

Es la implementacion real del puerto `InventoryLockRepository`.

Responsabilidades principales:

- verificar idempotencia por `reservationId`
- detectar overlap real sobre `inventory_locks`
- resolver referencias normalizadas en base (`inventory_lock_statuses`, `inventory_lock_types`)
- crear el lock solo si la unidad esta disponible
- crear el outbox `InventoryLocked` o `InventoryRejected` dentro de la misma transaccion
- construir el agregado de dominio al crear un nuevo lock

Es la pieza que conecta el dominio con el modelo SQL real del monorepo.

### `src/infrastructure/publishers/kafka-event.publisher.ts`

Es la implementacion real del puerto `EventPublisher`.

- lee `outbox_events`
- publica eventos `InventoryLocked` e `InventoryRejected` a Kafka
- marca estados del outbox como `PROCESSING`, `PUBLISHED` o `FAILED`
- incrementa `retryCount` si falla la publicacion

Esto implementa el patron outbox para no perder eventos si hay fallas entre la escritura en base y la publicacion.

## Relacion con la base de datos

Este servicio trabaja principalmente sobre estas tablas del esquema compartido:

- `inventory_locks`
- `inventory_lock_statuses`
- `inventory_lock_types`
- `outbox_events`

Puntos importantes:

- el lock operativo de una reserva se guarda en `inventory_locks`
- el estado inicial esperado para un lock nuevo es `ACTIVE`
- el tipo usado para este flujo es `RESERVATION`
- la idempotencia se apoya en `reservation_id`
- el overlap se decide por `unitId` y cruce de rango de fechas

## Eventos que consume y publica

Consume:

- `InventoryLockRequested`

Publica:

- `InventoryLocked`
- `InventoryRejected`

## Scripts

En `package.json`:

- `pnpm --filter inventory-service dev`
  - ejecuta el servicio con `tsx`
- `pnpm --filter inventory-service typecheck`
  - valida tipos TypeScript sin emitir build

## Resumen tecnico corto

`inventory-service` es el servicio que convierte una solicitud de lock en una decision de disponibilidad persistida y trazable. Su trabajo no es administrar la reserva completa, sino decidir si una unidad puede bloquearse para un rango de fechas, registrar ese resultado con idempotencia y publicar la respuesta correcta usando outbox.