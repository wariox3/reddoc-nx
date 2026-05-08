import { authEn } from '@reddoc/ui';
import type { AppDict } from './app.dict';

export const en: AppDict = {
  auth: authEn,
  layout: {
    menuLabel: 'Open menu',
    drawerHeader: 'Menu',
    nav: {
      dashboard: 'Dashboard',
      account: 'Manage account',
    },
    userMenu: {
      label: 'User menu',
      myContainers: 'My containers',
      manageAccount: 'Manage account',
      logout: 'Sign out',
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
  },
};
