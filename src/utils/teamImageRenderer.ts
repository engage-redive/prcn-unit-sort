import { PokemonType } from '../types';
import { TeamMember } from '../stores/teamStore';
import { pokedex } from '../data/pokedex';
import { getPokemonIconPath } from './uiHelpers';

// ======= 型定義・定数 =======

type StatKey = 'hp' | 'attack' | 'defense' | 'specialAttack' | 'specialDefense' | 'speed';

const STAT_KEYS: StatKey[] = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
const STAT_SHORT: Record<StatKey, string> = { hp: 'H', attack: 'A', defense: 'B', specialAttack: 'C', specialDefense: 'D', speed: 'S' };

const NATURE_NAME_JP: Record<string, string> = {
    Hardy: 'がんばりや', Lonely: 'さみしがり', Brave: 'ゆうかん', Adamant: 'いじっぱり', Naughty: 'やんちゃ',
    Bold: 'ずぶとい', Docile: 'すなお', Relaxed: 'のんき', Impish: 'わんぱく', Lax: 'のうてんき',
    Timid: 'おくびょう', Hasty: 'せっかち', Serious: 'まじめ', Jolly: 'ようき', Naive: 'むじゃき',
    Modest: 'ひかえめ', Mild: 'おっとり', Quiet: 'れいせい', Bashful: 'てれや', Rash: 'うっかりや',
    Calm: 'おだやか', Gentle: 'おとなしい', Sassy: 'なまいき', Careful: 'しんちょう', Quirky: 'きまぐれ',
};

const TYPE_COLORS: Record<PokemonType, string> = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
    ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
    psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
    dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD', stellar: '#75CADD',
};

// ======= 計算ロジック（変更なし） =======

const calculateStats = (member: TeamMember): Record<StatKey, number> => {
    const { pokemon, statPoints } = member;
    const result = { hp: 0, attack: 0, defense: 0, specialAttack: 0, specialDefense: 0, speed: 0 };
    const pokemonData = pokedex.find(p => p.id === pokemon.id);
    if (!pokemonData) return result;

    result.hp = pokemonData.nameEn === 'Shedinja' ? 1 : Math.floor(pokemonData.baseStats.hp + 75 + (statPoints.hp || 0));

    const nonHpKeys: StatKey[] = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
    nonHpKeys.forEach(key => {
        const base = pokemonData.baseStats[key];
        const pts = statPoints[key] || 0;
        let mult = 1.0;
        if (member.nature?.increasedStat === key) mult = 1.1;
        else if (member.nature?.decreasedStat === key) mult = 0.9;
        result[key] = Math.floor(Math.floor(base + 20 + pts) * mult);
    });

    return result;
};

// ======= 画像フェッチ =======

async function fetchImageAsBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) return '';
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch {
        return '';
    }
}

// ======= テキストのXMLエスケープ =======
function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ======= 1枚カードのSVG文字列を生成 =======
//
// カードサイズ: 340 × 200px
// レイアウト:
//   ┌─────────────────────────────────────┐
//   │ [Pokémon big ghost]   [icon 56px]   │
//   │  ポケモン名 テラ 性格 特性           │
//   │  持ち物アイコン + 持ち物名           │
//   │──────────────────────────────────────│
//   │ 技×4 (左)   ステータスグリッド (右) │
//   └─────────────────────────────────────┘

