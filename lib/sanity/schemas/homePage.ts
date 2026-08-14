import { defineField, defineType } from 'sanity';

export const homePage = defineType({
  name: 'homePage',
  title: 'الصفحة الرئيسية',
  type: 'document',
  fields: [
    defineField({
      name: 'heroImage',
      title: 'صورة البانر الرئيسي (Hero)',
      type: 'image',
      options: { hotspot: true },
      description: 'الصورة الكبيرة التي تظهر في الصفحة الرئيسية عند فتح الموقع',
      validation: r => r.required().error('يجب إضافة صورة للبانر الرئيسي'),
    }),

    defineField({
      name: 'heroImageMobile',
      title: 'صورة البانر للجوال (اختياري)',
      type: 'image',
      options: { hotspot: true },
      description: 'صورة مختلفة تظهر على الجوال فقط (إذا تركت فارغة سيُستخدم البانر الرئيسي)',
    }),

    defineField({
      name: 'marqueeText',
      title: 'نص الشريط المتحرك',
      type: 'string',
      description: 'النص الذي يتحرك في الشريط أسفل البانر',
      initialValue: 'LIVRAISON RAPIDE ✦ QUALITÉ PREMIUM ✦ MAISON D\'OR ✦ NOUVEAUX ARRIVAGES ✦',
    }),

    defineField({
      name: 'announcementBar',
      title: 'شريط الإعلانات (أعلى الصفحة)',
      type: 'object',
      fields: [
        { name: 'enabled', title: 'تفعيل', type: 'boolean', initialValue: false },
        { name: 'text', title: 'النص', type: 'string', description: 'مثال: شحن مجاني لجميع الولايات اليوم فقط!' },
        { name: 'bgColor', title: 'لون الخلفية (Hex)', type: 'string', initialValue: '#D4AF37' },
      ],
      options: { collapsible: true, collapsed: false },
    }),
  ],

  preview: {
    prepare() {
      return { title: 'الصفحة الرئيسية' };
    },
  },
});
