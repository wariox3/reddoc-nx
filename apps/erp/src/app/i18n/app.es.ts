import { authEs } from '@reddoc/ui';
import type { AppDict } from './app.dict';

export const es: AppDict = {
  auth: authEs,
  layout: {
    menuLabel: 'Abrir menú',
    drawerHeader: 'Menú',
    nav: {
      dashboard: 'Dashboard',
      account: 'Gestionar cuenta',
    },
    userMenu: {
      label: 'Menú de usuario',
      myContainers: 'Mis contenedores',
      manageAccount: 'Gestionar cuenta',
      logout: 'Cerrar sesión',
    },
  },
  contenedores: {
    list: {
      title: 'Tus contenedores',
      subtitle: 'Seleccioná un espacio de trabajo para continuar',
      newButton: 'Nuevo contenedor',
      searchPlaceholder: 'Buscar...',
      enter: 'Ingresar',
      status: { active: 'Activo', inactive: 'Inactivo' },
      summary: {
        containers: { one: 'contenedor', other: 'contenedores' },
        active: { one: 'activo', other: 'activos' },
      },
      actions: {
        menuLabel: 'Opciones del contenedor',
        invite: 'Invitar usuario',
        delete: 'Eliminar contenedor',
      },
      view: {
        list: 'Vista de lista',
        grid: 'Vista de cuadrícula',
      },
      empty: {
        noResults: {
          title: 'Sin resultados',
          sub: 'No encontramos empresas que coincidan con tu búsqueda.',
        },
        noContenedores: {
          title: 'Sin empresas',
          sub: 'Aún no tenés ningún espacio de trabajo asignado.',
          cta: 'Crear primera empresa',
        },
      },
    },
    create: {
      title: 'Nuevo contenedor',
      subtitle: 'Configurá el nuevo espacio de trabajo',
      fields: {
        name: 'Nombre del contenedor',
        namePlaceholder: 'Ej: Acme Corp',
        phone: 'Teléfono',
        phonePlaceholder: 'Ej: +54 9 11 1234-5678',
        email: 'Correo electrónico',
        emailPlaceholder: 'Ej: contacto@empresa.com',
      },
      validation: {
        nameRequired: 'El nombre es obligatorio.',
        nameMin2: 'Mínimo 2 caracteres.',
        phoneRequired: 'El teléfono es obligatorio.',
        emailRequired: 'El correo es obligatorio.',
        emailInvalid: 'Ingresá un correo válido.',
      },
      submit: 'Crear contenedor',
      cancel: 'Cancelar',
      toasts: {
        success: { title: 'Contenedor creado', desc: 'El contenedor fue creado correctamente.' },
        error: {
          title: 'Error al crear',
          desc: 'No se pudo crear el contenedor. Intentá de nuevo.',
        },
      },
    },
    delete: {
      title: 'Eliminar contenedor',
      subtitle: 'Esta acción es permanente y no se puede deshacer.',
      warning: 'Se eliminarán todos los datos asociados a este contenedor de forma irreversible.',
      containerLabel: 'Contenedor a eliminar',
      confirmLabel: 'Para confirmar, escribí el nombre exacto del contenedor',
      confirmError: 'El nombre no coincide.',
      submit: 'Eliminar',
      cancel: 'Cancelar',
      toasts: {
        success: {
          title: 'Contenedor eliminado',
          desc: 'El contenedor fue eliminado correctamente.',
        },
        error: {
          title: 'Error al eliminar',
          desc: 'No se pudo eliminar el contenedor. Intentá de nuevo.',
        },
      },
    },
  },
};
