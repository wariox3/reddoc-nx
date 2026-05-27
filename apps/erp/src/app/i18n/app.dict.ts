import type { AuthTranslationsHost } from '@reddoc/ui';

export interface AppDict extends AuthTranslationsHost {
  common: {
    comingSoon: string;
    actions: {
      new: string;
      edit: string;
      delete: string;
      deleteSelected: string;
      cancel: string;
      menuLabel: string;
      filters: string;
      clearFilters: string;
      clearSearch: string;
      refresh: string;
      exportExcel: string;
      import: string;
      export: string;
    };
    search: {
      placeholder: string;
    };
    list: {
      records: string;
      empty: { title: string; sub: string };
    };
    confirms: {
      deleteHeader: string;
      deleteMessage: string;
    };
    toasts: {
      loadError: { title: string; desc: string };
      deleteSuccess: { title: string; desc: string };
      deleteError: { title: string; desc: string };
    };
  };
  layout: {
    menuLabel: string;
    drawerHeader: string;
    nav: {
      dashboard: string;
      account: string;
      empty: string;
      sections: {
        master: string;
        document: string;
        utility: string;
      };
    };
    userMenu: {
      label: string;
      myContainers: string;
      manageAccount: string;
      logout: string;
    };
  };
  modules: {
    general: { name: string };
    compra: { name: string };
    venta: { name: string };
    inventario: { name: string };
  };
  entities: {
    contacto: {
      name: string;
      columns: {
        id: string;
        nombre: string;
        identificacion: string;
        correo: string;
        telefono: string;
      };
      form: {
        createTitle: string;
        createSubtitle: string;
        editTitle: string;
        editSubtitle: string;
        sections: { principal: string; cliente: string; proveedor: string };
        sectionsHint: { principal: string; cliente: string; proveedor: string };
        clasificacion: string;
        fields: {
          tipoPersona: string;
          regimen: string;
          identificacion: string;
          numeroIdentificacion: string;
          digitoVerificacion: string;
          nombreCorto: string;
          nombre1: string;
          nombre2: string;
          apellido1: string;
          apellido2: string;
          telefono: string;
          celular: string;
          ciudad: string;
          ciudadPlaceholder: string;
          direccion: string;
          barrio: string;
          correo: string;
          cliente: string;
          proveedor: string;
          empleado: string;
          plazoPago: string;
          precio: string;
          asesor: string;
          correoFacturacion: string;
          banco: string;
          bancoPlaceholder: string;
          numeroCuenta: string;
          cuentaBancoClase: string;
          plazoPagoProveedor: string;
        };
        tipoPersonaOptions: { juridica: string; natural: string };
        pendingPlaceholder: string;
        validation: {
          required: string;
          emailInvalid: string;
          numeroIdentificacionExistente: string;
        };
        submitCreate: string;
        submitEdit: string;
        cancel: string;
        toasts: {
          createSuccess: { title: string; desc: string };
          createError: { title: string; desc: string };
          editSuccess: { title: string; desc: string };
          editError: { title: string; desc: string };
          loadError: { title: string; desc: string };
        };
      };
    };
    facturaVenta: {
      name: string;
      columns: {
        numero: string;
        fecha: string;
        contacto: string;
        total: string;
        estado: string;
      };
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
        phoneMax20: string;
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
    invite: {
      title: string;
      subtitle: string;
      tabs: { members: string; pending: string };
      form: {
        label: string;
        placeholder: string;
        invalid: string;
        submit: string;
        sending: string;
      };
      pending: {
        estados: { P: string; A: string; R: string };
        count: { one: string; other: string };
        empty: { title: string; sub: string };
        toasts: { loadError: { title: string; desc: string } };
      };
      members: {
        title: string;
        count: { one: string; other: string };
        empty: { title: string; sub: string };
        you: string;
        roles: {
          propietario: string;
          administrador: string;
          usuario: string;
        };
        removeAria: string;
      };
      remove: {
        title: string;
        desc: string;
        confirm: string;
        cancel: string;
      };
      close: string;
      toasts: {
        sent: { title: string; desc: string };
        sendError: { title: string; desc: string };
        removed: { title: string; desc: string };
        removeError: { title: string; desc: string };
        loadError: { title: string; desc: string };
      };
    };
  };
}
