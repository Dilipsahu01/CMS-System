import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Log In | CMS Builder Platform',
  description: 'Log into your CMS Builder Platform account.',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-[80%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/30 blur-[120px] pointer-events-none" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-white hover:text-neutral-300 transition-colors">
            Register here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
