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
  defaultChildPath: 'puestos',
  menu: [
    {
      kind: 'accordion',
      id: 'turno-movimientos',
      labelKey: 'layout.nav.sections.movement',
      iconClass: 'pi pi-sync',
      defaultExpanded: true,
      groups: [
        {
          items: [
            { labelKey: 'entities.soporte.name', path: 'soportes' },
            { labelKey: 'entities.programacion.name', path: 'programaciones' },
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
            { labelKey: 'entities.programador.name', path: 'programadores' },
            { labelKey: 'entities.secuencia.name', path: 'secuencias' },
            { labelKey: 'entities.turno.name', path: 'turnos' },
          ],
        },
      ],
    },
  ],
};
