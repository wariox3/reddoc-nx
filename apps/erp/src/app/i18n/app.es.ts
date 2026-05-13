import { authEs } from '@reddoc/ui';
import type { AppDict } from './app.dict';

export const es: AppDict = {
  auth: authEs,
  common: {
    comingSoon: 'Próximamente disponible.',
    actions: {
      new: 'Nuevo',
      edit: 'Editar',
      delete: 'Eliminar',
      deleteSelected: 'Eliminar seleccionados',
      cancel: 'Cancelar',
      menuLabel: 'Opciones',
      filters: 'Filtros',
      export: 'Exportar',
      clearFilters: 'Limpiar filtros',
      clearSearch: 'Limpiar búsqueda',
      refresh: 'Actualizar',
      exportExcel: 'Excel',
      import: 'Importar',
    },
    search: {
      placeholder: 'Buscar...',
    },
    list: {
      records: 'registros',
      empty: {
        title: 'Sin registros',
        sub: 'No hay datos para mostrar todavía.',
      },
    },
    confirms: {
      deleteHeader: 'Confirmar eliminación',
      deleteMessage: '¿Estás seguro de que querés eliminar los registros seleccionados?',
    },
    toasts: {
      loadError: {
        title: 'Error al cargar',
        desc: 'No se pudieron obtener los registros. Intentá de nuevo.',
      },
      deleteSuccess: {
        title: 'Registros eliminados',
        desc: 'La eliminación se completó correctamente.',
      },
      deleteError: {
        title: 'Error al eliminar',
        desc: 'No se pudieron eliminar los registros. Intentá de nuevo.',
      },
    },
  },
  layout: {
    menuLabel: 'Abrir menú',
    drawerHeader: 'Menú',
    nav: {
      dashboard: 'Dashboard',
      account: 'Gestionar cuenta',
      empty: 'Seleccioná un módulo desde la barra superior.',
      sections: {
        master: 'Administrador',
        document: 'Documentos',
        utility: 'Utilidades',
      },
    },
    userMenu: {
      label: 'Menú de usuario',
      myContainers: 'Mis contenedores',
      manageAccount: 'Gestionar cuenta',
      logout: 'Cerrar sesión',
    },
  },
  modules: {
    general: { name: 'General' },
    compra: { name: 'Compra' },
    venta: { name: 'Venta' },
    inventario: { name: 'Inventario' },
  },
  entities: {
    contacto: {
      name: 'Contactos',
      columns: {
        id: 'ID',
        nombre: 'Nombre',
        identificacion: 'Identificación',
        correo: 'Correo',
        telefono: 'Teléfono',
      },
    },
  },
  contenedores: {
    list: {
      title: 'Tus contenedores de empresa',
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
        edit: 'Editar empresa',
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
    edit: {
      title: 'Editar empresa',
      subtitle: 'Actualizá los datos del contenedor',
      submit: 'Guardar cambios',
      cancel: 'Cancelar',
      toasts: {
        success: { title: 'Empresa actualizada', desc: 'Los cambios se guardaron correctamente.' },
        error: {
          title: 'Error al actualizar',
          desc: 'No se pudo actualizar la empresa. Intentá de nuevo.',
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
