import styles from './Loading.module.css';

/**
 * Loading indicator (spinner overlay, centered, a11y, theming)
 * Usage:
 *   if (loading) return <Loading text="Cargando..." variant="overlay" />;
 * Variants: 'overlay' (full screen), 'inline' (for small blocks).
 */
export default function Loading({ text = 'Cargando...', variant = 'overlay' }) {
  // If dark mode/body class needed, adapt: use prefers-color-scheme/media query CSS.
  return (
    <div className={
      variant === 'overlay' ? styles.overlay : styles.inline
    } role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true"></span>
      <span className={styles.text}>{text}</span>
      {/* For a11y readers only */}
      <span className={styles.srOnly}>Cargando…</span>
    </div>
  );
}
