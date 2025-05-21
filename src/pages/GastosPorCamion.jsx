import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../services/Firebase";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function GastosPorCamion() {
  const { empresaId } = useAuth();
  const [camiones, setCamiones] = useState([]);
  const [camionSeleccionado, setCamionSeleccionado] = useState("");
  const [gastos, setGastos] = useState([]);

  const [nuevoGasto, setNuevoGasto] = useState({
    tipo: "",
    concepto: "",
    monto: "",
    fecha: "",
  });

  const [editandoGastoId, setEditandoGastoId] = useState(null);
  const [gastoEditado, setGastoEditado] = useState({
    tipo: "",
    concepto: "",
    monto: "",
    fecha: "",
  });

  function timestampToDateString(timestamp) {
    if (!timestamp) return "";
    if (typeof timestamp.toDate === "function") {
      return timestamp.toDate().toLocaleDateString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString();
    }
    const date = new Date(timestamp);
    return isNaN(date) ? "" : date.toLocaleDateString();
  }

  useEffect(() => {
    if (!empresaId) return;
    const fetchCamiones = async () => {
      const snap = await getDocs(
        collection(db, "empresas", empresaId, "camiones")
      );
      const data = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCamiones(data);
    };
    fetchCamiones();
  }, [empresaId]);

  useEffect(() => {
    if (!empresaId || !camionSeleccionado) {
      setGastos([]);
      return;
    }

    const fetchGastos = async () => {
      const gastosSnap = await getDocs(
        query(
          collection(
            db,
            "empresas",
            empresaId,
            "camiones",
            camionSeleccionado,
            "gastos"
          ),
          orderBy("fecha", "desc")
        )
      );
      const data = gastosSnap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          ...d,
          fecha: d.fecha ? timestampToDateString(d.fecha) : "",
        };
      });
      setGastos(data);
    };
    fetchGastos();
  }, [empresaId, camionSeleccionado]);

  const recargarGastos = async () => {
    if (!empresaId || !camionSeleccionado) return;
    const snap = await getDocs(
      query(
        collection(
          db,
          "empresas",
          empresaId,
          "camiones",
          camionSeleccionado,
          "gastos"
        ),
        orderBy("fecha", "desc")
      )
    );
    const data = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        fecha: d.fecha ? timestampToDateString(d.fecha) : "",
      };
    });
    setGastos(data);
  };

  const agregarGasto = async () => {
    if (
      !nuevoGasto.tipo ||
      !nuevoGasto.concepto ||
      !nuevoGasto.monto ||
      !nuevoGasto.fecha
    ) {
      alert("Completá todos los campos");
      return;
    }

    const ref = collection(
      db,
      "empresas",
      empresaId,
      "camiones",
      camionSeleccionado,
      "gastos"
    );
    await addDoc(ref, {
      ...nuevoGasto,
      monto: parseFloat(nuevoGasto.monto),
      fecha: Timestamp.fromDate(new Date(nuevoGasto.fecha)),
    });
    setNuevoGasto({ tipo: "", concepto: "", monto: "", fecha: "" });
    recargarGastos();
  };

  const guardarGastoEditado = async () => {
    if (
      !gastoEditado.tipo ||
      !gastoEditado.concepto ||
      !gastoEditado.monto ||
      !gastoEditado.fecha
    ) {
      alert("Completá todos los campos");
      return;
    }

    const ref = doc(
      db,
      "empresas",
      empresaId,
      "camiones",
      camionSeleccionado,
      "gastos",
      editandoGastoId
    );
    await updateDoc(ref, {
      ...gastoEditado,
      monto: parseFloat(gastoEditado.monto),
      fecha: Timestamp.fromDate(new Date(gastoEditado.fecha)),
    });

    setEditandoGastoId(null);
    recargarGastos();
  };

  const eliminarGasto = async (id) => {
    if (!window.confirm("¿Eliminar este gasto?")) return;
    const ref = doc(
      db,
      "empresas",
      empresaId,
      "camiones",
      camionSeleccionado,
      "gastos",
      id
    );
    await deleteDoc(ref);
    recargarGastos();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-10 mt-20">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Gastos por Camión
        </h1>

        {/* Selección de camión */}
        <div className="mb-8">
          <label className="block mb-2 font-semibold text-gray-300">
            Seleccioná un camión
          </label>
          <select
            className="w-full bg-gray-800 border border-gray-700 p-3 rounded-lg"
            value={camionSeleccionado}
            onChange={(e) => setCamionSeleccionado(e.target.value)}
          >
            <option value="">-- Seleccioná un camión --</option>
            {camiones.map((c) => (
              <option key={c.id} value={c.id}>
                {c.patente || "Sin Patente"} - {c.marca || "Marca desconocida"}
              </option>
            ))}
          </select>
        </div>

        {/* Formulario de gasto */}
        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">
            {editandoGastoId ? "Editar Gasto" : "Nuevo Gasto"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <select
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg"
              value={editandoGastoId ? gastoEditado.tipo : nuevoGasto.tipo}
              onChange={(e) =>
                editandoGastoId
                  ? setGastoEditado({ ...gastoEditado, tipo: e.target.value })
                  : setNuevoGasto({ ...nuevoGasto, tipo: e.target.value })
              }
            >
              <option value="">Tipo</option>
              <option value="neumáticos">Neumáticos</option>
              <option value="repuestos">Repuestos</option>
              <option value="mano de obra">Mano de Obra</option>
              <option value="otro">Otro</option>
            </select>
            <input
              type="text"
              placeholder="Concepto"
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg"
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
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg"
              value={editandoGastoId ? gastoEditado.monto : nuevoGasto.monto}
              onChange={(e) =>
                editandoGastoId
                  ? setGastoEditado({ ...gastoEditado, monto: e.target.value })
                  : setNuevoGasto({ ...nuevoGasto, monto: e.target.value })
              }
            />
            <input
              type="date"
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg"
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
                  className="bg-green-600 px-4 py-2 rounded mr-3"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditandoGastoId(null)}
                  className="bg-gray-500 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                onClick={agregarGasto}
                className="bg-green-600 px-4 py-2 rounded"
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
              No hay gastos registrados para este camión.
            </p>
          ) : (
            <ul className="space-y-4">
              {gastos.map((g) => (
                <li
                  key={g.id}
                  className="bg-gray-900 border border-gray-700 p-5 rounded-lg shadow flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-bold text-xl">{g.concepto}</p>
                    <p>Tipo: {g.tipo}</p>
                    <p>Monto: ${g.monto.toFixed(2)}</p>
                    <p>Fecha: {g.fecha}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 space-x-2">
                    <button
                      onClick={() => {
                        setEditandoGastoId(g.id);
                        setGastoEditado({
                          tipo: g.tipo,
                          concepto: g.concepto,
                          monto: g.monto,
                          fecha: g.fecha,
                        });
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarGasto(g.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
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
