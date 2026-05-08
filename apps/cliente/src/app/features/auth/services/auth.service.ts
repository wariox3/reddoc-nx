import { Injectable } from '@angular/core';
import { BaseAuthService, Usuario } from '@reddoc/core';
import { ROUTE_PATHS } from '../../../core/constants/route-paths.constants';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseAuthService<Usuario> {
  protected readonly loginRoute = ROUTE_PATHS.auth.login;
}
