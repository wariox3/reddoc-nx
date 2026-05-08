export interface AuthDict {
  brandPanel: {
    feature1: string;
    feature2: string;
    feature3: string;
  };
  backToHome: string;
  backToLogin: string;
  fields: {
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    name: string;
    namePlaceholder: string;
    newPassword: string;
    confirmPassword: string;
  };
  validation: {
    emailRequired: string;
    emailInvalid: string;
    passwordRequired: string;
    passwordMin6: string;
    passwordMin8: string;
    passwordConfirmRequired: string;
    passwordMismatch: string;
    nameRequired: string;
    nameMin2: string;
  };
  login: {
    title: string;
    subtitle: string;
    forgotLink: string;
    submit: string;
    noAccount: string;
    registerLink: string;
    errors: { invalidCredentials: string };
  };
  register: {
    title: string;
    subtitle: string;
    submit: string;
    alreadyHaveAccount: string;
    loginLink: string;
    terms: { acceptPrefix: string; link: string; dialogTitle: string };
    success: { title: string; desc: string; goLogin: string };
    errors: { generic: string };
  };
  forgotPassword: {
    title: string;
    subtitle: string;
    submit: string;
    success: { title: string; desc: string };
    errors: { generic: string };
  };
  resetPassword: {
    title: string;
    subtitle: string;
    submit: string;
    success: { title: string; desc: string; goLogin: string };
    errors: { generic: string };
  };
  verifyEmail: {
    loading: { title: string; desc: string };
    success: { title: string; desc: string; action: string };
    error: { title: string; action: string };
    errors: { generic: string };
  };
  resendVerification: {
    unverifiedAlert: string;
    title: string;
    subtitle: string;
    submit: string;
    success: {
      title: string;
      desc: string;
      cooldownPrefix: string;
      cooldownSuffix: string;
      resend: string;
    };
    errors: { generic: string };
  };
}

export interface AuthTranslationsHost {
  auth: AuthDict;
}
