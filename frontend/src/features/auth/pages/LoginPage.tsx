/**
 * @fileoverview Página de inicio de sesión con formulario validado por react-hook-form.
 * Redirige al dashboard tras autenticación exitosa.
 */

import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLogin } from "@/features/auth/hooks/useAuthActions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";

type LoginFormInputs = {
  username: string;
  password: string;
};

/**
 * Página de inicio de sesión.
 * Usa react-hook-form para validación y useLogin para gestionar la petición.
 * Al autenticarse correctamente, guarda el token y redirige a /dashboard.
 *
 * @component
 * @returns {JSX.Element} Formulario de login
 */
export default function LoginPage() {
  const { login: doAuthLogin } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>();
  const { login, isLoading, error } = useLogin();

  const onSubmit = handleSubmit(async (data) => {
    const result = await login(data.username, data.password);
    if (result) {
      doAuthLogin(result.token, result.user);
      navigate("/dashboard");
    }
  });

  return (
    <div className="flex-1 flex items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-md">
        <Card
          title="Bienvenido"
          subtitle="Ingresa a tu cuenta para continuar"
        >
          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              label="Nombre de usuario"
              placeholder="usuario"
              icon={
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              {...register("username", { required: "El usuario es requerido" })}
              error={errors.username?.message}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              icon={
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              {...register("password", { required: "La contraseña es requerida" })}
              error={errors.password?.message}
            />

            <Button type="submit" isLoading={isLoading} className="w-full">
              Ingresar
            </Button>

            {error && <Alert>{error}</Alert>}
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              ¿No tienes una cuenta?{" "}
              <Link to="/auth/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
