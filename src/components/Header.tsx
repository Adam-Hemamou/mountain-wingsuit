import { useEffect, useRef, useState } from 'react';
import portrait from '../assets/portrait.jpg';
import { eur } from '../game/format';
import { HelpIcon, MenuIcon, SoundIcon } from './Icons';

interface Props {
  balance: number;
  canReset: boolean;
  onRules: () => void;
  onResetBalance: () => void;
}

export function Header({ balance, canReset, onRules, onResetBalance }: Props) {
  const [muted, setMuted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);

  return (
    <header className="topbar">
      {/* Mobile only: portrait moves into the header */}
      <img className="topbar__avatar" src={portrait} alt="" />
      <div className="topbar__brand">
        <span className="topbar__logo">
          MOUNTAIN <span className="accent-text">WINGSUIT</span>
        </span>
        <span className="topbar__balance-inline">
          Solde démo <strong>{eur(balance)}</strong>
        </span>
      </div>
      <div className="topbar__spacer" />
      <div className="topbar__balance">
        <span className="topbar__balance-label">Solde démo</span>
        <span className="topbar__balance-value">{eur(balance)}</span>
      </div>
      <button type="button" className="icon-btn" aria-label="Règles du jeu" onClick={onRules}>
        <HelpIcon />
      </button>
      <button
        type="button"
        className="icon-btn topbar__sound"
        aria-label="Son"
        aria-pressed={!muted}
        onClick={() => setMuted((m) => !m)}
      >
        <SoundIcon muted={muted} />
      </button>
      <div className="topbar__menu" ref={menuRef}>
        <button
          type="button"
          className="icon-btn"
          aria-label="Menu"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <MenuIcon />
        </button>
        {menuOpen && (
          <div className="topbar__dropdown" role="menu">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onRules();
              }}
            >
              Règles du jeu
            </button>
            <button
              type="button"
              role="menuitem"
              disabled={!canReset}
              onClick={() => {
                setMenuOpen(false);
                onResetBalance();
              }}
            >
              Réinitialiser le solde démo
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
