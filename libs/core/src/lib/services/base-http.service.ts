import { inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '../tokens';
import { TENANT_SCOPED } from '../tenant/tenant-http-context';

export type ParamValue = string | number | boolean | null | undefined;

export function buildHttpParams(params: Record<string, ParamValue>): HttpParams {
  let httpParams = new HttpParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null) {
      httpParams = httpParams.set(key, String(value));
    }
  }
  return httpParams;
}

export abstract class BaseHttpService {
  protected readonly http = inject(HttpClient);
  protected readonly baseUrl = inject(ENVIRONMENT).apiUrl;

  /**
   * ¿Los endpoints de este servicio se resuelven dentro del tenant activo?
   *
   * Default `true`: la mayoría de los masters del ERP son tenant-scoped. Los
   * servicios cuyo endpoint vive en el schema público (contenedor, catálogos
   * globales, selección de usuarios para invitar) lo marcan con
   * `protected override readonly tenantScoped = false;`.
   */
  protected readonly tenantScoped: boolean = true;

  /** Context HTTP con el scope de tenant declarado por el servicio. */
  private context(): HttpContext {
    return new HttpContext().set(TENANT_SCOPED, this.tenantScoped);
  }

  protected get<T>(path: string, params?: Record<string, ParamValue>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, {
      params: buildHttpParams(params ?? {}),
      context: this.context(),
    });
  }

  protected post<T>(
    path: string,
    body: unknown,
    params?: Record<string, ParamValue>,
  ): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body, {
      params: buildHttpParams(params ?? {}),
      context: this.context(),
    });
  }

  protected put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body, { context: this.context() });
  }

  protected patch<T>(path: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${path}`, body, { context: this.context() });
  }

  protected delete<T = void>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`, { context: this.context() });
  }
}
