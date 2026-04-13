import { useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut as firebaseSignOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Constantes para la caché
const YOUTUBE_TOKEN_KEY = 'youtube_token_cache';
const TOKEN_EXPIRY_MINUTES = 55; // 55 minutos por seguridad (Google expira en 60)

export function useAuth() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Obtiene un NUEVO token de YouTube desde Google
   * (Abre popup de login si es necesario)
   */
  const fetchNewYouTubeToken = useCallback(async () => {
    if (!auth.currentUser) {
      return null;
    }

    try {
      const provider = new GoogleAuthProvider();
      // Asegurar que tenemos el scope de YouTube
      provider.addScope('https://www.googleapis.com/auth/youtube.readonly');
      
      // Esto puede abrir popup si el token anterior expiró
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (!credential?.accessToken) {
        return null;
      }

      const newToken = credential.accessToken;
      
      // Guardar en Firestore (backup)
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userDocRef, {
          youtubeToken: newToken,
          youtubeTokenUpdated: new Date().toISOString()
        }, { merge: true });
      } catch {
        // Continuamos aunque falle Firestore
      }

      // Guardar en caché local
      const cacheData = {
        token: newToken,
        expiresAt: Date.now() + (TOKEN_EXPIRY_MINUTES * 60 * 1000),
        userId: auth.currentUser.uid,
        obtainedAt: new Date().toISOString()
      };
      localStorage.setItem(YOUTUBE_TOKEN_KEY, JSON.stringify(cacheData));

      return newToken;

    } catch (error) {
      // Si el usuario cancela el popup, no hacemos logout
      if (error.code === 'auth/popup-closed-by-user' || 
          error.code === 'auth/cancelled-popup-request') {
        return null;
      }
      
      // Otros errores - no podemos llamar a logout aquí porque crea dependencia circular
      // En su lugar, lanzamos el error y que el componente que llama maneje el logout
      throw error;
    }
  }, []);

  /**
   * Obtiene el token de YouTube desde caché o pide uno nuevo
   */
  const getYoutubeToken = useCallback(async (forceRefresh = false) => {
    if (!auth.currentUser) {
      return null;
    }

    // Si forceRefresh es true, ignorar caché y pedir nuevo
    if (!forceRefresh) {
      // 1. Verificar caché local
      try {
        const cached = localStorage.getItem(YOUTUBE_TOKEN_KEY);
        if (cached) {
          const cacheData = JSON.parse(cached);
          
          // Verificar que sea del mismo usuario
          if (cacheData.userId === auth.currentUser.uid) {
            // Verificar si no expiró
            if (Date.now() < cacheData.expiresAt) {
              return cacheData.token;
            } else {
              localStorage.removeItem(YOUTUBE_TOKEN_KEY);
            }
          }
        }
      } catch {
        localStorage.removeItem(YOUTUBE_TOKEN_KEY);
      }

      // 2. Intentar desde Firestore (fallback)
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (userSnap.exists()) {
          const firestoreToken = userSnap.data()?.youtubeToken;
          if (firestoreToken) {
            // Guardar en caché local
            const cacheData = {
              token: firestoreToken,
              expiresAt: Date.now() + (TOKEN_EXPIRY_MINUTES * 60 * 1000),
              userId: auth.currentUser.uid,
              obtainedAt: new Date().toISOString()
            };
            localStorage.setItem(YOUTUBE_TOKEN_KEY, JSON.stringify(cacheData));
            
            return firestoreToken;
          }
        }
      } catch {
        // Silencioso en producción
      }
    }

    // 3. Pedir NUEVO token (último recurso o forceRefresh)
    return await fetchNewYouTubeToken();
  }, [fetchNewYouTubeToken]);

  /**
   * Verifica si el token actual es válido (sin pedir uno nuevo)
   */
  const hasValidYouTubeToken = useCallback(() => {
    try {
      const cached = localStorage.getItem(YOUTUBE_TOKEN_KEY);
      if (!cached) return false;
      
      const cacheData = JSON.parse(cached);
      return cacheData.userId === auth.currentUser?.uid && 
             Date.now() < cacheData.expiresAt;
    } catch {
      return false;
    }
  }, []);

  /**
   * Limpia la caché del token (útil para logout o cambios de usuario)
   */
  const clearTokenCache = useCallback(() => {
    localStorage.removeItem(YOUTUBE_TOKEN_KEY);
  }, []);

  /**
   * Cierra la sesión del usuario
   */
  const logout = useCallback(async () => {
    try {
      clearTokenCache();
      await firebaseSignOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, [clearTokenCache]);

  return {
    user,
    loading,
    getYoutubeToken,
    hasValidYouTubeToken,
    clearTokenCache,
    logout,
    isAuthenticated: !!user
  };
}
