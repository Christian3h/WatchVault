import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { signOut as firebaseSignOut } from "firebase/auth";

export function useAuth() {

  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Suscribirse a cambios en el estado de autenticación de Firebase
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Limpiar la suscripción al desmontar el componente
    return () => unsubscribe();
  }, []);

  /**
   * Obtiene el token de acceso de YouTube (Google OAuth) desde Firestore.
   * @returns {Promise<string|null>} El token de YouTube o null si no existe.
   */
  const getYoutubeToken = useCallback(async () => {
    if (!auth.currentUser) return null;

    try {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        return userSnap.data()?.youtubeToken || null;
      }
      return null;
    } catch (error) {
      if (error.message.includes("network-changed") || error.code === "unavailable" || error.message.includes("BLOCKED_BY_CLIENT")) {
            console.warn("Interrupción de red detectada, reintentando en 1s...");
      }
      console.error("Error recuperando el token de YouTube:", error);
      return null;
    }
  }, []);

  /**
   * Cierra la sesión del usuario en Firebase y redirige al login.
   */
  const logout = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      // Forzamos la redirección para asegurar un estado limpio
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, []) ;

  return {
    user,
    loading,
    getYoutubeToken,
    logout,
    isAuthenticated: !!user
  };
}
