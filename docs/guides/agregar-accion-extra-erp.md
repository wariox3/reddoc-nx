# Guía: agregar una acción extra a un documento del ERP (modal + endpoint propios)

> **Para quién**: dev que necesita sumar una **acción de toolbar** a un documento del
> framework configuracional (camino A) — un botón que abre **su propio modal**, hace
> **su propia petición** y refresca la lista. Ejemplo vivo: **"Generar"** en
> `pedido-servicio` (modal de fecha → `POST /general/documento/generar/`).
> **Qué resuelve**: agregar acciones heterogéneas (cada una con campos, endpoint y
> payload distintos) **sin tocar** `BaseDocumentListComponent` ni el toolbar
> (principio Open/Closed). Cada acción nueva = sus archivos + **una línea** de registro
> \+ **un string** en el config del documento.
> **Cuándo NO usar esto**: para crear/editar/eliminar (eso ya lo derivan las
> `capabilities` del documento), ni para acciones de **fila** (eso son `rowActions`).
> Esto es para acciones a **nivel documento** que viven en el dropdown "Acciones".

---

## Modelo mental en 30 segundos

Una acción extra es un **Strategy auto-contenido** (`@Injectable`). El componente base
solo conoce el **contrato** `EntityActionStrategy`: lo busca por id, lo muestra como
entrada del dropdown "Acciones" y delega la ejecución. Todo lo concreto (modal, HTTP,
toast) vive dentro del strategy.

```
EntityActionStrategy            ← contrato { id, toolbarAction, isAvailable?, execute(ctx) }
   │  lo implementa…
<accion>-action.strategy.ts     ← @Injectable: abre su modal, hace HTTP, toast, ctx.reload()
   │   ├── <accion>.service.ts   ← extends BaseHttpService (su endpoint/payload)
   │   └── <accion>-modal.component.ts  ← standalone, sus campos; cierra con ref.close(resultado)
   │  se registra en…
ENTITY_ACTION_PROVIDERS         ← { provide: ENTITY_ACTION_STRATEGY, useClass: X, multi: true }
   │  (una línea, se spreadea en app.config.ts)
   │
<doc>.config.ts                 ← extraActionIds: ['<accion>']   ← qué docs la exponen
   │
BaseDocumentListComponent       ← filtra strategies por extraActionIds → dropdown "Acciones"
                                   → onToolbarAction delega en strategy.execute(ctx)
```

Todo vive en **`apps/erp/src/app/core/module-config/actions/`** (es infraestructura
ERP-específica). El _por qué_ del framework:
[`../architecture/erp-module-architecture.md`](../architecture/erp-module-architecture.md).

Ejemplo canónico vivo: `core/module-config/actions/generar/`.

---

## El contrato

`core/module-config/actions/entity-action-strategy.ts`:

```ts
export interface EntityActionContext {
  readonly document: DocumentEntityConfig; // documentTypeId, endpoint, etc.
  readonly reload: () => void; // recarga la lista tras éxito
}

export interface EntityActionStrategy {
  readonly id: string; // === un string de document.extraActionIds
  readonly toolbarAction: ToolbarAction; // label/icono; su id debe ser === this.id
  isAvailable?(document: DocumentEntityConfig): boolean; // filtro fino opcional (default: true)
  execute(ctx: EntityActionContext): Observable<void>; // abre modal + HTTP + toast + reload
}
```

- `execute` devuelve `Observable<void>`: el componente base solo se suscribe con
  `takeUntilDestroyed`. **El strategy es dueño de todo el flujo** (abrir el modal,
  esperar su resultado, pegarle al backend, mostrar toast y llamar `ctx.reload()`).
- `id` debe ser **único** y **distinto** de los reservados `new`/`edit`/`delete`.

---

## Paso a paso: agregar una acción nueva

Ejemplo hipotético: **"Anular"** un documento con un modal que pide un **motivo** (texto)
y hace `POST /general/documento/anular/`. Muestra el caso de campos/endpoint distintos a
"generar".

Carpeta nueva: `core/module-config/actions/anular/`.

### 1. El servicio HTTP

`anular/anular-documento.service.ts` — extiende `BaseHttpService` (deja `tenantScoped`
en su default `true`: el endpoint vive en el schema del tenant, como todo el framework).

```ts
@Injectable({ providedIn: 'root' })
export class AnularDocumentoService extends BaseHttpService {
  anular(payload: { documento_tipo_id: number; motivo: string }): Observable<unknown> {
    return this.post<unknown>('/general/documento/anular/', payload);
  }
}
```

> El `apiUrl` ya aporta el prefijo `/api`; el path empieza en `/general/...`.

### 2. El modal (sus campos)

