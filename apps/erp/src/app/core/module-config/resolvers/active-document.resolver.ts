import { inject } from '@angular/core';
import type { ActivatedRouteSnapshot, ResolveFn } from '@angular/router';
import {
  DocumentNotFoundError,
  MissingDocumentKeyError,
  MissingModuleContextError,
} from '../errors/config.errors';
import { ModuleNavigationStore } from '../module-navigation.store';
import type { DocumentEntityConfig } from '../types/entity-config.types';

/**
 * Nombre del parámetro de ruta que identifica el documento activo.
 * Centralizado en una constante para evitar typos en `route.paramMap.get(...)`.
 */
export const DOCUMENT_KEY_ROUTE_PARAM = 'documentKey';

/**
 * Crea un resolver que valida y resuelve el documento activo dentro del módulo
 * activo, según el parámetro `:documentKey` de la ruta.
 *
 * Garantías:
 *  - El módulo ya está cargado (el resolver del padre debió correr antes).
 *  - El documento existe en `module.documents`.
 *
 * Si cualquiera de estas condiciones falla, lanza un error tipado.
 *
 * Uso:
 *   ```ts
 *   {
 *     path: 'documento/:documentKey',
 *     resolve: { document: activeDocumentResolver() },
 *     children: [...]
 *   }
 *   ```
 */
export function activeDocumentResolver(): ResolveFn<DocumentEntityConfig> {
  return (route: ActivatedRouteSnapshot): DocumentEntityConfig => {
    const navigationStore = inject(ModuleNavigationStore);
    const documentId = route.paramMap.get(DOCUMENT_KEY_ROUTE_PARAM);
    const activeModule = navigationStore.activeModule();

    if (!activeModule) throw new MissingModuleContextError();
    if (!documentId) throw new MissingDocumentKeyError();

    const document = activeModule.documents.find((candidate) => candidate.id === documentId);
    if (!document) throw new DocumentNotFoundError(activeModule.id, documentId);

    navigationStore.setActiveDocument(document);
    return document;
  };
}
