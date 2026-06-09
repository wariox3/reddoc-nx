import type { AuthTranslationsHost } from '@reddoc/ui';

export interface AppDict extends AuthTranslationsHost {
  common: {
    comingSoon: string;
    actions: {
      new: string;
      actions: string;
      view: string;
      edit: string;
      delete: string;
      deleteSelected: string;
      cancel: string;
      back: string;
      save: string;
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
      of: string;
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
      exportError: { title: string; desc: string };
    };
    boolean: { true: string; false: string };
    imageUpload: {
      change: string;
      remove: string;
      removeConfirm: string;
      tooLarge: string;
      hint: string;
      dialogTitle: string;
      empty: string;
    };
    filters: {
      title: string;
      subtitle: string;
      addCondition: string;
      removeCondition: string;
      where: string;
      and: string;
      apply: string;
      clear: string;
      cancel: string;
      noValue: string;
      valuePlaceholder: string;
      empty: { title: string; sub: string };
      operators: {
        contiene: string;
        es: string;
        noEs: string;
        comienzaCon: string;
        terminaCon: string;
        vacio: string;
        noVacio: string;
        mayor: string;
        mayorIgual: string;
        menor: string;
        menorIgual: string;
        esVerdadero: string;
        esFalso: string;
      };
    };
    import: {
      dropzone: {
        primary: string;
        secondary: string;
        /** Soporta los placeholders `{types}` y `{max}`. */
        hint: string;
        invalidType: string;
        tooLarge: string;
      };
      fileMeta: {
        /** Soporta los placeholders `{size}` y `{time}`. */
        uploadedAt: string;
      };
      removeFile: string;
      tabs: { errors: string; masters: string };
      emptyStates: { errors: string; masters: string };
      errors: {
        rowHeader: string;
        messageHeader: string;
        /** Soporta los placeholders `{shown}` y `{total}`. */
        truncated: string;
      };
      example: {
        download: string;
        downloading: string;
        error: { title: string; desc: string };
      };
      submit: string;
      submitting: string;
      cancel: string;
      toasts: {
        success: { title: string; desc: string };
        error: { title: string; desc: string };
      };
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
        movement: string;
        utility: string;
      };
    };
    userMenu: {
      label: string;
      myContainers: string;
      manageAccount: string;
      settings: string;
      logout: string;
    };
  };
  modules: {
    general: { name: string };
    compra: { name: string };
    venta: { name: string };
    inventario: { name: string };
    turno: { name: string };
    contabilidad: { name: string };
  };
  entities: {
    contacto: {
      name: string;
      searchPlaceholder: string;
      import: { title: string; subtitle: string };
      columns: {
        id: string;
        nombre: string;
        identificacion: string;
        identificacion_abreviatura: string;
        correo: string;
        telefono: string;
        celular: string;
        cliente: string;
        proveedor: string;
        empleado: string;
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
          responsabilidad: string;
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
        dian: {
          button: string;
          notFound: { title: string; desc: string };
          error: { title: string; desc: string };
        };
      };
      detail: {
        title: string;
        subtitle: string;
        sections: {
          general: string;
          contacto: string;
          ubicacion: string;
          cliente: string;
          proveedor: string;
        };
        labels: { codigoCiiu: string; codigoPostal: string };
        notFound: { title: string; desc: string };
      };
    };
    item: {
      name: string;
      searchPlaceholder: string;
      columns: {
        id: string;
        codigo: string;
        nombre: string;
        referencia: string;
        precio: string;
        producto: string;
        servicio: string;
        inventario: string;
      };
      form: {
        createTitle: string;
        createSubtitle: string;
        editTitle: string;
        editSubtitle: string;
        sections: { principal: string; preciosImpuestos: string; cuentas: string };
        sectionsHint: { principal: string; preciosImpuestos: string; cuentas: string };
        clasificacion: string;
        fields: {
          codigo: string;
          nombre: string;
          referencia: string;
          tipo: string;
          precio: string;
          costo: string;
          inventario: string;
          negativo: string;
          venta: string;
          favorito: string;
          inactivo: string;
          impuestosVenta: string;
          impuestosCompra: string;
          impuestosPlaceholder: string;
          cuentaVenta: string;
          cuentaCompra: string;
          cuentaCostoVenta: string;
          cuentaInventario: string;
          cuentaPlaceholder: string;
        };
        tipoOptions: { producto: string; servicio: string };
        validation: { required: string };
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
      detail: {
        sections: { precios: string; impuestos: string; cuentas: string };
        labels: { impuestosVenta: string; impuestosCompra: string; sinImpuestos: string };
        notFound: { title: string; desc: string };
        toasts: {
          imageUploadSuccess: { title: string; desc: string };
          imageUploadError: { title: string; desc: string };
          imageRemoveSuccess: { title: string; desc: string };
          imageRemoveError: { title: string; desc: string };
        };
      };
    };
    puesto: {
      name: string;
      searchPlaceholder: string;
      columns: {
        id: string;
        nombre: string;
        direccion: string;
        celular: string;
        latitud: string;
        longitud: string;
        comentario: string;
        estado: string;
      };
      form: {
        createTitle: string;
        editTitle: string;
        createSubtitle: string;
        editSubtitle: string;
        cancel: string;
        submitCreate: string;
        submitEdit: string;
        sections: { principal: string };
        sectionsHint: { principal: string };
        fields: {
          nombre: string;
          direccion: string;
          celular: string;
          latitud: string;
          longitud: string;
          comentario: string;
          ciudad: string;
          ciudadPlaceholder: string;
          contacto: string;
          contactoPlaceholder: string;
          centroCosto: string;
          centroCostoPlaceholder: string;
          programador: string;
          programadorPlaceholder: string;
        };
        validation: { required: string };
        toasts: {
          createSuccess: { title: string; desc: string };
          editSuccess: { title: string; desc: string };
          createError: { title: string; desc: string };
          editError: { title: string; desc: string };
          loadError: { title: string; desc: string };
        };
      };
      detail: {
        notFound: { title: string; desc: string };
        sections: { ubicacion: string; relaciones: string; comentario: string };
        toasts: { loadError: { title: string; desc: string } };
      };
    };
    programador: {
      name: string;
      searchPlaceholder: string;
      columns: { id: string; nombre: string; estado: string };
      form: {
        createTitle: string;
        editTitle: string;
        createSubtitle: string;
        editSubtitle: string;
        cancel: string;
        submitCreate: string;
        submitEdit: string;
        sections: { principal: string };
        sectionsHint: { principal: string };
        fields: { nombre: string };
        validation: { required: string };
        toasts: {
          createSuccess: { title: string; desc: string };
          editSuccess: { title: string; desc: string };
          createError: { title: string; desc: string };
          editError: { title: string; desc: string };
          loadError: { title: string; desc: string };
        };
      };
      detail: {
        notFound: { title: string; desc: string };
        toasts: { loadError: { title: string; desc: string } };
      };
    };
    centroCosto: {
      name: string;
      searchPlaceholder: string;
      columns: { id: string; codigo: string; nombre: string; estado: string };
      form: {
        createTitle: string;
        editTitle: string;
        createSubtitle: string;
        editSubtitle: string;
        cancel: string;
        submitCreate: string;
        submitEdit: string;
        sections: { principal: string };
        sectionsHint: { principal: string };
        fields: { codigo: string; nombre: string };
        validation: { required: string };
        toasts: {
          createSuccess: { title: string; desc: string };
          editSuccess: { title: string; desc: string };
          createError: { title: string; desc: string };
          editError: { title: string; desc: string };
          loadError: { title: string; desc: string };
        };
      };
      detail: {
        notFound: { title: string; desc: string };
        toasts: { loadError: { title: string; desc: string } };
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
    contratoServicio: {
      name: string;
      columns: {
        id: string;
        numero: string;
        fecha: string;
        identificacion: string;
        contacto: string;
        horas: string;
        horasDiurnas: string;
        horasNocturnas: string;
        subtotal: string;
        impuesto: string;
        total: string;
        aprobado: string;
        anulado: string;
        electronico: string;
        contabilizado: string;
      };
      filters: {
        aprobado: string;
        anulado: string;
        electronico: string;
        contabilizado: string;
      };
      form: {
        createTitle: string;
        createSubtitle: string;
        editTitle: string;
        editSubtitle: string;
        section: string;
        sectionHint: string;
        sectorLockedHint: string;
        contactoLockedHint: string;
        fields: {
          contacto: string;
          contactoPlaceholder: string;
          fecha: string;
          sector: string;
          sectorPlaceholder: string;
          estrato: string;
          estratoPlaceholder: string;
          salario: string;
        };
        validation: { required: string };
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
        detalles: {
          title: string;
          hint: string;
          empty: string;
          addLine: string;
          editLine: string;
          removeLine: string;
          lineLabel: string;
          coverage: string;
          subtotalCol: string;
          contractSummaryTitle: string;
          contractSubtotal: string;
          contractTotal: string;
          yes: string;
          no: string;
          modalCreateTitle: string;
          modalEditTitle: string;
          modalSubtitle: string;
          modalAdd: string;
          modalSave: string;
          confirmDeleteLine: string;
          fields: {
            item: string;
            itemPlaceholder: string;
            puesto: string;
            puestoPlaceholder: string;
            cantidad: string;
            precio: string;
            periodo: string;
            desde: string;
            hasta: string;
            horario: string;
            dias: string;
            diasSemana: string[];
            festivo: string;
            modalidad: string;
            modalidadPlaceholder: string;
            salario: string;
            programar: string;
            programarHint: string;
            cortesia: string;
            cortesiaHint: string;
            compuesto: string;
            impuestos: string;
            impuestosPlaceholder: string;
          };
          contactoRequired: string;
          sectorRequired: string;
          salarioRequired: string;
          summary: {
            title: string;
            subtotal: string;
            total: string;
          };
          calc: {
            title: string;
            dias: string;
            diurna: string;
            nocturna: string;
            horasDia: string;
            valorHora: string;
            precioMinimo: string;
            definirPrecio: string;
            calculating: string;
            empty: string;
          };
          validation: { required: string };
          toasts: {
            lineSaveSuccess: { title: string; desc: string };
            lineSaveError: { title: string; desc: string };
          };
        };
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
        updateSubscription: string;
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
      expired: {
        badge: string;
        ownerCta: string;
        memberLocked: string;
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
  configuracion: {
    title: string;
    subtitle: string;
    tabs: { general: string; humano: string };
    unsavedChanges: string;
    actions: { save: string };
    general: {
      uvt: { title: string; hint: string; label: string };
      validation: { required: string };
    };
    humano: {
      section: { title: string; hint: string };
      fields: { salarioMinimo: string; factor: string; auxilioTransporte: string };
      validation: { required: string };
    };
    empresa: {
      sections: {
        identidad: { title: string; hint: string };
        contacto: { title: string; hint: string };
      };
      fields: {
        nombreCorto: string;
        tipoPersona: string;
        identificacion: string;
        numeroIdentificacion: string;
        digitoVerificacion: string;
        direccion: string;
        ciudad: string;
        telefono: string;
        correo: string;
      };
      validation: { required: string; emailInvalid: string };
    };
    toasts: {
      saveSuccess: { title: string; desc: string };
      saveError: { title: string; desc: string };
      loadError: { title: string; desc: string };
    };
  };
}
