import { authEn } from '@reddoc/ui';
import type { AppDict } from './app.dict';

export const en: AppDict = {
  auth: authEn,
  common: {
    comingSoon: 'Coming soon.',
    actions: {
      new: 'New',
      actions: 'Actions',
      edit: 'Edit',
      delete: 'Delete',
      deleteSelected: 'Delete selected',
      cancel: 'Cancel',
      menuLabel: 'Options',
      filters: 'Filters',
      clearFilters: 'Clear filters',
      clearSearch: 'Clear search',
      refresh: 'Refresh',
      exportExcel: 'Excel',
      import: 'Import',
      export: 'Export',
    },
    search: {
      placeholder: 'Search...',
    },
    list: {
      records: 'records',
      empty: {
        title: 'No records',
        sub: 'There is no data to show yet.',
      },
    },
    confirms: {
      deleteHeader: 'Confirm deletion',
      deleteMessage: 'Are you sure you want to delete the selected records?',
    },
    toasts: {
      loadError: {
        title: 'Failed to load',
        desc: 'Could not fetch the records. Please try again.',
      },
      deleteSuccess: {
        title: 'Records deleted',
        desc: 'Deletion completed successfully.',
      },
      deleteError: {
        title: 'Failed to delete',
        desc: 'Could not delete the records. Please try again.',
      },
    },
    boolean: { true: 'YES', false: 'NO' },
  },
  layout: {
    menuLabel: 'Open menu',
    drawerHeader: 'Menu',
    nav: {
      dashboard: 'Dashboard',
      account: 'Manage account',
      empty: 'Pick a module from the top bar.',
      sections: {
        master: 'Administration',
        document: 'Documents',
        utility: 'Utilities',
      },
    },
    userMenu: {
      label: 'User menu',
      myContainers: 'My containers',
      manageAccount: 'Manage account',
      logout: 'Sign out',
    },
  },
  modules: {
    general: { name: 'General' },
    compra: { name: 'Purchases' },
    venta: { name: 'Sales' },
    inventario: { name: 'Inventory' },
  },
  entities: {
    contacto: {
      name: 'Contacts',
      columns: {
        id: 'ID',
        identificacion_abreviatura: 'Type',
        identificacion: 'ID number',
        nombre: 'Name',
        correo: 'Email',
        telefono: 'Phone',
        celular: 'Mobile',
        cliente: 'CLI',
        proveedor: 'PRO',
        empleado: 'EMP',
      },
      form: {
        createTitle: 'new contact',
        createSubtitle: 'Register a new contact',
        editTitle: 'edit contact',
        editSubtitle: 'Update the contact details',
        sections: {
          principal: 'Main information',
          cliente: 'Customer information',
          proveedor: 'Supplier information',
        },
        sectionsHint: {
          principal: 'Identification, contact and classification',
          cliente: 'Commercial sales terms',
          proveedor: 'Banking details for payments',
        },
        clasificacion: 'This contact is',
        fields: {
          tipoPersona: 'Person type',
          responsabilidad: 'Responsibility',
          regimen: 'Tax regime',
          identificacion: 'ID type',
          numeroIdentificacion: 'ID number',
          digitoVerificacion: 'VD',
          nombreCorto: 'Name',
          nombre1: 'First name',
          nombre2: 'Middle name',
          apellido1: 'First surname',
          apellido2: 'Second surname',
          telefono: 'Phone',
          celular: 'Mobile',
          ciudad: 'City',
          ciudadPlaceholder: 'Search city…',
          direccion: 'Address',
          barrio: 'Neighborhood',
          correo: 'Email',
          cliente: 'Customer',
          proveedor: 'Supplier',
          empleado: 'Employee',
          plazoPago: 'Payment term',
          precio: 'Price list',
          asesor: 'Advisor',
          correoFacturacion: 'E-invoicing email',
          banco: 'Bank',
          bancoPlaceholder: 'Search bank…',
          numeroCuenta: 'Account number',
          cuentaBancoClase: 'Account type',
          plazoPagoProveedor: 'Supplier payment term',
        },
        tipoPersonaOptions: {
          juridica: 'Legal entity',
          natural: 'Individual',
        },
        pendingPlaceholder: 'Coming soon',
        validation: {
          required: 'This field is required.',
          emailInvalid: 'Enter a valid email.',
          numeroIdentificacionExistente: 'This identification number is already registered.',
        },
        submitCreate: 'Create contact',
        submitEdit: 'Save changes',
        cancel: 'Cancel',
        toasts: {
          createSuccess: {
            title: 'Contact created',
            desc: 'The contact was created successfully.',
          },
          createError: {
            title: 'Could not create',
            desc: 'The contact could not be created. Please try again.',
          },
          editSuccess: {
            title: 'Contact updated',
            desc: 'Your changes were saved successfully.',
          },
          editError: {
            title: 'Could not update',
            desc: 'The contact could not be updated. Please try again.',
          },
          loadError: {
            title: 'Could not load',
            desc: 'The contact could not be loaded.',
          },
        },
      },
    },
    facturaVenta: {
      name: 'Sales invoice',
      columns: {
        numero: 'Number',
        fecha: 'Date',
        contacto: 'Contact',
        total: 'Total',
        estado: 'Status',
      },
    },
  },
  contenedores: {
    list: {
      title: 'Your companies',
      subtitle: 'Pick a workspace to continue',
      newButton: 'New company',
      searchPlaceholder: 'Search...',
      enter: 'Enter',
      status: { active: 'Active', inactive: 'Inactive' },
      summary: {
        containers: { one: 'container', other: 'containers' },
        active: { one: 'active', other: 'active' },
      },
      actions: {
        menuLabel: 'Container options',
        invite: 'Invite user',
        edit: 'Edit company',
        delete: 'Delete container',
      },
      view: {
        list: 'List view',
        grid: 'Grid view',
      },
      empty: {
        noResults: {
          title: 'No results',
          sub: 'No companies match your search.',
        },
        noContenedores: {
          title: 'No companies',
          sub: 'You do not have any workspaces assigned yet.',
          cta: 'Create first company',
        },
      },
      expired: {
        badge: 'Expired',
        ownerCta: 'Renew subscription',
        memberLocked: 'Only the owner can renew',
      },
    },
    create: {
      title: 'New company',
      subtitle: 'Configure the new workspace',
      fields: {
        name: 'Company name',
        namePlaceholder: 'E.g. Acme Corp',
        phone: 'Phone',
        phonePlaceholder: 'E.g. +1 555 123-4567',
        email: 'Email',
        emailPlaceholder: 'E.g. contact@company.com',
      },
      validation: {
        nameRequired: 'Name is required.',
        nameMin2: 'Minimum 2 characters.',
        phoneRequired: 'Phone is required.',
        phoneMax20: 'Maximum 20 characters.',
        emailRequired: 'Email is required.',
        emailInvalid: 'Enter a valid email.',
      },
      submit: 'Create company',
      cancel: 'Cancel',
      toasts: {
        success: { title: 'Company created', desc: 'The container was created successfully.' },
        error: { title: 'Creation error', desc: 'Could not create the container. Try again.' },
      },
    },
    edit: {
      title: 'Edit company',
      subtitle: 'Update the container details',
      submit: 'Save changes',
      cancel: 'Cancel',
      toasts: {
        success: { title: 'Company updated', desc: 'Changes were saved successfully.' },
        error: { title: 'Update error', desc: 'Could not update the company. Try again.' },
      },
    },
    delete: {
      title: 'Delete container',
      subtitle: 'This action is permanent and cannot be undone.',
      warning: 'All data associated with this container will be permanently deleted.',
      containerLabel: 'Container to delete',
      confirmLabel: 'To confirm, type the exact name of the container',
      confirmError: 'The name does not match.',
      submit: 'Delete',
      cancel: 'Cancel',
      toasts: {
        success: { title: 'Container deleted', desc: 'The container was deleted successfully.' },
        error: { title: 'Deletion error', desc: 'Could not delete the container. Try again.' },
      },
    },
    invite: {
      title: 'Invite to container',
      subtitle: 'Share this workspace with your team by email.',
      tabs: { members: 'Members', pending: 'Invitations' },
      form: {
        label: 'Invitee email',
        placeholder: 'name@company.com',
        invalid: 'Enter a valid email.',
        submit: 'Send invitation',
        sending: 'Sending…',
      },
      pending: {
        estados: { P: 'Pending', A: 'Accepted', R: 'Rejected' },
        count: { one: 'invitation', other: 'invitations' },
        empty: {
          title: 'No invitations',
          sub: 'Invitations you send will appear here.',
        },
        toasts: {
          loadError: {
            title: 'Failed to load invitations',
            desc: 'We could not fetch the pending invitations.',
          },
        },
      },
      members: {
        title: 'Members',
        count: { one: 'member', other: 'members' },
        empty: {
          title: 'No one else yet',
          sub: 'Invite someone by email and they will appear here.',
        },
        you: 'you',
        roles: {
          propietario: 'Owner',
          administrador: 'Admin',
          usuario: 'Member',
        },
        removeAria: 'Remove member',
      },
      remove: {
        title: 'Remove member',
        desc: 'They will lose access to the container. This cannot be undone.',
        confirm: 'Remove',
        cancel: 'Cancel',
      },
      close: 'Close',
      toasts: {
        sent: {
          title: 'Invitation sent',
          desc: 'We emailed them to join the container.',
        },
        sendError: {
          title: 'Could not invite',
          desc: 'Try again in a moment.',
        },
        removed: {
          title: 'Member removed',
          desc: 'They no longer have access to the container.',
        },
        removeError: {
          title: 'Could not remove',
          desc: 'Try again in a moment.',
        },
        loadError: {
          title: 'Failed to load members',
          desc: 'We could not fetch the member list.',
        },
      },
    },
  },
};
