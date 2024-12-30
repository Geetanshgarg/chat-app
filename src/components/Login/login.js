"use client"
import React from 'react'
import Image from 'next/image'
import { useFormState, useFormStatus } from 'react-dom'

const Login = () => {
  return (
     // main container
     <div className="flex h-screen w-screen items-center justify-center">
     {/* login page contianer */}
     <div className="contain flex flex-col items-center justify-center border p-6 rounded">
       <Image className="my-4 "src="/main.svg" width={100} height={200} alt='logo'/>
       <div className=' text-3xl font-extrabold'>Login to Your account</div>
       <div className="flex flex-col w-[90%] my-4">
         <h1 className='font-bold'>Username</h1>  <input className="input mb-2 border p-2 rounded" type="text" placeholder="Username" />
         <h1 className='font-bold'>Password</h1>  <input className="input mb-2 border p-2 rounded" type="password" placeholder="Password" />
         <button className="border mx-20 my-10 p-2 bg-slate-600 hover:bg-slate-400">Login</button>
       </div>
     </div>
   </div>
  )
}

export default Login