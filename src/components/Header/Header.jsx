import styles from './Header.module.css';

export default function Header({ onSearch }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>WatchVault</div>
      <input
        className={styles.search}
        type="text"
        placeholder="Buscar video, canal, categoría…"
        onChange={e => onSearch && onSearch(e.target.value)}
      />
      <div className={styles.avatar}>{/* icono/avatar/logout futuro */}</div>
    </header>
  );
}
