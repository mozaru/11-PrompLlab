import type { RegexFlag } from '../../types/placeholders';

export function flagsToString(flags?: RegexFlag[]): string {
  if (!flags || !flags.length) return '';
  const uniq = Array.from(new Set(flags));
  return uniq.join('');
}
