"use client"
import next from "next"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
export default function Component() {
  const { data: session} = useSession()

  return (
    <div>
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-around items-center">
          <div className="text-white text-lg font-bold">
            MyApp
          </div>
          <div className="space-x-4">
            <a href="#" className="text-gray-300 hover:text-white">Home</a>
            <a href="#" className="text-gray-300 hover:text-white">About</a>
            <a href="#" className="text-gray-300 hover:text-white">Contact</a>
          </div>
          <div className="space-x-4">{session ? (
          <Link href= "/chat" className="text-gray-300 hover:text-white">
          Dashboard
          </Link>
):(
  <Link href="/login" className="text-gray-300 hover:text-white">
    Login
  </Link>
)}
        </div>
        </div>
      </nav>
      <div className="container mx-auto mt-4">
        
      </div>
    </div>
  )
}