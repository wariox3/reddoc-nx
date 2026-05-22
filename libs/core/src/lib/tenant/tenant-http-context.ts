import { HttpContextToken } from '@angular/common/http';

/**
 * Marca si una petición HTTP debe resolverse **dentro del tenant activo**.
 *
 * El `tenantInterceptor` lee este token para decidir si adjunta la cabecera
 * `X-Tenant`. El default es `true` porque la inmensa mayoría de endpoints del
 * ERP son tenant-scoped (contactos, ítems, documentos…).
 *
 * Los servicios cuyo endpoint vive en el **schema público** (auth, contenedor,
 * selección de usuarios para invitar, catálogos globales) declaran lo contrario
 * — en `BaseHttpService` basta con `protected override tenantScoped = false`.
 * Así la decisión vive junto al dueño del endpoint y no en una lista central.
 */
export const TENANT_SCOPED = new HttpContextToken<boolean>(() => true);
