import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function PageTemplate() {
  const payload = await getPayload({ config: configPromise })

  // Fetch all websites
  const websites = await payload.find({
    collection: 'websites',
    depth: 0,
    limit: 100,
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      {/* Top Navigation */}
      <header className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-bold tracking-tight">Archscale CMS</div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="text-gray-600 hover:text-black font-medium px-4 py-2"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="bg-black text-white px-5 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors shadow-sm"
          >
            Sign Up
          </Link>
          <Link
            href="/admin"
            className="bg-gray-100 text-black border border-gray-200 px-5 py-2 rounded-md font-medium hover:bg-gray-200 transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 pt-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-black tracking-tight">
            Explore the Network
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Welcome to the public directory of all websites hosted on our platform. 
            Click on any website below to view its public pages.
          </p>
        </div>

        {websites.docs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No websites found</h3>
            <p className="text-gray-500 mb-6">There are currently no public websites available on the platform.</p>
            <Link
              href="/signup"
              className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
            >
              Create the first one!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.docs.map((website) => (
              <Link 
                key={website.id} 
                href={`/${website.slug}`}
                className="group flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 border-b border-gray-100 flex items-center justify-center">
                  <span className="text-4xl">🌍</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {website.title}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    /{website.slug}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
