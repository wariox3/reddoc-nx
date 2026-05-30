import { parseImportErrors } from './import-dialog.utils';

describe('parseImportErrors', () => {
  it('mapea errores {fila, mensaje} a {row, message} y toma el detail/total', () => {
    const body = {
      detail: 'El archivo tiene problemas estructurales.',
      fase: 'estructural',
      total_errores: 1,
      errores: [{ fila: 2, mensaje: 'Faltan campos requeridos: Tipo identificación, Ciudad' }],
    };
    expect(parseImportErrors(body)).toEqual({
      errors: [{ row: 2, message: 'Faltan campos requeridos: Tipo identificación, Ciudad' }],
      summary: 'El archivo tiene problemas estructurales.',
      total: 1,
    });
  });

  it('capa los errores mostrados a `max` pero conserva el total real', () => {
    const errores = Array.from({ length: 150 }, (_, i) => ({ fila: i + 1, mensaje: `e${i}` }));
    const result = parseImportErrors({ total_errores: 150, errores }, 100);
    expect(result.errors).toHaveLength(100);
    expect(result.total).toBe(150);
  });

  it('usa la cantidad recibida cuando no viene total_errores', () => {
    const result = parseImportErrors({ errores: [{ fila: 1, mensaje: 'x' }] });
    expect(result.total).toBe(1);
    expect(result.summary).toBe('');
  });

  it('extrae el summary aunque no venga la lista de errores (solo detail)', () => {
    expect(parseImportErrors({ detail: 'Sin permisos' })).toEqual({
      errors: [],
      summary: 'Sin permisos',
      total: 0,
    });
  });

  it('acepta el body como string JSON', () => {
    const json = JSON.stringify({ total_errores: 1, errores: [{ fila: 3, mensaje: 'x' }] });
    expect(parseImportErrors(json)).toEqual({
      errors: [{ row: 3, message: 'x' }],
      summary: '',
      total: 1,
    });
  });

  it('devuelve vacío ante un body sin la forma esperada', () => {
    expect(parseImportErrors(null)).toEqual({ errors: [], summary: '', total: 0 });
    expect(parseImportErrors('<html>error</html>')).toEqual({ errors: [], summary: '', total: 0 });
    expect(parseImportErrors(42)).toEqual({ errors: [], summary: '', total: 0 });
  });
});
