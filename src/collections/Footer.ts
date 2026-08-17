import type { CollectionConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from '../Footer/hooks/revalidateFooter'
import { isTenantAdmin, isTenantAdminCreate } from '../access/tenant'
import { anyone } from '../access/anyone'
import { tenantAssociation } from '../hooks/tenantAssociation'
import { tenantListFilter } from '../access/tenantListFilter'

export const Footer: CollectionConfig = {
  slug: 'footer',
  access: {
    create: isTenantAdminCreate,
    read: anyone,
    update: isTenantAdmin,
    delete: isTenantAdmin,
  },
  fields: [
    {
      name: 'website',
      type: 'relationship',
      relationTo: 'websites',
      required: true,
      unique: true, // 1:1 relationship
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.roles?.includes('admin') || false,
      },
    },
    {
      name: 'navItems',
      type: 'array',
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
      admin: {
        initCollapsed: true,
        components: {
          RowLabel: '@/Footer/RowLabel#RowLabel',
        },
      },
    },
  ],
  admin: {
    baseListFilter: tenantListFilter,
  },
  hooks: {
    beforeValidate: [tenantAssociation],
    afterChange: [revalidateFooter],
  },
}
