import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function RulesDialog({ open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="rules" onClose={onClose} aria-labelledby="rules-title">
      <h2 id="rules-title">Règles du jeu</h2>
      <ol>
        <li>Choisis ta mise, puis appuie sur <strong>SAUTER</strong>.</li>
        <li>Pendant la chute, le multiplicateur augmente.</li>
        <li>
          Appuie sur <strong>OUVRIR LE PARACHUTE</strong> pour encaisser : gain = mise × multiplicateur.
        </li>
        <li>Si le wingsuit décroche avant, c’est le crash : la mise est perdue.</li>
        <li>
          <strong>Auto cash out</strong> ouvre le parachute automatiquement au multiplicateur choisi.{' '}
          <strong>Auto play</strong> enchaîne les sauts.
        </li>
      </ol>
      <p className="rules__note">
        Prototype de démonstration : le point de crash est tiré au hasard dans ton navigateur. Mises, soldes et gains
        sont fictifs — aucun argent réel, aucun paiement.
      </p>
      <button type="button" className="rules__close" onClick={onClose}>
        Fermer
      </button>
    </dialog>
  );
}
