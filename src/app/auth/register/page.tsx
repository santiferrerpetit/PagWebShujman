"use client"
import { useForm, SubmitHandler } from 'react-hook-form'

type RegisterFormInputs = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {

  const { register, handleSubmit } = useForm<RegisterFormInputs>()

  const onSubmit: SubmitHandler<RegisterFormInputs> = data => {
    console.log(data)
  }

  return (
    <div className="h-[calc(100vh-7rem)] flex justify-center items-center ">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-slate-800 p-10 rounded w-1/4  ">
        <div className="text-slate-200 font-bold text-3xl mb-4">Registrar Usuario</div>

        <label htmlFor="username" className="text-slate-500 mb-2 block-text-sm">Nombre de usuario:</label>
        <input type="text" 
               {...register('username', { required: true })} 
               className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
               />
        <label htmlFor="email" className="text-slate-500 mb-2 block-text-sm">Email:</label>               
        <input type="email" 
               {...register('email', { required: true })} 
               className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
               />
        <label htmlFor="password" className="text-slate-500 mb-2 block-text-sm">Password:</label>       
        <input type="password" 
               {...register('password', { required: true })} 
               className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
               />
        <label htmlFor="confirmPassword" className="text-slate-500 mb-2 block-text-sm">Confirmar Password:</label>       
        <input type="password" 
               {...register('confirmPassword', { required: true })}  
               className="p-3 rounded block mb-2 bg-slate-900 text-slate-300 w-full"
               />               

        <button 
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold p-3 rounded-lg mt-2">
             Registrar
        </button>
      </form>
    </div>
  )
}