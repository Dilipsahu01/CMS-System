import type { CollectionConfig } from 'payload'

import { adminsAndUser } from '../../access/adminsAndUser'

import { authenticated } from '../../access/authenticated'
import { anyone } from '../../access/anyone'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: authenticated,
    create: anyone,
    delete: adminsAndUser,
    read: adminsAndUser,
    update: adminsAndUser,
  },
  admin: {
    defaultColumns: ['name', 'email'],
    useAsTitle: 'name',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      saveToJWT: true,
      defaultValue: ['user'],
      options: [
        {
          label: 'admin',
          value: 'admin',
        },
        {
          label: 'user',
          value: 'user',
        },
      ],
      hooks: {
        beforeChange: [
          ({ req, value }) => {
            // Internal calls (like seed scripts) don't have a user, allow them to set roles
            if (!req.user) {
              return value
            }
            // Only admins can change roles manually
            if (req.user.roles?.includes('admin')) {
              return value
            }
            return ['user'] // Force user role if not admin
          },
        ],
      },
    },
  ],
  timestamps: true,
}
