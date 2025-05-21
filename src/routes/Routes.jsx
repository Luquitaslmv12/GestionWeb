import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Camiones from "../pages/Camiones";
import Viajes from "../pages/Viajes";
import GastosPorViaje from "../pages/GastosPorViaje";
import Choferes from "../pages/Choferes";

export default function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Dashboard />} />
            <Route path="/camiones" element={<Camiones />} />
            <Route path="/viajes" element={<Viajes />} />
            <Route path="/gastos" element={<GastosPorViaje />} />
            <Route path="/choferes" element={<Choferes />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}
