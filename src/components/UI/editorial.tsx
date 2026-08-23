// Gedeelde redactionele bouwstenen (match-programme stijl). Zie
// src/styles/globals.css voor .section-head / .section-index / .section-title /
// .section-rule / .kicker.

// Chalk-hairline voor lijst- en tabelscheidingen.
export const HAIRLINE = '1px solid var(--color-line, var(--color-border))';

// Genummerde sectiekop met rode rule. index optioneel (bv. "01").
export const SectieKop = ({ index, titel }: { index?: string; titel: string }) => (
  <div className="section-head">
    {index && <span className="section-index">{index}</span>}
    <span className="section-title">{titel}</span>
    <span className="section-rule" />
  </div>
);
