/** "1 234,50 €" — same formatting as the mockups. All amounts are fictional. */
export function eur(n: number): string {
  const [int, dec] = (Math.round(n * 100) / 100).toFixed(2).split('.');
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ',' + dec + ' €';
}

export function mult(m: number): string {
  return m.toFixed(2) + 'x';
}

/** Lenient number parser: accepts "10,5", "10.5 €", "2.00x"... */
export function parseNum(v: string): number {
  const n = parseFloat(v.replace(',', '.').replace(/[^0-9.]/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

export const round2 = (n: number) => Math.round(n * 100) / 100;
