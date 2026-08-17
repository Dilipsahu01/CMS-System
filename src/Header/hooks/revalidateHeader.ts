import type { CollectionAfterChangeHook } from 'payload'

let revalidateTag: (tag: string) => void
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const nextCache = require('next/cache')
  revalidateTag = nextCache.revalidateTag
} catch {
  revalidateTag = () => {}
}

export const revalidateHeader: CollectionAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)

    revalidateTag('global_header', 'max')
  }

  return doc
}
