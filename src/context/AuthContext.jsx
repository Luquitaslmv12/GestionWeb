import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/Firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // info básica del usuario
  const [loading, setLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState(null); // id empresa para filtrar datos

  useEffect(() => {
    const auth = getAuth();
    // Escucha cambios de sesión
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        // Obtener empresaId desde Firestore usuarios/{uid}
        const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
        if (userDoc.exists()) {
          setEmpresaId(userDoc.data().empresaId);
        } else {
          setEmpresaId(null);
        }
      } else {
        setUser(null);
        setEmpresaId(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, empresaId, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para consumir el contexto
export function useAuth() {
  return useContext(AuthContext);
}
