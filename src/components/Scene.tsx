import type { CSSProperties } from 'react';
import crashArt from '../assets/crash-tall.jpg';
import parachute from '../assets/parachute.png';
import sceneArt from '../assets/scene-tall.jpg';
import wingsuit from '../assets/wingsuit-back.png';
import { RATE, type GameState } from '../game/engine';
import { eur, mult as fmtMult } from '../game/format';
import type { Breakpoint } from '../hooks/useBreakpoint';
import { AltitudeIcon, SpeedIcon } from './Icons';

interface Props {
  state: GameState;
  bp: Breakpoint;
  onJump: () => void;
  onCashOut: () => void;
  onStopAuto: () => void;
  onFairness: () => void;
}

/** Speed-streak fan, per format (values from the mockups). */
const STREAKS: Record<Breakpoint, { n: number; from: number; span: number; mod: number; thick: number }> = {
  mobile: { n: 14, from: -150, span: 300, mod: 80, thick: 3 },
  tablet: { n: 16, from: -155, span: 310, mod: 85, thick: 3 },
  desktop: { n: 18, from: -160, span: 320, mod: 85, thick: 4 },
};

function streaks(bp: Breakpoint) {
  const c = STREAKS[bp];
  return Array.from({ length: c.n }, (_, i) => ({
    angle: Math.round(c.from + i * (c.span / (c.n - 1)) + (i % 2 ? 5 : -4)),
    delay: ((i * 37) % c.mod) / 100,
    w: i % 3 === 0 ? c.thick : 2,
  }));
}

