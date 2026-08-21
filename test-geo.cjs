require('dotenv').config({ path: '.env.local' });
const { wilayas, communes } = require('geoalgeria');

// Test data
const firstWilaya = wilayas[0];
const firstCommunes = communes.filter(c => c.wilaya_code === firstWilaya.code).slice(0, 3);
console.log('Sample wilaya:', JSON.stringify(firstWilaya, null, 2));
console.log('Sample communes:', JSON.stringify(firstCommunes, null, 2));
console.log('Total wilayas:', wilayas.length);
console.log('Total communes:', communes.length);
