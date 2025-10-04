export async function safeEval(functionCode: string, params: Record<string, any>): Promise<any> {
  const paramNames = Object.keys(params);
  const paramValues = Object.values(params);

  // Cria uma função anônima com parâmetros e corpo fornecidos
  const asyncFunction = new Function(...paramNames, `"use strict"; return (async () => { ${functionCode} })();`);
  return await asyncFunction(...paramValues);
}
