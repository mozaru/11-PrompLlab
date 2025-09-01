type BadgeStatus = 'ok' | 'warn' | 'error';

export function Badge({ label, status }: { label: string; status: BadgeStatus }) {
  return <span className={`badge badge--${status}`}>{label}</span>;
}
