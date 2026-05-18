# Wompi — pendientes a coordinar con backend

Contexto: el frontend de la app `cuenta` ya tiene el flujo completo del Web Checkout de Wompi (paso 3 del wizard de suscripciones + página `/suscripciones/pago/resultado` con polling). Tras la conversación con el jefe, el endpoint pesado `POST /contenedor/suscripcion/{id}/iniciar-pago/` se eliminó: ahora el **frontend manda los IDs del intento al endpoint de integridad y el backend devuelve `{ hash, referencia }`**. El backend es el único que conoce el `integrity_secret` y el único que arma la referencia (incluyendo el sufijo único). El frontend solo arma el `customer_data` (desde el `BillingProfile`) y el `redirect_url` (con `window.location.origin`). El **webhook ya existente** queda como única fuente de verdad: a partir de la referencia identifica el movimiento, lo registra y activa la suscripción.

## 1. Endpoints backend

### `POST /contenedor/suscripcion/integridad/` — NUEVO

Recibe los IDs del intento de pago + monto, y devuelve **tanto el hash como la referencia ya armada** (con el sufijo único que el backend decida internamente). El backend es ahora el único responsable de construir la referencia.

**Request:**

```json
{
  "suscripcion_id": 10,
  "suscripcion_tipo_id": 2,
  "periodo": "A",
  "contacto_id": 1,
  "monto_cents": 3990000,
  "moneda": "COP"
}
```

**Response:**

```json
{
  "hash": "<sha256 de referencia + monto_cents + moneda + integrity_secret>",
  "referencia": "10-2-A-1-1747500000000"
}
```

El frontend usa la `referencia` recibida tal cual (sessionStorage, `redirect_url`, y el parámetro `reference` del checkout de Wompi). El resto (`customer_data`, `redirect_url`, `public_key`) lo construye el frontend con datos que ya tiene (`selectedPlan`, `BillingProfile`, `window.location.origin`, `environment.wompiPublicKey`).

### `GET /contenedor/suscripcion/pago/{referencia}/` — NUEVO o validar si existe

Usado por la página `/suscripciones/pago/resultado` para hacer polling cada 2s hasta tener un estado final (timeout 30s).

**Response:**

```json
{
  "estado": "pending" | "approved" | "declined" | "voided" | "error",
  "transaction_id": "tr_xyz",          // opcional
  "referencia": "10-2-A-1",
  "suscripcion_id": 42,                // opcional
  "mensaje": "Texto opcional para mostrar al usuario"
}
```

### `POST /contenedor/evento-pago/webhook-wompi/` — YA EXISTE (confirmar)

Es la fuente de verdad de la activación. Verificar con backend que:

- [ ] Valida la firma del evento (`events.signature.checksum` con el `events_secret` de Wompi).
- [ ] **Parsea la referencia** (`{suscripcion_id}-{tipo_id}-{periodo}-{contacto_id}[-sufijo]`) para identificar qué activar.
- [ ] Si `transaction.status === 'APPROVED'`: crea el `SuscripcionMovimiento` en `approved` y activa la suscripción con el `tipo_id`/`periodo` indicados.
- [ ] Si `auto_renovacion === true && metodo_pago === 'tarjeta'`: guarda el `payment_source_id` que Wompi devuelve, para los cobros recurrentes.
- [ ] Si `DECLINED` / `ERROR`: registra el movimiento con ese estado.
- [ ] Es idempotente (Wompi puede reenviar el mismo evento varias veces).

## 2. Formato de la referencia

El backend la decide internamente y la devuelve en el response del endpoint de integridad. El frontend la usa tal cual (sessionStorage, `redirect_url`, `reference` del checkout). Debe ser **única por intento** porque Wompi rechaza referencias duplicadas — si un usuario reintenta tras un rechazo, el backend tiene que devolver una referencia distinta (típicamente con un sufijo `-{epoch_ms}`, `-{nro_intento}` o similar).

## 3. Llave pública de producción

`apps/cuenta/src/environments/environment.prod.ts` tiene `wompiPublicKey: ''`. Hay que pegarle la `pub_prod_*` antes de deploy productivo. Cuando exista, también el `events_secret` e `integrity_secret` van solo en backend (nunca en el frontend).

## 3.1. `redirect_url`: el WAF de Wompi bloquea `localhost`

