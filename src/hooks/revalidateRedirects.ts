import type { CollectionAfterChangeHook } from 'payload'

let revalidateTag: (tag: string) => void
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nextCache = require('next/cache')
  revalidateTag = nextCache.revalidateTag
} catch {
  revalidateTag = () => {}
}

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating redirects`)

  revalidateTag('redirects', 'max')

  return doc
}
