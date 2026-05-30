import { FILTER_OPERATORS, getOperatorDef, getOperatorsForType } from './filter-operators';

describe('FILTER_OPERATORS', () => {
  it('expone operadores para cada tipo de campo', () => {
    expect(getOperatorsForType('string').length).toBeGreaterThan(0);
    expect(getOperatorsForType('number').length).toBeGreaterThan(0);
    expect(getOperatorsForType('boolean').length).toBeGreaterThan(0);
    expect(getOperatorsForType('date').length).toBeGreaterThan(0);
  });

  it('string incluye "contiene" mapeado al operador semántico contains', () => {
    const def = getOperatorDef('string', 'contiene');
    expect(def).toMatchObject({ operator: 'contains', valueKind: 'text' });
  });

  it('string ofrece vacío / no vacío como is_null sin valor con fixedValue', () => {
    expect(getOperatorDef('string', 'vacio')).toMatchObject({
      operator: 'isNull',
      valueKind: 'none',
      fixedValue: true,
    });
    expect(getOperatorDef('string', 'noVacio')).toMatchObject({
      operator: 'isNull',
      valueKind: 'none',
      fixedValue: false,
    });
  });

  it('boolean ofrece es sí / es no como eq sin valor con fixedValue', () => {
    expect(getOperatorDef('boolean', 'esVerdadero')).toMatchObject({
      operator: 'eq',
      valueKind: 'none',
      fixedValue: true,
    });
    expect(getOperatorDef('boolean', 'esFalso')).toMatchObject({
      operator: 'eq',
      valueKind: 'none',
      fixedValue: false,
    });
  });

  it('number usa controles numéricos para los comparadores', () => {
    expect(getOperatorDef('number', 'mayor')).toMatchObject({
      operator: 'gt',
      valueKind: 'number',
    });
    expect(getOperatorDef('number', 'menorIgual')).toMatchObject({
      operator: 'lte',
      valueKind: 'number',
    });
  });

  it('los labelKeys apuntan al namespace common.filters.operators', () => {
    for (const ops of Object.values(FILTER_OPERATORS)) {
      for (const op of ops) {
        expect(op.labelKey.startsWith('common.filters.operators.')).toBe(true);
      }
    }
  });

  it('getOperatorDef devuelve undefined para un id inexistente', () => {
    expect(getOperatorDef('string', 'no_existe')).toBeUndefined();
  });
});
