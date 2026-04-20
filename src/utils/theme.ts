// CSS variable tokens — used in inline styles so they respond to light/dark mode.
// Define values in index.css under :root and html.light-mode.

export const tk = {
  // Surfaces
  cardBg:    'var(--c-surface)',
  cardBg2:   'var(--c-surface2)',
  cardBorder:'var(--c-border)',
  cardBorder2:'var(--c-border2)',

  // Text
  text:   'var(--c-text)',
  text2:  'var(--c-text2)',
  text3:  'var(--c-text3)',
  text4:  'var(--c-text4)',
  text5:  'var(--c-text5)',

  // Input
  inputBg:     'var(--c-input-bg)',
  inputBorder: 'var(--c-input-border)',
} as const;
