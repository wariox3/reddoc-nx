# Wompi — pendientes a coordinar con backend

Contexto: el frontend de la app `cuenta` ya tiene el flujo completo del Web Checkout de Wompi (paso 3 del wizard de suscripciones + página `/suscripciones/pago/resultado` con polling). Falta cerrar los contratos con backend y resolver decisiones de negocio.

## 1. Endpoints backend

### `POST /contenedor/suscripcion/{id}/iniciar-pago/` — NUEVO

Crea un `SuscripcionMovimiento` en estado `pending` y devuelve los datos firmados para abrir Wompi.

**Request (lo que manda el frontend hoy):**

```json
{
  "suscripcion_tipo_id": 5,
  "billing_profile_id": 12,
  "frecuencia": "mensual",
  "auto_renovacion": true,
  "metodo_pago": "tarjeta"
}
```

> Nota: hay una propuesta de renombrar `billing_profile_id` → `contacto_id` y `frecuencia: 'mensual' | 'anual'` → `periodo: 'M' | 'A'` para alinear con la convención de la referencia (ver punto 2). Si backend lo aprueba, ajusto `IniciarPagoRequest` y `pagar()` en `planes.component.ts`.

**Response esperada:**

```json
{
  "referencia": "10-2-A-1-{sufijo_unico}",
  "monto_cents": 3990000,
  "moneda": "COP",
  "hash": "<sha256 de referencia + monto_cents + moneda + integrity_secret>",
  "public_key": "pub_test_...", // opcional: si viene, el frontend lo prefiere sobre environment
  "redirect_url": "https://cuenta.reddoc.uk/suscripciones/pago/resultado?ref=<referencia>",
  "customer_data": {
    "email": "x@y.co",
    "full_name": "Tamerlán",
    "phone_number": "+57...",
    "legal_id": "9000...",
    "legal_id_type": "NIT"
  }
}
```

- `redirect_url` debe incluir `?ref=<referencia>` (idealmente). El frontend también guarda la referencia en `sessionStorage` como backup, pero si el usuario abre el retorno en otra pestaña solo le sirve el `?ref=`.
- `customer_data` es opcional pero recomendable: si viene, se pre-rellena el formulario del checkout de Wompi y mejora la conversión.

### `GET /contenedor/suscripcion/pago/{referencia}/` — NUEVO o validar si existe

Usado por la página `/suscripciones/pago/resultado` para hacer polling cada 2s hasta tener un estado final (timeout 30s).

**Response:**

```json
{
  "estado": "pending" | "approved" | "declined" | "voided" | "error",
  "transaction_id": "tr_xyz",          // opcional
  "referencia": "10-2-A-1-...",
  "suscripcion_id": 42,                // opcional
  "mensaje": "Texto opcional para mostrar al usuario"
}
```

### `POST /contenedor/evento-pago/webhook-wompi/` — YA EXISTE (confirmar)

Verificar con backend que:

- [ ] Valida la firma del evento (`events.signature.checksum` con el `events_secret` de Wompi).
- [ ] Si `transaction.status === 'APPROVED'`: activa la suscripción y registra el movimiento como `approved`.
- [ ] Si `auto_renovacion === true && metodo_pago === 'tarjeta'`: guarda el `payment_source_id` que Wompi devuelve, para los cobros recurrentes.
- [ ] Si `DECLINED` / `ERROR`: marca el movimiento con ese estado.
- [ ] Es idempotente (Wompi puede reenviar el mismo evento varias veces).

## 2. Formato de la referencia: `10-2-A-1`

El jefe propone `{suscripcion_id}-{suscripcion_tipo_id}-{periodo}-{contacto_id}` (ejemplo: `10-2-A-1` = suscripción 10, plan 2, anual, contacto 1).

**Tema bloqueante: Wompi rechaza referencias duplicadas.** Si un usuario intenta pagar y le rechazan la tarjeta, no puede reintentar con la misma referencia → necesitamos un sufijo único por intento.

Opciones propuestas (a elegir con el jefe):

- `10-2-A-1-{nro_intento}` (incremental por suscripcion+contacto). Más legible, requiere consultar último intento.
- `10-2-A-1-{epoch_ms}` (timestamp en ms). Trivial de generar, no requiere lookup.
- `10-2-A-1-{6_chars_hash}` (hash corto). Pierde legibilidad pero garantiza unicidad.

**Recomendación:** `10-2-A-1-{epoch_ms}` (simple y único).

## 3. Alineación de naming en el request payload

Hoy el frontend manda `billing_profile_id` y `frecuencia: 'mensual' | 'anual'`. Para que el payload calce con la referencia del backend, propongo:

| Hoy (frontend)                     | Propuesto             |
| ---------------------------------- | --------------------- |
| `billing_profile_id: number`       | `contacto_id: number` |
| `frecuencia: 'mensual' \| 'anual'` | `periodo: 'M' \| 'A'` |
| `auto_renovacion: boolean`         | (igual)               |
| `metodo_pago: 'tarjeta' \| 'pse'`  | (igual)               |
| `suscripcion_tipo_id: number`      | (igual)               |

Confirmar con backend qué nombres prefiere y actualizo `pago.model.ts` + `planes.component.ts:pagar()`.

## 4. Llave pública de producción

`apps/cuenta/src/environments/environment.prod.ts` tiene `wompiPublicKey: ''`. Hay que pegarle la `pub_prod_*` antes de deploy productivo. Cuando exista, también el `events_secret` y `integrity_secret` van solo en backend (nunca en el frontend).

## 5. Tokenización para auto-renovación

Para que el cronjob mensual pueda cobrar sin pedir tarjeta de nuevo:

- Tras el primer pago `APPROVED` con tarjeta, el webhook recibe `payment_source_id` (o `payment_method.installments` + token). El backend debe persistirlo en la suscripción/contacto.
- Cobros recurrentes: backend hace `POST https://production.wompi.co/v1/transactions` con `payment_source_id` (sin pasar por el checkout web).
- Cancelación: al desactivar auto-renovación desde la cuenta, el backend invalida el `payment_source` y deja de cobrar.

**Pendiente:** definir el cronjob de cobros y la UI de "gestionar tarjeta guardada / cancelar suscripción" (fuera del scope actual del wizard).

## 6. PSE + auto-renovación

Decidido: si el usuario elige PSE, el toggle de auto-renovación se deshabilita con tooltip ("PSE requiere pago manual cada ciclo"). PSE no soporta tokenización en Wompi.

A futuro, el backend debería mandar un email tipo "tu suscripción vence en 5 días, paga acá" con un link al wizard.

## 7. Bundle size pre-existente

El initial bundle de `cuenta` está en 1.08 MB, sobre el budget configurado de 1.00 MB (`apps/cuenta/project.json` → `budgets.initial.maximumError`). Esto **no** fue introducido por la integración de Wompi (mis chunks van todos en lazy: `planes-component`, `pago-resultado-component`). Pero conviene resolverlo antes de prod:

- Opción a: subir el budget a `1.2mb` y monitorear.
- Opción b: code-splitting del initial (rutas de auth lazy, evitar imports de PrimeNG en el bootstrap).

## 8. Cosas menores / nice-to-have

- Link real a Términos y Política de privacidad en `plan-confirm-step.component.html` (hoy son `href="#"`).
- Pantallas separadas para "pago pendiente" y "pago fallido" más elaboradas (hoy comparten layout en `pago-resultado.component.html`).
- Recibo descargable post-pago.
- Cambio de plan a mitad de ciclo con prorrateo.
