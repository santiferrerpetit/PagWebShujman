"use client"
import { useState } from "react"
import { set, useForm } from "react-hook-form"
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation';

export default function LoginPage() {

  const { register, handleSubmit, formState: { errors } } = useForm()
  const router = useRouter()

  const [error, setError] = useState(null)

  const onSubmit = handleSubmit(async data => {
    console.log(data)
    setError(null)
    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false
    })
    if (res.error) {
      console.log('Error en el inicio de sesión:', res.error)
      setError("Error en el inicio de sesión")
    } else {
      console.log('Inicio de sesión exitoso', res)
      router.push('/dashboard')
      router.refresh()
    }
  })


  return (
    <div className="h-[calc(100vh-7rem)] flex justify-center items-center ">
      <form onSubmit={onSubmit} className="bg-slate-800 p-10 rounded w-1/4  ">
        <div className="text-slate-200 font-bold text-3xl mb-4">Login</div>

        <label htmlFor="email" className="text-slate-500 mb-2 block-text-sm">Email:</label>
        <input type="email"
          {...register('email', { required: { value: true, message: 'El email es requerido' } })}
          className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          placeholder="su email"
        />
        {errors.email && (<span className="text-red-500 text-xs">{errors.email.message} </span>)}

        <label htmlFor="password" className="text-slate-500 mb-2 block-text-sm">Password:</label>
        <input type="password"
          {...register('password', { required: { value: true, message: 'El password es requerido' } })}
          className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
          placeholder="********"
        />
        {errors.password && (<span className="text-red-500 text-xs">{errors.password.message} </span>)}

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold p-3 rounded-lg mt-2">
          Ingresar
        </button>
        {error && <p className="bg-red-500 text-white text-xs mt-2">{error}</p>}
      </form>

    </div>
  )
}
