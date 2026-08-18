import { defineField, defineType } from 'sanity';

export const category = defineType({
  name: 'category',
  title: 'الأقسام',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'اسم القسم',
      type: 'object',
      fields: [
        { name: 'ar', title: 'العربية 🇩🇿', type: 'string', validation: r => r.required() },
        { name: 'fr', title: 'Français 🇫🇷', type: 'string' },
        { name: 'en', title: 'English 🇺🇸', type: 'string' },
      ],
    }),
    
    defineField({
      name: 'slug',
      title: 'الرابط (Slug)',
      description: 'الرابط الذي سيظهر في المتصفح (يفضل أن يكون بالإنجليزية أو الفرنسية)',
      type: 'slug',
      options: {
        source: (doc: any) => {
          const t = doc.title;
          const base = (typeof t === 'object' ? (t?.en || t?.fr || t?.ar) : t) || '';
          return base
            .toLowerCase()
            .trim()
            .replace(/[\s\u0600-\u06FF]+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        },
        maxLength: 96,
      },
      validation: r => r.required(),
    }),
    
    defineField({
      name: 'description',
      title: 'وصف القسم',
      type: 'object',
      fields: [
        { name: 'ar', title: 'العربية 🇩🇿', type: 'text', rows: 3 },
        { name: 'fr', title: 'Français 🇫🇷', type: 'text', rows: 3 },
        { name: 'en', title: 'English 🇺🇸', type: 'text', rows: 3 },
      ],
    }),

    defineField({
      name: 'image',
      title: 'صورة القسم',
      type: 'image',
      options: { hotspot: true },
    }),

    defineField({
      name: 'heroImage',
      title: 'صورة البانر (Hero)',
      type: 'image',
      options: { hotspot: true },
      description: 'صورة كبيرة تظهر في أعلى صفحة القسم',
    }),

    defineField({
      name: 'order',
      title: 'ترتيب العرض',
      type: 'number',
      initialValue: 0,
    }),
  ],

  preview: {
    select: { title: 'title.ar', media: 'image' },
    prepare({ title, media }) {
      return { title: title || 'بدون اسم', media };
    },
  },
});
