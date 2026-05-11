import type { AuthTranslationsHost } from '@reddoc/ui';

export interface AppDict extends AuthTranslationsHost {
  layout: {
    menuLabel: string;
    drawerHeader: string;
    nav: {
      dashboard: string;
      account: string;
    };
    userMenu: {
      label: string;
      myContainers: string;
      manageAccount: string;
      logout: string;
    };
  };
  contenedores: {
    list: {
      title: string;
      subtitle: string;
      newButton: string;
      searchPlaceholder: string;
      enter: string;
      status: { active: string; inactive: string };
      summary: {
        containers: { one: string; other: string };
        active: { one: string; other: string };
      };
      actions: {
        menuLabel: string;
        invite: string;
        edit: string;
        delete: string;
      };
      view: {
        list: string;
        grid: string;
      };
      empty: {
        noResults: { title: string; sub: string };
        noContenedores: { title: string; sub: string; cta: string };
      };
    };
    create: {
      title: string;
      subtitle: string;
      fields: {
        name: string;
        namePlaceholder: string;
        phone: string;
        phonePlaceholder: string;
        email: string;
        emailPlaceholder: string;
      };
      validation: {
        nameRequired: string;
        nameMin2: string;
        phoneRequired: string;
        emailRequired: string;
        emailInvalid: string;
      };
      submit: string;
      cancel: string;
      toasts: {
        success: { title: string; desc: string };
        error: { title: string; desc: string };
      };
    };
    edit: {
      title: string;
      subtitle: string;
      submit: string;
      cancel: string;
      toasts: {
        success: { title: string; desc: string };
        error: { title: string; desc: string };
      };
    };
    delete: {
      title: string;
      subtitle: string;
      warning: string;
      containerLabel: string;
      confirmLabel: string;
      confirmError: string;
      submit: string;
      cancel: string;
      toasts: {
        success: { title: string; desc: string };
        error: { title: string; desc: string };
      };
    };
  };
}
