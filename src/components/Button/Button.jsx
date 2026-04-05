import styles from './Button.module.css';

function Button({ children, onClick, className, size, variant, width}) {
  return (
    <button
      className={`
        ${styles.button}
        ${className}
        ${styles[size]}
        ${styles[variant]}
      `}
      onClick={onClick}
      style={{width: width}}
    >
      {children}
    </button>
  )
}


export default Button;
