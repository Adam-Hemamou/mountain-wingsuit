import type { Dispatch } from 'react';
import portrait from '../assets/portrait.jpg';
import { CHIPS, type Action, type GameState } from '../game/engine';
import { eur, mult as fmtMult, parseNum, round2 } from '../game/format';
import { StepperField } from './StepperField';

interface PanelProps {
  state: GameState;
  dispatch: Dispatch<Action>;
}

function Switch({ on }: { on: boolean }) {
  return (
    <span className={`switch${on ? ' switch--on' : ''}`} aria-hidden="true">
      <span className="switch__knob" />
    </span>
  );
}

export function BetPanel({ state, dispatch }: PanelProps) {
  const busy = state.phase === 'FLYING';
  const setBet = (value: number) => dispatch({ type: 'SET_BET', value });
  return (
    <div className="panel panel--bet">
      <span className="panel__title">MISE</span>
      <StepperField
        display={eur(state.bet)}
        label="Mise en euros (fictifs)"
        minusLabel="Diminuer la mise"
        plusLabel="Augmenter la mise"
        disabled={busy}
        onCommit={(t) => setBet(parseNum(t))}
        onMinus={() => setBet(round2(state.bet - 1))}
        onPlus={() => setBet(round2(state.bet + 1))}
      />
      <div className="chips">
        {CHIPS.map((v) => {
          const on = Math.abs(state.bet - v) < 0.001;
          return (
            <button
              key={v}
              type="button"
              className={`chip${on ? ' chip--on' : ''}`}
              aria-pressed={on}
              disabled={busy}
              onClick={() => setBet(v)}
            >
              {v}€
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AutoPanel({ state, dispatch }: PanelProps) {
  const busy = state.phase === 'FLYING';
  const { cashOn, cashAt, autoPlay, count, infinite } = state;
  const setCashAt = (value: number) => dispatch({ type: 'SET_CASH_AT', value });
  return (
    <div className="panel panel--auto">
      <div className="panel__head">
        <span className="panel__title">AUTO CASH OUT</span>
        <button
          type="button"
          className="switch-btn"
          aria-label="Activer l'auto cash out"
          aria-pressed={cashOn}
          disabled={busy}
          onClick={() => dispatch({ type: 'SET_CASH_ON', value: !cashOn })}
        >
          <Switch on={cashOn} />
        </button>
      </div>
      <StepperField
        display={fmtMult(cashAt)}
        label="Multiplicateur d'auto cash out"
        minusLabel="Diminuer le multiplicateur"
        plusLabel="Augmenter le multiplicateur"
        disabled={busy}
        dimmed={!cashOn}
        onCommit={(t) => setCashAt(parseNum(t))}
        onMinus={() => setCashAt(round2(cashAt - 0.5))}
        onPlus={() => setCashAt(round2(cashAt + 0.5))}
      />
      <div className="autoplay">
        <button
          type="button"
          className="autoplay__toggle"
          aria-pressed={autoPlay}
          onClick={() => dispatch({ type: 'SET_AUTO_PLAY', value: !autoPlay })}
        >
          <Switch on={autoPlay} />
          Auto play
        </button>
        <input
          className={`autoplay__count${infinite ? ' autoplay__count--off' : ''}`}
          type="text"
          inputMode="numeric"
          aria-label="Nombre de parties"
          defaultValue={String(count)}
          key={count}
          disabled={infinite}
          onBlur={(e) => dispatch({ type: 'SET_COUNT', value: parseNum(e.target.value) })}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        />
        <span className="autoplay__unit">parties</span>
        <button
          type="button"
          className={`chip chip--square${infinite ? ' chip--on' : ''}`}
          aria-label="Parties illimitées"
          aria-pressed={infinite}
          onClick={() => dispatch({ type: 'SET_INFINITE', value: !infinite })}
        >
          ∞
        </button>
      </div>
    </div>
  );
}

/** Compact label so big multipliers fit under their bar (full value stays in aria-label). */
const shortMult = (m: number) => (m >= 100 ? Math.floor(m) + 'x' : m >= 10 ? m.toFixed(1) + 'x' : fmtMult(m));

export function HistoryPanel({ history }: { history: number[] }) {
  const bars = history.map((m) => ({
    m,
    // Share of the max bar height (log scale, same as the mockups).
    f: m < 1.05 ? 0 : Math.min(86, Math.round(6 + Math.log10(m) * 80)) / 86,
    low: m < 2,
  }));
  return (
    <div className="panel panel--history">
      <span className="panel__title">DERNIÈRES PARTIES</span>
      <div
        className="history__chart"
        role="img"
        aria-label={'Multiplicateurs des 10 dernières parties : ' + history.map(fmtMult).join(', ')}
      >
        {bars.map((b, i) => (
          <div className="history__col" key={i}>
            <div className="history__bar" style={{ height: `calc(var(--bar-max) * ${b.f.toFixed(3)})` }} />
            <div className={`history__base${b.low ? ' history__base--low' : ''}`} />
          </div>
        ))}
      </div>
      <div className="history__labels" aria-hidden="true">
        {bars.map((b, i) => (
          <span key={i}>{shortMult(b.m)}</span>
        ))}
      </div>
    </div>
  );
}

export function PortraitCard() {
  return (
    <div className="portrait">
      <img src={portrait} alt="Portrait du wingsuiter, capuche violette et lunettes noires" />
    </div>
  );
}
