import type { CollectionConfig } from 'payload'

import { isWebsiteOwner, canReadWebsite } from '../access/tenant'
import { anyone } from '../access/anyone'

export const Websites: CollectionConfig = {
  slug: 'websites',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'owner'],
  },
  access: {
    // Anyone logged in can create a website
    create: ({ req: { user } }) => {
      if (user) return true
      return false
    },
    read: canReadWebsite,
    update: isWebsiteOwner,
    delete: isWebsiteOwner,
  },
  hooks: {
    beforeValidate: [
      ({ req, operation, data }) => {
        // Automatically set the owner to the current user if not provided or if normal user
        if (operation === 'create') {
          if (req.user) {
            // Normal users cannot create websites for other people
            if (!req.user.roles?.includes('admin')) {
              data.owner = req.user.id
            } else if (!data.owner) {
              data.owner = req.user.id
            }
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Used in the URL, e.g., /my-site/home',
      },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      access: {
        update: ({ req: { user } }) => {
          return user?.roles?.includes('admin') || false
        },
      },
      admin: {
        condition: (data, siblingData, { user }) => {
          // Only show owner field if user is admin, else it is handled automatically
          return user?.roles?.includes('admin') || false
        },
      },
    },
    {
      name: 'editors',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Editors can create, edit, and publish any content on this website.',
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'users',
      hasMany: true,
      admin: {
        description: 'Authors can only create and edit their own pages on this website.',
      },
    },
  ],
}
