export const API_ENDPOINTS = {
  perfil: {
    update: '/seguridad/usuario/', // PATCH /:id/
    foto: '/seguridad/usuario/foto/',
  },
  seguridad: {
    cambiarClave: '/seguridad/usuario/cambiar-clave/',
  },
  invitaciones: {
    pendientes: '/contenedor/invitacion/pendiente-usuario/',
    aceptar: '/contenedor/invitacion/', // POST /:id/aceptar/
  },
};
