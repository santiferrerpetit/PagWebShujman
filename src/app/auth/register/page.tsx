"use client"
import { useForm, SubmitHandler } from 'react-hook-form'

type RegisterFormInputs = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>()

  const onSubmit = handleSubmit(async data => {
    console.log(data)
    console.log(JSON.stringify(data))
    const respuesta = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data) 
    })

    const resultado = await respuesta.json()
    
    console.log(resultado)
  })

  return (
    <div className="h-[calc(100vh-7rem)] flex justify-center items-center ">
      <form onSubmit={onSubmit} className="bg-slate-800 p-10 rounded w-1/4  ">
        <div className="text-slate-200 font-bold text-3xl mb-4">Registrar Usuario</div>

        <div>
          <label htmlFor="username" className="text-slate-500 mb-2 block-text-sm">Nombre de usuario:</label>
          <input type="text"
            {...register('username', { required: { value: true, message: 'El nombre de usuario es requerido' } })}
            className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          />
          {errors.username && (<span className="text-red-500 text-xs">{errors.username.message} </span>)}
        </div>

        <div>
          <label htmlFor="email" className="text-slate-500 mb-2 block-text-sm">Email:</label>
          <input type="email"
            {...register('email', { required: { value: true, message: 'El email es requerido' } })}
            className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          />
          {errors.email && (<span className="text-red-500 text-xs">{errors.email.message} </span>)}
        </div>

        <div>
          <label htmlFor="password" className="text-slate-500 mb-2 block-text-sm">Password:</label>
          <input type="password"
            {...register('password', { required: { value: true, message: 'La contraseña es requerida' } })}
            className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          />
          {errors.password && (<span className="text-red-500 text-xs">{errors.password.message} </span>)}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-slate-500 mb-2 block-text-sm">Confirmar Password:</label>
          <input type="password"
            {...register('confirmPassword', { required: { value: true, message: 'Es necesario confirmar la contraseña' } })}
            className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          />
          {errors.confirmPassword && (<span className="text-red-500 text-xs">{errors.confirmPassword.message} </span>)}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold p-3 rounded-lg mt-2">
          Registrar
        </button>
      </form>
    </div>
  )
}