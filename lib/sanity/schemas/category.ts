import { defineField, defineType } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'Catégorie',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Nom de la catégorie',
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
      name: 'image',
      title: 'Image de la catégorie',
      type: 'image',
      options: { hotspot: true },
    }),

    defineField({
      name: 'heroImage',
      title: 'Image Hero (page catégorie)',
      type: 'image',
      options: { hotspot: true },
      description: 'صورة fullscreen للـ hero section في صفحة هذا القسم',
    }),

    defineField({
      name: 'order',
      title: 'Ordre d\'affichage',
      type: 'number',
      initialValue: 0,
    }),
  ],

  preview: {
    select: { title: 'title.fr', media: 'image' },
    prepare({ title, media }) {
      return { title: title || 'Sans titre', media };
    },
  },
});
