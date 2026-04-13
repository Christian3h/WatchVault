import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import Button from '../Button/Button';
// Usar el logo blanco original
// Usar el logo blanco desde la carpeta de favicons (usuario prefirió los íconos blancos)
// Nota: la carpeta tiene paréntesis en el nombre; Vite lo resolverá correctamente.
import logoWhite from '../../assets/favicon (1)/favicon-96x96.png';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  //funcion para cerrar sesion
  const handleSignOut = () => {
    signOut(auth);
  };

  //cargar foto de perfil
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setPhoto(user.photoURL); // Guardamos la foto en el estado
      } else {
        setPhoto(null);
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <img 
            src={logoWhite} 
            alt="WatchVault" 
            className={styles.logoImage}
          />
          <span className={styles.logoText}>WatchVault</span>
        </Link>
        
        <div className={styles.menuContainer}>
          <img src={photo}
            alt="foto de perfil"
            referrerPolicy="no-referrer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
          {isMenuOpen && (
            <div className={styles.dropdown}>
              {/* Estadísticas */}
              <Button 
                size="small" 
                variant="normal" 
                width="100%"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate('/stats');
                }}
              >
                Estadísticas
              </Button>

              {/*
              <Button size="small" variant="normal" width="100%">
                Mi Perfil
              </Button>

              <Button size="small" variant="normal" width="100%">
                Ajustes
              </Button>
              */}

              {/* Botón de alerta con tamaño pequeño */}
              <Button size="small" variant="alert" width="100%" onClick={handleSignOut}>
                Cerrar Sesión
              </Button>

            </div>
          )}
        </div>
      </nav>
    </header>
  );
}


export default Header;
