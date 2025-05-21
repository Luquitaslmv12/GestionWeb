import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Choferes() {
  const { empresaId } = useAuth();

  const [choferes, setChoferes] = useState([]);
  const [nuevoChofer, setNuevoChofer] = useState({
    nombre: "",
    dni: "",
    telefono: "",
    email: "",
  });
  const [modoEdicion, setModoEdicion] = useState(null);

  const choferesRef = empresaId
    ? collection(db, "empresas", empresaId, "choferes")
    : null;

  useEffect(() => {
    if (!empresaId) return;
    const fetchChoferes = async () => {
      const snapshot = await getDocs(choferesRef);
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setChoferes(lista);
    };
    fetchChoferes();
  }, [empresaId]);

  const agregarChofer = async () => {
    const { nombre, dni, telefono, email } = nuevoChofer;

    // Validaciones básicas
    if (!nombre || !dni || !email) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Validación de DNI (solo números y largo típico de 7-8 dígitos)
    if (!/^\d{7,8}$/.test(dni)) {
      alert("El DNI debe contener solo números y tener entre 7 y 8 dígitos.");
      return;
    }

    // Validación de email
    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      alert("Por favor, ingresa un correo electrónico válido.");
      return;
    }

    // Si pasa todas las validaciones, guarda en Firestore
    await addDoc(choferesRef, { nombre, dni, telefono, email });
    setNuevoChofer({ nombre: "", dni: "", telefono: "", email: "" });

    // Actualiza la lista de choferes
    const snapshot = await getDocs(choferesRef);
    setChoferes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const eliminarChofer = async (id) => {
    if (!empresaId) return;
    await deleteDoc(doc(db, "empresas", empresaId, "choferes", id));
    setChoferes(choferes.filter((c) => c.id !== id));
  };

  const editarChofer = async (id) => {
    if (!empresaId || !modoEdicion) return;
    await updateDoc(
      doc(db, "empresas", empresaId, "choferes", id),
      modoEdicion
    );
    setModoEdicion(null);
    const snapshot = await getDocs(choferesRef);
    setChoferes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Choferes</h1>

        {/* Formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            placeholder="Nombre"
            value={nuevoChofer.nombre}
            onChange={(e) =>
              setNuevoChofer({ ...nuevoChofer, nombre: e.target.value })
            }
          />
          <input
            type="number"
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            placeholder="DNI"
            value={nuevoChofer.dni}
            onChange={(e) =>
              setNuevoChofer({ ...nuevoChofer, dni: e.target.value })
            }
          />
          <input
            type="number"
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            placeholder="Teléfono"
            value={nuevoChofer.telefono}
            onChange={(e) =>
              setNuevoChofer({ ...nuevoChofer, telefono: e.target.value })
            }
          />
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            placeholder="Email"
            type="email"
            value={nuevoChofer.email}
            onChange={(e) =>
              setNuevoChofer({ ...nuevoChofer, email: e.target.value })
            }
          />

          <button
            disabled={!nuevoChofer.dni.trim()}
            className={`md:col-span-2 transition py-3 rounded-lg text-white font-semibold ${
              nuevoChofer.dni.trim()
                ? "bg-green-600 hover:bg-green-700 transition p-3 rounded-lg"
                : "bg-gray-600 cursor-not-allowed"
            }`}
            onClick={agregarChofer}
          >
            Agregar Chofer
          </button>
        </div>

        {/* Lista */}
        <ul className="space-y-4">
          {choferes.map((c) => (
            <li
              key={c.id}
              className="bg-gray-900 border border-gray-700 p-5 rounded-lg shadow"
            >
              {modoEdicion?.id === c.id ? (
                <div className="grid md:grid-cols-5 gap-2">
                  <input
                    className="bg-gray-800 border border-gray-700 p-2 rounded-lg text-white"
                    value={modoEdicion.nombre}
                    onChange={(e) =>
                      setModoEdicion({ ...modoEdicion, nombre: e.target.value })
                    }
                  />
                  <input
                    className="bg-gray-800 border border-gray-700 p-2 rounded-lg text-white"
                    value={modoEdicion.dni}
                    onChange={(e) =>
                      setModoEdicion({ ...modoEdicion, dni: e.target.value })
                    }
                  />
                  <input
                    className="bg-gray-800 border border-gray-700 p-2 rounded-lg text-white"
                    value={modoEdicion.telefono || ""}
                    onChange={(e) =>
                      setModoEdicion({
                        ...modoEdicion,
                        telefono: e.target.value,
                      })
                    }
                  />
                  <input
                    className="bg-gray-800 border border-gray-700 p-2 rounded-lg text-white"
                    type="email"
                    value={modoEdicion.email || ""}
                    onChange={(e) =>
                      setModoEdicion({ ...modoEdicion, email: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
                      onClick={() => editarChofer(c.id)}
                    >
                      Guardar
                    </button>
                    <button
                      className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg"
                      onClick={() => setModoEdicion(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{c.nombre}</p>
                    <p className="text-sm text-gray-400">DNI: {c.dni}</p>
                    <p className="text-sm text-gray-400">
                      Tel: {c.telefono || "-"}
                    </p>
                    <p className="text-sm text-gray-400">
                      Email: {c.email || "-"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg"
                      onClick={() => setModoEdicion({ ...c, id: c.id })}
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                      onClick={() => eliminarChofer(c.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
