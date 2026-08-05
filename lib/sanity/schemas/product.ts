import { defineField, defineType } from 'sanity';

export const product = defineType({
  name: 'product',
  title: 'Produit',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nom du produit',
      type: 'object',
      fields: [
        { name: 'fr', title: 'Français 🇫🇷', type: 'string', validation: r => r.required() },
        { name: 'ar', title: 'العربية 🇩🇿', type: 'string' },
        { name: 'en', title: 'English 🇺🇸', type: 'string' },
      ],
    }),

    defineField({
      name: 'slug',
      title: 'Slug URL',
      type: 'slug',
      options: { source: 'title.fr', maxLength: 96 },
      validation: r => r.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        { name: 'fr', title: 'Français 🇫🇷', type: 'text', rows: 4 },
        { name: 'ar', title: 'العربية 🇩🇿', type: 'text', rows: 4 },
        { name: 'en', title: 'English 🇺🇸', type: 'text', rows: 4 },
      ],
    }),

    defineField({
      name: 'price',
      title: 'Prix (DA)',
      type: 'number',
      validation: r => r.required().min(0),
    }),

    defineField({
      name: 'images',
      title: 'Images du produit',
      type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true },
        fields: [
          { name: 'alt', type: 'string', title: 'Description (ALT)' },
        ],
      }],
      validation: r => r.required().min(1).error('Au moins une image requise'),
    }),

    defineField({
      name: 'category',
      title: 'Catégorie',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: r => r.required(),
    }),

    defineField({
      name: 'colors',
      title: 'Couleurs disponibles',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'name', type: 'string', title: 'Nom de la couleur (ex: Noir)' },
          { name: 'hex', type: 'string', title: 'Couleur HEX (ex: #000000)' },
        ],
      }],
    }),

    defineField({
      name: 'sizes',
      title: 'Tailles disponibles',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'XS', value: 'XS' },
          { title: 'S', value: 'S' },
          { title: 'M', value: 'M' },
          { title: 'L', value: 'L' },
          { title: 'XL', value: 'XL' },
          { title: 'Unique', value: 'Unique' },
        ],
        layout: 'tags',
      },
    }),

    defineField({
      name: 'inStock',
      title: 'En stock',
      type: 'boolean',
      initialValue: true,
    }),

    defineField({
      name: 'isNewArrival',
      title: 'Nouvelle arrivée',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'isFeatured',
      title: 'Produit vedette',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'order',
      title: 'Ordre d\'affichage',
      type: 'number',
      initialValue: 0,
    }),
  ],

  preview: {
    select: {
      title: 'title.fr',
      media: 'images.0',
      price: 'price',
    },
    prepare({ title, media, price }) {
      return {
        title: title || 'Sans titre',
        subtitle: `${price?.toLocaleString('fr-DZ')} DA`,
        media,
      };
    },
  },
});
