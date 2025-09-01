/**
 * Renderiza um template substituindo {{nome}} por values[nome].
 * - Se não houver valor, mantém o placeholder (keepUnresolved=true) ou substitui por "".
 * - Sanitização básica: não altera newlines, preserva texto.
 */
export function renderTemplate(
  tpl: string,
  values: Record<string, string | undefined>,
  opts?: { keepUnresolved?: boolean }
): string {
  const keep = opts?.keepUnresolved ?? true;
  return tpl.replace(/{{\s*([A-Za-z0-9_]+)\s*}}/g, (_all, name: string) => {
    const v = values[name];
    if (typeof v === 'string') return v;
    return keep ? `{{${name}}}` : '';
  });
}
