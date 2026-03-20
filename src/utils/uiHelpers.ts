// src/utils/uiHelpers.ts


export const TYPE_NAME_JP: Record<string, string> = {
  normal: "ノーマル",
  fire: "ほのお",
  water: "みず",
  grass: "くさ",
  electric: "でんき",
  ice: "こおり",
  fighting: "かくとう",
  poison: "どく",
  ground: "じめん",
  flying: "ひこう",
  psychic: "エスパー",
  bug: "むし",
  rock: "いわ",
  ghost: "ゴースト",
  dragon: "ドラゴン",
  dark: "あく",
  steel: "はがね",
  fairy: "フェアリー",
  stellar: "ステラ",
};

export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C',
  grass: '#7AC74C', ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1',
  ground: '#E2BF65', flying: '#A98FF3', psychic: '#F95587', bug: '#A6B91A',
  rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC', dark: '#705746',
  steel: '#B7B7CE', fairy: '#D685AD', stellar: '#7A7AE6',
};

export const getTypeNameJp = (type: string): string => {
  if (!type) return '';
  return TYPE_NAME_JP[type.toLowerCase()] || type.toLowerCase();
};

export const getTypeColor = (type: string): string => {
  if (!type) return '#777777';
  return TYPE_COLORS[type.toLowerCase()] || '#777777';
};

/**
 * ポケモンIDからアイコン画像のパスを生成する。
 * - ハイフンを含むID（例: "0889-c"）はそのままファイル名として使用。
 * - 4桁の数字の後に文字が続くID（例: "0479h"）は、4桁目と5桁目の間にハイフンを挿入する。
 * - 数値または純粋な数字文字列（例: 1, "25"）は4桁ゼロ埋めする。
 */
export const getPokemonIconPath = (id: string | number): string => {
  const idStr = id.toString();
  // ハイフンが含まれる場合はフォーマット済みとして扱う
  if (idStr.includes('-')) {
    return `/icon/${idStr}.png`;
  }
  
  // 4桁の数字の後に文字がある場合 (例: "0479h" -> "0479-h")
  if (/^[0-9]{4}.+/.test(idStr)) {
    return `/icon/${idStr.slice(0, 4)}-${idStr.slice(4)}.png`;
  }

  // 数値の場合は4桁ゼロ埋め
  return `/icon/${idStr.padStart(4, '0')}.png`;
};