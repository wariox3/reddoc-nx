import {
  BACKEND_OPERATOR,
  buildFiltros,
  buildListBody,
  buildOrdenamientos,
} from './build-list-body';
import type { FilterCondition, ListQuery, SortSpec } from './list-query.types';

describe('BACKEND_OPERATOR', () => {
  it('mapea cada operador semántico al vocabulario autoritativo del backend', () => {
    expect(BACKEND_OPERATOR).toEqual({
      eq: '=',
      neq: '!=',
      gt: '>',
      gte: '>=',
      lt: '<',
      lte: '<=',
      contains: 'contiene',
      startsWith: 'comienza_con',
      endsWith: 'termina_con',
      in: 'in',
      isNull: 'is_null',
    });
  });
});

describe('buildFiltros', () => {
  it('traduce field/operator/value a propiedad/operador/valor', () => {
    const filters: FilterCondition[] = [
      { field: 'nombre_corto', operator: 'contains', value: 'm' },
    ];
    expect(buildFiltros(filters)).toEqual([
      { propiedad: 'nombre_corto', operador: 'contiene', valor: 'm' },
    ]);
  });

  it('serializa booleanos (eq true/false) tal cual', () => {
    const filters: FilterCondition[] = [
      { field: 'cliente', operator: 'eq', value: true },
      { field: 'proveedor', operator: 'eq', value: false },
    ];
    expect(buildFiltros(filters)).toEqual([
      { propiedad: 'cliente', operador: '=', valor: true },
      { propiedad: 'proveedor', operador: '=', valor: false },
    ]);
  });

  it('serializa is_null con su valor booleano (vacío / no vacío)', () => {
    const filters: FilterCondition[] = [
      { field: 'correo', operator: 'isNull', value: true },
      { field: 'celular', operator: 'isNull', value: false },
    ];
    expect(buildFiltros(filters)).toEqual([
      { propiedad: 'correo', operador: 'is_null', valor: true },
      { propiedad: 'celular', operador: 'is_null', valor: false },
    ]);
  });

  it('serializa listas (operador in) a CSV', () => {
    const filters: FilterCondition[] = [{ field: 'id', operator: 'in', value: [1, 2, 3] }];
    expect(buildFiltros(filters)).toEqual([{ propiedad: 'id', operador: 'in', valor: '1,2,3' }]);
  });
});

describe('buildOrdenamientos', () => {
  it('antepone "-" a los descendentes y respeta el orden de prioridad', () => {
    const sort: SortSpec[] = [
      { field: 'nombre_corto', direction: 'desc' },
      { field: 'id', direction: 'asc' },
    ];
    expect(buildOrdenamientos(sort)).toEqual(['-nombre_corto', 'id']);
  });

  it('devuelve [] cuando no hay orden', () => {
    expect(buildOrdenamientos([])).toEqual([]);
  });
});

describe('buildListBody', () => {
  const baseQuery: ListQuery = {
    filters: [{ field: 'nombre_corto', operator: 'contains', value: 'm' }],
    sort: [{ field: 'nombre_corto', direction: 'desc' }],
    page: 0,
    pageSize: 25,
  };

  it('arma el body completo y convierte la página a 1-based', () => {
    expect(buildListBody(baseQuery)).toEqual({
      filtros: [{ propiedad: 'nombre_corto', operador: 'contiene', valor: 'm' }],
      ordenamientos: ['-nombre_corto'],
      pagina: 1,
      tamano_pagina: 25,
    });
  });

  it('antepone los baseFilters a los del usuario', () => {
    const body = buildListBody(baseQuery, {
      baseFilters: [{ field: 'documento_tipo_id', operator: 'eq', value: 7 }],
    });
    expect(body.filtros).toEqual([
      { propiedad: 'documento_tipo_id', operador: '=', valor: 7 },
      { propiedad: 'nombre_corto', operador: 'contiene', valor: 'm' },
    ]);
  });
});
