import { Injectable } from '@angular/core';
import { BaseAuthService, AuthApiEndpoints, Usuario } from '@reddoc/core';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { ROUTE_PATHS } from '../../../core/constants/route-paths.constants';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseAuthService<Usuario> {
  protected readonly apiEndpoints: AuthApiEndpoints = {
    login: API_ENDPOINTS.auth.login,
    register: API_ENDPOINTS.auth.register,
    logout: API_ENDPOINTS.auth.logout,
    refresh: API_ENDPOINTS.auth.refresh,
    me: API_ENDPOINTS.auth.me,
    forgotPassword: API_ENDPOINTS.auth.forgotPassword,
    resetPassword: API_ENDPOINTS.auth.resetPassword,
    resendVerification: API_ENDPOINTS.auth.resendVerification,
    verifyEmail: API_ENDPOINTS.auth.verifyEmail,
  };

  protected readonly loginRoute = ROUTE_PATHS.auth.login;
}
