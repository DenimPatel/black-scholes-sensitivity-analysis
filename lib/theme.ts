/**
 * Broadsheet palette — shared with the companion site at
 * github.com/DenimPatel/transformer-inference-roofline-explorer. Near-black
 * serif on paper white, with cyan and magenta used sparingly as spot color.
 *
 * The CSS custom properties in `index.css` are the source of truth for
 * anything rendered by CSS; these constants exist for the places that must
 * hand a literal color to a chart library (Recharts) or an SVG attribute.
 */

export const INK = '#201e1d';
export const PAPER = '#f3f2f2';
export const SURFACE = '#eae9e9';

/** Warm newsprint greys (the remapped "slate" ramp). */
export const NEUTRAL = {
  100: '#f8f4f4',
  200: '#eae7e7',
  300: '#d7d3d3',
  400: '#928e8e',
  500: '#7d7979',
  600: '#605d5d',
  700: '#444141',
  800: '#2d2b2b',
  900: '#201e1d',
} as const;

/** Primary spot color: cyan. */
export const ACCENT = {
  100: '#e9f8ff',
  200: '#cbeeff',
  300: '#99e0ff',
  400: '#62c5ee',
  500: '#38a6cf',
  600: '#1186ac',
  700: '#006786',
  800: '#004961',
  900: '#0a303e',
} as const;

/** Secondary spot color: magenta. */
export const ACCENT_2 = {
  100: '#fff1f4',
  200: '#ffdee6',
  300: '#ffc0d0',
  400: '#ff90b1',
  500: '#ff458e',
  600: '#d6006c',
  700: '#aa0b56',
  800: '#790e3d',
  900: '#4b1528',
} as const;

/** Muted semantic hues, kept at newsprint saturation. */
export const GREEN = '#2f8365';
export const MUSTARD = '#c8963a';
export const PLUM = '#7b4b90';

/**
 * Named roles for the Black-Scholes / Greeks chart components. Recharts
 * wants literal colors, so these mirror the CSS custom properties rather
 * than reading them.
 */
export const GREEK_COLORS = {
  callPrimary: ACCENT[700],
  putPrimary: ACCENT_2[600],
  gamma: PLUM,
  vega: ACCENT[400],
  callSecondary: MUSTARD,
  putSecondary: GREEN,
  itmFill: ACCENT_2[500],
  otmFill: GREEN,
  markerFill: PAPER,
  markerStroke: INK,
  lightAccent: ACCENT[300],
  lightAccent2: ACCENT_2[300],
  axisTick: NEUTRAL[600],
  axisLine: NEUTRAL[300],
  gridLine: 'color-mix(in srgb, #201e1d 10%, transparent)',
  tooltipBg: INK,
  tooltipBorder: NEUTRAL[700],
  comparisonPalette: [ACCENT[700], ACCENT[400], PLUM, MUSTARD, ACCENT_2[600]],
} as const;
