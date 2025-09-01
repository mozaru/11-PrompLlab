export type RegexFlag = 'i' | 'm' | 's';

export type Placeholder = {
  name: string;
  regex: string;
  flags?: RegexFlag[];
  default?: string;
  /** Grupo a retornar: número (0..n) ou nome de grupo nomeado. Omissão => 0 (match inteiro) */
  group?: number | string;
};

export type TestStatus =
  | 'matched_non_empty'
  | 'matched_empty'
  | 'no_match'
  | 'invalid_regex'
  | 'group_not_found';

export type TestResult = {
  name: string;
  status: TestStatus;
  value: string;
  error?: string;
  /** Grupo efetivamente solicitado (normalizado) */
  group?: number | string;
};

/** Extrai nomes de placeholders `{{nome}}` do template. */
export function extractPlaceholderNames(template: string): string[] {
  const re = /{{\s*([A-Za-z0-9_]+)\s*}}/g;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    found.add(m[1]);
  }
  return Array.from(found);
}
