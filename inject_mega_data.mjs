/**
 * inject_mega_data.mjs
 * pokedex.ts内のメガポケモンエントリに baseSpecies, isMega, reqItem を追加するスクリプト
 */
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/pokedex.ts');
let content = fs.readFileSync(filePath, 'utf8');

// メガストーンのIDマップ (Pokedex IDの数字部分 -> itemID のマッピング)
// items.ts の id フィールドに合わせる
const MEGA_ITEM_MAP = {
  // ID suffix -> item id
  '0003-m':    'venusaurite',
  '0006-mx':   'charizarditex',
  '0006-my':   'charizarditey',
  '0009-m':    'blastoisinite',
  '0015-m':    'beedrillite',
  '0018-m':    'pidgeotite',
  '0026-mx':   'aloraichuniumz',  // fallback
  '0026-my':   'aloraichuniumz',
  '0036-m':    'clefableite',
  '0065-m':    'alakazite',
  '0071-m':    'victreebelite',
  '0080-m':    'slowbronite',
  '0094-m':    'gengarite',
  '0115-m':    'kangaskhanite',
  '0121-m':    'starmiete',
  '0127-m':    'pinsirite',
  '0130-m':    'gyaradosite',
  '0142-m':    'aerodactylite',
  '0149-m':    'dragonite',   // fallback
  '0150-mx':   'mewtwonite-x',
  '0150-my':   'mewtwonite-y',
  '0154-m':    'meganiumite',
  '0160-m':    'feraligatrite',
  '0181-m':    'ampharosite',
  '0208-m':    'steelixite',
  '0212-m':    'scizorite',
  '0214-m':    'heracronite',
  '0229-m':    'houndoominite',
  '0248-m':    'tyranitarite',
  '0254-m':    'sceptilite',
  '0257-m':    'blazikenite',
  '0260-m':    'swampertite',
  '0282-m':    'gardevoirite',
  '0302-m':    'sablenite',
  '0303-m':    'mawilite',
  '0306-m':    'aggronite',
  '0308-m':    'medichamite',
  '0310-m':    'manectite',
  '0319-m':    'sharpedonite',
  '0323-m':    'cameruptite',
  '0334-m':    'altarianite',
  '0354-m':    'banettite',
  '0359-m':    'absolite',
  '0362-m':    'glalitite',
  '0373-m':    'salamencite',
  '0376-m':    'metagrossite',
  '0380-m':    'latiasite',
  '0381-m':    'latiosite',
  '0382-m':    'blueorb',
  '0383-m':    'redorb',
  '0384-m':    'rayquazite',
  '0428-m':    'lopunnite',
  '0445-m':    'garchompite',
  '0448-m':    'lucarionite',
  '0460-m':    'abomasite',
  '0475-m':    'galladite',
  '0531-m':    'audinite',
  '0542-m':    'leavannite',
  '0545-m':    'scolipede',
  '0700-m':    'diancite',
  '0719-m':    'diancite',
  '0745-m':    'lycanroc',  // fallback
};

// IDからbbaseSpecies (4桁ゼロ埋め数字部分) を抽出
function getBaseSpecies(megaId) {
  const match = megaId.match(/^(\d{4})/);
  return match ? match[1] : null;
}

// ヒットしたメガエントリにフィールドを追加する
// pokedex.tsの各エントリは { ... "weight": N } の形式なので
// "weight": N の後に追加
let modified = 0;

// まず全メガポケモンIDを収集
const megaPattern = /"id": "(\d{4}-m[xy]?)"/g;
let match;
const megaIds = [];
while ((match = megaPattern.exec(content)) !== null) {
  megaIds.push({ id: match[1], index: match.index });
}

console.log(`Found ${megaIds.length} mega entries`);

// 後ろから処理することでインデックスのズレを回避
for (let i = megaIds.length - 1; i >= 0; i--) {
  const { id } = megaIds[i];
  const baseSpecies = getBaseSpecies(id);
  if (!baseSpecies) continue;
  
  // reqItemを取得 (マップにない場合はnull)
  const reqItem = MEGA_ITEM_MAP[id] || null;
  
  // このエントリのweightフィールドの後に追加フィールドを挿入
  // エントリパターン: "weight": <number>\n  }
  // id フィールドを起点として、そのエントリのweightを探す
  const idMarker = `"id": "${id}"`;
  const idPos = content.indexOf(idMarker);
  if (idPos === -1) continue;
  
  // 既に isMega が存在する場合はスキップ
  // 次の { の位置からエントリの終わりを探す
  let braceDepth = 0;
  let entryStart = -1;
  let entryEnd = -1;
  for (let j = idPos; j >= 0; j--) {
    if (content[j] === '{') {
      entryStart = j;
      break;
    }
  }
  if (entryStart === -1) continue;
  
  braceDepth = 1;
  for (let j = entryStart + 1; j < content.length; j++) {
    if (content[j] === '{') braceDepth++;
    else if (content[j] === '}') {
      braceDepth--;
      if (braceDepth === 0) {
        entryEnd = j;
        break;
      }
    }
  }
  if (entryEnd === -1) continue;
  
  const entryContent = content.substring(entryStart, entryEnd + 1);
  if (entryContent.includes('isMega')) {
    console.log(`  Skipping ${id} - already has isMega`);
    continue;
  }
  
  // weightフィールドを見つけて後ろにフィールドを追加
  // エントリ内で "weight": N を探す
  const weightRegex = /("weight":\s*[\d.]+)/;
  const weightMatch = weightRegex.exec(entryContent);
  if (!weightMatch) {
    console.log(`  No weight field found in ${id}`);
    continue;
  }
  
  const weightPos = entryStart + weightMatch.index;
  const weightEnd = weightPos + weightMatch[0].length;
  
  // 追加するフィールド
  const additionalFields = reqItem
    ? `,\n  "baseSpecies": "${baseSpecies}",\n  "isMega": true,\n  "reqItem": "${reqItem}"`
    : `,\n  "baseSpecies": "${baseSpecies}",\n  "isMega": true`;
  
  content = content.substring(0, weightEnd) + additionalFields + content.substring(weightEnd);
  modified++;
  console.log(`  Added meta to ${id} (baseSpecies: ${baseSpecies}, reqItem: ${reqItem})`);
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone! Modified ${modified} mega entries.`);
