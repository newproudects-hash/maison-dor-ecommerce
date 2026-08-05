import { defineField, defineType } from 'sanity';

export const settings = defineType({
  name: 'settings',
  title: 'Paramètres du site',
  type: 'document',
  // مستند واحد فقط
  // __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({
      name: 'heroImage',
      title: 'Image Hero (page d\'accueil)',
      type: 'image',
      options: { hotspot: true },
    }),

    defineField({
      name: 'boutiqueHeroImage',
      title: 'Image Hero (page Boutique)',
      type: 'image',
      options: { hotspot: true },
    }),

    defineField({
      name: 'marqueeText',
      title: 'Texte du bandeau animé',
      type: 'object',
      fields: [
        { name: 'fr', title: 'Français', type: 'string', initialValue: "Bienvenue chez Maison d'Or • Livraison dans toute l'Algérie • Collections Exclusives" },
        { name: 'ar', title: 'العربية', type: 'string' },
        { name: 'en', title: 'English', type: 'string' },
      ],
    }),

    defineField({
      name: 'socialLinks',
      title: 'Réseaux sociaux',
      type: 'object',
      fields: [
        { name: 'facebook', title: 'Facebook URL', type: 'url' },
        { name: 'telegram', title: 'Telegram URL', type: 'url' },
        { name: 'tiktok', title: 'TikTok URL', type: 'url' },
        { name: 'instagram', title: 'Instagram URL', type: 'url' },
        { name: 'whatsapp', title: 'WhatsApp URL', type: 'url' },
      ],
    }),
  ],
});
