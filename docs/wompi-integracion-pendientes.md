# Wompi — pendientes a coordinar con backend

Contexto: el frontend de la app `cuenta` tiene el flujo completo del Web Checkout de Wompi (paso 3 del wizard de suscripciones + página `/suscripciones/pago/resultado` con polling). El backend es el único que conoce el `integrity_secret` y el único que arma la referencia (incluyendo el sufijo único). El frontend solo arma el `customer_data` (desde el `BillingProfile`) y el `redirect_url` (con `window.location.origin`). El **webhook ya existente** queda como única fuente de verdad: a partir de la referencia identifica el movimiento, lo registra y activa la suscripción.

## 1. Endpoints backend

### `POST /contenedor/suscripcion/integridad/` ✅ IMPLEMENTADO

Recibe los IDs del intento de pago + monto y devuelve el hash de integridad y la referencia ya armada con sufijo único.

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
  "hash": "c46d17c0e5cb6790ff496324bc378d11bb44c344556380a3f71385e85bd6c48b",
  "referencia": "12-5-M-1-20260519134416"
}
```

El frontend usa la `referencia` recibida tal cual en: `sessionStorage`, `redirect_url`, y el parámetro `reference` del checkout de Wompi.

### `GET /contenedor/suscripcion/pago/{referencia}/` ❌ PENDIENTE

Usado por `pago-resultado.component.ts` para polling cada 2s (timeout 30s). No habla con Wompi directamente — solo consulta el estado que el webhook ya persistió en base de datos.

**Response:**

```json
{
  "estado": "pending" | "approved" | "declined" | "voided" | "error",
  "transaction_id": "tr_xyz",
  "referencia": "12-5-M-1-20260519134416",
  "suscripcion_id": 42,
  "mensaje": "Texto opcional para mostrar al usuario"
}
```

`transaction_id`, `suscripcion_id` y `mensaje` son opcionales. `estado` es obligatorio en toda respuesta.

### `POST /contenedor/evento-pago/webhook-wompi/` ✅ YA EXISTE

Es la fuente de verdad de la activación. Verificar con backend que:

- [ ] Valida la firma del evento (`events.signature.checksum` con el `events_secret` de Wompi).
- [ ] Parsea la referencia para identificar `suscripcion_id`, `tipo_id`, `periodo` y `contacto_id`.
- [ ] Si `transaction.status === 'APPROVED'`: crea el `SuscripcionMovimiento` en `approved` y activa la suscripción.
- [ ] Si pago con tarjeta: persiste el `payment_source_id` para cobros recurrentes.
- [ ] Si `DECLINED` / `ERROR`: registra el movimiento con ese estado.
- [ ] Es idempotente (Wompi puede reenviar el mismo evento varias veces).

## 2. Llave pública de producción

`apps/cuenta/src/environments/environment.prod.ts` tiene `wompiPublicKey: ''`. Hay que pegarle la `pub_prod_*` antes de deploy productivo. El `events_secret` e `integrity_secret` van solo en backend (nunca en el frontend).

## 2.1. `redirect_url`: el WAF de Wompi bloquea `localhost`

Wompi rechaza con 403 cualquier `redirect-url` con `localhost`. Acepta cualquier dominio público.

**Solución actual:** se agregó `wompiRedirectOrigin?: string` al `ReddocEnvironment`. El orchestrator usa `environment.wompiRedirectOrigin || window.location.origin`.

- **dev (`environment.ts`)**: `wompiRedirectOrigin: 'https://app.reddoc.uk'` — workaround para que Wompi acepte la URL. Implica que tras el pago el usuario termina en `https://app.reddoc.uk/suscripciones/pago/resultado?ref=...`. **Limitación**: no se puede probar localmente la página de polling / pago aprobado / rechazado sin ngrok.
- **staging y prod**: `wompiRedirectOrigin: ''` — cae a `window.location.origin` (el dominio público correcto).

**Alternativa para dev local con flujo completo**: usar `ngrok http 4203` y setear `wompiRedirectOrigin` con la URL pública que ngrok genera.

## 3. Modelo de cobro: recurrente por defecto

Toda suscripción es recurrente por defecto. El wizard no le pregunta al usuario ni el método ni si quiere auto-renovación — elige el método directamente en la ventana de Wompi, y el backend decide al recibir el webhook:

- **Pago con tarjeta** → Wompi devuelve `payment_source_id`. Backend lo persiste y queda **recurrente**: cronjob cobra automáticamente al final de cada ciclo.
- **PSE, Nequi u otro no tokenizable** → no hay `payment_source_id`. Suscripción activa pero **no recurrente**: el usuario paga manualmente cada ciclo. Backend debería enviar email de aviso antes del vencimiento.

El body del request al endpoint de integridad **no lleva `metodo_pago` ni `auto_renovacion`** (solo IDs + monto). La inferencia ocurre en el webhook leyendo `transaction.payment_method.type`.

**Pendiente:**

- Definir el cronjob de cobros recurrentes (backend).
- Pantalla "Gestionar suscripción / Cancelar" en `cuenta` (fuera de scope del wizard actual).
- Emails de aviso de vencimiento para suscripciones no-recurrentes.

## 4. Bundle size pre-existente

El initial bundle de `cuenta` está en 1.08 MB, sobre el budget configurado de 1.00 MB (`apps/cuenta/project.json` → `budgets.initial.maximumError`). No fue introducido por la integración de Wompi (los chunks de `planes-component` y `pago-resultado-component` van lazy). Opciones antes de prod:

- Opción a: subir el budget a `1.2mb` y monitorear.
- Opción b: code-splitting del initial (rutas de auth lazy, evitar imports de PrimeNG en el bootstrap).

## 5. Cosas menores / nice-to-have

- Link real a Términos y Política de privacidad en `plan-confirm-step.component.html` (hoy son `href="#"`).
- Pantallas separadas para "pago pendiente" y "pago fallido" más elaboradas.
- Recibo descargable post-pago.
- Cambio de plan a mitad de ciclo con prorrateo.
