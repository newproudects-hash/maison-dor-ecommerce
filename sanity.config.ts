import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { schema } from './lib/sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  
  title: 'Maison Dor Studio',

  plugins: [deskTool()],

  schema: {
    types: schema.types,
  },
})
