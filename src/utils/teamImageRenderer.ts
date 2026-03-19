import { PokemonType } from '../types';
import { TeamMember } from '../stores/teamStore';
import { pokedex } from '../data/pokedex';

// calculateStats 関数は変更なし
const calculateStats = (member: TeamMember) => {
    const { pokemon, statPoints } = member;
    const stats: { [key: string]: number } = {
        hp: 0,
        attack: 0,
        defense: 0,
        specialAttack: 0,
        specialDefense: 0,
        speed: 0,
    };

    const pokemonData = pokedex.find(p => p.id === pokemon.id);

    if (!pokemonData) {
        console.warn('Pokemon data not found in pokedex for:', pokemon.name);
        return stats;
    }

    // HP
    if (pokemonData.nameEn === 'Shedinja') {
        stats.hp = 1;
    } else {
        stats.hp = pokemonData.baseStats.hp + 20 + (statPoints.hp || 0);
    }

    // その他ステータス
    const statKeys: (keyof Omit<typeof stats, 'hp'>)[] = ['attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
    statKeys.forEach(key => {
        const baseStat = pokemonData.baseStats[key as keyof typeof pokemonData.baseStats];
        const statPoint = statPoints[key as keyof typeof statPoints] || 0;
        let natureMultiplier = 1.0;
        if (member.nature?.increasedStat === key) {
            natureMultiplier = 1.1;
        } else if (member.nature?.decreasedStat === key) {
            natureMultiplier = 0.9;
        }
        let statValue = baseStat + 20 + statPoint;
        statValue = Math.floor(statValue * natureMultiplier);
        stats[key] = statValue;
    });

    return stats;
};


// POKEMON_TYPE_NAMES_JP と POKEMON_TYPE_COLORS は元のコードのものをそのまま使用
const POKEMON_TYPE_NAMES_JP: { [key in PokemonType]: string } = {
    normal: 'ノーマル', fire: 'ほのお', water: 'みず', electric: 'でんき', grass: 'くさ',
    ice: 'こおり', fighting: 'かくとう', poison: 'どく', ground: 'じめん', flying: 'ひこう',
    psychic: 'エスパー', bug: 'むし', rock: 'いわ', ghost: 'ゴースト', dragon: 'ドラゴン',
    dark: 'あく', steel: 'はがね', fairy: 'フェアリー', stellar: 'ステラ',
};

const POKEMON_TYPE_COLORS: { [key in PokemonType]: string } = {
    normal: '#A8A77A', fire: '#EE8130', water: '#6390F0', electric: '#F7D02C', grass: '#7AC74C',
    ice: '#96D9D6', fighting: '#C22E28', poison: '#A33EA1', ground: '#E2BF65', flying: '#A98FF3',
    psychic: '#F95587', bug: '#A6B91A', rock: '#B6A136', ghost: '#735797', dragon: '#6F35FC',
    dark: '#705746', steel: '#B7B7CE', fairy: '#D685AD', stellar: '#75CADD',
};

// fetchImageAsBase64 関数は変更なし
async function fetchImageAsBase64(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) { return ''; }
            throw new Error(`Network response was not ok for url: ${url}`);
        }
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        return '';
    }
}

