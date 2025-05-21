import { Link } from "react-router-dom";
import { Truck, User, MapPin } from "lucide-react";

const icons = {
  Camiones: Truck,
  Choferes: User,
  Viajes: MapPin,
};

export default function StatsCards({ stats }) {
  return (
    <section className="w-full px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {stats.map(({ title, count, color, href }) => {
        const Icon = icons[title] || null;

        return (
          <Link
            to={href}
            key={title}
            className={`rounded-xl p-8 text-white shadow-xl transform hover:scale-105 transition-transform duration-300 bg-gradient-to-br ${color} flex flex-col items-center justify-center`}
          >
            {Icon && <Icon size={48} className="mb-4 opacity-90" />}
            <h3 className="text-2xl font-semibold tracking-wide">{title}</h3>
            <p className="text-6xl mt-2 font-extrabold drop-shadow-md">
              {count}
            </p>
          </Link>
        );
      })}
    </section>
  );
}
