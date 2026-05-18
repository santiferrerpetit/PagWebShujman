import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <div>
      <section className="h-[calc(100vh-7rem)] flex justify-center items-center">
        <div className="flex flex-col items-center">
          <h1 className="text-white text-5xl">Bienvenido!</h1>
          <button
            className="bg-white text-black px-4 py-2 rounded-md mt-4"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </section>
    </div>
  );
}
