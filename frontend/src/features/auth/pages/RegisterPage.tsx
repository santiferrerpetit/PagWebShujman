/**
 * @fileoverview Página de registro de nuevo usuario con formulario validado.
 * Valida coincidencia de contraseñas y redirige al login tras registro exitoso.
 */

import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "@/features/auth/hooks/useAuthActions";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card from "@/components/ui/Card";
import Alert from "@/components/ui/Alert";

type RegisterFormInputs = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

/**
 * Página de registro de nuevos usuarios.
 * Valida que las contraseñas coincidan antes de enviar.
 * Redirige a /auth/login tras un registro exitoso.
 *
 * @component
 * @returns {JSX.Element} Formulario de registro
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>();
  const { register: doRegister, isLoading, error, setError } = useRegister();

  const onSubmit = handleSubmit(async (formValues) => {
    if (formValues.password !== formValues.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const result = await doRegister(formValues);
    if (result) {
      navigate("/auth/login");
    }
  });

  return (
    <div className="flex-1 flex items-center justify-center bg-neutral-950 px-4 py-12">
      <div className="w-full max-w-md">
        <Card
          title="Crear Cuenta"
          subtitle="Completa tus datos para registrarte"
        >
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                placeholder="Juan"
                {...register("firstName", { required: "El nombre es requerido" })}
                error={errors.firstName?.message}
              />
              <Input
                label="Apellido"
                placeholder="Pérez"
                {...register("lastName", { required: "El apellido es requerido" })}
                error={errors.lastName?.message}
              />
            </div>

            <Input
              label="Nombre de usuario"
              placeholder="juanperez"
              icon={
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
              {...register("username", { required: "El nombre de usuario es requerido" })}
              error={errors.username?.message}
            />

            <Input
              label="Correo electrónico"
              type="email"
              placeholder="tu@email.com"
              icon={
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              }
              {...register("email", { required: "El email es requerido" })}
              error={errors.email?.message}
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

            <Input
              label="Confirmar contraseña"
              type="password"
              placeholder="••••••••"
              icon={
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              {...register("confirmPassword", { required: "Es necesario confirmar la contraseña" })}
              error={errors.confirmPassword?.message}
            />

            <Button type="submit" variant="secondary" isLoading={isLoading} className="w-full">
              Registrar
            </Button>

            {error && <Alert>{error}</Alert>}
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link to="/auth/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
