export function interpolatePlaceholders(template: string, variables: Record<string, any>): string {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = variables[key.trim()];
    return value !== undefined ? String(value) : '';
  });
}
