// verify_flags.mjs - 代表的な技の flags を検証するスクリプト
import { readFileSync } from 'fs';

const content = readFileSync('d:/cドラ避難所/0505-1446/project/src/data/moves.ts', 'utf-8');

const checks = [
  ['closecombat', '接触○'],
  ['earthquake', '接触×'],
  ['aquajet', '接触○'],
  ['thunderbolt', '接触×'],
  ['darkpulse', 'pulse○'],
  ['ironhead', '接触○'],
  ['aerialace', 'slicing+contact'],
  ['alluringvoice', 'sound○'],
  ['icepunch', 'punch+contact'],
  ['crunch', 'bite+contact'],
  ['bodypress', '接触○'],
  ['hammerarm', 'punch+contact'],
  ['aircutter', 'slicing○'],
];

for (const [id, expected] of checks) {
  const re = new RegExp(`id:\\s*["']${id}["'][\\s\\S]*?flags:\\s*\\{([^}]*)\\}`);
  const m = content.match(re);
  console.log(`${id}: ${m ? 'flags={' + m[1].trim() + '}' : 'flags未検出'} (期待: ${expected})`);
}
