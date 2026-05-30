import type { SortSpec } from '@reddoc/core';
import { multiSortMetaToSpecs, sortSpecsEqual } from './sort.util';

describe('multiSortMetaToSpecs', () => {
  it('traduce order 1 → asc y -1 → desc, preservando el orden', () => {
    expect(
      multiSortMetaToSpecs([
        { field: 'nombre_corto', order: -1 },
        { field: 'id', order: 1 },
      ]),
    ).toEqual([
      { field: 'nombre_corto', direction: 'desc' },
      { field: 'id', direction: 'asc' },
    ]);
  });

  it('devuelve [] para null/undefined', () => {
    expect(multiSortMetaToSpecs(null)).toEqual([]);
    expect(multiSortMetaToSpecs(undefined)).toEqual([]);
  });
});

describe('sortSpecsEqual', () => {
  const a: SortSpec[] = [{ field: 'id', direction: 'asc' }];

  it('true cuando coinciden campo y dirección en orden', () => {
    expect(sortSpecsEqual(a, [{ field: 'id', direction: 'asc' }])).toBe(true);
  });

  it('false cuando difiere dirección, campo o longitud', () => {
    expect(sortSpecsEqual(a, [{ field: 'id', direction: 'desc' }])).toBe(false);
    expect(sortSpecsEqual(a, [{ field: 'nombre', direction: 'asc' }])).toBe(false);
    expect(sortSpecsEqual(a, [])).toBe(false);
  });
});
