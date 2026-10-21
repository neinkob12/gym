// Schlichte, gefüllte Symbole für das Geräte-Raster.

import type { EqKind } from "../sim/equipment";

export const EQ_ICON: Record<EqKind | "leg" | "cable" | "deco" | "megaphone", string> = {
  bench: '<svg viewBox="0 0 40 40" fill="currentColor"><rect x="6" y="17" width="28" height="5" rx="2"/><rect x="10" y="22" width="3" height="9" rx="1"/><rect x="27" y="22" width="3" height="9" rx="1"/><rect x="4" y="11" width="3" height="10" rx="1"/><rect x="2" y="9" width="7" height="3" rx="1"/></svg>',
  db: '<svg viewBox="0 0 40 40" fill="currentColor"><rect x="5" y="14" width="6" height="12" rx="2"/><rect x="29" y="14" width="6" height="12" rx="2"/><rect x="11" y="18" width="18" height="4" rx="1"/></svg>',
  lat: '<svg viewBox="0 0 40 40" fill="currentColor"><rect x="24" y="4" width="4" height="32" rx="1"/><rect x="8" y="4" width="20" height="4" rx="1"/><rect x="5" y="12" width="16" height="3" rx="1"/><rect x="11" y="26" width="10" height="4" rx="1"/><rect x="29" y="14" width="6" height="16" rx="1"/></svg>',
  rack: '<svg viewBox="0 0 40 40" fill="currentColor"><rect x="8" y="4" width="4" height="32" rx="1"/><rect x="28" y="4" width="4" height="32" rx="1"/><rect x="8" y="4" width="24" height="3"/><rect x="2" y="16" width="36" height="3" rx="1"/><rect x="2" y="11" width="4" height="13" rx="1"/><rect x="34" y="11" width="4" height="13" rx="1"/></svg>',
  tm: '<svg viewBox="0 0 40 40" fill="currentColor"><path d="M4 30l26-6 6 4-26 6z"/><rect x="28" y="8" width="3" height="18" rx="1"/><rect x="25" y="6" width="10" height="5" rx="1"/></svg>',
  water: '<svg viewBox="0 0 40 40" fill="currentColor"><rect x="12" y="16" width="16" height="20" rx="2"/><rect x="14" y="3" width="12" height="12" rx="3" opacity=".6"/><rect x="17" y="22" width="6" height="3" rx="1" fill="#fff"/></svg>',
  leg: '<svg viewBox="0 0 40 40" fill="currentColor"><path d="M6 30l12-18 4 3-12 18z"/><rect x="20" y="26" width="16" height="5" rx="2"/><rect x="22" y="8" width="10" height="5" rx="2"/></svg>',
  cable: '<svg viewBox="0 0 40 40" fill="currentColor"><rect x="5" y="4" width="4" height="32" rx="1"/><rect x="31" y="4" width="4" height="32" rx="1"/><rect x="5" y="4" width="30" height="3"/><path d="M9 8l10 14M31 8L21 22" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>',
  deco: '<svg viewBox="0 0 40 40" fill="currentColor"><path d="M20 6c4 4 4 10 0 14-4-4-4-10 0-14z"/><path d="M8 14c6 0 10 4 12 8-6 0-10-3-12-8zM32 14c-6 0-10 4-12 8 6 0 10-3 12-8z"/><rect x="14" y="24" width="12" height="11" rx="2"/></svg>',
  megaphone: '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 8h3l7-4v12l-7-4H3z"/><rect x="15" y="8" width="2" height="4"/></svg>',
};
