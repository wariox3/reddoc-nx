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
  },
};
