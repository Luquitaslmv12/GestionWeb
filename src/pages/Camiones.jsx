import { useEffect, useState } from "react";
import { db } from "../services/Firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Camiones() {
  const { empresaId } = useAuth();
  const [camiones, setCamiones] = useState([]);
  const [nuevoCamion, setNuevoCamion] = useState({
    patente: "",
    marca: "",
    modelo: "",
    año: "",
  });

  const camionesRef = empresaId
    ? collection(db, "empresas", empresaId, "camiones")
    : null;

  useEffect(() => {
    if (!camionesRef) return;

    const obtenerCamiones = async () => {
      const snapshot = await getDocs(camionesRef);
      setCamiones(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    obtenerCamiones();
  }, [empresaId]);

  const agregarCamion = async () => {
    if (!nuevoCamion.patente.trim()) return;
    await addDoc(camionesRef, nuevoCamion);
    setNuevoCamion({ patente: "", marca: "", modelo: "", año: "" });
    const snapshot = await getDocs(camionesRef);
    setCamiones(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const eliminarCamion = async (id) => {
    await deleteDoc(doc(camionesRef, id));
    setCamiones(camiones.filter((camion) => camion.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Camiones</h1>

        {/* Formulario agregar */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Patente"
            value={nuevoCamion.patente}
            onChange={(e) =>
              setNuevoCamion({ ...nuevoCamion, patente: e.target.value })
            }
          />
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Marca"
            value={nuevoCamion.marca}
            onChange={(e) =>
              setNuevoCamion({ ...nuevoCamion, marca: e.target.value })
            }
          />
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Modelo"
            value={nuevoCamion.modelo}
            onChange={(e) =>
              setNuevoCamion({ ...nuevoCamion, modelo: e.target.value })
            }
          />
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Año"
            type="number"
            value={nuevoCamion.año}
            onChange={(e) =>
              setNuevoCamion({ ...nuevoCamion, año: e.target.value })
            }
          />
          <button
            disabled={!nuevoCamion.patente.trim()}
            className={`md:col-span-2 transition py-3 rounded-lg text-white font-semibold ${
              nuevoCamion.patente.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            onClick={agregarCamion}
          >
            Agregar Camión
          </button>
        </div>

        {/* Lista de camiones */}
        {camiones.length === 0 ? (
          <p className="text-center text-gray-400 italic">
            No hay camiones registrados aún.
          </p>
        ) : (
          <ul className="space-y-4">
            {camiones.map((camion) => (
              <li
                key={camion.id}
                className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex justify-between items-center shadow hover:shadow-lg transition"
              >
                <div>
                  <p className="text-lg font-semibold">{camion.patente}</p>
                  <p className="text-sm text-gray-400">
                    {camion.marca} {camion.modelo} ({camion.año})
                  </p>
                </div>
                <button
                  className="text-red-400 hover:text-red-600 transition font-medium"
                  onClick={() => eliminarCamion(camion.id)}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
