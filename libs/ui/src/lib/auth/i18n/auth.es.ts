import type { AuthDict } from './auth.dict';

export const authEs: AuthDict = {
  brandPanel: {
    feature1: 'Reportes en tiempo real',
    feature2: 'Gestión de equipos',
    feature3: 'Acceso seguro',
  },
  backToHome: 'Volver al inicio',
  backToLogin: 'Volver al login',
  fields: {
    email: 'Correo electrónico',
    emailPlaceholder: 'usuario@ejemplo.com',
    password: 'Contraseña',
    passwordPlaceholder: '••••••••',
    name: 'Nombre',
    namePlaceholder: 'Juan Pérez',
    newPassword: 'Nueva contraseña',
    confirmPassword: 'Confirmar contraseña',
  },
  validation: {
    emailRequired: 'El correo es requerido.',
    emailInvalid: 'Ingresa un correo válido.',
    passwordRequired: 'La contraseña es requerida.',
    passwordMin6: 'Mínimo 6 caracteres.',
    passwordMin8: 'Mínimo 8 caracteres.',
    passwordConfirmRequired: 'Debes confirmar la contraseña.',
    passwordMismatch: 'Las contraseñas no coinciden.',
    nameRequired: 'El nombre es requerido.',
    nameMin2: 'Mínimo 2 caracteres.',
  },
  login: {
    title: 'Iniciar sesión',
    subtitle: 'Ingresa tus credenciales para continuar',
    forgotLink: '¿Olvidaste tu contraseña?',
    submit: 'Ingresar',
    noAccount: '¿No tienes cuenta?',
    registerLink: 'Regístrate',
    errors: { invalidCredentials: 'Credenciales inválidas.' },
  },
  register: {
    title: 'Crear cuenta',
    subtitle: 'Completa tus datos para registrarte.',
    submit: 'Crear cuenta',
    alreadyHaveAccount: '¿Ya tienes cuenta?',
    loginLink: 'Inicia sesión',
    terms: {
      acceptPrefix: 'Acepto los',
      link: 'términos y condiciones',
      dialogTitle: 'Términos y condiciones',
    },
    success: {
      title: '¡Registro exitoso!',
      desc: 'Tu cuenta fue creada correctamente. Recibirás un correo de confirmación para verificar tu cuenta.',
      goLogin: 'Ir al login ahora',
    },
    errors: { generic: 'No se pudo completar el registro. Inténtalo de nuevo.' },
  },
  forgotPassword: {
    title: 'Recuperar contraseña',
    subtitle: 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.',
    submit: 'Enviar enlace',
    success: {
      title: 'Revisa tu correo',
      desc: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.',
    },
    errors: { generic: 'Ocurrió un error. Intenta de nuevo.' },
  },
  resetPassword: {
    title: 'Nueva contraseña',
    subtitle: 'Establece una nueva contraseña para tu cuenta.',
    submit: 'Restablecer contraseña',
    success: {
      title: '¡Contraseña actualizada!',
      desc: 'Tu contraseña fue restablecida. Serás redirigido al login en unos segundos.',
      goLogin: 'Ir al login ahora',
    },
    errors: { generic: 'No se pudo restablecer la contraseña. El enlace puede haber expirado.' },
  },
  verifyEmail: {
    loading: {
      title: 'Verificando tu cuenta...',
      desc: 'Por favor espera un momento.',
    },
    success: {
      title: '¡Cuenta verificada!',
      desc: 'Tu cuenta fue verificada correctamente. Ya puedes iniciar sesión.',
      action: 'Ir al login',
    },
    error: {
      title: 'Error al verificar',
      action: 'Reenviar verificación',
    },
    errors: {
      generic: 'No se pudo verificar la cuenta. El enlace puede haber expirado o ser inválido.',
    },
  },
  resendVerification: {
    unverifiedAlert: 'Tu cuenta aún no ha sido verificada. Reenvía el correo de verificación.',
    title: 'Reenviar verificación',
    subtitle: 'Te enviaremos un nuevo correo de verificación.',
    submit: 'Reenviar correo',
    success: {
      title: 'Correo enviado',
      desc: 'Revisa tu bandeja de entrada y sigue las instrucciones del correo de verificación.',
      cooldownPrefix: 'Puedes reenviar en ',
      cooldownSuffix: 's',
      resend: 'Reenviar de nuevo',
    },
    errors: { generic: 'No se pudo reenviar el correo. Inténtalo de nuevo.' },
  },
};
