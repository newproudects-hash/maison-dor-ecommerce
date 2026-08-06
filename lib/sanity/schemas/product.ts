import { defineField, defineType } from 'sanity';

export const product = defineType({
  name: 'product',
  title: 'المنتجات',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'اسم المنتج',
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
      type: 'slug',
      options: { source: 'title.en', maxLength: 96 },
      validation: r => r.required(),
      description: 'الرابط الذي يظهر في المتصفح (يفضل أن يكون بالإنجليزية)',
    }),

    defineField({
      name: 'description',
      title: 'وصف المنتج',
      type: 'object',
      fields: [
        { name: 'ar', title: 'العربية 🇩🇿', type: 'text', rows: 4 },
        { name: 'fr', title: 'Français 🇫🇷', type: 'text', rows: 4 },
        { name: 'en', title: 'English 🇺🇸', type: 'text', rows: 4 },
      ],
    }),

    defineField({
      name: 'originalPrice',
      title: 'السعر الأصلي (DA)',
      type: 'number',
      description: 'السعر قبل التخفيض (اختياري - سيظهر مشطوباً إذا كان موجوداً)',
      validation: r => r.min(0),
    }),

    defineField({
      name: 'price',
      title: 'السعر الحالي / بعد التخفيض (DA)',
      type: 'number',
      validation: r => r.required().min(0),
    }),

    defineField({
      name: 'images',
      title: 'صور المنتج',
      type: 'array',
      of: [{
        type: 'image',
        options: { hotspot: true },
        fields: [
          { name: 'alt', type: 'string', title: 'وصف الصورة (ALT) للـ SEO' },
        ],
      }],
      validation: r => r.required().min(1).error('يجب إضافة صورة واحدة على الأقل'),
    }),

    defineField({
      name: 'category',
      title: 'القسم',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: r => r.required(),
    }),

    defineField({
      name: 'placement',
      title: 'مكان الظهور في الموقع',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'الرئيسية (Home)', value: 'home' },
          { title: 'وصلنا حديثاً (New Arrivals)', value: 'new_arrivals' },
          { title: 'الأكثر مبيعاً (Best Sellers)', value: 'best_sellers' },
          { title: 'منتجات مميزة (Featured)', value: 'featured' },
        ],
      },
      description: 'اختر أين تريد أن يظهر هذا المنتج في الموقع',
    }),

    defineField({
      name: 'colors',
      title: 'الألوان المتاحة',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'أسود (Black)', value: '#000000' },
          { title: 'أبيض (White)', value: '#FFFFFF' },
          { title: 'أحمر (Red)', value: '#FF0000' },
          { title: 'أزرق (Blue)', value: '#0000FF' },
          { title: 'أصفر (Yellow)', value: '#FFFF00' },
          { title: 'أخضر (Green)', value: '#008000' },
          { title: 'بني (Brown)', value: '#A52A2A' },
          { title: 'رمادي (Gray)', value: '#808080' },
          { title: 'وردي (Pink)', value: '#FFC0CB' },
          { title: 'بنفسجي (Purple)', value: '#800080' },
          { title: 'برتقالي (Orange)', value: '#FFA500' },
          { title: 'بيج (Beige)', value: '#F5F5DC' },
          { title: 'ذهبي (Gold)', value: '#FFD700' },
          { title: 'فضي (Silver)', value: '#C0C0C0' },
          { title: 'كحلي (Navy)', value: '#000080' },
          { title: 'عنابي (Maroon)', value: '#800000' },
          { title: 'زيتوني (Olive)', value: '#808000' },
          { title: 'سماوي (Cyan)', value: '#00FFFF' },
          { title: 'كريمي (Cream)', value: '#FFFDD0' },
          { title: 'خردلي (Mustard)', value: '#FFDB58' },
          { title: 'مشمشي (Apricot)', value: '#FBCEB1' },
          { title: 'خوخي (Peach)', value: '#FFE5B4' },
          { title: 'تركوازي (Turquoise)', value: '#40E0D0' },
          { title: 'نيلي (Indigo)', value: '#4B0082' },
          { title: 'رصاصي داكن (Dark Gray)', value: '#A9A9A9' },
          { title: 'شامبين (Champagne)', value: '#F7E7CE' },
          { title: 'نبيذي (Wine)', value: '#722F37' },
          { title: 'فيروزي (Teal)', value: '#008080' },
          { title: 'ليلكي (Lilac)', value: '#C8A2C8' },
          { title: 'ماجنتا (Magenta)', value: '#FF00FF' },
          { title: 'كورال (Coral)', value: '#FF7F50' },
          { title: 'كاكي (Khaki)', value: '#C3B091' },
        ],
      },
      description: 'اختر الألوان المتوفرة لهذا المنتج (يمكنك اختيار أكثر من لون)',
    }),

    defineField({
      name: 'sizes',
      title: 'المقاسات المتوفرة',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          // مقاسات الملابس
          { title: 'XS', value: 'XS' },
          { title: 'S', value: 'S' },
          { title: 'M', value: 'M' },
          { title: 'L', value: 'L' },
          { title: 'XL', value: 'XL' },
          { title: 'XXL', value: 'XXL' },
          { title: '3XL', value: '3XL' },
          { title: 'قياس موحد (Unique)', value: 'Unique' },
          // مقاسات الأحذية من 1 إلى 50
          ...Array.from({ length: 50 }, (_, i) => ({ title: String(i + 1), value: String(i + 1) }))
        ],
        layout: 'grid',
      },
    }),

    defineField({
      name: 'inStock',
      title: 'متوفر في المخزن',
      type: 'boolean',
      initialValue: true,
    }),

    defineField({
      name: 'order',
      title: 'ترتيب العرض',
      type: 'number',
      initialValue: 0,
    }),
  ],

  preview: {
    select: {
      title: 'title.ar',
      media: 'images.0',
      price: 'price',
      originalPrice: 'originalPrice',
    },
    prepare({ title, media, price, originalPrice }) {
      const priceStr = price ? `${price.toLocaleString('fr-DZ')} DA` : '';
      const origStr = originalPrice ? ` (أصلي: ${originalPrice} DA)` : '';
      return {
        title: title || 'بدون اسم',
        subtitle: `${priceStr}${origStr}`,
        media,
      };
    },
  },
});