`anular/anular-documento-modal.component.ts` + `.html` — componente **standalone**.
No conoce el endpoint: al confirmar **cierra el dialog con su resultado** vía
`ref.close(...)`; al cancelar `ref.close(null)`.

```ts
@Component({ standalone: true, imports: [FormsModule, InputTextModule, ButtonModule] /*…*/ })
export class AnularDocumentoModalComponent {
  private readonly ref = inject(DynamicDialogRef);
  protected readonly motivo = signal('');
  protected confirm(): void {
    if (this.motivo().trim()) this.ref.close(this.motivo().trim());
  }
  protected cancel(): void {
    this.ref.close(null);
  }
}
```

**El chrome del modal sigue el estándar del ERP** (ver sección "Estándar visual" abajo):
badge + título + subtítulo + footer con borde. Copiá la estructura de
`generar/generar-documento-modal.component.html` y cambiá solo los campos del medio.

### 3. El strategy (orquesta todo)

`anular/anular-documento-action.strategy.ts`:

```ts
@Injectable()
export class AnularDocumentoActionStrategy implements EntityActionStrategy {
  readonly id = 'anular';
  readonly toolbarAction: ToolbarAction = {
    id: this.id,
    labelKey: 'documentActions.anular.buttonLabel',
    iconClass: 'pi pi-ban',
  };

  private readonly dialog = inject(DialogService);
  private readonly api = inject(AnularDocumentoService);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  execute(ctx: EntityActionContext): Observable<void> {
    const dict = this.i18n.t().documentActions.anular;
    // El modal se carga lazy: mantiene su peso fuera del bundle inicial.
    return from(import('./anular-documento-modal.component')).pipe(
      switchMap(({ AnularDocumentoModalComponent }) => {
        const ref = this.dialog.open(AnularDocumentoModalComponent, {
          ...ENTITY_ACTION_DIALOG_DEFAULTS, // frame compartido del ERP
          width: '27rem',
        });
        return ref ? ref.onClose : EMPTY;
      }),
      filter((motivo: unknown): motivo is string => typeof motivo === 'string'),
      switchMap((motivo) =>
        this.api.anular({ documento_tipo_id: ctx.document.documentTypeId, motivo }).pipe(
          tap(() => {
            this.toast.success(dict.success.title, dict.success.desc);
            ctx.reload();
          }),
          catchError(() => {
            this.toast.error(dict.error.title, dict.error.desc);
            return EMPTY;
          }),
        ),
      ),
      map(() => void 0),
    );
  }
}
```

> **Parámetros de la acción**: si necesitás un valor del documento (ej. `documentTypeId`),
> leelo de `ctx.document`. Si es una constante del negocio, usá `DOCUMENT_TYPE_ID.X`
> (como hace "generar": origen `34` → destino `35`). Si la **misma** acción se reusa en
> varios documentos con valores distintos, promové ese valor a un **campo tipado** del
> `DocumentEntityConfig` (no metás parámetros dentro de `extraActionIds`).

### 4. Registrar el strategy (la línea única)

`core/module-config/actions/entity-action.providers.ts`:

```ts
export const ENTITY_ACTION_PROVIDERS: readonly Provider[] = [
  { provide: ENTITY_ACTION_STRATEGY, useClass: GenerarDocumentoActionStrategy, multi: true },
  { provide: ENTITY_ACTION_STRATEGY, useClass: AnularDocumentoActionStrategy, multi: true }, // ← nueva
];
```

(Ya está spreadeado en `app.config.ts` como `...ENTITY_ACTION_PROVIDERS`; no se toca.)

### 5. Exponerla desde el documento

`features/<modulo>/documentos/<doc>/<doc>.config.ts`:

```ts
export const PEDIDO_SERVICIO_CONFIG: DocumentEntityConfig = {
  // …
  extraActionIds: ['generar', 'anular'], // ← agregás el id; aparece en el dropdown "Acciones"
};
```

Un documento sin `extraActionIds` no muestra el dropdown. Varios documentos pueden
compartir la misma acción listándola en sus `extraActionIds`.

### 6. i18n

`apps/erp/src/app/i18n/app.dict.ts` (tipo) + `app.es.ts` + `app.en.ts` — agregá tu
subtree bajo `documentActions.<accion>`:

```ts
documentActions: {
  generar: {
    /* … */
  }
  anular: {
    // ← nuevo, mismo shape tipado
    buttonLabel: string;
    modalHeader: string;
    modalSubtitle: string;
    motivoLabel: string;
    submit: string;
    cancel: string;
    success: {
      title: string;
      desc: string;
    }
    error: {
      title: string;
      desc: string;
    }
  }
}
```

