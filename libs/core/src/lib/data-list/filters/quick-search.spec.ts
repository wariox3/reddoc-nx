import { quickSearchCondition } from './quick-search';

describe('quickSearchCondition', () => {
  it('arma un filtro contains sobre el campo dado', () => {
    expect(quickSearchCondition('nombre_corto', 'sebastian')).toEqual({
      field: 'nombre_corto',
      operator: 'contains',
      value: 'sebastian',
    });
  });

  it('recorta espacios del término', () => {
    expect(quickSearchCondition('nombre_corto', '  ana  ')).toEqual({
      field: 'nombre_corto',
      operator: 'contains',
      value: 'ana',
    });
  });

  it('devuelve null cuando el término está vacío o solo espacios', () => {
    expect(quickSearchCondition('nombre_corto', '')).toBeNull();
    expect(quickSearchCondition('nombre_corto', '   ')).toBeNull();
  });
});
