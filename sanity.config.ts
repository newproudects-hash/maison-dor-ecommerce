import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schema } from './lib/sanity/schemas'

export default defineConfig({
  basePath: '/studio',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '4zyu7eeg',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  
  title: "Maison D'Or Studio",

  plugins: [structureTool()],

  schema: {
    types: schema.types,
  },
})
