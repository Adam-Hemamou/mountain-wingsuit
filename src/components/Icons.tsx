// Stroke icons copied from the mockups.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const HelpIcon = () => (
  <svg {...base}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 0 1 4.9.8c0 1.7-2.4 2.2-2.4 3.7" />
    <path d="M12 17h.01" />
  </svg>
);

export const SoundIcon = ({ muted }: { muted: boolean }) => (
  <svg {...base}>
    <path d="M11 5 6 9H3v6h3l5 4z" />
    {muted ? (
      <>
        <path d="M16 9l5 6" />
        <path d="M21 9l-5 6" />
      </>
    ) : (
      <>
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </>
    )}
  </svg>
);

export const MenuIcon = () => (
  <svg {...base}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </svg>
);

export const AltitudeIcon = () => (
  <svg className="hud__icon hud__icon--alt" viewBox="0 0 26 20" aria-hidden="true">
    <path d="M1 19 L9 6 L13 11 L17 3 L25 19 Z" fill="#9C7BEA" />
    <path d="M9 6 L11.5 10 L13 11 L15 6.5 L17 3 L19 7 L16 8 L13 13 L10.5 9.5 Z" fill="#F1ECFF" />
  </svg>
);

export const SpeedIcon = () => (
  <svg
    className="hud__icon hud__icon--speed"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#B9A8F0"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4.5 17a9 9 0 1 1 15 0" />
    <path d="M12 13 L16.5 8.5" />
    <circle cx="12" cy="13" r="1.4" fill="#B9A8F0" />
  </svg>
);