> Convención de copy del repo: mayúscula **solo** en la primera palabra ("Generar
> documento", no "Generar Documento").

---

## Estándar visual del modal (no reinventar)

Los modales del ERP comparten un mismo chrome. Para acciones extra:

1. **Frame** (radio 16px, sombra suave, padding) → ya resuelto por
   `ENTITY_ACTION_DIALOG_DEFAULTS` (`actions/entity-action-dialog.defaults.ts`), que aplica
   `showHeader: false` + `styleClass: 'erp-action-dialog'`. La clase global vive en
   `apps/erp/src/styles.scss` (el dialog se teletransporta al `body`, fuera del alcance
   de estilos scoped). **No dupliques estos estilos**: spreá `ENTITY_ACTION_DIALOG_DEFAULTS`.

2. **Header del componente** (badge + título + subtítulo), copiado del estándar
   (`generar-documento-modal.component.html` o `contenedores-create-dialog`):

   ```html
   <div class="flex items-center gap-3.5">
     <span
       class="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-brand-blue/15"
     >
       <i class="pi pi-<icono> text-[1.1rem] text-brand-blue"></i>
     </span>
     <div class="flex flex-col gap-[0.1rem]">
       <h2
         class="m-0 text-[1.05rem] font-extrabold leading-tight tracking-[-0.03em] text-brand-navy"
       >
         {{ d.modalHeader }}
       </h2>
       <p class="m-0 text-[0.75rem] tracking-[0.01em] text-brand-muted">{{ d.modalSubtitle }}</p>
     </div>
   </div>
   ```

3. **Footer** con borde superior y botones (cancelar `outlined secondary` + primario):

   ```html
   <div class="mt-1 flex items-center justify-end gap-3 border-t border-[rgba(20,48,73,0.08)] pt-5">
     <p-button
       type="button"
       [label]="d.cancel"
       [outlined]="true"
       severity="secondary"
       (onClick)="cancel()"
     />
     <p-button type="submit" [label]="d.submit" [disabled]="…" />
   </div>
   ```

Tokens de marca: `text-brand-navy` (títulos), `text-brand-blue` + `bg-brand-blue/15`
(badge/acento), `text-brand-muted` (subtítulo). Usá clases Tailwind, evitá estilos inline.

---

## Cómo se renderiza

`BaseDocumentListComponent` agrupa **todas** las acciones disponibles del documento en un
único dropdown **"Acciones"** del toolbar (un `ToolbarAction` con `children`). Al elegir
una entrada, el toolbar emite el `id` del strategy → `onToolbarAction` lo resuelve y llama
`execute(ctx)`. No hace falta tocar nada de esto: tu acción aparece sola en el dropdown.

---

## Checklist

- [ ] `actions/<accion>/<accion>.service.ts` (extends `BaseHttpService`; `tenantScoped`
      por default `true` salvo endpoint público).
- [ ] `actions/<accion>/<accion>-modal.component.ts` + `.html` (standalone; cierra con
      `ref.close(resultado | null)`; chrome estándar).
- [ ] `actions/<accion>/<accion>-action.strategy.ts` (`@Injectable`, `id` único,
      `toolbarAction.id === id`, modal **lazy** vía `import()`, spreá
      `ENTITY_ACTION_DIALOG_DEFAULTS`).
- [ ] Una línea en `ENTITY_ACTION_PROVIDERS`.
- [ ] `extraActionIds: [..., '<accion>']` en el `<doc>.config.ts`.
- [ ] Claves `documentActions.<accion>.*` en `app.dict.ts` / `app.es.ts` / `app.en.ts`.
- [ ] `npx nx lint erp && npx nx build erp`.

**No se toca**: `BaseDocumentListComponent`, el toolbar, `app.config.ts` (salvo la primera
vez que se montó el mecanismo).

---

## Gotchas

- **Cancelación**: el modal cierra con `null` al cancelar; el `filter(...)` del strategy
  evita disparar el HTTP. Devolvé siempre un tipo distinguible en éxito (Date, string, objeto).
- **`id` reservados**: no uses `new`/`edit`/`delete` como `id` de acción.
- **Bundle inicial**: el strategy se provee eager en root, así que **cargá el modal lazy**
  con `import()` dentro de `execute()` (mantiene PrimeNG/datepicker fuera del initial chunk).
  No exportes el strategy ni el modal desde `core/module-config/index.ts` — solo el
  contrato, el token y los providers ya están exportados.
- **`tenantScoped`**: si el endpoint resuelve en el schema público, override
  `protected override readonly tenantScoped = false;` en el servicio (si no → 404).
- **`appendTo="body"`** en datepickers/dropdowns dentro del modal, para que el overlay
  se apile por encima del dialog.
