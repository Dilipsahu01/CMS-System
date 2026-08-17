import type { CollectionAfterChangeHook } from 'payload'

let revalidateTag: (tag: string) => void
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nextCache = require('next/cache')
  revalidateTag = nextCache.revalidateTag
} catch {
  revalidateTag = () => {}
}

export const revalidateFooter: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)

    revalidateTag('global_footer', 'max')
  }

  return doc
}
