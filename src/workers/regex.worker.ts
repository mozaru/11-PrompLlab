/// <reference lib="webworker" />

type Job = { name: string; regex: string; flags?: string; default?: string; group?: number | string };
type Req = { text: string; jobs: Job[] };
type Status = 'matched_non_empty' | 'matched_empty' | 'no_match' | 'invalid_regex' | 'group_not_found';
type Res = { name: string; status: Status; value: string; error?: string; group?: number | string };

self.onmessage = (e: MessageEvent<Req>) => {
  const { text, jobs } = e.data;
  const results: Res[] = jobs.map((j) => {
    try {
      const re = new RegExp(j.regex, j.flags ?? '');
      const m = re.exec(text);
      if (!m) return { name: j.name, status: 'no_match', value: j.default ?? '', group: j.group };

      // decidir valor com base no group
      let v: string | undefined;
      const g = j.group;

      if (g === undefined || g === null || g === '' || (typeof g === 'number' && g === 0)) {
        // match inteiro
        v = m[0] ?? '';
      } else if (typeof g === 'number' || (typeof g === 'string' && /^\d+$/.test(g))) {
        // índice numérico
        const idx = typeof g === 'number' ? g : parseInt(g, 10);
        if (idx >= 0 && idx < m.length) {
          v = m[idx] ?? '';
        } else {
          return { name: j.name, status: 'group_not_found', value: j.default ?? '', group: g };
        }
      } else if (typeof g === 'string') {
        // grupo nomeado
        const named = (m as any).groups?.[g];
        if (named === undefined) {
          return { name: j.name, status: 'group_not_found', value: j.default ?? '', group: g };
        }
        v = String(named);
      }

      if (v === undefined) v = '';
      if (v.length === 0) return { name: j.name, status: 'matched_empty', value: '', group: g };
      return { name: j.name, status: 'matched_non_empty', value: v, group: g };
    } catch (err: any) {
      return { name: j.name, status: 'invalid_regex', value: j.default ?? '', error: String(err?.message ?? err), group: j.group };
    }
  });
  (self as any).postMessage(results);
};
