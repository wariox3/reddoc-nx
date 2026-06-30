import type { ErpModuleDescriptor } from '@erp/core/erp-modules';

/**
 * Descriptor del módulo Turno para la capa de navegación.
 *
 * El menú declara el acordeón que ve el sidebar cuando este módulo está activo.
 * Los `path` son **relativos al módulo** — el `WorkspaceLayout` les prepende
 * `/t/<slug>/turno/`. Por ahora solo el master `puesto`; sumar entradas cuando
 * se implementen más masters/documentos.
 */
export const TURNO_MODULE: ErpModuleDescriptor = {
  id: 'turno',
  displayNameKey: 'modules.turno.name',
  iconClass: 'pi pi-calendar',
  defaultChildPath: 'inicio',
  menu: [
    { kind: 'item', labelKey: 'layout.nav.home', iconClass: 'pi pi-home', path: 'inicio' },
    {
      kind: 'accordion',
      id: 'turno-movimientos',
      labelKey: 'layout.nav.sections.movement',
      iconClass: 'pi pi-sync',
      defaultExpanded: true,
      groups: [
        {
          items: [
            { labelKey: 'entities.programacion.name', path: 'programaciones' },
            { labelKey: 'entities.soporte.name', path: 'soportes' },
          ],
        },
      ],
    },
    {
      kind: 'accordion',
      id: 'turno-administracion',
      labelKey: 'layout.nav.sections.master',
      iconClass: 'pi pi-folder',
      defaultExpanded: true,
      groups: [
        {
          items: [
            { labelKey: 'entities.puesto.name', path: 'puestos' },
            { labelKey: 'entities.turno.name', path: 'turnos' },
            { labelKey: 'entities.secuencia.name', path: 'secuencias' },
            { labelKey: 'entities.programador.name', path: 'programadores' },
          ],
        },
      ],
    },
  ],
};