async function renderMemberCard(
    member: TeamMember,
    offsetX: number,
    offsetY: number,
    cardW: number,
    cardH: number,
    baseUrl: string,
): Promise<string> {
    const stats = calculateStats(member);
    const teraColor = TYPE_COLORS[member.teraType] || '#777777';
    const natureName = member.nature
        ? (NATURE_NAME_JP[member.nature.nameEn ?? ''] || member.nature.name || '')
        : '';

    // 画像URLリスト
    const pokemonIconUrl = `${baseUrl}${getPokemonIconPath(member.pokemon.id)}`;
    const itemIconUrl = member.item ? `${baseUrl}/itemsIcon/${member.item.id}.png` : '';
    const teraIconUrl = `${baseUrl}/teraIcon/${member.teraType}.png`;
    const moveIconUrls = member.moves.slice(0, 4).map(m => m ? `${baseUrl}/typesIcon/${m.type}_icon_sv.png` : '');

    // 並列フェッチ
    const [pokemonB64, itemB64, teraB64, ...moveB64s] = await Promise.all([
        fetchImageAsBase64(pokemonIconUrl),
        itemIconUrl ? fetchImageAsBase64(itemIconUrl) : Promise.resolve(''),
        fetchImageAsBase64(teraIconUrl),
        ...moveIconUrls.map(u => u ? fetchImageAsBase64(u) : Promise.resolve('')),
    ]);

    // ─── グラデーション/グローのユニークID ───
    const uid = `m${offsetX}_${offsetY}`;
    const gradId = `grad_${uid}`;
    const glowId = `glow_${uid}`;
    const clipId = `clip_${uid}`;

    // ─── レイアウト定数 ───
    const PAD = 10;
    const HEADER_H = 76;   // ヘッダーエリア高さ
    const DIVIDER_Y = HEADER_H + 2;
    const BODY_Y = DIVIDER_Y + 6;
    const BODY_H = cardH - BODY_Y - PAD;

    // 技エリア
    const MOVE_AREA_W = Math.floor(cardW * 0.48);
    const MOVE_ROW_H = Math.floor(BODY_H / 4) - 2;

    // ステータスグリッドエリア
    const STAT_AREA_X = PAD + MOVE_AREA_W + 6;
    const STAT_AREA_W = cardW - STAT_AREA_X - PAD;
    const COL_W = Math.floor(STAT_AREA_W / 6);

    // ─── 定義セクション（defs） ───
    const hexToRgb = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r},${g},${b}`;
    };
    const teraRgb = hexToRgb(teraColor.length === 7 ? teraColor : '#75CADD');

    const defs = `
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#1a1f2e"/>
        <stop offset="100%" stop-color="#0f1318"/>
      </linearGradient>
      <radialGradient id="${glowId}" cx="85%" cy="15%" r="55%">
        <stop offset="0%" stop-color="rgba(${teraRgb},0.22)"/>
        <stop offset="100%" stop-color="rgba(${teraRgb},0)"/>
      </radialGradient>
      <clipPath id="${clipId}">
        <rect width="${cardW}" height="${cardH}" rx="10"/>
      </clipPath>
    </defs>`;

    // ─── カード背景 ───
    const bg = `
    <g transform="translate(${offsetX},${offsetY})">
      <rect width="${cardW}" height="${cardH}" rx="10" fill="url(#${gradId})" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <rect width="${cardW}" height="${cardH}" rx="10" fill="url(#${glowId})"/>`;

    // ─── ポケモン大ゴースト画像（右上背景） ───
    const ghostImg = pokemonB64 ? `
      <image href="${pokemonB64}" x="${cardW - 100}" y="-8" width="105" height="105"
        opacity="0.18" style="filter:drop-shadow(0 0 12px rgba(255,255,255,0.15));" clip-path="url(#${clipId})"/>` : '';

    // ─── ヘッダー部分 ───
    // 左: ポケモンアイコン(56px)
    const iconImg = pokemonB64 ? `
      <image href="${pokemonB64}" x="${PAD}" y="${PAD}" width="56" height="56"
        style="filter:drop-shadow(0 2px 6px rgba(0,0,0,0.6));"/>` : `
      <rect x="${PAD}" y="${PAD}" width="56" height="56" rx="6" fill="#2a3040"/>`;

    // 右: テキスト情報
    const infoX = PAD + 56 + 8;
    const infoMaxW = cardW - infoX - PAD - 10;

    // ポケモン名
    const nameText = `
      <text x="${infoX}" y="${PAD + 16}" font-family="system-ui,sans-serif" font-size="14" font-weight="bold"
        fill="#ffffff" textLength="${Math.min(infoMaxW, esc(member.pokemon.name).length * 9)}" lengthAdjust="spacingAndGlyphs">${esc(member.pokemon.name)}</text>`;

    // テラ + 性格 (横並び)
    let row1X = infoX;
    const teraImgEl = teraB64 ? `<image href="${teraB64}" x="${row1X}" y="${PAD + 20}" width="18" height="18"/>` : '';
    if (teraB64) row1X += 22;
    const natureEl = natureName ? `
      <rect x="${row1X}" y="${PAD + 21}" width="${Math.min(natureName.length * 8 + 8, 70)}" height="15" rx="3" fill="rgba(255,255,255,0.07)"/>
      <text x="${row1X + 4}" y="${PAD + 32}" font-family="system-ui,sans-serif" font-size="10" fill="#d1d5db">${esc(natureName)}</text>` : '';
    if (natureName) row1X += Math.min(natureName.length * 8 + 12, 74);

    // 特性
    const abilityEl = member.ability ? `
      <rect x="${row1X}" y="${PAD + 21}" width="${Math.min(member.ability.name.length * 7 + 8, 80)}" height="15" rx="3" fill="rgba(255,220,50,0.08)"/>
      <text x="${row1X + 4}" y="${PAD + 32}" font-family="system-ui,sans-serif" font-size="10" fill="#fde68a">${esc(member.ability.name)}</text>` : '';

    // 持ち物
    const itemY = PAD + 42;
    const itemImgEl = itemB64 ? `<image href="${itemB64}" x="${infoX}" y="${itemY}" width="20" height="20"/>` : '';
    const itemNameEl = member.item ? `
      <text x="${infoX + (itemB64 ? 24 : 0)}" y="${itemY + 14}" font-family="system-ui,sans-serif" font-size="10" fill="#d1d5db"
        textLength="${Math.min(infoMaxW - (itemB64 ? 24 : 0), member.item.name.length * 7)}" lengthAdjust="spacingAndGlyphs">${esc(member.item.name)}</text>` : '';

    const header = nameText + teraImgEl + natureEl + abilityEl + itemImgEl + itemNameEl;

    // ─── 区切り線 ───
    const divider = `
      <line x1="${PAD}" y1="${DIVIDER_Y}" x2="${cardW - PAD}" y2="${DIVIDER_Y}" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>`;

    // ─── 技リスト ───
    const moves = member.moves.slice(0, 4);
    const moveRows = moves.map((move, i) => {
        const my = BODY_Y + i * (MOVE_ROW_H + 2);
        const rowH = MOVE_ROW_H;
        if (!move) {
            return `
      <rect x="${PAD}" y="${my}" width="${MOVE_AREA_W}" height="${rowH}" rx="3" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
      <text x="${PAD + 6}" y="${my + rowH / 2 + 4}" font-family="system-ui,sans-serif" font-size="10" fill="#374151">—</text>`;
        }
        const mb64 = moveB64s[i];
        const TYPE_ICON_W = 36;
        const TYPE_ICON_H = 14;
        const iconEl = mb64 ? `<image href="${mb64}" x="${PAD + 4}" y="${my + (rowH - TYPE_ICON_H) / 2}" width="${TYPE_ICON_W}" height="${TYPE_ICON_H}"/>` : '';
        const textX = PAD + 4 + (mb64 ? TYPE_ICON_W + 3 : 0);
        const availW = MOVE_AREA_W - (textX - PAD) - 4;
        return `
      <rect x="${PAD}" y="${my}" width="${MOVE_AREA_W}" height="${rowH}" rx="3" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.04)" stroke-width="0.5"/>
      ${iconEl}
      <text x="${textX}" y="${my + rowH / 2 + 4}" font-family="system-ui,sans-serif" font-size="10" fill="#e5e7eb"
        textLength="${Math.min(availW, esc(move.name).length * 7)}" lengthAdjust="spacingAndGlyphs">${esc(move.name)}</text>`;
    }).join('');

    // ─── ステータスグリッド（3段×6列） ───
    // 行1: ヘッダー (H A B C D S)
    // 行2: 実数値
    // 行3: ポイント
    const ROW1_Y = BODY_Y + 4;
    const ROW2_Y = ROW1_Y + 18;
    const ROW3_Y = ROW2_Y + 16;

    const statGrid = STAT_KEYS.map((key, ci) => {
        const cx = STAT_AREA_X + ci * COL_W;
        const cellCX = cx + COL_W / 2;

        // 性格補正色
        let headerBg = 'none';
        let headerFill = '#9ca3af';
        if (member.nature?.increasedStat === key) { headerBg = 'rgba(153,27,27,0.55)'; headerFill = '#fca5a5'; }
        else if (member.nature?.decreasedStat === key) { headerBg = 'rgba(30,58,138,0.55)'; headerFill = '#93c5fd'; }

        const actual = stats[key];
        const pt = member.statPoints[key] || 0;

        return `
      ${headerBg !== 'none' ? `<rect x="${cx}" y="${ROW1_Y - 2}" width="${COL_W - 1}" height="13" rx="2" fill="${headerBg}"/>` : ''}
      <text x="${cellCX}" y="${ROW1_Y + 9}" font-family="system-ui,sans-serif" font-size="9" font-weight="bold"
        fill="${headerFill}" text-anchor="middle">${STAT_SHORT[key]}</text>
      <text x="${cellCX}" y="${ROW2_Y + 11}" font-family="system-ui,sans-serif" font-size="12" font-weight="bold"
        fill="#ffffff" text-anchor="middle">${actual}</text>
      <text x="${cellCX}" y="${ROW3_Y + 9}" font-family="system-ui,sans-serif" font-size="9"
        fill="${pt > 0 ? '#6ee7b7' : '#4b5563'}" text-anchor="middle">${pt > 0 ? pt : '—'}</text>`;
    }).join('');

    const closeG = `\n    </g>`;

    return defs + bg + ghostImg + iconImg + header + divider + moveRows + statGrid + closeG;
}

// ======= メインエクスポート =======

export async function createTeamImage(team: TeamMember[]): Promise<string> {
    // 縦長: 2列×3行
    const COLS = 2;
    const CARD_W = 340;
    const CARD_H = 200;
    const GAP = 10;
    const PAD_OUTER = 12;

    // 最大6名
    const members = team.slice(0, 6);
    const rows = Math.ceil(members.length / COLS);

    const totalW = COLS * CARD_W + (COLS - 1) * GAP + PAD_OUTER * 2;
    const totalH = rows * CARD_H + (rows - 1) * GAP + PAD_OUTER * 2;

    const baseUrl = window.location.origin;

    // 全カードを並列レンダリング
    const cardSvgs = await Promise.all(
        members.map((member, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            const ox = PAD_OUTER + col * (CARD_W + GAP);
            const oy = PAD_OUTER + row * (CARD_H + GAP);
            return renderMemberCard(member, ox, oy, CARD_W, CARD_H, baseUrl);
        })
    );

    const svgInner = cardSvgs.join('\n');

    return `<svg width="${totalW}" height="${totalH}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="100%" height="100%" fill="#0b0d12"/>
  ${svgInner}
</svg>`;
}