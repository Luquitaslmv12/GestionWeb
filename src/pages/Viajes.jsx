import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function Viajes() {
  const { empresaId } = useAuth();

  const [viajes, setViajes] = useState([]);
  const [camiones, setCamiones] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [acoplados, setAcoplados] = useState([]);

  const [nuevoViaje, setNuevoViaje] = useState({
    origen: "",
    destino: "",
    fechaInicio: "",
    fechaFin: "",
    camionId: "",
    acopladoId: "",
    choferId: "",
    estado: "pendiente",
  });

  const [filtros, setFiltros] = useState({
    desde: "",
    hasta: "",
    estado: "",
  });

  const [editandoId, setEditandoId] = useState(null);

  const viajesRef = empresaId
    ? collection(db, "empresas", empresaId, "viajes")
    : null;

  useEffect(() => {
    if (!empresaId) return;

    const fetchData = async () => {
      const [viajesSnap, camionesSnap, choferesSnap, acopladosSnap] =
        await Promise.all([
          getDocs(collection(db, "empresas", empresaId, "viajes")),
          getDocs(collection(db, "empresas", empresaId, "camiones")),
          getDocs(collection(db, "empresas", empresaId, "choferes")),
          getDocs(collection(db, "empresas", empresaId, "acoplados")),
        ]);

      const todosViajes = viajesSnap.docs.map((doc) => {
        const data = doc.data();

        const fechaInicio = data.fechaInicio?.toDate
          ? data.fechaInicio.toDate().toISOString().slice(0, 10)
          : data.fechaInicio || "";

        const fechaFin = data.fechaFin?.toDate
          ? data.fechaFin.toDate().toISOString().slice(0, 10)
          : data.fechaFin || "";

        return {
          id: doc.id,
          ...data,
          fechaInicio,
          fechaFin,
        };
      });

      setViajes(filtrarViajes(todosViajes, filtros));
      setCamiones(
        camionesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setChoferes(
        choferesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
      setAcoplados(
        acopladosSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    fetchData();
  }, [empresaId, filtros]);

  const filtrarViajes = (lista, filtros) => {
    return lista.filter((v) => {
      const cumpleEstado = filtros.estado ? v.estado === filtros.estado : true;
      const cumpleDesde = filtros.desde
        ? new Date(v.fechaInicio) >= new Date(filtros.desde)
        : true;
      const cumpleHasta = filtros.hasta
        ? new Date(v.fechaInicio) <= new Date(filtros.hasta)
        : true;
      return cumpleEstado && cumpleDesde && cumpleHasta;
    });
  };

  const refrescarViajes = async () => {
    if (!viajesRef) return;
    const snapshot = await getDocs(viajesRef);
    const actualizados = snapshot.docs.map((doc) => {
      const data = doc.data();
      const fechaInicio = data.fechaInicio?.toDate
        ? data.fechaInicio.toDate().toISOString().slice(0, 10)
        : data.fechaInicio || "";
      const fechaFin = data.fechaFin?.toDate
        ? data.fechaFin.toDate().toISOString().slice(0, 10)
        : data.fechaFin || "";
      return { id: doc.id, ...data, fechaInicio, fechaFin };
    });
    setViajes(filtrarViajes(actualizados, filtros));
  };

  const agregarViaje = async () => {
    if (!viajesRef) return;

    // Si estamos editando, actualizamos el viaje
    if (editandoId) {
      const viajeDoc = doc(db, "empresas", empresaId, "viajes", editandoId);
      await updateDoc(viajeDoc, nuevoViaje);
      setEditandoId(null);
    } else {
      await addDoc(viajesRef, nuevoViaje);
    }

    setNuevoViaje({
      origen: "",
      destino: "",
      fechaInicio: "",
      fechaFin: "",
      camionId: "",
      acopladoId: "",
      choferId: "",
      estado: "pendiente",
    });

    await refrescarViajes();
  };

  const eliminarViaje = async (id) => {
    if (!empresaId) return;
    const viajeDoc = doc(db, "empresas", empresaId, "viajes", id);
    await deleteDoc(viajeDoc);
    await refrescarViajes();
  };

  const editarViaje = (viaje) => {
    setNuevoViaje({
      origen: viaje.origen || "",
      destino: viaje.destino || "",
      fechaInicio: viaje.fechaInicio || "",
      fechaFin: viaje.fechaFin || "",
      camionId: viaje.camionId || "",
      acopladoId: viaje.acopladoId || "",
      choferId: viaje.choferId || "",
      estado: viaje.estado || "pendiente",
    });
    setEditandoId(viaje.id);
    window.scrollTo({ top: 0, behavior: "smooth" }); // para que el usuario vea el formulario
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-30">
        <h1 className="text-4xl font-bold mb-8 text-center">Viajes</h1>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <input
            type="date"
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            value={filtros.desde}
            onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
          />
          <input
            type="date"
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            value={filtros.hasta}
            onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
          />
          <select
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en curso">En curso</option>
            <option value="completado">Completado</option>
          </select>
        </div>

        {/* Formulario nuevo/editar viaje */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            placeholder="Origen"
            value={nuevoViaje.origen}
            onChange={(e) =>
              setNuevoViaje({ ...nuevoViaje, origen: e.target.value })
            }
          />
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            placeholder="Destino"
            value={nuevoViaje.destino}
            onChange={(e) =>
              setNuevoViaje({ ...nuevoViaje, destino: e.target.value })
            }
          />
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            type="date"
            value={nuevoViaje.fechaInicio}
            onChange={(e) =>
              setNuevoViaje({ ...nuevoViaje, fechaInicio: e.target.value })
            }
          />
          <input
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            type="date"
            value={nuevoViaje.fechaFin}
            onChange={(e) =>
              setNuevoViaje({ ...nuevoViaje, fechaFin: e.target.value })
            }
          />
          <select
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            value={nuevoViaje.camionId}
            onChange={(e) =>
              setNuevoViaje({ ...nuevoViaje, camionId: e.target.value })
            }
          >
            <option value="">Camión</option>
            {camiones.map((c) => (
              <option key={c.id} value={c.id}>
                {c.patente}
              </option>
            ))}
          </select>
          <select
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            value={nuevoViaje.acopladoId}
            onChange={(e) =>
              setNuevoViaje({ ...nuevoViaje, acopladoId: e.target.value })
            }
          >
            <option value="">Acoplado</option>
            {acoplados.map((a) => (
              <option key={a.id} value={a.id}>
                {a.patente}
              </option>
            ))}
          </select>
          <select
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            value={nuevoViaje.choferId}
            onChange={(e) =>
              setNuevoViaje({ ...nuevoViaje, choferId: e.target.value })
            }
          >
            <option value="">Chofer</option>
            {choferes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            value={nuevoViaje.estado}
            onChange={(e) =>
              setNuevoViaje({ ...nuevoViaje, estado: e.target.value })
            }
          >
            <option value="pendiente">Pendiente</option>
            <option value="en curso">En curso</option>
            <option value="completado">Completado</option>
          </select>

          <button
            className="md:col-span-2 bg-green-600 hover:bg-green-700 transition py-3 rounded-lg text-white font-semibold"
            onClick={agregarViaje}
          >
            {editandoId ? "Guardar Cambios" : "Agregar Viaje"}
          </button>
          {editandoId && (
            <button
              className="md:col-span-2 bg-red-600 hover:bg-red-700 transition py-3 rounded-lg text-white font-semibold"
              onClick={() => {
                setNuevoViaje({
                  origen: "",
                  destino: "",
                  fechaInicio: "",
                  fechaFin: "",
                  camionId: "",
                  acopladoId: "",
                  choferId: "",
                  estado: "pendiente",
                });
                setEditandoId(null);
              }}
            >
              Cancelar Edición
            </button>
          )}
        </div>

        {/* Lista de viajes */}
        <ul className="space-y-4">
          {viajes.map((v) => (
            <li
              key={v.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-4 shadow hover:shadow-lg transition flex justify-between items-center"
            >
              <div>
                <p className="text-lg font-semibold">
                  {v.origen} → {v.destino}
                </p>
                <p className="text-gray-400 text-sm">
                  Fecha: {v.fechaInicio} a {v.fechaFin}
                </p>
                <p className="text-gray-400 text-sm">
                  Camión: {v.camionId} | Chofer: {v.choferId}
                </p>
                <p className="text-sm text-blue-400 mt-1">Estado: {v.estado}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded"
                  onClick={() => editarViaje(v)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
                  onClick={() => eliminarViaje(v.id)}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
