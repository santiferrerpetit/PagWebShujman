import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Card from "@/components/ui/Card";

const modules = [
  {
    title: "Socios",
    description: "Gestiona el registro, edición y seguimiento de socios del club.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    to: "/members",
    color: "from-blue-500 to-indigo-600",
    available: true,
  },
  {
    title: "Aranceles",
    description: "Gestiona aranceles deportivos y su asignación a socios.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    to: "/fees",
    color: "from-purple-500 to-indigo-600",
    available: true,
  },
  {
    title: "Disciplinas",
    description: "Crea grupos por deporte y gestiona horarios de práctica.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    to: "#",
    color: "from-emerald-500 to-teal-600",
    available: false,
  },
  {
    title: "Inventario",
    description: "Control de stock y préstamos de materiales deportivos.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    to: "#",
    color: "from-amber-500 to-orange-600",
    available: false,
  },
  {
    title: "Mantenimiento",
    description: "Bitácora de reparaciones y estado de instalaciones.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    to: "#",
    color: "from-rose-500 to-pink-600",
    available: false,
  },
];

function ModuleCard({ mod }: { mod: typeof modules[0] }) {
  const content = (
    <Card className="h-full hover:border-slate-600 transition-all duration-300 group-hover:shadow-xl">
      <div className={`w-12 h-12 bg-gradient-to-br ${mod.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
        {mod.icon}
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{mod.title}</h3>
      <p className="text-slate-400 text-sm">{mod.description}</p>
      {!mod.available && (
        <span className="inline-block mt-3 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
          Próximamente
        </span>
      )}
    </Card>
  );

  if (!mod.available) {
    return (
      <div className="group cursor-not-allowed opacity-60">
        {content}
      </div>
    );
  }

  return (
    <Link to={mod.to} className="group cursor-pointer">
      {content}
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="flex-1 px-4 py-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Bienvenido{user ? `, ${user.firstName}` : ""}!
        </h1>
        <p className="text-slate-400 mt-1">
          Rol: <span className="text-blue-400 font-medium">{user?.role?.name ?? "Sin rol"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <ModuleCard key={mod.title} mod={mod} />
        ))}
      </div>
    </div>
  );
}
