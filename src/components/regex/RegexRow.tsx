import type { Placeholder, RegexFlag, TestResult } from '../../types/placeholders';
import { usePlaceholders } from '../../state/placeholders.store';

const FLAG_LIST: RegexFlag[] = ['i', 'm', 's'];

export function RegexRow({ ph, result, onTest }: {
  ph: Placeholder;
  result?: TestResult;
  onTest: (name: string) => void;
}) {
  const setRegex = usePlaceholders((s) => s.setRegex);
  const setFlags = usePlaceholders((s) => s.setFlags);
  const setDefault = usePlaceholders((s) => s.setDefault);
  const setGroup = usePlaceholders((s) => s.setGroup);
  const remove = usePlaceholders((s) => s.remove);

  const flags = new Set(ph.flags ?? []);

  return (
    <tr>
      <td className="mono">{`{{${ph.name}}}`}</td>
      <td>
        <input
          className="input"
          value={ph.regex}
          onChange={(e) => setRegex(ph.name, e.target.value)}
          placeholder="ex.: ^Nome:(.*)$ ou (?<nome>...)"
        />
      </td>
      <td>
        <div className="flags">
          {FLAG_LIST.map((f) => (
            <label key={f} className="flag">
              <input
                type="checkbox"
                checked={flags.has(f)}
                onChange={(e) => {
                  const next = new Set(flags);
                  if (e.target.checked) next.add(f); else next.delete(f);
                  setFlags(ph.name, Array.from(next) as RegexFlag[]);
                }}
              />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </td>
      <td>
        <input
          className="input"
          value={ph.group === undefined ? '' : String(ph.group)}
          onChange={(e) => {
            const raw = e.target.value.trim();
            setGroup(ph.name, raw === '' ? undefined : raw);
          }}
          placeholder="0 = match inteiro, 1..n ou nome"
        />
        <p className="hint">Deixe vazio para usar o match completo.</p>
      </td>
      <td>
        <input
          className="input"
          value={ph.default ?? ''}
          onChange={(e) => setDefault(ph.name, e.target.value)}
          placeholder="valor default"
        />
      </td>
      <td className="actions">
        <button className="btn btn-secondary" onClick={() => onTest(ph.name)}>Testar</button>
        <button className="btn btn-danger" onClick={() => remove(ph.name)}>Remover</button>
      </td>
      <td className="status">
        {result ? (
          <span className={`badge ${cls(result.status)}`}>
            {human(result.status)}
          </span>
        ) : <span className="badge">—</span>}
      </td>
    </tr>
  );
}

function human(s: TestResult['status']): string {
  switch (s) {
    case 'matched_non_empty': return 'match (≠ vazio)';
    case 'matched_empty': return 'match (vazio)';
    case 'no_match': return 'sem match';
    case 'invalid_regex': return 'regex inválida';
    case 'group_not_found': return 'grupo não encontrado';
  }
}

function cls(s: TestResult['status']): string {
  switch (s) {
    case 'matched_non_empty': return 'badge--ok';
    case 'matched_empty': return 'badge--warn';
    case 'no_match': return 'badge--warn';
    case 'invalid_regex': return 'badge--error';
    case 'group_not_found': return 'badge--error';
  }
}
