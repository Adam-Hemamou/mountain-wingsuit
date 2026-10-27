import { round2 } from './format';

export type Phase = 'READY' | 'FLYING' | 'CASHED_OUT' | 'CRASHED';

export interface GameState {
  phase: Phase;
  mult: number;
  crashAt: number;
  cashedAt: number | null;
  /** Stake of the round in progress / last round (for the gain pill). */
  roundBet: number;
  round: number;
  bet: number;
  balance: number;
  cashOn: boolean;
  cashAt: number;
  autoPlay: boolean;
  count: number;
  infinite: boolean;
  left: number;
  history: number[];
}

export const BET_MIN = 0.1;
export const BET_MAX = 100;
export const CASH_MIN = 1.01;
export const CHIPS = [1, 5, 10, 50] as const;
/** Delay before the multiplier starts climbing (launch animation). */
export const LAUNCH_MS = 700;
/** Growth rate of the multiplier: m(t) = e^(RATE·t). */
export const RATE = 0.00014;
/** Pause between two Auto Play rounds. */
export const NEXT_ROUND_MS = 2200;

export const initialState: GameState = {
  phase: 'READY',
  mult: 1,
  crashAt: 2,
  cashedAt: null,
  roundBet: 10,
  round: 1,
  bet: 10,
  balance: 1000,
  cashOn: true,
  cashAt: 5,
  autoPlay: false,
  count: 10,
  infinite: false,
  left: 0,
  history: [1.24, 2.11, 6.83, 1.02, 3.56, 1.18, 4.21, 2.73, 1.09, 9.12],
};

/** Local random crash point (3 % edge), capped at 1000x. Fictional simulation only. */
export function drawCrashPoint(rand = Math.random()): number {
  return Math.min(1000, Math.max(1, Math.floor((0.97 / (1 - rand)) * 100) / 100));
}

export function multAt(elapsedMs: number): number {
  return Math.exp(RATE * Math.max(0, elapsedMs - LAUNCH_MS));
}

export type Action =
  | { type: 'START'; fromAuto: boolean; crashAt: number }
  | { type: 'TICK'; mult: number }
  | { type: 'CASH_OUT' }
  | { type: 'SET_BET'; value: number }
  | { type: 'SET_CASH_ON'; value: boolean }
  | { type: 'SET_CASH_AT'; value: number }
  | { type: 'SET_AUTO_PLAY'; value: boolean }
  | { type: 'SET_COUNT'; value: number }
  | { type: 'SET_INFINITE'; value: boolean }
  | { type: 'RESET_BALANCE' };

const pushHistory = (h: number[], m: number) => h.concat([m]).slice(-10);

function cashOut(s: GameState, at: number): GameState {
  return {
    ...s,
    phase: 'CASHED_OUT',
    mult: at,
    cashedAt: at,
    balance: round2(s.balance + s.roundBet * at),
    history: pushHistory(s.history, s.crashAt),
  };
}

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case 'START': {
      if (s.phase === 'FLYING') return s;
      if (s.bet <= 0 || s.bet > s.balance) return { ...s, autoPlay: false };
      const left = a.fromAuto ? s.left - 1 : s.autoPlay ? s.count - 1 : 0;
      return {
        ...s,
        phase: 'FLYING',
        mult: 1,
        crashAt: a.crashAt,
        cashedAt: null,
        roundBet: s.bet,
        // Jump n°1 is the first one; READY only exists before it.
        round: s.phase === 'READY' ? s.round : s.round + 1,
        balance: round2(s.balance - s.bet),
        left,
      };
    }
    case 'TICK': {
      if (s.phase !== 'FLYING') return s;
      if (a.mult >= s.crashAt) {
        return { ...s, phase: 'CRASHED', mult: s.crashAt, history: pushHistory(s.history, s.crashAt) };
      }
      if (s.cashOn && a.mult >= s.cashAt) return cashOut(s, s.cashAt);
      return { ...s, mult: a.mult };
    }
    case 'CASH_OUT':
      return s.phase === 'FLYING' ? cashOut(s, s.mult) : s;
    case 'SET_BET':
      return s.phase === 'FLYING' ? s : { ...s, bet: round2(Math.min(BET_MAX, Math.max(BET_MIN, a.value))) };
    case 'SET_CASH_ON':
      return s.phase === 'FLYING' ? s : { ...s, cashOn: a.value };
    case 'SET_CASH_AT':
      return s.phase === 'FLYING' ? s : { ...s, cashAt: round2(Math.min(1000, Math.max(CASH_MIN, a.value))) };
    case 'SET_AUTO_PLAY':
      return { ...s, autoPlay: a.value, left: s.count };
    case 'SET_COUNT':
      return { ...s, count: Math.max(1, Math.min(999, Math.round(a.value) || 1)) };
    case 'SET_INFINITE':
      return { ...s, infinite: a.value };
    case 'RESET_BALANCE':
      return s.phase === 'FLYING' ? s : { ...s, balance: initialState.balance };
  }
}
