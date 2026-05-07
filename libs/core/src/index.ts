export { BaseAuthService } from './lib/auth/base-auth.service';
export type { AuthApiEndpoints } from './lib/auth/base-auth.service';
export { authGuard } from './lib/guards/auth.guard';
export { publicGuard } from './lib/guards/public.guard';
export { authInterceptor } from './lib/interceptors/auth.interceptor';
export { errorInterceptor } from './lib/interceptors/error.interceptor';
export type {
  BaseUsuario,
  LoginRequest,
  AuthResponse,
  ResendVerificationRequest,
  RegisterRequest,
  RegisteredUser,
  RegisterResponse,
} from './lib/models/auth.model';
export { BaseHttpService, buildHttpParams } from './lib/services/base-http.service';
export type { ParamValue } from './lib/services/base-http.service';
export { TokenRefreshService } from './lib/services/token-refresh.service';
export { ToastService } from './lib/services/toast.service';
export { ReddocPreset } from './lib/theme/reddoc-preset';
export {
  ENVIRONMENT,
  ROUTE_PATHS_TOKEN,
  AUTH_SERVICE,
  AUTH_SKIP_URLS,
  APP_BRANDING,
} from './lib/tokens';
export type { ReddocEnvironment, RoutePaths, AuthServiceContract, AppBranding } from './lib/tokens';
export { extractErrorMessage, parseApiError } from './lib/utils/error.utils';
export type { ApiError, ApiErrorResponse } from './lib/utils/error.utils';
