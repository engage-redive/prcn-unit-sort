// src/utils/moveEffects.ts
import type { Move, MoveDynamicContext, MoveDynamicProperties } from '../types';

const effectHandlers: Record<string, (baseMove: Move, context: MoveDynamicContext) => MoveDynamicProperties> = {
  Boost: (baseMove, context) => {
    if (context.moveUiOptions && baseMove.uiOption && context.moveUiOptions[baseMove.uiOption.key]) {
      return { power: (baseMove.power || 0) * 2 };
    }
    return {};
  },

  ivyCudgelEffect: (_baseMove, context) => {
    if (context.attackerPokemon) {
      const attackerId = context.attackerPokemon.id.toString();
      switch (attackerId) {
        case '1017-w':
          return { type: 'water' };
        case '1017-h':
          return { type: 'fire' };
        case '1017-c':
          return { type: 'rock' };
        default:
          return { type: 'grass' };
      }
    }
    return {};
  },

  weatherBallEffect: (baseMove, context) => {
    const defaultPower = baseMove.power || 50;
    const defaultType = baseMove.type || 'normal';

    switch (context.weather) {
      case 'sun':
      case 'harsh_sunlight':
        return { power: 100, type: 'fire' };
      case 'rain':
      case 'heavy_rain':
        return { power: 100, type: 'water' };
      case 'snow':
        return { power: 100, type: 'ice' };
      case 'sandstorm':
        return { power: 100, type: 'rock' };
      default:
        return { power: defaultPower, type: defaultType };
    }
  },
  expandingForceEffect: (_baseMove, context) => {
    const result: MoveDynamicProperties = {};
    if (context.field === 'psychic' && context.attackerPokemon) {
        const attacker = context.attackerPokemon;
        const isFlyingType = attacker.types.includes('flying');
        let isLevitating = false;
        if (context.attackerAbility?.id === 'levitate') {
            isLevitating = true;
        }

        const isGrounded = !isFlyingType && !isLevitating;

        if (isGrounded) {
            result.isSpread = true;
        }
    }
    return result;
  },

  attackerWeightRatioPower: (_baseMove, context) => {
    if (!context.attackerPokemon || !context.defenderPokemon) {
      return {};
    }

    const attackerWeight = context.attackerPokemon.weight;
    const defenderWeight = context.defenderPokemon.weight;

    if (typeof attackerWeight !== 'number' || typeof defenderWeight !== 'number' || attackerWeight <= 0 || defenderWeight <= 0) {
      return {};
    }

    const ratio = attackerWeight / defenderWeight;
    let calculatedPower = 0;

    if (ratio >= 5) {
      calculatedPower = 120;
    } else if (ratio >= 4) {
      calculatedPower = 100;
    } else if (ratio >= 3) {
      calculatedPower = 80;
    } else if (ratio >= 2) {
      calculatedPower = 60;
    } else {
      calculatedPower = 40;
    }

    return { power: calculatedPower };
  },
  crushGripPower: (_baseMove, context) => {
    const hpPercent = context.moveUiOptions?.['crushGripHpPercent'] as number | undefined ?? 100;
    const calculatedPower = Math.floor(120 * (hpPercent / 100));
    return { power: Math.max(1, calculatedPower) };
  },
  defenderWeightBasedPower: (_baseMove, context) => {
    if (!context.defenderPokemon) {
      return {};
    }

    const defenderWeight = context.defenderPokemon.weight;

    if (typeof defenderWeight !== 'number' || defenderWeight < 0) {
      return { power: 1 };
    }

    let calculatedPower = 0;
    if (defenderWeight < 10.0) {
      calculatedPower = 20;
    } else if (defenderWeight < 25.0) {
      calculatedPower = 40;
    } else if (defenderWeight < 50.0) {
      calculatedPower = 60;
    } else if (defenderWeight < 100.0) {
      calculatedPower = 80;
    } else if (defenderWeight < 200.0) {
      calculatedPower = 100;
    } else {
      calculatedPower = 120;
    }

    return { power: calculatedPower };
  },
  // ★ テラクラスターの効果ハンドラ
  terastarstormEffects: (_baseMove, context) => {
    const props: MoveDynamicProperties = {};
    if (context.attackerPokemon?.id === "1024-s") { // テラパゴス (ステラフォルム) の場合
        props.type = 'stellar'; // 技タイプをステラに変更
        props.isSpread = true; // 範囲攻撃に変更
        // カテゴリ変更はここでは行わない (App.tsx と AttackerPanel.tsx で処理)
    }
    // 他のポケモンが使う場合は、元の技の性質 (ノーマル、単体) のまま
    return props;
  },
  // ★ フォトンゲイザーの効果ハンドラ (識別用)
  photonGeyserEffect: (_baseMove, _context) => {
    // カテゴリの決定は AttackerPanel で行い、App.tsx で effectiveMove に反映されるため、
    // ここでは特別なプロパティ変更は不要。
    return {};
  },
  // calcDefForSpecial: サイコショック・サイコブレイクなど、特殊技だが相手の防御で計算する技
  calcDefForSpecial: (_baseMove, _context) => {
    // このハンドラは主に識別用。実際の計算ロジックは calculator.ts で行う。
    return {};
  },
};

export function getEffectiveMoveProperties(originalMove: Move | null, context: MoveDynamicContext): Move | null {
  if (!originalMove) {
    return null;
  }

  let effectiveMove = { ...originalMove };

  if (originalMove.dynamicEffectId && effectHandlers[originalMove.dynamicEffectId]) {
    const dynamicProps = effectHandlers[originalMove.dynamicEffectId](originalMove, context);

    if (dynamicProps.power !== undefined) {
      effectiveMove.power = dynamicProps.power;
    }
    if (dynamicProps.type !== undefined) {
      effectiveMove.type = dynamicProps.type;
    }
    if (dynamicProps.isSpread !== undefined) {
        effectiveMove.isSpread = dynamicProps.isSpread;
    }
  }
  return effectiveMove;
}