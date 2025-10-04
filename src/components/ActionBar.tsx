import { type ReactNode } from 'react';

export type AppActionVariant = 'primary' | 'secondary' | 'danger';

export type AppActionId =
  | 'openConfig'
  | 'newProject'
  | 'loadProject'
  | 'openPrompts'
  | 'openHistory'
  | 'openRegex'
  | 'openBatch'
  | 'saveProject'
  | 'importProject'
  | 'exportProject'
  | 'goHome'
  | (string & {}); // permite ids específicos por tela

export interface AppAction {
  id: AppActionId;
  label: string;
  variant?: AppActionVariant;
  disabled?: boolean;
  tooltip?: string;
  icon?: ReactNode; // opcional (ex.: <IconSettings />)
  'data-testid'?: string;
}

type Props = {
  actions: AppAction[];
  onAction?: (id: AppActionId) => void;
  align?: 'left' | 'center' | 'right' | 'space-between';
  wrap?: boolean; // default true
};

export function ActionBar({ actions, onAction, align = 'center', wrap = true }: Props) {
  return (
    <div
      className="action-bar"
      style={{
        justifyContent:
          align === 'left'
            ? 'flex-start'
            : align === 'right'
            ? 'flex-end'
            : align === 'space-between'
            ? 'space-between'
            : 'center',
        flexWrap: wrap ? 'wrap' as const : 'nowrap' as const,
      }}
    >
      {actions.map((a) => {
        const v = a.variant ?? 'secondary';
        const classes =
          v === 'primary' ? 'btn btn-primary' : v === 'danger' ? 'btn btn-danger' : 'btn btn-secondary';
        return (
          <button
            key={a.id}
            className={classes}
            title={a.tooltip}
            onClick={() => onAction?.(a.id)}
            disabled={a.disabled}
            data-testid={a['data-testid']}
            aria-label={a.label}
          >
            {a.icon ? <span style={{ display: 'inline-flex', marginRight: 8 }}>{a.icon}</span> : null}
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
