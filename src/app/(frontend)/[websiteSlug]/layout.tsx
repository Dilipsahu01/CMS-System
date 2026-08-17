import React from 'react'
import { Header } from '@/Header/Component'
import { Footer } from '@/Footer/Component'

export default async function WebsiteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ websiteSlug: string }>
}) {
  const { websiteSlug } = await params
  return (
    <>
      <Header websiteSlug={websiteSlug} />
      {children}
      <Footer websiteSlug={websiteSlug} />
    </>
  )
}
