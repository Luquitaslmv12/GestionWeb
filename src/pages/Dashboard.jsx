import { useEffect, useState } from "react";
import { collection, query, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../context/AuthContext";

import Navbar from "../components/Navbar";
import Banner from "../components/Banner";
import StatsCards from "../components/StatsCards";

export default function Dashboard() {
  const { empresaId } = useAuth();
  const [camiones, setCamiones] = useState(0);
  const [choferes, setChoferes] = useState(0);
  const [viajes, setViajes] = useState(0);

  useEffect(() => {
    if (!empresaId) return;

    const unsub1 = onSnapshot(
      query(collection(db, "empresas", empresaId, "camiones")),
      (snapshot) => setCamiones(snapshot.size)
    );

    const unsub2 = onSnapshot(
      query(collection(db, "empresas", empresaId, "choferes")),
      (snapshot) => setChoferes(snapshot.size)
    );

    const unsub3 = onSnapshot(
      query(collection(db, "empresas", empresaId, "viajes")),
      (snapshot) => setViajes(snapshot.size)
    );

    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [empresaId]);

  const stats = [
    {
      title: "Camiones",
      count: camiones,
      color: "from-blue-600 to-blue-800",
      href: "/camiones",
    },
    {
      title: "Choferes",
      count: choferes,
      color: "from-teal-500 to-teal-700",
      href: "/choferes",
    },
    {
      title: "Viajes",
      count: viajes,
      color: "from-purple-600 to-purple-800",
      href: "/viajes",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
        <Banner />

        <section>
          <StatsCards stats={stats} />
        </section>
      </main>
    </div>
  );
}
