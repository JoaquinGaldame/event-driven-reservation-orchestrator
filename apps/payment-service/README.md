# Payment Service

`payment-service` es el microservicio que administra la ejecucion inicial de cobros dentro del orquestador. Su responsabilidad actual es escuchar solicitudes de pago, persistir el pago en PostgreSQL, registrar los intentos tecnicos contra un gateway y publicar el resultado correspondiente sin mezclar esa decision con la logica de reservas.

En la practica, este servicio hoy hace cuatro cosas principales: escucha `PaymentRequested` desde Kafka, traduce el evento a un command interno, crea o reutiliza un `payment` con estado controlado e idempotencia por `reservationId`, registra `payment_attempts` por cada intento tecnico y deja en outbox el resultado para publicar `PaymentCaptured` o `PaymentFailed`. Todavia no integra un PSP real ni procesa webhooks: hoy usa `MockPaymentGateway` detras del puerto `PaymentGateway`.

## Responsabilidad funcional

Flujo principal actual:

1. Llega `PaymentRequested`.
2. El servicio lo traduce a `ProcessPaymentCommand`.
3. Busca si ya existe un `payment` para la `reservationId`.
4. Si no existe, crea el `payment` en estado `PENDING` dentro de una transaccion.
5. En esa misma transaccion crea un `payment_attempt` inicial.
6. El handler llama al `PaymentGateway` configurado.
7. El repository registra el resultado del gateway en la misma transaccion: actualiza `payments`, completa `payment_attempts` y crea el `outbox_event` si el resultado es final.
8. Si el resultado es `APPROVED`, publica `PaymentCaptured`.
9. Si el resultado es `REJECTED`, publica `PaymentFailed`.
10. Si el resultado es `PENDING`, no publica evento final y deja trazabilidad tecnica para una etapa posterior de webhook.

## Arquitectura

El servicio sigue una arquitectura por capas ligera, con separacion entre:

- `domain`: reglas y comportamiento del agregado `Payment` y del modelo `PaymentAttempt`.
- `application`: commands, handlers y puertos usados por el caso de uso principal.
- `interfaces`: adaptadores de entrada. Hoy la entrada real es mensajeria Kafka.
- `infrastructure`: persistencia PostgreSQL/Drizzle, publicacion de eventos y provider mock.

La idea es simple: Kafka entrega eventos externos, `interfaces/messaging` los traduce a commands internos, `application` coordina el caso de uso, `domain` contiene estados y reglas, e `infrastructure` persiste y publica.

## Estructura actual