export function Scene({ state, bp, onJump, onCashOut, onStopAuto, onFairness }: Props) {
  const { phase, mult, cashedAt, crashAt, roundBet, bet, balance, autoPlay, infinite, left, round } = state;
  const ready = phase === 'READY';
  const flying = phase === 'FLYING';
  const cashed = phase === 'CASHED_OUT';
  const crashed = phase === 'CRASHED';
  const ended = cashed || crashed;

  // Progress of the dive, 0 → 1 (same curve as the mockups).
  const prog = 1 - Math.exp(-Math.log(mult) / RATE / 9000);
  const altitude = Math.round((3200 - prog * 2600) / 2) * 2;
  const speed = ready ? 0 : cashed ? 18 : Math.round(120 + prog * 110);

  // Zoom + downward drift of the backdrop. Amplitudes are per format in _scene.scss;
  // the drift is bounded by the zoom overhang so the image edge never shows.
  const bgStyle = {
    '--prog': prog.toFixed(4),
    '--settle': cashed ? 0.12 : 0,
    transition: ready ? 'none' : cashed ? 'transform 2200ms cubic-bezier(.1,.7,.2,1)' : 'transform 120ms linear',
  } as CSSProperties;
  // The flyer drifts away from the summit: smaller and higher as the dive goes on.
  const distanceStyle: CSSProperties = {
    transform: `translateY(${(-prog * 9).toFixed(2)}%) scale(${(1 - prog * 0.2).toFixed(4)})`,
  };

  // Main button
  let main = { label: 'SAUTER', sub: 'Mise ' + eur(bet), mod: 'jump', action: onJump, disabled: false };
  if (flying) main = { label: 'OUVRIR LE PARACHUTE', sub: 'Encaisser ' + eur(roundBet * mult), mod: 'cash', action: onCashOut, disabled: false };
  else if (ended && autoPlay)
    main = { label: 'ARRÊTER L’AUTO PLAY', sub: 'Prochain saut dans 2 s', mod: 'stop', action: onStopAuto, disabled: false };
  else if (ended) main = { ...main, label: 'RESAUTER' };
  if ((ready || (ended && !autoPlay)) && (bet > balance || bet <= 0)) {
    main = { ...main, sub: 'Solde démo insuffisant', disabled: true };
  }

  const leftStr = infinite ? 'illimité' : `${Math.max(0, left)} restante${left > 1 ? 's' : ''}`;
  const showAuto = autoPlay && (bp !== 'mobile' || flying);

  return (
    <section className={`scene scene--${phase.toLowerCase()}`} aria-label="Zone de jeu">
      {/* One un-mirrored backdrop, cropped with object-fit: cover. It stays under the
          crash art (frozen at the crash zoom) so the crash fades in over the same place. */}
      <img className="scene__bg" src={sceneArt} alt="" style={bgStyle} />
      <div className="scene__vignette" aria-hidden="true" />

      {crashed && (
        <>
          <div className="scene__crash ws-shake">
            <img
              className="scene__crash-img ws-crash-in"
              src={crashArt}
              alt="Le wingsuiter s'écrase contre la falaise, parachute déchiré"
            />
          </div>
          <div className="scene__flash ws-flash" aria-hidden="true" />
        </>
      )}

      {flying && (
        <div className="scene__streaks" aria-hidden="true">
          {streaks(bp).map((s, i) => (
            <div key={i} className="scene__streak-axis" style={{ transform: `rotate(${s.angle}deg)` }}>
              <div className="scene__streak ws-streak" style={{ width: s.w, animationDelay: `${s.delay}s` }} />
            </div>
          ))}
        </div>
      )}

      {(ready || flying) && (
        <div className="scene__flyer">
          <div className="scene__distance" style={distanceStyle}>
            <div className={flying ? 'ws-launch' : ''} key={flying ? `fly-${round}` : 'ready'}>
              <img className={flying ? 'ws-sway' : ''} src={wingsuit} alt="Le wingsuiter vu de dos, en vol" />
            </div>
          </div>
        </div>
      )}

      {cashed && (
        <div className="scene__chute ws-deploy">
          <img className="ws-float" src={parachute} alt="Le wingsuiter sous son parachute ouvert" />
        </div>
      )}

      <div className="scene__shade" aria-hidden="true" />

      <div className="hud hud--left">
        <AltitudeIcon />
        <div className="hud__text">
          <span className="hud__label">ALTITUDE</span>
          <span className="hud__value">{altitude.toLocaleString('fr-FR')} m</span>
        </div>
      </div>
      <div className="hud hud--right">
        <SpeedIcon />
        <div className="hud__text">
          <span className="hud__label">VITESSE</span>
          <span className="hud__value">{speed} km/h</span>
        </div>
      </div>

      <div className="scene__center">
        {ready && <span className="pill pill--ready ws-pop">PRÊT À SAUTER</span>}
        {cashed && <span className="pill pill--cashed ws-pop">ENCAISSÉ !</span>}
        <div className="multiplier">
          {crashed && (
            <svg className="multiplier__burst ws-pop" viewBox="0 0 260 104" aria-hidden="true">
              <polygon
                points="20,52 44,34 30,12 66,22 84,2 104,20 130,6 152,22 178,4 192,24 230,14 220,38 252,52 222,64 238,92 196,82 176,102 152,84 128,100 108,82 80,98 66,78 28,90 40,66"
                fill="#2A0710"
                stroke="#FF3B5C"
                strokeWidth="3"
              />
            </svg>
          )}
          {cashed && (
            <div className="multiplier__sparkles" aria-hidden="true">
              <i className="ws-twinkle" />
              <i className="ws-twinkle" />
              <i className="ws-twinkle" />
              <i className="ws-twinkle" />
            </div>
          )}
          <span className="multiplier__value">{fmtMult(mult)}</span>
        </div>
        {(ready || flying) && (
          <svg className="arc" viewBox="0 0 220 36" aria-hidden="true">
            <path d="M10 32 Q110 0 210 32" pathLength={100} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="6" strokeLinecap="round" />
            <path
              d="M10 32 Q110 0 210 32"
              pathLength={100}
              fill="none"
              stroke="#B57BFF"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(2, Math.round(prog * 100))} 100`}
            />
          </svg>
        )}
        {cashed && cashedAt !== null && <span className="pill pill--gain ws-pop">+ {eur(roundBet * cashedAt)}</span>}
        {crashed && <span className="pill pill--crash ws-pop">CRASH !</span>}
      </div>

      <p className="sr-only" aria-live="polite">
        {cashed && cashedAt !== null ? `Encaissé à ${fmtMult(cashedAt)}, gain ${eur(roundBet * cashedAt)}.` : ''}
        {crashed ? `Crash à ${fmtMult(crashAt)}.` : ''}
      </p>

      {cashed && <span className="scene__reveal">Le wingsuit aurait décroché à {fmtMult(crashAt)}</span>}

      <div className="scene__meta">
        <button type="button" className="scene__chip scene__chip--link" onClick={onFairness}>
          Équité vérifiable
        </button>
        <span className="scene__chip scene__chip--round">Saut n° {round}</span>
      </div>
      {showAuto && (
        <span className="scene__auto">
          <span className="scene__auto-long">Auto play · </span>
          <span className="scene__auto-short">Auto · </span>
          {leftStr}
        </span>
      )}

      <div className="scene__action">
        <button
          type="button"
          className={`main-btn main-btn--${main.mod}`}
          onClick={main.action}
          disabled={main.disabled}
        >
          <span className="main-btn__label">{main.label}</span>
          <span className="main-btn__sub">{main.sub}</span>
        </button>
      </div>
    </section>
  );
}
