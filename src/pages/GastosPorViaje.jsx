import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function GastosPorViaje() {
  const { empresaId } = useAuth();

  const [viajes, setViajes] = useState([]);
  const [viajeSeleccionado, setViajeSeleccionado] = useState("");
  const [gastos, setGastos] = useState([]);

  const [nuevoGasto, setNuevoGasto] = useState({
    concepto: "",
    monto: "",
    fecha: "",
  });

  const [editandoGastoId, setEditandoGastoId] = useState(null);
  const [gastoEditado, setGastoEditado] = useState({
    concepto: "",
    monto: "",
    fecha: "",
  });

  function timestampToDateString(timestamp) {
    if (!timestamp) return "";

    // Si es un objeto Timestamp (Firebase)
    if (typeof timestamp.toDate === "function") {
      const date = timestamp.toDate();
      return date.toLocaleDateString(); // o el formato que prefieras
    }

    // Si ya es un objeto Date
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }

    // Si es un string o otro tipo, intenta convertirlo a Date
    const date = new Date(timestamp);
    if (!isNaN(date)) {
      return date.toLocaleDateString();
    }

    // Si no es ninguno de los anteriores, retorna vacío o alguna cadena por defecto
    return "";
  }

  useEffect(() => {
    if (!empresaId) return;

    async function fetchViajes() {
      const viajesQuery = query(
        collection(db, "empresas", empresaId, "viajes"),
        orderBy("fechaInicio", "desc") // 👈 orden descendente (más reciente primero)
      );

      const viajesSnap = await getDocs(viajesQuery);
      const viajesData = viajesSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          fechaInicio: data.fechaInicio
            ? timestampToDateString(data.fechaInicio)
            : "",
          fechaFin: data.fechaFin ? timestampToDateString(data.fechaFin) : "",
        };
      });
      setViajes(viajesData);
    }

    fetchViajes();
  }, [empresaId]);

  useEffect(() => {
    if (!empresaId || !viajeSeleccionado) {
      setGastos([]);
      return;
    }

    async function fetchGastos() {
      const gastosSnap = await getDocs(
        collection(
          db,
          "empresas",
          empresaId,
          "viajes",
          viajeSeleccionado,
          "gastos"
        )
      );
      const gastosData = gastosSnap.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          concepto: data.concepto,
          monto: data.monto,
          fecha: data.fecha ? timestampToDateString(data.fecha) : "",
        };
      });
      setGastos(gastosData);
    }

    fetchGastos();
  }, [empresaId, viajeSeleccionado]);

  const recargarGastos = async () => {
    if (!empresaId || !viajeSeleccionado) return;

    const gastosSnap = await getDocs(
      collection(
        db,
        "empresas",
        empresaId,
        "viajes",
        viajeSeleccionado,
        "gastos"
      )
    );
    const gastosData = gastosSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        concepto: data.concepto,
        monto: data.monto,
        fecha: data.fecha ? timestampToDateString(data.fecha) : "",
      };
    });
    setGastos(gastosData);
  };

  const agregarGasto = async () => {
    if (!viajeSeleccionado) {
      alert("Seleccioná un viaje primero");
      return;
    }
    if (!nuevoGasto.concepto || !nuevoGasto.monto || !nuevoGasto.fecha) {
      alert("Completá todos los campos");
      return;
    }

    const gastosRef = collection(
      db,
      "empresas",
      empresaId,
      "viajes",
      viajeSeleccionado,
      "gastos"
    );
    await addDoc(gastosRef, {
      concepto: nuevoGasto.concepto,
      monto: parseFloat(nuevoGasto.monto),
      fecha: Timestamp.fromDate(new Date(nuevoGasto.fecha)),
    });

    setNuevoGasto({ concepto: "", monto: "", fecha: "" });
    recargarGastos();
  };

  const editarGasto = (gasto) => {
    setEditandoGastoId(gasto.id);
    setGastoEditado({
      concepto: gasto.concepto,
      monto: gasto.monto,
      fecha: gasto.fecha,
    });
  };

  const guardarGastoEditado = async () => {
    if (!gastoEditado.concepto || !gastoEditado.monto || !gastoEditado.fecha) {
      alert("Completá todos los campos");
      return;
    }

    const gastoRef = doc(
      db,
      "empresas",
      empresaId,
      "viajes",
      viajeSeleccionado,
      "gastos",
      editandoGastoId
    );
    await updateDoc(gastoRef, {
      concepto: gastoEditado.concepto,
      monto: parseFloat(gastoEditado.monto),
      fecha: Timestamp.fromDate(new Date(gastoEditado.fecha)),
    });

    setEditandoGastoId(null);
    recargarGastos();
  };

  const cancelarEdicion = () => {
    setEditandoGastoId(null);
  };

  const eliminarGasto = async (id) => {
    if (!window.confirm("¿Querés eliminar este gasto?")) return;

    const gastoRef = doc(
      db,
      "empresas",
      empresaId,
      "viajes",
      viajeSeleccionado,
      "gastos",
      id
    );
    await deleteDoc(gastoRef);
    recargarGastos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-10 mt-15">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Gastos por Viaje
        </h1>

        {/* Selección de viaje */}
        <div className="mb-8">
          <label
            htmlFor="select-viaje"
            className="block mb-2 font-semibold text-gray-300"
          >
            Seleccioná un viaje
          </label>
          <select
            id="select-viaje"
            className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
            value={viajeSeleccionado}
            onChange={(e) => setViajeSeleccionado(e.target.value)}
          >
            <option value="">-- Seleccioná un viaje --</option>
            {viajes.map((v) => (
              <option key={v.id} value={v.id}>
                {v.origen} → {v.destino} ({v.fechaInicio})
              </option>
            ))}
          </select>
        </div>

        {/* Formulario Nuevo / Editar Gasto */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            {editandoGastoId ? "Editar Gasto" : "Nuevo Gasto"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Concepto"
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
              value={
                editandoGastoId ? gastoEditado.concepto : nuevoGasto.concepto
              }
              onChange={(e) =>
                editandoGastoId
                  ? setGastoEditado({
                      ...gastoEditado,
                      concepto: e.target.value,
                    })
                  : setNuevoGasto({ ...nuevoGasto, concepto: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Monto"
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
              value={editandoGastoId ? gastoEditado.monto : nuevoGasto.monto}
              onChange={(e) =>
                editandoGastoId
                  ? setGastoEditado({ ...gastoEditado, monto: e.target.value })
                  : setNuevoGasto({ ...nuevoGasto, monto: e.target.value })
              }
            />
            <input
              type="date"
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white"
              value={editandoGastoId ? gastoEditado.fecha : nuevoGasto.fecha}
              onChange={(e) =>
                editandoGastoId
                  ? setGastoEditado({ ...gastoEditado, fecha: e.target.value })
                  : setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })
              }
            />
          </div>

          <div className="mt-4">
            {editandoGastoId ? (
              <>
                <button
                  onClick={guardarGastoEditado}
                  className="bg-green-600 text-white px-4 py-2 rounded mr-3 hover:bg-green-700 transition"
                >
                  Guardar
                </button>
                <button
                  onClick={cancelarEdicion}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={agregarGasto}
                className="bg-green-600 hover:bg-green-700 transition p-3 rounded-lg"
              >
                Agregar Gasto
              </button>
            )}
          </div>
        </section>

        {/* Lista de gastos */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Lista de Gastos</h2>
          {gastos.length === 0 ? (
            <p className="text-gray-400">
              No hay gastos registrados para este viaje.
            </p>
          ) : (
            <ul className="space-y-4">
              {gastos.map((gasto) => (
                <li
                  key={gasto.id}
                  className="bg-gray-900 border border-gray-700 p-5 rounded-lg shadow flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-xl">{gasto.concepto}</p>
                    <p>Monto: ${gasto.monto.toFixed(2)}</p>
                    <p>Fecha: {gasto.fecha}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 space-x-2">
                    <button
                      onClick={() => editarGasto(gasto)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarGasto(gasto.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
