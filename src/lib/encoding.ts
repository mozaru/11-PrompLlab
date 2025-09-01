/** Decodifica ArrayBuffer tentando UTF-8 (fatal). Se falhar, usa ISO-8859-1. */
export function decodeBufferToText(buf: ArrayBuffer): string {
  try {
    const dec = new TextDecoder('utf-8', { fatal: true });
    return dec.decode(new Uint8Array(buf));
  } catch {
    const dec = new TextDecoder('iso-8859-1');
    return dec.decode(new Uint8Array(buf));
  }
}

/** Lê um File como texto usando o decode acima. */
export async function readFileAsText(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  return decodeBufferToText(buf);
}
