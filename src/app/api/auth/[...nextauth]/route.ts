import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

const authOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null
                }
                console.log('authorize credentials:', credentials)

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                })
                if (!user) {
                    console.log('Usuario no encontrado')
                    return null
                }

                const matchPassword = await bcrypt.compare(credentials.password, user.password)
                if (!matchPassword) {
                    console.log('Contraseña incorrecta')
                    return null
                }

                return {
                    id: String(user.id),
                    name: user.username,
                    email: user.email,
                };
            }
        })
    ],
    pages: {
        signIn: '/auth/login'
    },
    secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
export { authOptions }
