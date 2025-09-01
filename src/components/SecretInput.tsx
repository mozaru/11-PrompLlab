import { useState } from 'react';

type Props = {
  value?: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  name?: string;
  autoComplete?: string;
};

export function SecretInput({
  value,
  onChange,
  placeholder = '••••••••',
  disabled,
  name,
  autoComplete = 'off',
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <div className="secret-input">
      <input
        type={show ? 'text' : 'password'}
        className="input"
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        name={name}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        className="btn btn-secondary btn-ghost"
        aria-label={show ? 'Ocultar' : 'Mostrar'}
        onClick={() => setShow((s) => !s)}
        disabled={disabled}
      >
        {show ? '🙈' : '👁'}
      </button>
    </div>
  );
}
