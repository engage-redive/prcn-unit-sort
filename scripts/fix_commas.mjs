// fix_commas.mjs - flags行の前にカンマが欠けている行を修正するスクリプト
import { readFileSync, writeFileSync } from 'fs';

const movesTsPath = 'd:/cドラ避難所/0505-1446/project/src/data/moves.ts';
let content = readFileSync(movesTsPath, 'utf-8');

const lines = content.split('\n');
const result = [];
let fixedCommas = 0;
let fixedContact = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
  
  // 次の行が "    flags: {" で始まる場合、現在の行の末尾にカンマがなければ追加
  if (nextLine.trimStart().startsWith('flags: {')) {
    const trimmed = line.trimEnd();
    // コメントで終わる行かプロパティ値で終わる行でカンマがない場合
    if (trimmed && !trimmed.endsWith(',') && !trimmed.endsWith('{') && !trimmed.endsWith('[')) {
      // コメント付きの行を処理
      const commentMatch = trimmed.match(/^(.+?)\s*(\/\/.*)$/);
      if (commentMatch) {
        const code = commentMatch[1].trimEnd();
        const comment = commentMatch[2];
        if (!code.endsWith(',')) {
          result.push(`${code}, ${comment}`);
          fixedCommas++;
          continue;
        }
      } else {
        result.push(trimmed + ',');
        fixedCommas++;
        continue;
      }
    }
  }
  
  result.push(line);
}

let output = result.join('\n');

// `contact: true,` と `contact: false,` の独立プロパティ (flags外) を修正
// これらは Move 型に存在しないため削除が必要
// ただし flags 内の contact は残す
// パターン: 行頭空白 + "contact: true," or "contact: false," (flags の中でない場合)
output = output.replace(/^(\s*)contact:\s*(true|false),?\s*$/gm, (match, indent) => {
  // この行が flags: { ... } の中にあるかどうか判定
  // flagsの中の場合はインデントが深い(6スペース以上)
  // 独立プロパティの場合は4スペース
  if (indent.length <= 4) {
    fixedContact++;
    return ''; // 行を削除
  }
  return match; // flags内なら残す
});

// 空行の連続を1つに
output = output.replace(/\n{3,}/g, '\n\n');

console.log(`カンマ修正: ${fixedCommas}箇所`);
console.log(`contact独立プロパティ削除: ${fixedContact}箇所`);

writeFileSync(movesTsPath, output, 'utf-8');
console.log('moves.ts を更新しました。');
