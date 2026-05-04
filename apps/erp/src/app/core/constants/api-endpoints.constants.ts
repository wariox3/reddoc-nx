export const API_ENDPOINTS = {
  auth: {
    login: '/seguridad/login/',
    register: '/seguridad/usuario/',
    resendVerification: '/seguridad/usuario/reenviar-verificacion/',
    verifyEmail: '/seguridad/usuario/verificar-email/',
    logout: '/seguridad/logout/',
    refresh: '/seguridad/refresh/',
    me: '/seguridad/me/',
    forgotPassword: '/seguridad/usuario/recuperar-clave/',
    resetPassword: '/seguridad/usuario/restablecer-clave/',
  },
  contenedores: {
    list: '/contenedores/accesos/',
  },
};
