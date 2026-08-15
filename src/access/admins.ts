import type { AccessArgs } from 'payload'

import type { User } from '@/payload-types'

type isAuthenticated = (args: AccessArgs<User>) => boolean

export const admins: isAuthenticated = ({ req: { user } }) => {
  return Boolean(user?.roles?.includes('admin'))
}
