import { authEn } from '@reddoc/ui';
import type { AppDict } from './app.dict';

export const en: AppDict = {
  auth: authEn,
  common: {
    comingSoon: 'Coming soon.',
    actions: {
      new: 'New',
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
        nombre: 'Name',
        identificacion: 'ID number',
        correo: 'Email',
        telefono: 'Phone',
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
      form: {
        label: 'Invitee email',
        placeholder: 'name@company.com',
        invalid: 'Enter a valid email.',
        submit: 'Send invitation',
        sending: 'Sending…',
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