```text
apps/payment-service/
├── package.json
├── README.md
├── tsconfig.json
└── src/
   ├── config.ts
   ├── main.ts
   ├── application/
   │  ├── commands/
   │  │  └── process-payment.command.ts
   │  ├── handlers/
   │  │  └── process-payment.handler.ts
   │  └── ports/
   │     ├── event-publisher.ts
   │     ├── payment-attempt.repository.ts
   │     ├── payment-gateway.ts
   │     └── payment.repository.ts
   ├── domain/
   │  ├── payment-attempt.entity.ts
   │  ├── payment.entity.ts
   │  ├── payment.errors.ts
   │  ├── payment-rules.ts
   │  └── payment-status.ts
   ├── infrastructure/
   │  ├── db/
   │  │  ├── drizzle-payment-attempt.repository.ts
   │  │  └── drizzle-payment.repository.ts
   │  ├── providers/
   │  │  └── mock-payment.gateway.ts
   │  └── publishers/
   │     └── kafka-event.publisher.ts
   └── interfaces/
      └── messaging/
         ├── payment-events.consumer.ts
         └── payment-message-router.ts
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

### `src/interfaces/messaging/payment-events.consumer.ts`

Es la puerta de entrada del servicio desde Kafka.

- crea el `KafkaEventBus`
- instancia repository, gateway y publisher
- hace `flush` de eventos pendientes del outbox al iniciar
- se subscribe a `PaymentRequested`
- traduce el evento a un command interno antes de invocar application

Hoy instancia `MockPaymentGateway`, por lo que la arquitectura ya es provider-driven aunque el provider real todavia no este integrado.

### `src/interfaces/messaging/payment-message-router.ts`

Hace el mapeo entre el evento externo y el command interno.

- `PaymentRequested` -> `ProcessPaymentCommand`

Esta separacion evita que la capa de aplicacion dependa directamente del formato del evento Kafka.

## Capa `application`

### `src/application/commands/process-payment.command.ts`

Representa la intencion interna del servicio.

Contiene los datos minimos que necesita el caso de uso para procesar un pago:

- `reservationId`
- `guestId`
- `currencyCode`
- `amount`
- `correlationId`
- `causationId`

Un command no es un evento externo. Es la forma interna y estable en la que la aplicacion expresa un caso de uso.

### `src/application/handlers/process-payment.handler.ts`

Ejecuta el caso de uso principal del servicio.

- crea o recupera el `payment` pendiente desde el repository
- verifica si corresponde o no llamar al gateway
- invoca `paymentGateway.createPayment(...)`
- registra el resultado contra `payments` y `payment_attempts`
- si hay outbox pendiente, pide publicarlo

El handler coordina. No conoce SQL ni Kafka.

### `src/application/ports/payment.repository.ts`

Define el contrato de persistencia principal que necesita la aplicacion.

Expone las operaciones centrales del flujo actual:

- `createPendingPayment(...)`
- `registerGatewayResult(...)`

La aplicacion depende de este contrato, no de Drizzle ni de PostgreSQL directamente.

### `src/application/ports/payment-attempt.repository.ts`

Define el contrato para persistir intentos tecnicos del pago.

Expone:

- `getNextAttemptNumber(...)`
- `createPendingAttempt(...)`
- `completeAttempt(...)`

Hoy estos metodos trabajan con `tx` explicito para que `payments`, `payment_attempts` y `outbox_events` queden dentro de la misma transaccion.

### `src/application/ports/payment-gateway.ts`

Define el puerto estable del proveedor de pago.

Hoy el contrato soporta:

- `createPayment(...)`

Y normaliza la respuesta a:

- `APPROVED`
- `REJECTED`
- `PENDING`

Ese puerto es el que permite reemplazar el mock por un PSP real mas adelante sin mover el flujo interno.

### `src/application/ports/event-publisher.ts`

Define el contrato para publicar eventos de salida.

- publicar un resultado pendiente de pago
- reprocesar pendientes al iniciar

Esto desacopla la aplicacion del mecanismo concreto de publicacion.

## Capa `domain`

### `src/domain/payment-status.ts`

Define los estados validos del pago:

- `PENDING`
- `AUTHORIZED`
- `CONFIRMED`
- `FAILED`
- `CANCELLED`
- `REFUNDED`
- `PARTIALLY_REFUNDED`
- `EXPIRED`

Tambien define que estados son terminales.

### `src/domain/payment-rules.ts`

Contiene reglas puras del dominio.

- valida asociacion minima con reserva
- valida transiciones de estado permitidas
- bloquea mutaciones sobre pagos ya finalizados

Esto evita que las reglas de negocio queden escondidas dentro del repository.

### `src/domain/payment.errors.ts`

Define errores propios del dominio, por ejemplo:

- reserva no asociada
- transicion de estado invalida
- intento de modificar un pago ya finalizado

### `src/domain/payment.entity.ts`

Es la entidad principal del servicio.

Modela un pago con comportamiento:

- `request()`
- `authorize()`
- `confirm()`
- `fail()`
- `cancel()`
- `expire()`
- `refunded()`
- `partiallyRefunded()`

Aunque el flujo actual no usa todo ese comportamiento, el dominio ya esta preparado para una evolucion hacia PSP real y webhooks.

### `src/domain/payment-attempt.entity.ts`

Modela un intento tecnico de cobro.

Representa:

- el numero de intento
- el proveedor
- request y response tecnicos
- estado tecnico
- errores tecnicos
- `correlationId`

Es la base para trazabilidad, soporte y futuros reintentos.

## Capa `infrastructure`

### `src/infrastructure/db/drizzle-payment.repository.ts`

Es la implementacion real del puerto `PaymentRepository`.

Responsabilidades principales:

- buscar pagos por `reservationId`
- crear pagos en estado `PENDING`
- respetar idempotencia funcional simple por reserva
- registrar el resultado del gateway
- actualizar `providerPaymentId`, `providerReference` y `externalReceiptNumber`
- completar `payment_attempts`
- crear `PaymentCaptured` o `PaymentFailed` en `outbox_events`
- ejecutar el flujo principal dentro de transacciones
- no crear nuevos attempts si el pago ya esta en estado terminal

Es la pieza que conecta el dominio con el modelo SQL real del monorepo.

### `src/infrastructure/db/drizzle-payment-attempt.repository.ts`

Es la implementacion real del puerto `PaymentAttemptRepository`.

Responsabilidades principales:

- calcular el siguiente `attemptNumber`
- crear intentos pendientes dentro de la misma transaccion del pago
- completar intentos con response tecnico y estado final
- detectar colision por `(paymentId, attemptNumber)` y reintentar una vez

Esta pieza se agrego para que la trazabilidad tecnica no dependa solo de la tabla `payments`.

### `src/infrastructure/providers/mock-payment.gateway.ts`

Es la implementacion actual del puerto `PaymentGateway`.

Su rol es mantener viva la saga sin acoplar el resultado al repository.

Comportamiento actual:

- si `customerReference === "999999"` responde `REJECTED`
- en cualquier otro caso responde `APPROVED`

Este comportamiento es deliberadamente temporal y existe como provider mock, no como logica de persistencia.

### `src/infrastructure/publishers/kafka-event.publisher.ts`

Es la implementacion real del puerto `EventPublisher`.

- lee `outbox_events`
- publica `PaymentCaptured` y `PaymentFailed` a Kafka
- marca estados del outbox como `PROCESSING`, `PUBLISHED` o `FAILED`
- incrementa `retryCount` si falla la publicacion

Esto implementa el patron outbox para no perder eventos si hay fallas entre escritura y publicacion.

## Relacion con la base de datos

Este servicio trabaja principalmente sobre estas tablas del esquema compartido:

- `payments`
- `payment_attempts`
- `payments_statuses`
- `payments_attempts_statuses`
- `currencies`
- `outbox_events`

Puntos importantes:

- el pago nace en `PENDING`
- cada intento tecnico deja huella en `payment_attempts`
- el flujo principal persiste `payments`, `payment_attempts` y `outbox_events` dentro de transacciones
- la base ahora protege unicidad de `(payment_id, attempt_number)` para evitar colisiones de concurrencia
- `PaymentCaptured` y `PaymentFailed` salen desde outbox, no directamente desde el handler

## Eventos que consume y publica

Consume:

- `PaymentRequested`

Publica:

- `PaymentCaptured`
- `PaymentFailed`

## Estado actual del refactor

El servicio ya completo la base de las etapas iniciales del refactor:

- se separo la decision del resultado del repository hacia `PaymentGateway`
- `payment_attempts` ya se usa en el flujo real
- el path legacy `processPayment(...)` y la simulacion embebida en repository fueron removidos
- el flujo de `payments`, `payment_attempts` y `outbox_events` ya es transaccional

Todavia falta para la arquitectura final:

- `PaymentProvider` formal en dominio
- resolver de proveedor por negocio
- servidor HTTP propio para webhooks
- parser de webhooks por provider
- integracion con PSP real
- refunds y cancelaciones sobre gateway real

## Scripts

En `package.json`:

- `pnpm --filter @reservation/payment-service dev`
  - ejecuta el servicio con `tsx`
- `pnpm --filter @reservation/payment-service typecheck`
  - valida tipos TypeScript sin emitir build

## Estructura final esperada

Esta se conserva como referencia de la estructura final que queres alcanzar. No representa necesariamente el estado actual implementado.

```text
apps/payment-service/src/
├── config.ts
├── main.ts
├── application/
│  ├── commands/
│  │  ├── process-payment.command.ts
│  │  ├── handle-payment-webhook.command.ts
│  │  ├── refund-payment.command.ts
│  │  └── cancel-payment.command.ts
│  ├── dto/
│  │  ├── create-payment-request.dto.ts
│  │  ├── payment-gateway-result.dto.ts
│  │  └── parsed-payment-webhook.dto.ts
│  ├── handlers/
│  │  ├── process-payment.handler.ts
│  │  ├── payment-webhook.handler.ts
│  │  ├── refund-payment.handler.ts
│  │  └── cancel-payment.handler.ts
│  ├── ports/
│  │  ├── payment.repository.ts
│  │  ├── payment-attempt.repository.ts
│  │  ├── event-publisher.ts
│  │  ├── payment-gateway.ts
│  │  ├── payment-webhook-parser.ts
│  │  └── payment-provider-resolver.ts
│  └── services/
│     └── payment-provider-resolution.service.ts
├── domain/
│  ├── payment-status.ts
│  ├── payment-provider.ts
│  ├── payment-method-type.ts
│  ├── payment.entity.ts
│  ├── payment-attempt.entity.ts
│  ├── payment.errors.ts
│  └── payment-rules.ts
├── infrastructure/
│  ├── db/
│  │  ├── drizzle-payment.repository.ts
│  │  └── drizzle-payment-attempt.repository.ts
│  ├── publishers/
│  │  └── kafka-event.publisher.ts
│  ├── providers/
│  │  ├── stripe/
│  │  │  ├── stripe-payment.gateway.ts
│  │  │  ├── stripe-webhook.parser.ts
│  │  │  ├── stripe.mapper.ts
│  │  │  ├── stripe.client.ts
│  │  │  └── stripe.types.ts
│  │  ├── mercado-pago/
│  │  │  ├── mercadopago-payment.gateway.ts
│  │  │  ├── mercadopago-webhook.parser.ts
│  │  │  ├── mercadopago.mapper.ts
│  │  │  ├── mercadopago.client.ts
│  │  │  └── mercadopago.types.ts
│  │  ├── modo/
│  │  │  ├── modo-payment.gateway.ts
│  │  │  ├── modo-webhook.parser.ts
│  │  │  ├── modo.mapper.ts
│  │  │  ├── modo.client.ts
│  │  │  └── modo.types.ts
│  │  └── direct-company/
│  │     ├── direct-company-payment.gateway.ts
│  │     ├── direct-company-webhook.parser.ts
│  │     ├── direct-company.mapper.ts
│  │     ├── direct-company.client.ts
│  │     └── direct-company.types.ts
│  └── resolvers/
│     └── payment-provider-resolver.impl.ts
├── interfaces/
│  ├── messaging/
│  │  ├── payment-events.consumer.ts
│  │  └── payment-message-router.ts
│  └── http/
│     ├── server.ts
│     ├── routes.ts
│     └── controllers/
│        ├── stripe-webhooks.controller.ts
│        ├── mercadopago-webhooks.controller.ts
│        ├── modo-webhooks.controller.ts
│        └── direct-company-webhooks.controller.ts
└── shared/
   ├── types/
   ├── utils/
   └── constants/
```

## Resumen tecnico corto

`payment-service` hoy convierte una solicitud de cobro en un pago persistido, trazable y desacoplado del proveedor. Su trabajo actual no es integrar un PSP real end-to-end, sino administrar el estado base del pago, registrar intentos tecnicos, garantizar transaccionalidad entre `payments`, `payment_attempts` y `outbox_events`, y publicar correctamente `PaymentCaptured` o `PaymentFailed`.