export async function createTeamImage(team: TeamMember[]): Promise<string> {
    const cardWidth = 350;
    const cardHeight = 240;
    const gap = 15;
    const columns = 3;
    const rows = Math.ceil(team.length / columns);
    const totalWidth = columns * cardWidth + (columns - 1) * gap;
    const totalHeight = rows * cardHeight + (rows - 1) * gap;

    let svgContent = `<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <style>
            .card-bg { fill: #2d3748; }
            .text-white { fill: #ffffff; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'; }
            .text-gray-300 { fill: #d1d5db; font-family: system-ui, sans-serif; }
            .text-gray-400 { fill: #9ca3af; font-family: system-ui, sans-serif; }
            .font-bold { font-weight: bold; }
            .text-base { font-size: 16px; }
            .text-xs { font-size: 12px; }
            .stat-label { font-weight: 500; }
        </style>
        <rect width="100%" height="100%" fill="#1a202c"/>`;

    for (let i = 0; i < team.length; i++) {
        const member = team[i];
        if (!member.pokemon) continue;

        const actualStats = calculateStats(member);
        const row = Math.floor(i / columns);
        const col = i % columns;
        const x = col * (cardWidth + gap);
        const y = row * (cardHeight + gap);

        const baseUrl = window.location.origin;
        const pokemonIconUrl = `${baseUrl}/icon/${member.pokemon.id.toString().padStart(4, '0')}.png`;
        const itemIconUrl = member.item ? `${baseUrl}/itemsIcon/${member.item.id}.png` : '';
        const moveIconUrls = member.moves.map((move: any) => move ? `${baseUrl}/typesIcon/${move.type}_icon_sv.png` : '');

        const [pokemonIconBase64, itemIconBase64, ...moveIconBase64s] = await Promise.all([
            fetchImageAsBase64(pokemonIconUrl),
            itemIconUrl ? fetchImageAsBase64(itemIconUrl) : Promise.resolve(''),
            ...moveIconUrls.map((url: string) => url ? fetchImageAsBase64(url) : Promise.resolve(''))
        ]);

        const padding = 12;
        const statsGroupX = 170;
        const stLabelX = 0;
        const stLabelWidth = 20;
        const stActualValWidth = 35;
        const stActualValEndX = stLabelX + stLabelWidth + stActualValWidth;
        const stEvValWidth = 30;
        const stEvValEndX = stActualValEndX + 5 + stEvValWidth;
        const stBarMargin = 5;
        const stBarX = stEvValEndX + stBarMargin;
        const stBarMaxWidth = Math.max(10, (cardWidth - statsGroupX - padding) - stBarX);

        svgContent += `
            <g transform="translate(${x}, ${y})">
                <rect class="card-bg" width="${cardWidth}" height="${cardHeight}" rx="8"/>
                
                <!-- Header -->
                <g transform="translate(12, 12)">
                    ${pokemonIconBase64 ? `<image href="${pokemonIconBase64}" x="0" y="0" width="56" height="56"/>` : `<rect x="0" y="0" width="56" height="56" fill="#4a5568"/>`}
                    <g transform="translate(68, 0)">
                        <text x="0" y="18" class="text-white font-bold text-base">${member.pokemon.name}</text>
                        <text x="0" y="34" class="text-gray-400 text-xs">性格: ${member.nature ? (POKEMON_TYPE_NAMES_JP[member.nature.name as PokemonType] || member.nature.name) : '-'}</text>
                        <text x="0" y="50" class="text-gray-400 text-xs">特性: ${member.ability?.name || '-'}</text>
                    </g>
                </g>

                <!-- Details -->
                <g transform="translate(12, 78)">
                    ${itemIconBase64 ? `<image href="${itemIconBase64}" x="0" y="0" width="20" height="20"/>` : ''}
                    <text x="24" y="14" class="text-gray-300 text-xs truncate" width="${cardWidth / 2 - 40}">持物: ${member.item?.name || '-'}</text>
                    
                    <rect x="${cardWidth / 2 - 12}" y="2" width="60" height="16" style="fill:${POKEMON_TYPE_COLORS[member.teraType as PokemonType] || '#777'};" rx="3"/>
                    <text x="${cardWidth / 2 - 8}" y="14" class="text-white text-xs font-bold">${POKEMON_TYPE_NAMES_JP[member.teraType as PokemonType] || '-'}</text>
                </g>

                <!-- Body -->
                <g transform="translate(12, 105)">
                    <!-- Moves -->
                    <g>
                        ${member.moves.slice(0,4).map((move: any, index: number) => {
                            const moveY = index * 28;
                            const moveRectWidth = 150;
                            const moveRectHeight = 24;
                            if (!move) return `<rect x="0" y="${moveY}" width="${moveRectWidth}" height="${moveRectHeight}" fill="#374151" rx="4"><title>-</title></rect>`;
                            const moveIcon = moveIconBase64s[index];
                            return `
                                <g transform="translate(0, ${moveY})">
                                    <rect x="0" y="0" width="${moveRectWidth}" height="${moveRectHeight}" fill="#4a5568" rx="4"/>
                                    ${moveIcon ? `<image href="${moveIcon}" x="4" y="4" width="16" height="16"/>` : ''}
                                    <text x="24" y="16" class="text-white text-xs">${move.name}</text>
                                </g>
                            `;
                        }).join('')}
                    </g>

                    <g transform="translate(${statsGroupX}, 0)">
                        ${['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'].map((statName, index) => {
                            const statKey = statName as keyof typeof actualStats;
                            const shortLabel = ({hp: 'H', attack: 'A', defense: 'B', specialAttack: 'C', specialDefense: 'D', speed: 'S'} as const)[statKey];
                            const evValue = member.statPoints[statKey as keyof typeof member.statPoints] || 0;
                            const actualStatValue = actualStats[statKey];
                            const MAX_EV_SINGLE_STAT = 32;
                            const evPercentage = evValue > 0 ? Math.min((evValue / MAX_EV_SINGLE_STAT) * 100, 100) : 0;
                            
                            let labelColor = "#d1d5db";
                            let statIndicator = "";
                            if (member.nature) {
                                if (member.nature.increasedStat === statKey) {
                                    labelColor = "#34d399";
                                    statIndicator = "↑";
                                }
                                if (member.nature.decreasedStat === statKey) {
                                    labelColor = "#f87171";
                                    statIndicator = "↓";
                                }
                            }
                            const statRowY = index * 18.5;
                            const statTextBaselineY = 12;

                            return `
                                <g transform="translate(0, ${statRowY})">
                                    <text x="${stLabelX}" y="${statTextBaselineY}" class="text-xs stat-label" style="fill:${labelColor};">${shortLabel}${statIndicator}</text>
                                    <text x="${stActualValEndX}" y="${statTextBaselineY}" class="text-white text-xs" text-anchor="end">${actualStatValue}</text>
                                    <text x="${stEvValEndX}" y="${statTextBaselineY}" class="text-gray-300 text-xs" text-anchor="end">${evValue > 0 ? evValue : '-'}</text>
                                    <rect x="${stBarX}" y="4" width="${stBarMaxWidth}" height="10" fill="#4a5568" rx="2"/>
                                    <rect x="${stBarX}" y="4" width="${(evPercentage / 100) * stBarMaxWidth}" height="10" fill="#3b82f6" rx="2"/>
                                </g>
                            `;
                        }).join('')}
                    </g>
                </g>
            </g>
        `;
    }

    svgContent += `</svg>`;
    return svgContent;
}