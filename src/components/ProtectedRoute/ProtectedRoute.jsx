import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import Loading from "../Loading/Loading";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe(); // limpia el listener cuando se desmonta
  }, []);

  if (loading) return <Loading text="Cargando..." variant="overlay" />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
