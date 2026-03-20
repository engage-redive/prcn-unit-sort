// merge_flags.mjs - moves.js の flags を moves.ts にマージするスクリプト
import { readFileSync, writeFileSync } from 'fs';

const movesJsPath = 'd:/cドラ避難所/0505-1446/project/src/data/moves.js';
const movesTsPath = 'd:/cドラ避難所/0505-1446/project/src/data/moves.ts';

// moves.js を読み込んでパース
const movesJsContent = readFileSync(movesJsPath, 'utf-8');
const movesJsModule = {};
const fn = new Function('exports', movesJsContent);
fn(movesJsModule);
const battleMovedex = movesJsModule.BattleMovedex;

// moves.ts を読み込む
let movesTsContent = readFileSync(movesTsPath, 'utf-8');

// moves.ts から全ての技IDを抽出
const tsIds = new Set();
const idRegex = /id:\s*["']([^"']+)["']/g;
let m;
while ((m = idRegex.exec(movesTsContent)) !== null) {
  tsIds.add(m[1]);
}

// moves.ts の nameEn → id マッピング
const tsNameEnToId = new Map();
const blockRegex = /id:\s*["']([^"']+)["'][\s\S]*?nameEn:\s*["']([^"']+)["']/g;
while ((m = blockRegex.exec(movesTsContent)) !== null) {
  const normalizedNameEn = m[2].toLowerCase().replace(/[^a-z0-9]/g, '');
  tsNameEnToId.set(normalizedNameEn, m[1]);
}

// マッチング: jsKey → tsId
const jsKeyToTsId = new Map();
const IMPORTANT_FLAGS = ['contact', 'punch', 'bite', 'slicing', 'sound', 'pulse', 'protect', 'bullet', 'wind'];

for (const jsKey of Object.keys(battleMovedex)) {
  if (tsIds.has(jsKey)) {
    jsKeyToTsId.set(jsKey, jsKey);
    continue;
  }
  const jsName = battleMovedex[jsKey].name;
  if (jsName) {
    const norm = jsName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tsNameEnToId.has(norm)) {
      jsKeyToTsId.set(jsKey, tsNameEnToId.get(norm));
    }
  }
}

// マッチしなかった moves.ts のID
const matchedTsIds = new Set(jsKeyToTsId.values());
const unmatchedTs = [...tsIds].filter(id => !matchedTsIds.has(id));

// マッチしなかった moves.js の攻撃技
const unmatchedJs = [];
for (const [key, data] of Object.entries(battleMovedex)) {
  if (jsKeyToTsId.has(key)) continue;
  if (data.isNonstandard || data.isZ || data.isMax) continue;
  if (data.category === 'Status') continue;
  unmatchedJs.push(`${key} (${data.name})`);
}

console.log(`moves.js: ${Object.keys(battleMovedex).length}, moves.ts: ${tsIds.size}, matched: ${jsKeyToTsId.size}`);
if (unmatchedTs.length > 0) console.log(`\nmoves.tsのみ (${unmatchedTs.length}): ${unmatchedTs.join(', ')}`);
if (unmatchedJs.length > 0) console.log(`\nmoves.jsのみ攻撃技 (${unmatchedJs.length}): ${unmatchedJs.join(', ')}`);

// moves.ts の各技ブロックに flags を挿入
const lines = movesTsContent.split('\n');
const resultLines = [];
let modifiedCount = 0;
let currentId = null;
let blockStartLine = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  const idMatch = line.match(/^\s*id:\s*["']([^"']+)["']/);
  if (idMatch) {
    currentId = idMatch[1];
    blockStartLine = i;
  }
  
  if (currentId && /^\s*\},?\s*$/.test(line)) {
    let jsKey = null;
    for (const [k, v] of jsKeyToTsId.entries()) {
      if (v === currentId) {
        jsKey = k;
        break;
      }
    }
    
    if (jsKey && battleMovedex[jsKey]?.flags) {
      const jsFlags = battleMovedex[jsKey].flags;
      const flagEntries = [];
      for (const flag of IMPORTANT_FLAGS) {
        if (jsFlags[flag] === 1) {
          flagEntries.push(`${flag}: true`);
        }
      }
      
      const blockLines = lines.slice(blockStartLine, i);
      const hasFlags = blockLines.some(l => /^\s*flags\s*:/.test(l));
      
      if (flagEntries.length > 0 && !hasFlags) {
        resultLines.push(`    flags: { ${flagEntries.join(', ')} },`);
        modifiedCount++;
      }
    }
    currentId = null;
  }
  
  resultLines.push(line);
}

console.log(`\nflags追加: ${modifiedCount}技`);

writeFileSync(movesTsPath, resultLines.join('\n'), 'utf-8');
console.log('moves.ts を更新しました。');
