import type { CollectionConfig } from 'payload'

import { canCreatePage, canReadPage, canUpdateOrDeletePage } from '../../access/tenant'

import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { FAQ } from '../../blocks/FAQ/config'
import { Statistics } from '../../blocks/Statistics/config'
import { Testimonials } from '../../blocks/Testimonials/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'
import { tenantAssociation } from '../../hooks/tenantAssociation'
import { tenantListFilter } from '../../access/tenantListFilter'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  access: {
    create: canCreatePage,
    delete: canUpdateOrDeletePage,
    read: canReadPage,
    update: canUpdateOrDeletePage,
  },
  // This config controls what's populated by default when a page is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // Type safe if the collection slug generic is passed to `CollectionConfig` - `CollectionConfig<'pages'>
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    baseListFilter: tenantListFilter,
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: async ({ data, req }) =>
        await generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
          website: data?.website,
        }),
    },
    preview: async (data, { req }) =>
      await generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
        website: data?.website,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'website',
      type: 'relationship',
      relationTo: 'websites',
      required: true,
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.roles?.includes('admin') || false,
      },
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        condition: (data, siblingData, { user }) => user?.roles?.includes('admin') || false,
      },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'layout',
              type: 'blocks',
              blocks: [CallToAction, Content, MediaBlock, FormBlock, FAQ, Statistics, Testimonials],
              required: true,
              admin: {
                initCollapsed: true,
              },
            },
          ],
          label: 'Content',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField({ disableUnique: true }),
  ],
  hooks: {
    beforeValidate: [
      tenantAssociation,
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user) {
          if (!data?.author) {
            data.author = req.user.id
          }
        }
        return data
      },
    ],
    afterChange: [revalidatePage],
    beforeChange: [populatePublishedAt],
    afterDelete: [revalidateDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
