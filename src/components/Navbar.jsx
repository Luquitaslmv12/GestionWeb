import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import {
  Menu,
  X,
  Truck,
  Home,
  Route,
  DollarSign,
  LogOut,
  Users,
} from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();

  const linkClass = (path) =>
    `flex items-center gap-2 px-3 py-2 rounded-md transition-colors duration-200 ${
      location.pathname === path
        ? "bg-white/30 font-semibold text-white"
        : "text-white hover:bg-white/20"
    }`;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-blue-900 text-white shadow-lg w-full fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-extrabold tracking-wide select-none">
          Gestión de Flota
        </h1>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6 text-lg">
          <Link to="/" className={linkClass("/")}>
            <Home size={20} /> INICIO
          </Link>
          <Link to="/camiones" className={linkClass("/camiones")}>
            <Truck size={20} /> Camiones
          </Link>
          <Link to="/choferes" className={linkClass("/choferes")}>
            <Users size={20} /> Choferes
          </Link>
          <Link to="/viajes" className={linkClass("/viajes")}>
            <Route size={20} /> Viajes
          </Link>
          <Link to="/gastos" className={linkClass("/gastos")}>
            <DollarSign size={20} /> Gastos
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors duration-200"
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} />
            Salir
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-white/20 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-700/90 backdrop-blur-sm px-6 py-4 space-y-3 text-lg">
          <Link
            to="/"
            className={linkClass("/")}
            onClick={() => setIsOpen(false)}
          >
            <Home size={20} /> INICIO
          </Link>
          <Link
            to="/camiones"
            className={linkClass("/camiones")}
            onClick={() => setIsOpen(false)}
          >
            <Truck size={20} /> Camiones
          </Link>
          <Link
            to="/choferes"
            className={linkClass("/choferes")}
            onClick={() => setIsOpen(false)}
          >
            <Users size={20} /> Choferes
          </Link>
          <Link
            to="/viajes"
            className={linkClass("/viajes")}
            onClick={() => setIsOpen(false)}
          >
            <Route size={20} /> Viajes
          </Link>
          <Link
            to="/gastos"
            className={linkClass("/gastos")}
            onClick={() => setIsOpen(false)}
          >
            <DollarSign size={20} /> Gastos
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 w-full transition-colors duration-200"
          >
            <LogOut size={20} />
            Salir
          </button>
        </div>
      )}
    </nav>
  );
}
