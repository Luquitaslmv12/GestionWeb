import { useAuth } from "../context/AuthContext";

export default function Banner() {
  const { empresaId } = useAuth();

  return (
    <section className="bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 py-20 px-8 text-white w-full text-center shadow-lg rounded-b-3xl select-none">
      <h2 className="text-5xl md:text-6xl font-extrabold mb-3 drop-shadow-md">
        Bienvenido{" "}
        <span className="text-yellow-300">{empresaId || "tu empresa"}</span>
      </h2>
      <p className="text-xl md:text-2xl font-light tracking-wide drop-shadow-sm">
        Gestiona tu flota con facilidad
      </p>
    </section>
  );
}
