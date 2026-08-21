// Auto-generated from geoalgeria package - 69 Algerian wilayas with Arabic names
// DO NOT edit manually — regenerate from the package if needed

export interface Wilaya {
  code: number;
  name_ar: string;
  name_fr: string;
  phone_code: string;
  postal_code: string;
}

export interface Commune {
  code_commune: number;
  name_ar: string;
  name_fr: string;
  wilaya_code: number;
  daira: string;
  postal_code: string;
}

// All 69 Algerian wilayas in Arabic
export const WILAYAS: Wilaya[] = [
  { code: 1,  name_ar: 'أدرار',              name_fr: 'Adrar',               phone_code: '049', postal_code: '01000' },
  { code: 2,  name_ar: 'الشلف',              name_fr: 'Chlef',               phone_code: '027', postal_code: '02000' },
  { code: 3,  name_ar: 'الأغواط',            name_fr: 'Laghouat',            phone_code: '029', postal_code: '03000' },
  { code: 4,  name_ar: 'أم البواقي',         name_fr: 'Oum El Bouaghi',      phone_code: '032', postal_code: '04000' },
  { code: 5,  name_ar: 'باتنة',              name_fr: 'Batna',               phone_code: '033', postal_code: '05000' },
  { code: 6,  name_ar: 'بجاية',              name_fr: 'Béjaïa',              phone_code: '034', postal_code: '06000' },
  { code: 7,  name_ar: 'بسكرة',              name_fr: 'Biskra',              phone_code: '033', postal_code: '07000' },
  { code: 8,  name_ar: 'بشار',               name_fr: 'Béchar',              phone_code: '049', postal_code: '08000' },
  { code: 9,  name_ar: 'البليدة',            name_fr: 'Blida',               phone_code: '025', postal_code: '09000' },
  { code: 10, name_ar: 'البويرة',            name_fr: 'Bouira',              phone_code: '026', postal_code: '10000' },
  { code: 11, name_ar: 'تمنراست',            name_fr: 'Tamanrasset',         phone_code: '029', postal_code: '11000' },
  { code: 12, name_ar: 'تبسة',               name_fr: 'Tébessa',             phone_code: '037', postal_code: '12000' },
  { code: 13, name_ar: 'تلمسان',             name_fr: 'Tlemcen',             phone_code: '043', postal_code: '13000' },
  { code: 14, name_ar: 'تيارت',              name_fr: 'Tiaret',              phone_code: '046', postal_code: '14000' },
  { code: 15, name_ar: 'تيزي وزو',           name_fr: 'Tizi Ouzou',          phone_code: '026', postal_code: '15000' },
  { code: 16, name_ar: 'الجزائر',            name_fr: 'Alger',               phone_code: '021', postal_code: '16000' },
  { code: 17, name_ar: 'الجلفة',             name_fr: 'Djelfa',              phone_code: '027', postal_code: '17000' },
  { code: 18, name_ar: 'جيجل',               name_fr: 'Jijel',               phone_code: '034', postal_code: '18000' },
  { code: 19, name_ar: 'سطيف',               name_fr: 'Sétif',               phone_code: '036', postal_code: '19000' },
  { code: 20, name_ar: 'سعيدة',              name_fr: 'Saïda',               phone_code: '048', postal_code: '20000' },
  { code: 21, name_ar: 'سكيكدة',             name_fr: 'Skikda',              phone_code: '038', postal_code: '21000' },
  { code: 22, name_ar: 'سيدي بلعباس',        name_fr: 'Sidi Bel Abbès',      phone_code: '048', postal_code: '22000' },
  { code: 23, name_ar: 'عنابة',              name_fr: 'Annaba',              phone_code: '038', postal_code: '23000' },
  { code: 24, name_ar: 'قالمة',              name_fr: 'Guelma',              phone_code: '037', postal_code: '24000' },
  { code: 25, name_ar: 'قسنطينة',            name_fr: 'Constantine',         phone_code: '031', postal_code: '25000' },
  { code: 26, name_ar: 'المدية',             name_fr: 'Médéa',               phone_code: '025', postal_code: '26000' },
  { code: 27, name_ar: 'مستغانم',            name_fr: 'Mostaganem',          phone_code: '045', postal_code: '27000' },
  { code: 28, name_ar: 'المسيلة',            name_fr: "M'Sila",              phone_code: '035', postal_code: '28000' },
  { code: 29, name_ar: 'معسكر',              name_fr: 'Mascara',             phone_code: '045', postal_code: '29000' },
  { code: 30, name_ar: 'ورقلة',              name_fr: 'Ouargla',             phone_code: '029', postal_code: '30000' },
  { code: 31, name_ar: 'وهران',              name_fr: 'Oran',                phone_code: '041', postal_code: '31000' },
  { code: 32, name_ar: 'البيض',              name_fr: 'El Bayadh',           phone_code: '049', postal_code: '32000' },
  { code: 33, name_ar: 'اليزي',              name_fr: 'Illizi',              phone_code: '029', postal_code: '33000' },
  { code: 34, name_ar: 'برج بوعريريج',       name_fr: 'Bordj Bou Arréridj', phone_code: '035', postal_code: '34000' },
  { code: 35, name_ar: 'بومرداس',            name_fr: 'Boumerdès',           phone_code: '024', postal_code: '35000' },
  { code: 36, name_ar: 'الطارف',             name_fr: 'El Tarf',             phone_code: '038', postal_code: '36000' },
  { code: 37, name_ar: 'تندوف',              name_fr: 'Tindouf',             phone_code: '049', postal_code: '37000' },
  { code: 38, name_ar: 'تيسمسيلت',          name_fr: 'Tissemsilt',          phone_code: '046', postal_code: '38000' },
  { code: 39, name_ar: 'الوادي',             name_fr: 'El Oued',             phone_code: '033', postal_code: '39000' },
  { code: 40, name_ar: 'خنشلة',              name_fr: 'Khenchela',           phone_code: '032', postal_code: '40000' },
  { code: 41, name_ar: 'سوق أهراس',          name_fr: 'Souk Ahras',          phone_code: '037', postal_code: '41000' },
  { code: 42, name_ar: 'تيبازة',             name_fr: 'Tipaza',              phone_code: '024', postal_code: '42000' },
  { code: 43, name_ar: 'ميلة',               name_fr: 'Mila',                phone_code: '031', postal_code: '43000' },
  { code: 44, name_ar: 'عين الدفلى',         name_fr: 'Aïn Defla',           phone_code: '027', postal_code: '44000' },
  { code: 45, name_ar: 'النعامة',            name_fr: 'Naâma',               phone_code: '049', postal_code: '45000' },
  { code: 46, name_ar: 'عين تموشنت',         name_fr: 'Aïn Témouchent',      phone_code: '043', postal_code: '46000' },
  { code: 47, name_ar: 'غرداية',             name_fr: 'Ghardaïa',            phone_code: '029', postal_code: '47000' },
  { code: 48, name_ar: 'غليزان',             name_fr: 'Relizane',            phone_code: '046', postal_code: '48000' },
  { code: 49, name_ar: 'تيميمون',            name_fr: 'Timimoun',            phone_code: '049', postal_code: '49000' },
  { code: 50, name_ar: 'برج باجي مختار',     name_fr: 'Bordj Badji Mokhtar', phone_code: '049', postal_code: '50000' },
  { code: 51, name_ar: 'أولاد جلال',         name_fr: 'Ouled Djellal',       phone_code: '033', postal_code: '51000' },
  { code: 52, name_ar: 'بني عباس',           name_fr: 'Béni Abbès',          phone_code: '049', postal_code: '52000' },
  { code: 53, name_ar: 'عين صالح',           name_fr: 'In Salah',            phone_code: '029', postal_code: '53000' },
  { code: 54, name_ar: 'عين قزام',           name_fr: 'In Guezzam',          phone_code: '029', postal_code: '54000' },
  { code: 55, name_ar: 'توقرت',              name_fr: 'Touggourt',           phone_code: '029', postal_code: '55000' },
  { code: 56, name_ar: 'جانت',               name_fr: 'Djanet',              phone_code: '029', postal_code: '56000' },
  { code: 57, name_ar: 'المغير',             name_fr: "El M'Ghair",          phone_code: '033', postal_code: '57000' },
  { code: 58, name_ar: 'المنيعة',            name_fr: 'El Meniaa',           phone_code: '029', postal_code: '58000' },
  { code: 59, name_ar: 'آفلو',               name_fr: 'Aflou',               phone_code: '029', postal_code: '59000' },
  { code: 60, name_ar: 'بريكة',              name_fr: 'Barika',              phone_code: '033', postal_code: '60000' },
  { code: 61, name_ar: 'القنطرة',            name_fr: 'El Kantara',          phone_code: '033', postal_code: '61000' },
  { code: 62, name_ar: 'بير العاتر',         name_fr: 'Bir El Ater',         phone_code: '037', postal_code: '62000' },
  { code: 63, name_ar: 'العريشة',            name_fr: 'El Aouinet',          phone_code: '037', postal_code: '63000' },
  { code: 64, name_ar: 'قصر الشلالة',        name_fr: 'Ksar El Hirane',      phone_code: '046', postal_code: '64000' },
  { code: 65, name_ar: 'عين وسارة',          name_fr: 'Ain Oussera',         phone_code: '027', postal_code: '65000' },
  { code: 66, name_ar: 'مسعد',               name_fr: "M'Saad",              phone_code: '029', postal_code: '66000' },
  { code: 67, name_ar: 'قصر البخاري',        name_fr: 'Ksar El Boukhari',    phone_code: '025', postal_code: '67000' },
  { code: 68, name_ar: 'بوسعادة',            name_fr: 'Bou Saâda',           phone_code: '035', postal_code: '68000' },
  { code: 69, name_ar: 'الأبيض سيدي الشيخ', name_fr: 'El Abiodh Sidi Cheikh',phone_code: '049', postal_code: '69000' },
];

// Helper to get label for option display: "01 - أدرار"
export function wilayaLabel(w: Wilaya): string {
  return `${String(w.code).padStart(2, '0')} - ${w.name_ar}`;
}

// Helper: extract wilaya code from label like "01 - أدرار"
export function parseWilayaCode(label: string): number {
  return parseInt(label.split(' - ')[0]) || 0;
}

// Delivery fallback defaults (overridden by Supabase prices)
export const LIVRAISON_DOMICILE = 400; // DA
export const LIVRAISON_BUREAU = 200;   // DA
