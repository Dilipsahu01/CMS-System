'use client'

import React, { useEffect, useState } from 'react'

export const TenantSelector: React.FC = () => {
  const [websites, setWebsites] = useState<{ id: string | number; title: string }[]>([])
  const [activeTenant, setActiveTenant] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Read current cookie
    const match = document.cookie.match(/(?:^|; )payload-tenant=([^;]+)/)
    if (match) {
      setActiveTenant(match[1])
    }

    // Fetch user's websites
    const fetchWebsites = async () => {
      try {
        const res = await fetch('/api/websites?limit=100')
        if (res.ok) {
          const json = await res.json()
          setWebsites(json.docs || [])
        }
      } catch (err) {
        console.error('Error fetching websites:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWebsites()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setActiveTenant(val)
    if (val) {
      document.cookie = `payload-tenant=${val}; path=/; max-age=31536000` // 1 year
    } else {
      document.cookie = 'payload-tenant=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
    // Reload the admin panel to update context
    window.location.reload()
  }

  // Only show if user has more than 1 website
  if (loading || websites.length <= 1) {
    return null
  }

  return (
    <div style={{ padding: '0 var(--base-half) var(--base-half) var(--base-half)' }}>
      <label
        htmlFor="tenant-selector"
        style={{
          display: 'block',
          marginBottom: 'var(--base-quarter)',
          color: 'var(--theme-elevation-400)',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        Active Website
      </label>
      <select
        id="tenant-selector"
        value={activeTenant}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: 'var(--base-half)',
          backgroundColor: 'var(--theme-bg)',
          color: 'var(--theme-elevation-800)',
          border: '1px solid var(--theme-elevation-150)',
          borderRadius: 'var(--style-radius-m)',
          cursor: 'pointer',
        }}
      >
        <option value="">-- Select a Website --</option>
        {websites.map((site) => (
          <option key={site.id} value={site.id}>
            {site.title}
          </option>
        ))}
      </select>
    </div>
  )
}
