import { useEffect, useState } from 'react';

interface Props {
  /** Formatted value shown when the field is not being edited. */
  display: string;
  label: string;
  minusLabel: string;
  plusLabel: string;
  disabled?: boolean;
  dimmed?: boolean;
  inputMode?: 'decimal' | 'numeric';
  onCommit: (text: string) => void;
  onMinus: () => void;
  onPlus: () => void;
}

/** Text field with −/+ buttons. Typing is free; the value is parsed on blur or Enter. */
export function StepperField(p: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  useEffect(() => setDraft(null), [p.display]);

  const commit = () => {
    if (draft !== null) p.onCommit(draft);
    setDraft(null);
  };

  return (
    <div className={`stepper${p.dimmed ? ' stepper--dimmed' : ''}`}>
      <input
        type="text"
        inputMode={p.inputMode ?? 'decimal'}
        aria-label={p.label}
        value={draft ?? p.display}
        disabled={p.disabled}
        onFocus={(e) => e.currentTarget.select()}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
      />
      <button type="button" aria-label={p.minusLabel} onClick={p.onMinus} disabled={p.disabled}>
        −
      </button>
      <button type="button" aria-label={p.plusLabel} onClick={p.onPlus} disabled={p.disabled}>
        +
      </button>
    </div>
  );
}
