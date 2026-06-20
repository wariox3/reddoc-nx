/**
 * Lee el filename del header `Content-Disposition`. Soporta tanto el formato
 * RFC 5987 (`filename*=UTF-8''nombre%20codificado.pdf`) como el clásico
 * (`filename="nombre.pdf"`). Si el header no viene o no es parseable, devuelve
 * el fallback.
 *
 * Importante: para que el navegador exponga este header al JS, el backend debe
 * incluir `Access-Control-Expose-Headers: Content-Disposition` en CORS. Si no,
 * `headers.get('content-disposition')` será `null` y se usará el fallback.
 */
export function parseFilename(contentDisposition: string | null, fallback = 'download'): string {
  if (!contentDisposition) return fallback;

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
  if (utf8Match) {
    try {
      return decodeURIComponent(utf8Match[1].trim());
    } catch {
      return fallback;
    }
  }

  const match = /filename="?([^";]+)"?/i.exec(contentDisposition);
  return match ? match[1].trim() : fallback;
}

/**
 * Crea un object URL temporal a partir del blob, dispara la descarga vía un
 * `<a>` sintético y limpia el URL en el siguiente tick para no filtrar memoria.
 */
export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
