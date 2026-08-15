'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SignUpForm() {
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      // 1. Create User
      const createRes = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const createData = await createRes.json()

      if (!createRes.ok) {
        throw new Error(createData?.errors?.[0]?.message || 'An error occurred during registration.')
      }

      // 2. Automatically Log In
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const loginData = await loginRes.json()

      if (!loginRes.ok) {
        throw new Error(loginData?.message || 'Failed to login after registration.')
      }

      // 3. Redirect to Admin Dashboard
      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-neutral-300">
          Full Name
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="appearance-none block w-full px-3 py-3 border border-white/10 rounded-md shadow-sm bg-black/50 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 sm:text-sm transition-colors"
            placeholder="John Doe"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-neutral-300">
          Email address
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-3 border border-white/10 rounded-md shadow-sm bg-black/50 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 sm:text-sm transition-colors"
            placeholder="john@example.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-neutral-300">
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-3 border border-white/10 rounded-md shadow-sm bg-black/50 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 sm:text-sm transition-colors"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-3 border border-white/10 rounded-md shadow-sm bg-black/50 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 sm:text-sm transition-colors"
            placeholder="••••••••"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-white hover:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </div>
    </form>
  )
}
