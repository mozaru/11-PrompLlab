export function interpolatePlaceholders(template: string, variables: Record<string, any>): string {
  if (!template) return '';
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = variables[key.trim()];
    return value !== undefined ? String(value) : '';
  });
}
