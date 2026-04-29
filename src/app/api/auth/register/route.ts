import bcrypt from "bcrypt"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type RegisterData = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export async function POST(request: NextRequest) {
    console.log('funcion POST')
    try {
        const data = await request.json() as RegisterData;

        console.log('funcion POST data:', data)

        if (data.password !== data.confirmPassword) {
            return NextResponse.json({ message: 'Las contraseñas no coinciden' }, { status: 400 })
        }

        const emailFound = await prisma.user.findUnique({
            where: {
                email: data.email
            }
        })

        if (emailFound) {
            return NextResponse.json({ message: 'El email ya está registrado' }, { status: 400 })
        }

        const usernameFound = await prisma.user.findUnique({
            where: {
                username: data.username
            }
        })

        if (usernameFound) {
            return NextResponse.json({ message: 'El nombre de usuario ya está registrado' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)
        
        const newUser = await prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hashedPassword
            }
        })

        // quitamos el password de la respuesta para no enviarlo al cliente
        const {password, ...user} = newUser
        void password

        return NextResponse.json(user)
    } catch (error) {
        console.error('[register] error:', error)
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 })
    }
}