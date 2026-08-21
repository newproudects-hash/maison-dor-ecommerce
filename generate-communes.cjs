require('dotenv').config({ path: '.env.local' });
const { communes } = require('geoalgeria');

// Build the TS file
const lines = [
  '// Auto-generated from geoalgeria — 1541 Algerian communes with Arabic names',
  'export interface Commune {',
  '  code_commune: number;',
  '  name_ar: string;',
  '  name_fr: string;',
  '  wilaya_code: number;',
  '}',
  '',
  'export const COMMUNES: Commune[] = [',
];

for (const c of communes) {
  const ar = (c.name_ar || c.name_fr || '').replace(/'/g, "\\'");
  const fr = (c.name_fr || '').replace(/'/g, "\\'");
  lines.push(`  { code_commune: ${c.code_commune}, name_ar: '${ar}', name_fr: '${fr}', wilaya_code: ${c.wilaya_code} },`);
}

lines.push('];');
lines.push('');
lines.push('/** Get communes for a specific wilaya code */');
lines.push('export function getCommunesByWilaya(wilayaCode: number): Commune[] {');
lines.push('  return COMMUNES.filter(c => c.wilaya_code === wilayaCode);');
lines.push('}');

const fs = require('fs');
fs.writeFileSync('lib/data/communes.ts', lines.join('\n'), 'utf8');
console.log('Done! Communes file written:', communes.length, 'entries');
