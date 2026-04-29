import Link from "next/link";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";

export default async function Navbar() {

    const session = await getServerSession(authOptions)

  return (
    <nav className="flex justify-between items-center bg-gray-900 text-white px-24">
        <h1 className="text-xl font-bold">Aplicación NextAuth</h1>
        <ul className="flex gap-x-2">
            {!session?.user ? (
                <>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/auth/login">Login</Link></li>
                    <li><Link href="/auth/register">Registrar</Link></li>
                </>
            ):(<>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/api/auth/signout">Logout</Link></li>
            
            </>)}
        </ul>
    </nav>
  )
}
