import type { CollectionConfig } from 'payload'

import { authenticated } from '../../access/authenticated'

import { anyone } from '../../access/anyone'
import { adminsAndUser } from '../../access/adminsAndUser'

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
            // Only admins can change roles
            if (req.user && req.user.roles?.includes('admin')) {
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
