import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { UsersRound, CalendarDays, BarChart3 } from "lucide-react";

const features = [
  {
    title: "Gestión de Socios",
    description: "Administra la membresía y datos de tus socios de forma sencilla.",
    icon: UsersRound,
  },
  {
    title: "Actividades",
    description: "Organiza y programa actividades, eventos y reuniones del club.",
    icon: CalendarDays,
  },
  {
    title: "Reportes",
    description: "Visualiza estadísticas y genera reportes de la gestión del club.",
    icon: BarChart3,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full text-center"
      >
        <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
          Gestión Integral de Clubes
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
          Administra tu club de manera eficiente. Simplifica la gestión de socios, actividades y recursos en una sola plataforma.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/auth/login">
            <Button size="lg">Iniciar Sesión</Button>
          </Link>
          <Link to="/auth/register">
            <Button variant="outline" size="lg">Registrarse</Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full"
      >
        {features.map((f) => (
          <motion.div
            key={f.title}
            variants={item}
            className="group border rounded-xl p-6 bg-card/50 hover:bg-card transition-colors"
          >
            <f.icon className="size-6 text-muted-foreground mb-4 group-hover:text-foreground transition-colors" />
            <h3 className="text-base font-medium mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
