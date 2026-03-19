import type { Nature } from '../types';

// types/index.ts の Nature 型に name_jp を追加した拡張型
export interface NatureWithJp extends Nature {
  name_jp: string;
}

export const natures: NatureWithJp[] = [
  { name: "Hardy", nameEn: "Hardy", name_jp: "がんばりや", increasedStat: null, decreasedStat: null },
  { name: "Lonely", nameEn: "Lonely", name_jp: "さみしがり", increasedStat: "attack", decreasedStat: "defense" },
  { name: "Brave", nameEn: "Brave", name_jp: "ゆうかん", increasedStat: "attack", decreasedStat: "speed" },
  { name: "Adamant", nameEn: "Adamant", name_jp: "いじっぱり", increasedStat: "attack", decreasedStat: "specialAttack" },
  { name: "Naughty", nameEn: "Naughty", name_jp: "やんちゃ", increasedStat: "attack", decreasedStat: "specialDefense" },
  { name: "Bold", nameEn: "Bold", name_jp: "ずぶとい", increasedStat: "defense", decreasedStat: "attack" },
  { name: "Docile", nameEn: "Docile", name_jp: "すなお", increasedStat: null, decreasedStat: null },
  { name: "Relaxed", nameEn: "Relaxed", name_jp: "のんき", increasedStat: "defense", decreasedStat: "speed" },
  { name: "Impish", nameEn: "Impish", name_jp: "わんぱく", increasedStat: "defense", decreasedStat: "specialAttack" },
  { name: "Lax", nameEn: "Lax", name_jp: "のうてんき", increasedStat: "defense", decreasedStat: "specialDefense" },
  { name: "Timid", nameEn: "Timid", name_jp: "おくびょう", increasedStat: "speed", decreasedStat: "attack" },
  { name: "Hasty", nameEn: "Hasty", name_jp: "せっかち", increasedStat: "speed", decreasedStat: "defense" },
  { name: "Serious", nameEn: "Serious", name_jp: "まじめ", increasedStat: null, decreasedStat: null },
  { name: "Jolly", nameEn: "Jolly", name_jp: "ようき", increasedStat: "speed", decreasedStat: "specialAttack" },
  { name: "Naive", nameEn: "Naive", name_jp: "むじゃき", increasedStat: "speed", decreasedStat: "specialDefense" },
  { name: "Modest", nameEn: "Modest", name_jp: "ひかえめ", increasedStat: "specialAttack", decreasedStat: "attack" },
  { name: "Mild", nameEn: "Mild", name_jp: "おっとり", increasedStat: "specialAttack", decreasedStat: "defense" },
  { name: "Quiet", nameEn: "Quiet", name_jp: "れいせい", increasedStat: "specialAttack", decreasedStat: "speed" },
  { name: "Bashful", nameEn: "Bashful", name_jp: "てれや", increasedStat: null, decreasedStat: null },
  { name: "Rash", nameEn: "Rash", name_jp: "うっかりや", increasedStat: "specialAttack", decreasedStat: "specialDefense" },
  { name: "Calm", nameEn: "Calm", name_jp: "おだやか", increasedStat: "specialDefense", decreasedStat: "attack" },
  { name: "Gentle", nameEn: "Gentle", name_jp: "おとなしい", increasedStat: "specialDefense", decreasedStat: "defense" },
  { name: "Sassy", nameEn: "Sassy", name_jp: "なまいき", increasedStat: "specialDefense", decreasedStat: "speed" },
  { name: "Careful", nameEn: "Careful", name_jp: "しんちょう", increasedStat: "specialDefense", decreasedStat: "specialAttack" },
  { name: "Quirky", nameEn: "Quirky", name_jp: "きまぐれ", increasedStat: null, decreasedStat: null }
];