Cuando el frontend manda al usuario al Web Checkout, Wompi rechaza con 403 (CloudFront) cualquier `redirect-url` con `localhost`. Acepta cualquier dominio público — HTTP o HTTPS, no importa el puerto siempre que NO sea `localhost`. El legacy nunca chocó con esto porque usaba el **widget** (no requiere `redirect-url`), pero el Web Checkout sí lo requiere obligatorio.

**Solución actual:** se agregó `wompiRedirectOrigin?: string` al `ReddocEnvironment` (en `libs/core/src/lib/tokens.ts`). El orchestrator (`wompi-payment-orchestrator.service.ts`) usa `environment.wompiRedirectOrigin || window.location.origin`.

- **dev (`environment.ts`)**: `wompiRedirectOrigin: 'https://app.reddoc.uk'` — workaround para que Wompi acepte la URL. Implica que tras el pago el usuario termina en `https://app.reddoc.uk/suscripciones/pago/resultado?ref=...` en vez de volver a `localhost:4203`. **Limitación**: no se puede probar localmente la página de polling / pago aprobado / pago rechazado. Si esa ruta no existe en `app.reddoc.uk`, va a dar 404 — el cobro igualmente queda registrado vía webhook, pero la UX post-pago no es testeable en local.
- **staging (`environment.staging.ts`) y prod (`environment.prod.ts`)**: `wompiRedirectOrigin: ''` (placeholder). Cuando se sepa el dominio público de cada ambiente (ej. `https://cuenta-staging.reddoc.uk`, `https://cuenta.reddoc.uk`), llenarlo. Si queda vacío, cae a `window.location.origin` que ya es el dominio público correcto.

**Alternativa para dev local con flujo completo**: usar `ngrok http 4203` y setear `wompiRedirectOrigin` con la URL pública que ngrok genera. Así el redirect vuelve a tu localhost vía túnel.

## 4. Tokenización para auto-renovación

Para que el cronjob mensual pueda cobrar sin pedir tarjeta de nuevo:

- Tras el primer pago `APPROVED` con tarjeta, el webhook recibe `payment_source_id` (o `payment_method.installments` + token). El backend debe persistirlo en la suscripción/contacto.
- Cobros recurrentes: backend hace `POST https://production.wompi.co/v1/transactions` con `payment_source_id` (sin pasar por el checkout web).
- Cancelación: al desactivar auto-renovación desde la cuenta, el backend invalida el `payment_source` y deja de cobrar.

**Pendiente:** definir el cronjob de cobros y la UI de "gestionar tarjeta guardada / cancelar suscripción" (fuera del scope actual del wizard).

> Nota: con el nuevo flujo el frontend ya no manda `auto_renovacion` ni `metodo_pago` en el request al endpoint de integridad (el body solo lleva los IDs + monto). Esa información debe inferirse desde el webhook (Wompi indica el `payment_method_type` y si quedó tokenizada la tarjeta). Validar con backend cómo va a saber si el usuario quiere o no auto-renovación — opciones: (a) que el backend la persista al armar la referencia (recibirla como flag adicional en el request del endpoint de integridad), (b) que el frontend la persista en una tabla aparte antes de redirigir, (c) que el usuario configure auto-renovación post-pago desde el portal.

## 5. PSE + auto-renovación

Decidido: si el usuario elige PSE, el toggle de auto-renovación se deshabilita con tooltip ("PSE requiere pago manual cada ciclo"). PSE no soporta tokenización en Wompi.

A futuro, el backend debería mandar un email tipo "tu suscripción vence en 5 días, paga acá" con un link al wizard.

## 6. Bundle size pre-existente

El initial bundle de `cuenta` está en 1.08 MB, sobre el budget configurado de 1.00 MB (`apps/cuenta/project.json` → `budgets.initial.maximumError`). Esto **no** fue introducido por la integración de Wompi (los chunks de `planes-component` y `pago-resultado-component` van lazy). Pero conviene resolverlo antes de prod:

- Opción a: subir el budget a `1.2mb` y monitorear.
- Opción b: code-splitting del initial (rutas de auth lazy, evitar imports de PrimeNG en el bootstrap).

## 7. Cosas menores / nice-to-have

- Link real a Términos y Política de privacidad en `plan-confirm-step.component.html` (hoy son `href="#"`).
- Pantallas separadas para "pago pendiente" y "pago fallido" más elaboradas (hoy comparten layout en `pago-resultado.component.html`).
- Recibo descargable post-pago.
- Cambio de plan a mitad de ciclo con prorrateo.
