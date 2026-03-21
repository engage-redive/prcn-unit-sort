import { Item, } from '../types';

export const items: Item[] = [
  {
    id: "cornerstonemask",
    name: "タイプ強化x1.2倍",
    nameEn: "Aaaa",
    effect: {
      side: 'attacker',
      type: 'none',
    },
  },
  {
    id: "choiceband",
    name: "こだわりハチマキ",
    nameEn: "Choice Band",
    effect: {
      type: 'multiplier',
      stat: 'attack',
      value: 6144 / 4096,
      side: 'attacker'
    }
  },
  {
    id: "choicespecs",
    name: "こだわりメガネ",
    nameEn: "Choice Specs",
    effect: {
      type: 'multiplier',
      stat: 'attack',
      value: 6144 / 4096,
      side: 'attacker'
    }
  },
  {
    id: "lifeorb",
    name: "いのちのたま",
    nameEn: "Life Orb",
    effect: {
      type: 'multiplier',
      stat: 'damage',
      value: 5324 / 4096,
      side: 'attacker'
    }
  },
  {
    id: "4",
    name: "半減きのみ",
    effect: {
      type: 'multiplier',
      stat: 'damage',
      value: 2048 / 4096,
      side: 'defender'
    }
  },
  {
    id: "expertbelt",
    name: "たつじんのおび",
    nameEn: "Expert Belt",
    effect: {
      type: 'multiplier',
      stat: 'damage',
      value: 4915 / 4096,
      side: 'attacker'
    }
  },
  {
    id: "assaultvest",
    name: "とつげきチョッキ",
    nameEn: "Assault Vest",
    effect: {
      type: 'multiplier',
      stat: 'specialDefense',
      side: 'defender'
    }
  },
  {
    id: "boosterenergy",
    name: "ブーストエナジー",
    nameEn: "Booster Energy",
    effect: {
      type: 'multiplier',
      stat: 'specialDefense',
      side: 'both'
    }
  },

  {
    id: "abilityshield",
    name: "とくせいガード",
    nameEn: "Ability Shield",
    effect: {}
  },
  {
    id: "Abomasite",
    name: "ユキノオナイト",
    nameEn: "Abomasite",
    effect: {}
  },
  {
    id: "Absolite",
    name: "アブソルナイト",
    nameEn: "Absolite",
    effect: {}
  },
  {
    id: "absorbbulb",
    name: "きゅうこん",
    nameEn: "Absorb Bulb",
    effect: {}
  },
  {
    id: "adamantcrystal",
    name: "だいこんごうだま",
    nameEn: "Adamant Crystal",
    effect: {}
  },
  {
    id: "adamantorb",
    name: "こんごうだま",
    nameEn: "Adamant Orb",
    effect: {}
  },
  {
    id: "adrenalineorb",
    name: "ビビリだま",
    nameEn: "Adrenaline Orb",
    effect: {}
  },
  {
    id: "Aerodactylite",
    name: "プテラナイト",
    nameEn: "Aerodactylite",
    effect: {}
  },
  {
    id: "Aggronite",
    name: "ボスゴドラナイト",
    nameEn: "Aggronite",
    effect: {}
  },
  {
    id: "aguavberry",
    name: "バンジのみ",
    nameEn: "Aguav Berry",
    effect: {}
  },
  {
    id: "airballoon",
    name: "ふうせん",
    nameEn: "Air Balloon",
    effect: {}
  },
  {
    id: "Alakazite",
    name: "フーディナイト",
    nameEn: "Alakazite",
    effect: {}
  },
  {
    id: "aloraichiumz",
    name: "アロライＺ",
    nameEn: "Aloraichium Z",
    effect: {}
  },
  {
    id: "Altarianite",
    name: "チルタリスナイト",
    nameEn: "Altarianite",
    effect: {}
  },
  {
    id: "Ampharosite",
    name: "デンリュウナイト",
    nameEn: "Ampharosite",
    effect: {}
  },
  {
    id: "apicotberry",
    name: "アッキのみ",
    nameEn: "Apicot Berry",
    effect: {}
  },
  {
    id: "armorfossil",
    name: "たてのカセキ",
    nameEn: "Armor Fossil",
    effect: {}
  },
  {
    id: "aspearberry",
    name: "モモンのみ",
    nameEn: "Aspear Berry",
    effect: {}
  },
  {
    id: "Audinite",
    name: "タブンネナイト",
    nameEn: "Audinite",
    effect: {}
  },
  {
    id: "auspiciousarmor",
    name: "イワイノヨロイ",
    nameEn: "Auspicious Armor",
    effect: {}
  },
  {
    id: "babiriberry",
    name: "バコウのみ",
    nameEn: "Babiri Berry",
    effect: {}
  },
  {
    id: "Banettite",
    name: "ジュペッタナイト",
    nameEn: "Banettite",
    effect: {}
  },
  {
    id: "beastball",
    name: "ウルトラボール",
    nameEn: "Beast Ball",
    effect: {}
  },
  {
    id: "Beedrillite",
    name: "スピアーナイト",
    nameEn: "Beedrillite",
    effect: {}
  },
  {
    id: "belueberry",
    name: "ズアのみ",
    nameEn: "Belue Berry",
    effect: {}
  },
  {
    id: "berryjuice",
    name: "きのみジュース",
    nameEn: "Berry Juice",
    effect: {}
  },
  {
    id: "berrysweet",
    name: "イチゴアメざいく",
    nameEn: "Berry Sweet",
    effect: {}
  },
  {
    id: "bignugget",
    name: "でかいきんのたま",
    nameEn: "Big Nugget",
    effect: {}
  },
  {
    id: "bigroot",
    name: "おおきなねっこ",
    nameEn: "Big Root",
    effect: {}
  },
  {
    id: "bindingband",
    name: "しめつけバンド",
    nameEn: "Binding Band",
    effect: {}
  },
  {
    id: "blackbelt",
    name: "くろおび",
    nameEn: "Black Belt",
    typeEnhance: 'fighting',
    effect: {
      type: 'none',

    }
  },
  {
    id: "blackglasses",
    name: "くろいメガネ",
    nameEn: "Black Glasses",
    typeEnhance: 'dark',
    effect: {
      type: 'none',

    }
  },
  {
    id: "blacksludge",
    name: "くろいヘドロ",
    nameEn: "Black Sludge",
    effect: {}
  },
  {
    id: "Blastoisinite",
    name: "カメックスナイト",
    nameEn: "Blastoisinite",
    effect: {}
  },
  {
    id: "Blazikenite",
    name: "バシャーモナイト",
    nameEn: "Blazikenite",
    effect: {}
  },
  {
    id: "blueorb",
    name: "あいいろのたま",
    nameEn: "Blue Orb",
    effect: {}
  },
  {
    id: "blukberry",
    name: "ナナシのみ",
    nameEn: "Bluk Berry",
    effect: {}
  },
  {
    id: "blunderpolicy",
    name: "からぶりほけん",
    nameEn: "Blunder Policy",
    effect: {}
  },
  {
    id: "bottlecap",
    name: "ぎんのおうかん",
    nameEn: "Bottle Cap",
    effect: {}
  },
  {
    id: "brightpowder",
    name: "ひかりのこな",
    nameEn: "Bright Powder",
    effect: {}
  },
  {
    id: "buggem",
    name: "むしのジュエル",
    nameEn: "Bug Gem",
    effect: {}
  },
  {
    id: "bugmemory",
    name: "バグメモリ",
    nameEn: "Bug Memory",
    effect: {}
  },
  {
    id: "buginiumz",
    name: "ムシＺ",
    nameEn: "Buginium Z",
    effect: {}
  },
  {
    id: "burndrive",
    name: "バーンカセット",
    nameEn: "Burn Drive",
    effect: {}
  },
  {
    id: "Cameruptite",
    name: "バクーダナイト",
    nameEn: "Cameruptite",
    effect: {}
  },
  {
    id: "cellbattery",
    name: "じゅうでんち",
    nameEn: "Cell Battery",
    effect: {}
  },
  {
    id: "Charizardite X",
    name: "リザードナイトX",
    nameEn: "Charizardite X",
    effect: {}
  },
  {
    id: "Charizardite Y",
    name: "リザードナイトY",
    nameEn: "Charizardite Y",
    effect: {}
  },
  {
    id: "chartiberry",
    name: "ヨロギのみ",
    nameEn: "Charti Berry",
    effect: {}
  },
  {
    id: "cheriberry",
    name: "クラボのみ",
    nameEn: "Cheri Berry",
    effect: {}
  },
  {
    id: "cherishball",
    name: "プレシャスボール",
    nameEn: "Cherish Ball",
    effect: {}
  },
  {
    id: "chestoberry",
    name: "カゴのみ",
    nameEn: "Chesto Berry",
    effect: {}
  },
  {
    id: "chilanberry",
    name: "リンドのみ",
    nameEn: "Chilan Berry",
    effect: {}
  },
  {
    id: "chilldrive",
    name: "フリーズカセット",
    nameEn: "Chill Drive",
    effect: {}
  },
  {
    id: "chippedpot",
    name: "われたポット",
    nameEn: "Chipped Pot",
    effect: {}
  },
  {
    id: "choicescarf",
    name: "こだわりスカーフ",
    nameEn: "Choice Scarf",
    effect: {}
  },
  {
    id: "chopleberry",
    name: "オッカのみ",
    nameEn: "Chople Berry",
    effect: {}
  },
  {
    id: "clawfossil",
    name: "ツメのカセキ",
    nameEn: "Claw Fossil",
    effect: {}
  },
  {
    id: "clearamulet",
    name: "クリアチャーム",
    nameEn: "Clear Amulet",
    effect: {}
  },
  {
    id: "cloversweet",
    name: "ヨツバアメざいく",
    nameEn: "Clover Sweet",
    effect: {}
  },
  {
    id: "cobaberry",
    name: "ヨプのみ",
    nameEn: "Coba Berry",
    effect: {}
  },
  {
    id: "colburberry",
    name: "タンガのみ",
    nameEn: "Colbur Berry",
    effect: {}
  },
  {
    id: "cornerstonemask",
    name: "いしずえのめん",
    nameEn: "Cornerstone Mask",
    effect: {}
  },
  {
    id: "cornnberry",
    name: "ノワキのみ",
    nameEn: "Cornn Berry",
    effect: {}
  },
  {
    id: "coverfossil",
    name: "ふたのカセキ",
    nameEn: "Cover Fossil",
    effect: {}
  },
  {
    id: "covertcloak",
    name: "おんみつマント",
    nameEn: "Covert Cloak",
    effect: {}
  },
  {
    id: "crackedpot",
    name: "かけたポット",
    nameEn: "Cracked Pot",
    effect: {}
  },
  {
    id: "custapberry",
    name: "イバンのみ",
    nameEn: "Custap Berry",
    effect: {}
  },
  {
    id: "damprock",
    name: "しめったいわ",
    nameEn: "Damp Rock",
    effect: {}
  },
  {
    id: "darkgem",
    name: "あくのジュエル",
    nameEn: "Dark Gem",
    effect: {}
  },
  {
    id: "darkmemory",
    name: "ダークメモリ",
    nameEn: "Dark Memory",
    effect: {}
  },
  {
    id: "darkiniumz",
    name: "アクＺ",
    nameEn: "Darkinium Z",
    effect: {}
  },
  {
    id: "dawnstone",
    name: "めざめいし",
    nameEn: "Dawn Stone",
    effect: {}
  },
  {
    id: "decidiumz",
    name: "ジュナイパーＺ",
    nameEn: "Decidium Z",
    effect: {}
  },
  {
    id: "deepseascale",
    name: "しんかいのウロコ",
    nameEn: "Deep Sea Scale",
    effect: {}
  },
  {
    id: "deepseatooth",
    name: "しんかいのキバ",
    nameEn: "Deep Sea Tooth",
    effect: {}
  },
  {
    id: "destinyknot",
    name: "あかいいと",
    nameEn: "Destiny Knot",
    effect: {}
  },
  {
    id: "Diancite",
    name: "ディアンシナイト",
    nameEn: "Diancite",
    effect: {}
  },
  {
    id: "diveball",
    name: "ダイブボール",
    nameEn: "Dive Ball",
    effect: {}
  },
  {
    id: "domefossil",
    name: "こうらのカセキ",
    nameEn: "Dome Fossil",
    effect: {}
  },
  {
    id: "dousedrive",
    name: "アクアカセット",
    nameEn: "Douse Drive",
    effect: {}
  },

  {
    id: "dragonfang",
    name: "りゅうのキバ",
    nameEn: "Dragon Fang",
    typeEnhance: 'dragon', // true → 'dragon'
    effect: {
      type: 'none',

    }
  },
  {
    id: "dragongem",
    name: "ドラゴンジュエル",
    nameEn: "Dragon Gem",
    effect: {}
  },
  {
    id: "dragonmemory",
    name: "ドラゴンメモリ",
    nameEn: "Dragon Memory",
    effect: {}
  },
  {
    id: "dragonscale",
    name: "りゅうのウロコ",
    nameEn: "Dragon Scale",
    effect: {}
  },
  {
    id: "dragoniumz",
    name: "ドラゴンＺ",
    nameEn: "Dragonium Z",
    effect: {}
  },

  {
    id: "dreamball",
    name: "ドリームボール",
    nameEn: "Dream Ball",
    effect: {}
  },
  {
    id: "dubiousdisc",
    name: "あやしいパッチ",
    nameEn: "Dubious Disc",
    effect: {}
  },
  {
    id: "durinberry",
    name: "ネコブのみ",
    nameEn: "Durin Berry",
    effect: {}
  },
  {
    id: "duskball",
    name: "ダークボール",
    nameEn: "Dusk Ball",
    effect: {}
  },
  {
    id: "duskstone",
    name: "やみのいし",
    nameEn: "Dusk Stone",
    effect: {}
  },
  {
    id: "eeviumz",
    name: "イーブイＺ",
    nameEn: "Eevium Z",
    effect: {}
  },
  {
    id: "ejectbutton",
    name: "だっしゅつボタン",
    nameEn: "Eject Button",
    effect: {}
  },
  {
    id: "ejectpack",
    name: "だっしゅつパック",
    nameEn: "Eject Pack",
    effect: {}
  },
  {
    id: "electirizer",
    name: "エレキブースター",
    nameEn: "Electirizer",
    effect: {}
  },
  {
    id: "electricgem",
    name: "でんきのジュエル",
    nameEn: "Electric Gem",
    effect: {}
  },
  {
    id: "electricmemory",
    name: "エレクトロメモリ",
    nameEn: "Electric Memory",
    effect: {}
  },
  {
    id: "electricseed",
    name: "エレキシード",
    nameEn: "Electric Seed",
    effect: {}
  },
  {
    id: "electriumz",
    name: "デンキＺ",
    nameEn: "Electrium Z",
    effect: {}
  },
  {
    id: "enigmaberry",
    name: "ナゾのみ",
    nameEn: "Enigma Berry",
    effect: {}
  },
  {
    id: "eviolite",
    name: "しんかのきせき",
    nameEn: "Eviolite",
    effect: {
      side: 'defender'
    }
  },
  {
    id: "fairiumz",
    name: "フェアリーＺ",
    nameEn: "Fairium Z",
    effect: {}
  },
  {
    id: "fairyfeather",
    name: "ようせいのハネ",
    nameEn: "Fairy Feather",
    typeEnhance: 'fairy',
    effect: {
      type: 'none',

    }
  },
  {
    id: "fairygem",
    name: "フェアリージュエル",
    nameEn: "Fairy Gem",
    effect: {}
  },
  {
    id: "fairymemory",
    name: "フェアリーメモリ",
    nameEn: "Fairy Memory",
    effect: {}
  },
  {
    id: "fastball",
    name: "スピードボール",
    nameEn: "Fast Ball",
    effect: {}
  },
  {
    id: "fightinggem",
    name: "かくとうジュエル",
    nameEn: "Fighting Gem",
    effect: {}
  },
  {
    id: "fightingmemory",
    name: "ファイトメモリ",
    nameEn: "Fighting Memory",
    effect: {}
  },
  {
    id: "fightiniumz",
    name: "カクトウＺ",
    nameEn: "Fightinium Z",
    effect: {}
  },
  {
    id: "figyberry",
    name: "フィラのみ",
    nameEn: "Figy Berry",
    effect: {}
  },
  {
    id: "firegem",
    name: "ほのおのジュエル",
    nameEn: "Fire Gem",
    effect: {}
  },
  {
    id: "firememory",
    name: "ファイアメモリ",
    nameEn: "Fire Memory",
    effect: {}
  },
  {
    id: "firestone",
    name: "ほのおのいし",
    nameEn: "Fire Stone",
    effect: {}
  },
  {
    id: "firiumz",
    name: "ホノオＺ",
    nameEn: "Firium Z",
    effect: {}
  },
  {
    id: "flameorb",
    name: "かえんだま",
    nameEn: "Flame Orb",
    effect: {}
  },
  {
    id: "floatstone",
    name: "かるいし",
    nameEn: "Float Stone",
    effect: {}
  },
  {
    id: "flowersweet",
    name: "ハナアメざいく",
    nameEn: "Flower Sweet",
    effect: {}
  },
  {
    id: "flyinggem",
    name: "ひこうのジュエル",
    nameEn: "Flying Gem",
    effect: {}
  },
  {
    id: "flyingmemory",
    name: "フライングメモリ",
    nameEn: "Flying Memory",
    effect: {}
  },
  {
    id: "flyiniumz",
    name: "ヒコウＺ",
    nameEn: "Flyinium Z",
    effect: {}
  },
  {
    id: "focusband",
    name: "きあいのハチマキ",
    nameEn: "Focus Band",
    effect: {}
  },
  {
    id: "focussash",
    name: "きあいのタスキ",
    nameEn: "Focus Sash",
    effect: {}
  },
  {
    id: "fossilizedbird",
    name: "カセキのトリ",
    nameEn: "Fossilized Bird",
    effect: {}
  },
  {
    id: "fossilizeddino",
    name: "カセキのクビナガ",
    nameEn: "Fossilized Dino",
    effect: {}
  },
  {
    id: "fossilizeddrake",
    name: "カセキのリュウ",
    nameEn: "Fossilized Drake",
    effect: {}
  },
  {
    id: "fossilizedfish",
    name: "カセキのサカナ",
    nameEn: "Fossilized Fish",
    effect: {}
  },
  {
    id: "friendball",
    name: "フレンドボール",
    nameEn: "Friend Ball",
    effect: {}
  },
  {
    id: "fullincense",
    name: "まんぷくおこう",
    nameEn: "Full Incense",
    effect: {}
  },
  {
    id: "galaricacuff",
    name: "ガラナツブレス",
    nameEn: "Galarica Cuff",
    effect: {}
  },
  {
    id: "galaricawreath",
    name: "ガラナツリース",
    nameEn: "Galarica Wreath",
    effect: {}
  },
  {
    id: "Galladite",
    name: "エルレイドナイト",
    nameEn: "Galladite",
    effect: {}
  },
  {
    id: "ganlonberry",
    name: "レンブのみ",
    nameEn: "Ganlon Berry",
    effect: {}
  },
  {
    id: "Garchompite",
    name: "ガブリアスナイト",
    nameEn: "Garchompite",
    effect: {}
  },
  {
    id: "Gardevoirite",
    name: "サーナイトナイト",
    nameEn: "Gardevoirite",
    effect: {}
  },
  {
    id: "Gengarite",
    name: "ゲンガーナイト",
    nameEn: "Gengarite",
    effect: {}
  },
  {
    id: "ghostgem",
    name: "ゴーストジュエル",
    nameEn: "Ghost Gem",
    effect: {}
  },
  {
    id: "ghostmemory",
    name: "ゴーストメモリ",
    nameEn: "Ghost Memory",
    effect: {}
  },
  {
    id: "ghostiumz",
    name: "ゴーストＺ",
    nameEn: "Ghostium Z",
    effect: {}
  },
  {
    id: "Glalitite",
    name: "オニゴーリナイト",
    nameEn: "Glalitite",
    effect: {}
  },
  {
    id: "goldbottlecap",
    name: "きんのおうかん",
    nameEn: "Gold Bottle Cap",
    effect: {}
  },
  {
    id: "grassgem",
    name: "くさのジュエル",
    nameEn: "Grass Gem",
    effect: {}
  },
  {
    id: "grassmemory",
    name: "グラスメモリ",
    nameEn: "Grass Memory",
    effect: {}
  },
  {
    id: "grassiumz",
    name: "クサＺ",
    nameEn: "Grassium Z",
    effect: {}
  },
  {
    id: "grassyseed",
    name: "グラスシード",
    nameEn: "Grassy Seed",
    effect: {}
  },
  {
    id: "greatball",
    name: "スーパーボール",
    nameEn: "Great Ball",
    effect: {}
  },

  {
    id: "grepaberry",
    name: "セシナのみ",
    nameEn: "Grepa Berry",
    effect: {}
  },
  {
    id: "gripclaw",
    name: "ねばりのかぎづめ",
    nameEn: "Grip Claw",
    effect: {}
  },
  {
    id: "griseouscore",
    name: "はっきんだま改", // 正式名称が不明瞭なため暫定
    nameEn: "Griseous Core",
    effect: {}
  },
  {
    id: "griseousorb",
    name: "はっきんだま",
    nameEn: "Griseous Orb",
    effect: {}
  },
  {
    id: "groundgem",
    name: "じめんのジュエル",
    nameEn: "Ground Gem",
    effect: {}
  },
  {
    id: "groundmemory",
    name: "グラウンドメモリ",
    nameEn: "Ground Memory",
    effect: {}
  },
  {
    id: "groundiumz",
    name: "ジメンＺ",
    nameEn: "Groundium Z",
    effect: {}
  },
  {
    id: "Gyaradosite",
    name: "ギャラドスナイト",
    nameEn: "Gyaradosite",
    effect: {}
  },
  {
    id: "habanberry",
    name: "ハバンのみ",
    nameEn: "Haban Berry",
    effect: {}
  },
  {
    id: "hardstone",
    name: "かたいいし",
    nameEn: "Hard Stone",
    typeEnhance: 'rock',
    effect: {
      type: 'none',

    }
  },
  {
    id: "healball",
    name: "ヒールボール",
    nameEn: "Heal Ball",
    effect: {}
  },
  {
    id: "hearthflamemask",
    name: "かまどのめん",
    nameEn: "Hearthflame Mask",
    effect: {}
  },
  {
    id: "heatrock",
    name: "あついいわ",
    nameEn: "Heat Rock",
    effect: {}
  },
  {
    id: "heavyball",
    name: "ヘビーボール",
    nameEn: "Heavy Ball",
    effect: {}
  },
  {
    id: "heavydutyboots",
    name: "あつぞこブーツ",
    nameEn: "Heavy-Duty Boots",
    effect: {}
  },
  {
    id: "helixfossil",
    name: "ひみつのコハク", // これはオムナイトの化石なので「かいのカセキ」が正しい
    nameEn: "Helix Fossil",
    effect: {}
  },
  {
    id: "Heracronite",
    name: "ヘラクロスナイト",
    nameEn: "Heracronite",
    effect: {}
  },
  {
    id: "hondewberry",
    name: "ロメのみ",
    nameEn: "Hondew Berry",
    effect: {}
  },
  {
    id: "Houndoominite",
    name: "ヘルガーナイト",
    nameEn: "Houndoominite",
    effect: {}
  },
  {
    id: "iapapaberry",
    name: "イアのみ",
    nameEn: "Iapapa Berry",
    effect: {}
  },
  {
    id: "icegem",
    name: "こおりのジュエル",
    nameEn: "Ice Gem",
    effect: {}
  },
  {
    id: "icememory",
    name: "アイスメモリ",
    nameEn: "Ice Memory",
    effect: {}
  },
  {
    id: "icestone",
    name: "こおりのいし",
    nameEn: "Ice Stone",
    effect: {}
  },
  {
    id: "iciumz",
    name: "コオリＺ",
    nameEn: "Icium Z",
    effect: {}
  },
  {
    id: "icyrock",
    name: "つめたいいわ",
    nameEn: "Icy Rock",
    effect: {}
  },
  {
    id: "inciniumz",
    name: "ガオガエンＺ",
    nameEn: "Incinium Z",
    effect: {}
  },
  {
    id: "ironball",
    name: "くろいてっきゅう",
    nameEn: "Iron Ball",
    effect: {}
  },
  {
    id: "jabocaberry",
    name: "ジャポのみ",
    nameEn: "Jaboca Berry",
    effect: {}
  },
  {
    id: "jawfossil",
    name: "アゴのカセキ",
    nameEn: "Jaw Fossil",
    effect: {}
  },
  {
    id: "kasibberry",
    name: "カシブのみ",
    nameEn: "Kasib Berry",
    effect: {}
  },
  {
    id: "kebiaberry",
    name: "イトケのみ",
    nameEn: "Kebia Berry",
    effect: {}
  },
  {
    id: "keeberry",
    name: "キーのみ",
    nameEn: "Kee Berry",
    effect: {}
  },
  {
    id: "kelpsyberry",
    name: "ネコブのみ", // Durin Berry と重複。正しくは「マトマのみ」
    nameEn: "Kelpsy Berry",
    effect: {}
  },
  {
    id: "Kangaskhanite",
    name: "ガルーラナイト",
    nameEn: "Kangaskhanite",
    effect: {}
  },
  {
    id: "kingsrock",
    name: "おうじゃのしるし",
    nameEn: "King's Rock",
    effect: {}
  },
  {
    id: "kommoniumz",
    name: "ジャラランガＺ",
    nameEn: "Kommonium Z",
    effect: {}
  },
  {
    id: "laggingtail",
    name: "こうこうのしっぽ",
    nameEn: "Lagging Tail",
    effect: {}
  },
  {
    id: "lansatberry",
    name: "サンのみ",
    nameEn: "Lansat Berry",
    effect: {}
  },
  {
    id: "Latiasite",
    name: "ラティアスナイト",
    nameEn: "Latiasite",
    effect: {}
  },
  {
    id: "Latiosite",
    name: "ラティオスナイト",
    nameEn: "Latiosite",
    effect: {}
  },
  {
    id: "laxincense",
    name: "のんきのおこう",
    nameEn: "Lax Incense",
    effect: {}
  },
  {
    id: "leafstone",
    name: "リーフのいし",
    nameEn: "Leaf Stone",
    effect: {}
  },
  {
    id: "leek",
    name: "ながねぎ",
    nameEn: "Leek",
    effect: {}
  },
  {
    id: "leftovers",
    name: "たべのこし",
    nameEn: "Leftovers",
    effect: {}
  },
  {
    id: "leppaberry",
    name: "ヒメリのみ",
    nameEn: "Leppa Berry",
    effect: {}
  },
  {
    id: "levelball",
    name: "レベルボール",
    nameEn: "Level Ball",
    effect: {}
  },
  {
    id: "liechiberry",
    name: "チイラのみ",
    nameEn: "Liechi Berry",
    effect: {}
  },
  {
    id: "lightball",
    name: "でんきだま",
    nameEn: "Light Ball",
    effect: {}
  },
  {
    id: "lightclay",
    name: "ひかりのねんど",
    nameEn: "Light Clay",
    effect: {}
  },
  {
    id: "loadeddice",
    name: "いかさまダイス",
    nameEn: "Loaded Dice",
    effect: {}
  },
  {
    id: "Lopunnite",
    name: "ミミロップナイト",
    nameEn: "Lopunnite",
    effect: {}
  },
  {
    id: "loveball",
    name: "ラブラブボール",
    nameEn: "Love Ball",
    effect: {}
  },
  {
    id: "lovesweet",
    name: "ハートアメざいく",
    nameEn: "Love Sweet",
    effect: {}
  },
  {
    id: "Lucarionite",
    name: "ルカリオナイト",
    nameEn: "Lucarionite",
    effect: {}
  },
  {
    id: "luckypunch",
    name: "ラッキーパンチ",
    nameEn: "Lucky Punch",
    effect: {}
  },
  {
    id: "lumberry",
    name: "ラムのみ",
    nameEn: "Lum Berry",
    effect: {}
  },
  {
    id: "luminousmoss",
    name: "ひかりごけ",
    nameEn: "Luminous Moss",
    effect: {}
  },
  {
    id: "lunaliumz",
    name: "ルナアーラＺ",
    nameEn: "Lunalium Z",
    effect: {}
  },
  {
    id: "lureball",
    name: "ルアーボール",
    nameEn: "Lure Ball",
    effect: {}
  },
  {
    id: "lustrousglobe",
    name: "しらたま改", // 正式名称が不明瞭なため暫定
    nameEn: "Lustrous Globe",
    effect: {}
  },
  {
    id: "lustrousorb",
    name: "しらたま",
    nameEn: "Lustrous Orb",
    effect: {}
  },
  {
    id: "luxuryball",
    name: "ゴージャスボール",
    nameEn: "Luxury Ball",
    effect: {}
  },
  {
    id: "lycaniumz",
    name: "ルガルガンＺ",
    nameEn: "Lycanium Z",
    effect: {}
  },
  {
    id: "machobrace",
    name: "きょうせいギプス",
    nameEn: "Macho Brace",
    effect: {}
  },
  {
    id: "magmarizer",
    name: "マグマブースター",
    nameEn: "Magmarizer",
    effect: {}
  },

  {
    id: "magoberry",
    name: "マゴのみ",
    nameEn: "Mago Berry",
    effect: {}
  },
  {
    id: "magostberry",
    name: "ゴスのみ",
    nameEn: "Magost Berry",
    effect: {}
  },
  {
    id: "mail",
    name: "メール", // 種類が複数あるため総称
    nameEn: "Mail",
    effect: {}
  },
  {
    id: "maliciousarmor",
    name: "ノロイノヨロイ",
    nameEn: "Malicious Armor",
    effect: {}
  },
  {
    id: "Manectite",
    name: "ライボルトナイト",
    nameEn: "Manectite",
    effect: {}
  },
  {
    id: "marangaberry",
    name: "タラプのみ",
    nameEn: "Maranga Berry",
    effect: {}
  },
  {
    id: "marshadiumz",
    name: "マーシャドーＺ",
    nameEn: "Marshadium Z",
    effect: {}
  },
  {
    id: "masterball",
    name: "マスターボール",
    nameEn: "Master Ball",
    effect: {}
  },
  {
    id: "masterpieceteacup",
    name: "ケッサクのちゃわん",
    nameEn: "Masterpiece Teacup",
    effect: {}
  },
  {
    id: "Mawilite",
    name: "クチートナイト",
    nameEn: "Mawilite",
    effect: {}
  },
  {
    id: "Medichamite",
    name: "チャーレムナイト",
    nameEn: "Medichamite",
    effect: {}
  },
  {
    id: "mentalherb",
    name: "メンタルハーブ",
    nameEn: "Mental Herb",
    effect: {}
  },
  {
    id: "Metagrossite",
    name: "メタグロスナイト",
    nameEn: "Metagrossite",
    effect: {}
  },
  {
    id: "metalalloy",
    name: "ふくごうきんぞく",
    nameEn: "Metal Alloy",
    effect: {}
  },
  {
    id: "metalcoat",
    name: "メタルコート",
    nameEn: "Metal Coat",
    typeEnhance: 'steel',
    effect: {
      type: 'none',

    }
  },
  {
    id: "metalpowder",
    name: "メタルパウダー",
    nameEn: "Metal Powder",
    effect: {}
  },
  {
    id: "metronome",
    name: "メトロノーム",
    nameEn: "Metronome",
    effect: {}
  },
  {
    id: "mewniumz",
    name: "ミュウＺ",
    nameEn: "Mewnium Z",
    effect: {}
  },
  {
    id: "Mewtwonite X",
    name: "ミュウツーナイトX",
    nameEn: "Mewtwonite X",
    effect: {}
  },
  {
    id: "Mewtwonite Y",
    name: "ミュウツーナイトY",
    nameEn: "Mewtwonite Y",
    effect: {}
  },
  {
    id: "micleberry",
    name: "ミクルのみ",
    nameEn: "Micle Berry",
    effect: {}
  },
  {
    id: "mimikiumz",
    name: "ミミッキュＺ",
    nameEn: "Mimikium Z",
    effect: {}
  },
  {
    id: "miracleseed",
    name: "きせきのタネ",
    nameEn: "Miracle Seed",
    typeEnhance: 'grass',
    effect: {
      type: 'none',

    }
  },
  {
    id: "mirrorherb",
    name: "ものまねハーブ",
    nameEn: "Mirror Herb",
    effect: {}
  },
  {
    id: "mistyseed",
    name: "ミストシード",
    nameEn: "Misty Seed",
    effect: {}
  },
  {
    id: "moonball",
    name: "ムーンボール",
    nameEn: "Moon Ball",
    effect: {}
  },
  {
    id: "moonstone",
    name: "つきのいし",
    nameEn: "Moon Stone",
    effect: {}
  },
  {
    id: "muscleband",
    name: "ちからのハチマキ",
    nameEn: "Muscle Band",
    effect: {
      side: 'attacker',
      type: 'none',
    },
  },
  {
    id: "nanabberry",
    name: "ナナのみ",
    nameEn: "Nanab Berry",
    effect: {}
  },
  {
    id: "nestball",
    name: "ネストボール",
    nameEn: "Nest Ball",
    effect: {}
  },
  {
    id: "netball",
    name: "ネットボール",
    nameEn: "Net Ball",
    effect: {}
  },
  {
    id: "nevermeltice",
    name: "とけないこおり",
    nameEn: "Never-Melt Ice",
    typeEnhance: 'ice',
    effect: {
      type: 'none',

    }
  },
  {
    id: "nomelberry",
    name: "ザロクのみ",
    nameEn: "Nomel Berry",
    effect: {}
  },
  {
    id: "normalgem",
    name: "ノーマルジュエル",
    nameEn: "Normal Gem",
    effect: {}
  },
  {
    id: "normaliumz",
    name: "ノーマルＺ",
    nameEn: "Normalium Z",
    effect: {}
  },
  {
    id: "occaberry",
    name: "オッカのみ", // Chople Berry と重複。正しくは「シュカのみ」
    nameEn: "Occa Berry",
    effect: {}
  },
  {
    id: "oddincense",
    name: "あやしいおこう",
    nameEn: "Odd Incense",
    effect: {}
  },
  {
    id: "oldamber",
    name: "ひみつのコハク",
    nameEn: "Old Amber",
    effect: {}
  },
  {
    id: "oranberry",
    name: "オレンのみ",
    nameEn: "Oran Berry",
    effect: {}
  },
  {
    id: "ovalstone",
    name: "まんまるいし",
    nameEn: "Oval Stone",
    effect: {}
  },
  {
    id: "pamtreberry",
    name: "ラブタのみ",
    nameEn: "Pamtre Berry",
    effect: {}
  },
  {
    id: "parkball",
    name: "パークボール",
    nameEn: "Park Ball",
    effect: {}
  },
  {
    id: "passhoberry",
    name: "ソクノのみ",
    nameEn: "Passho Berry",
    effect: {}
  },
  {
    id: "payapaberry",
    name: "ウタンのみ",
    nameEn: "Payapa Berry",
    effect: {}
  },
  {
    id: "pechaberry",
    name: "モモンのみ", // Aspear Berry と重複。正しくは「チーゴのみ」
    nameEn: "Pecha Berry",
    effect: {}
  },
  {
    id: "persimberry",
    name: "キーのみ", // Kee Berry と重複。正しくは「ナナシのみ」 (Bluk Berryとも重複の可能性あり)
    nameEn: "Persim Berry",
    effect: {}
  },
  {
    id: "petayaberry",
    name: "ヤタピのみ",
    nameEn: "Petaya Berry",
    effect: {}
  },
  {
    id: "Pidgeotite",
    name: "ピジョットナイト",
    nameEn: "Pidgeotite",
    effect: {}
  },
  {
    id: "pikaniumz",
    name: "ピカチュウＺ",
    nameEn: "Pikanium Z",
    effect: {}
  },
  {
    id: "pikashuniumz",
    name: "サトピカＺ",
    nameEn: "Pikashunium Z",
    effect: {}
  },
  {
    id: "pinapberry",
    name: "パイルのみ",
    nameEn: "Pinap Berry",
    effect: {}
  },
  {
    id: "Pinsirite",
    name: "カイロスナイト",
    nameEn: "Pinsirite",
    effect: {}
  },
  {
    id: "plumefossil",
    name: "はねのカセキ",
    nameEn: "Plume Fossil",
    effect: {}
  },
  {
    id: "poisonbarb",
    name: "どくバリ",
    nameEn: "Poison Barb",
    typeEnhance: 'poison',
    effect: {
      type: 'none',

    }
  },
  {
    id: "poisongem",
    name: "どくのジュエル",
    nameEn: "Poison Gem",
    effect: {}
  },
  {
    id: "poisonmemory",
    name: "ポイズンメモリ",
    nameEn: "Poison Memory",
    effect: {}
  },
  {
    id: "poisoniumz",
    name: "ドクＺ",
    nameEn: "Poisonium Z",
    effect: {}
  },
  {
    id: "pokeball",
    name: "モンスターボール",
    nameEn: "Poke Ball",
    effect: {}
  },
  {
    id: "pomegberry",
    name: "ザロクのみ", // Nomel Berry と重複。正しくは「タポルのみ」
    nameEn: "Pomeg Berry",
    effect: {}
  },
  {
    id: "poweranklet",
    name: "パワーアンクル",
    nameEn: "Power Anklet",
    effect: {}
  },
  {
    id: "powerband",
    name: "パワーバンド",
    nameEn: "Power Band",
    effect: {}
  },
  {
    id: "powerbelt",
    name: "パワーベルト",
    nameEn: "Power Belt",
    effect: {}
  },
  {
    id: "powerbracer",
    name: "パワーリスト",
    nameEn: "Power Bracer",
    effect: {}
  },
  {
    id: "powerherb",
    name: "パワフルハーブ",
    nameEn: "Power Herb",
    effect: {}
  },

  {
    id: "powerlens",
    name: "パワーレンズ",
    nameEn: "Power Lens",
    effect: {}
  },
  {
    id: "powerweight",
    name: "パワーウエイト",
    nameEn: "Power Weight",
    effect: {}
  },
  {
    id: "premierball",
    name: "プレミアボール",
    nameEn: "Premier Ball",
    effect: {}
  },
  {
    id: "primariumz",
    name: "アシレーヌＺ",
    nameEn: "Primarium Z",
    effect: {}
  },
  {
    id: "prismscale",
    name: "きれいなウロコ",
    nameEn: "Prism Scale",
    effect: {}
  },
  {
    id: "protectivepads",
    name: "ぼうごパット",
    nameEn: "Protective Pads",
    effect: {}
  },
  {
    id: "protector",
    name: "プロテクター",
    nameEn: "Protector",
    effect: {}
  },
  {
    id: "psychicgem",
    name: "エスパージュエル",
    nameEn: "Psychic Gem",
    effect: {}
  },
  {
    id: "psychicmemory",
    name: "サイキックメモリ",
    nameEn: "Psychic Memory",
    effect: {}
  },
  {
    id: "psychicseed",
    name: "サイコシード",
    nameEn: "Psychic Seed",
    effect: {}
  },
  {
    id: "psychiumz",
    name: "エスパーＺ",
    nameEn: "Psychium Z",
    effect: {}
  },
  {
    id: "punchingglove",
    name: "パンチグローブ",
    nameEn: "Punching Glove",
    effect: {}
  },
  {
    id: "qualotberry",
    name: "タポルのみ",
    nameEn: "Qualot Berry",
    effect: {}
  },
  {
    id: "quickball",
    name: "クイックボール",
    nameEn: "Quick Ball",
    effect: {}
  },
  {
    id: "quickclaw",
    name: "せんせいのツメ",
    nameEn: "Quick Claw",
    effect: {}
  },
  {
    id: "quickpowder",
    name: "スピードパウダー",
    nameEn: "Quick Powder",
    effect: {}
  },
  {
    id: "rabutaberry",
    name: "ヤチェのみ",
    nameEn: "Rabuta Berry",
    effect: {}
  },
  {
    id: "rarebone",
    name: "きちょうなホネ",
    nameEn: "Rare Bone",
    effect: {}
  },
  {
    id: "rawstberry",
    name: "チーゴのみ",
    nameEn: "Rawst Berry",
    effect: {}
  },
  {
    id: "razorclaw",
    name: "するどいツメ",
    nameEn: "Razor Claw",
    effect: {}
  },
  {
    id: "razorfang",
    name: "するどいキバ",
    nameEn: "Razor Fang",
    effect: {}
  },
  {
    id: "razzberry",
    name: "ズリのみ",
    nameEn: "Razz Berry",
    effect: {}
  },
  {
    id: "reapercloth",
    name: "れいかいのぬの",
    nameEn: "Reaper Cloth",
    effect: {}
  },
  {
    id: "redcard",
    name: "レッドカード",
    nameEn: "Red Card",
    effect: {}
  },
  {
    id: "redorb",
    name: "べにいろのたま",
    nameEn: "Red Orb",
    effect: {}
  },
  {
    id: "repeatball",
    name: "リピートボール",
    nameEn: "Repeat Ball",
    effect: {}
  },
  {
    id: "ribbonsweet",
    name: "リボンアメざいく",
    nameEn: "Ribbon Sweet",
    effect: {}
  },
  {
    id: "rindoberry",
    name: "リンドのみ", // Chilan Berry と重複の可能性あり
    nameEn: "Rindo Berry",
    effect: {}
  },
  {
    id: "ringtarget",
    name: "ねらいのまと",
    nameEn: "Ring Target",
    effect: {}
  },
  {
    id: "rockgem",
    name: "いわのジュエル",
    nameEn: "Rock Gem",
    effect: {}
  },
  {
    id: "rockincense",
    name: "がんせきおこう",
    nameEn: "Rock Incense",
    effect: {}
  },
  {
    id: "rockmemory",
    name: "ロックメモリ",
    nameEn: "Rock Memory",
    effect: {}
  },
  {
    id: "rockiumz",
    name: "イワＺ",
    nameEn: "Rockium Z",
    effect: {}
  },
  {
    id: "rockyhelmet",
    name: "ゴツゴツメット",
    nameEn: "Rocky Helmet",
    effect: {}
  },
  {
    id: "roomservice",
    name: "ルームサービス",
    nameEn: "Room Service",
    effect: {}
  },
  {
    id: "rootfossil",
    name: "ねっこのカセキ",
    nameEn: "Root Fossil",
    effect: {}
  },
  {
    id: "roseincense",
    name: "おはなのおこう",
    nameEn: "Rose Incense",
    effect: {}
  },
  {
    id: "roseliberry",
    name: "ロゼルのみ",
    nameEn: "Roseli Berry",
    effect: {}
  },
  {
    id: "rowapberry",
    name: "レンブのみ", // Ganlon Berry と重複の可能性あり
    nameEn: "Rowap Berry",
    effect: {}
  },
  {
    id: "rustedshield",
    name: "くちたたて",
    nameEn: "Rusted Shield",
    effect: {}
  },
  {
    id: "rustedsword",
    name: "くちたけん",
    nameEn: "Rusted Sword",
    effect: {}
  },
  {
    id: "Sablenite",
    name: "ヤミラミナイト",
    nameEn: "Sablenite",
    effect: {}
  },
  {
    id: "sachet",
    name: "においぶくろ",
    nameEn: "Sachet",
    effect: {}
  },
  {
    id: "safariball",
    name: "サファリボール",
    nameEn: "Safari Ball",
    effect: {}
  },
  {
    id: "safetygoggles",
    name: "ぼうじんゴーグル",
    nameEn: "Safety Goggles",
    effect: {}
  },
  {
    id: "sailfossil",
    name: "ヒレのカセキ",
    nameEn: "Sail Fossil",
    effect: {}
  },
  {
    id: "salacberry",
    name: "カムラのみ",
    nameEn: "Salac Berry",
    effect: {}
  },
  {
    id: "Salamencite",
    name: "ボーマンダナイト",
    nameEn: "Salamencite",
    effect: {}
  },
  {
    id: "Sceptilite",
    name: "ジュカインナイト",
    nameEn: "Sceptilite",
    effect: {}
  },
  {
    id: "Scizorite",
    name: "ハッサムナイト",
    nameEn: "Scizorite",
    effect: {}
  },
  {
    id: "scopelens",
    name: "ピントレンズ",
    nameEn: "Scope Lens",
    effect: {}
  },
  {
    id: "seaincense",
    name: "うしおのおこう",
    nameEn: "Sea Incense",
    effect: {}
  },
  {
    id: "sharpbeak",
    name: "するどいくちばし",
    nameEn: "Sharp Beak",
    typeEnhance: 'flying',
    effect: {
      type: 'none',

    }
  },
  {
    id: "Sharpedonite",
    name: "サメハダーナイト",
    nameEn: "Sharpedonite",
    effect: {}
  },
  {
    id: "shedshell",
    name: "きれいなぬけがら",
    nameEn: "Shed Shell",
    effect: {}
  },
  {
    id: "shellbell",
    name: "かいがらのすず",
    nameEn: "Shell Bell",
    effect: {}
  },
  {
    id: "shinystone",
    name: "ひかりのいし",
    nameEn: "Shiny Stone",
    effect: {}
  },
  {
    id: "shockdrive",
    name: "イナズマカセット",
    nameEn: "Shock Drive",
    effect: {}
  },
  {
    id: "shucaberry",
    name: "シュカのみ",
    nameEn: "Shuca Berry",
    effect: {}
  },
  {
    id: "silkscarf",
    name: "シルクのスカーフ",
    nameEn: "Silk Scarf",
    effect: {}
  },
  {
    id: "silverpowder",
    name: "ぎんのこな",
    nameEn: "Silver Powder",
    typeEnhance: 'bug',
    effect: {
      type: 'none',

    }
  },
  {
    id: "sitrusberry",
    name: "オボンのみ",
    nameEn: "Sitrus Berry",
    effect: {}
  },
  {
    id: "skullfossil",
    name: "ずがいのカセキ",
    nameEn: "Skull Fossil",
    effect: {}
  },
  {
    id: "Slowbronite",
    name: "ヤドランナイト",
    nameEn: "Slowbronite",
    effect: {}
  },
  {
    id: "smoothrock",
    name: "さらさらいわ",
    nameEn: "Smooth Rock",
    effect: {}
  },
  {
    id: "snorliumz",
    name: "カビゴンＺ",
    nameEn: "Snorlium Z",
    effect: {}
  },
  {
    id: "snowball",
    name: "ゆきだま",
    nameEn: "Snowball",
    effect: {}
  },
  {
    id: "softsand",
    name: "やわらかいすな",
    nameEn: "Soft Sand",
    typeEnhance: 'ground',
    effect: {
      type: 'none',

    }
  },
  {
    id: "solganiumz",
    name: "ソルガレオＺ",
    nameEn: "Solganium Z",
    effect: {}
  },
  {
    id: "souldew",
    name: "こころのしずく",
    nameEn: "Soul Dew",
    effect: {}
  },
  {
    id: "spelltag",
    name: "のろいのおふだ",
    nameEn: "Spell Tag",
    typeEnhance: 'ghost',
    effect: {
      type: 'none',

    }
  },
  {
    id: "spelonberry",
    name: "ウブのみ",
    nameEn: "Spelon Berry",
    effect: {}
  },
  {
    id: "sportball",
    name: "コンペボール",
    nameEn: "Sport Ball",
    effect: {}
  },
  {
    id: "starfberry",
    name: "スターのみ",
    nameEn: "Starf Berry",
    effect: {}
  },
  {
    id: "starsweet",
    name: "ホシのアメざいく",
    nameEn: "Star Sweet",
    effect: {}
  },
  {
    id: "Steelixite",
    name: "ハガネールナイト",
    nameEn: "Steelixite",
    effect: {}
  },
  {
    id: "steelgem",
    name: "はがねのジュエル",
    nameEn: "Steel Gem",
    effect: {}
  },
  {
    id: "steelmemory",
    name: "スチールメモリ",
    nameEn: "Steel Memory",
    effect: {}
  },
  {
    id: "steeliumz",
    name: "ハガネＺ",
    nameEn: "Steelium Z",
    effect: {}
  },
  {
    id: "stick",
    name: "ながねぎ", // Leek と重複
    nameEn: "Stick",
    effect: {}
  },
  {
    id: "stickybarb",
    name: "くっつきバリ",
    nameEn: "Sticky Barb",
    effect: {}
  },
  {
    id: "strangeball",
    name: "ストレンジボール",
    nameEn: "Strange Ball",
    effect: {}
  },
  {
    id: "strawberrysweet",
    name: "イチゴのアメざいく", // Berry Sweet と名称が似ているが別物
    nameEn: "Strawberry Sweet",
    effect: {}
  },
  {
    id: "sunstone",
    name: "たいようのいし",
    nameEn: "Sun Stone",
    effect: {}
  },
  {
    id: "Swampertite",
    name: "ラグラージナイト",
    nameEn: "Swampertite",
    effect: {}
  },
  {
    id: "sweetapple",
    name: "あまーいリンゴ",
    nameEn: "Sweet Apple",
    effect: {}
  },
  {
    id: "syrupyapple",
    name: "みついりリンゴ",
    nameEn: "Syrupy Apple",
    effect: {}
  },
  {
    id: "tamatoberry",
    name: "トマトのみ",
    nameEn: "Tamato Berry",
    effect: {}
  },
  {
    id: "tangaberry",
    name: "ヨロギのみ", // Charti Berry と重複の可能性あり
    nameEn: "Tanga Berry",
    effect: {}
  },
  {
    id: "tapuniumz",
    name: "カプＺ",
    nameEn: "Tapunium Z",
    effect: {}
  },
  {
    id: "tartapple",
    name: "すっぱいリンゴ",
    nameEn: "Tart Apple",
    effect: {}
  },
  {
    id: "terrainextender",
    name: "グランドコート",
    nameEn: "Terrain Extender",
    effect: {}
  },
  {
    id: "thickclub",
    name: "ふといホネ",
    nameEn: "Thick Club",
    effect: {}
  },
  {
    id: "throatspray",
    name: "のどスプレー",
    nameEn: "Throat Spray",
    effect: {}
  },
  {
    id: "thunderstone",
    name: "かみなりのいし",
    nameEn: "Thunder Stone",
    effect: {}
  },
  {
    id: "timerball",
    name: "タイマーボール",
    nameEn: "Timer Ball",
    effect: {}
  },
  {
    id: "toxicorb",
    name: "どくどくだま",
    nameEn: "Toxic Orb",
    effect: {}
  },
  {
    id: "twistedspoon",
    name: "まがったスプーン",
    nameEn: "Twisted Spoon",
    typeEnhance: 'psychic',
    effect: {
      type: 'none',

    }
  },
  {
    id: "Tyranitarite",
    name: "バンギラスナイト",
    nameEn: "Tyranitarite",
    effect: {}
  },
  {
    id: "ultraball",
    name: "ハイパーボール",
    nameEn: "Ultra Ball",
    effect: {}
  },
  {
    id: "ultranecroziumz",
    name: "ウルトラネクロＺ",
    nameEn: "Ultranecrozium Z",
    effect: {}
  },
  {
    id: "unremarkableteacup",
    name: "ボンサクのちゃわん",
    nameEn: "Unremarkable Teacup",
    effect: {}
  },
  {
    id: "upgrade",
    name: "アップグレード",
    nameEn: "Up-Grade",
    effect: {}
  },
  {
    id: "utilityumbrella",
    name: "ばんのうがさ",
    nameEn: "Utility Umbrella",
    effect: {}
  },
  {
    id: "Venusaurite",
    name: "フシギバナナイト",
    nameEn: "Venusaurite",
    effect: {}
  },
  {
    id: "wacanberry",
    name: "ソクノのみ", // Passho Berry と重複の可能性あり
    nameEn: "Wacan Berry",
    effect: {}
  },
  {
    id: "watergem",
    name: "みずのジュエル",
    nameEn: "Water Gem",
    effect: {}
  },
  {
    id: "watermemory",
    name: "ウオーターメモリ",
    nameEn: "Water Memory",
    effect: {}
  },
  {
    id: "waterstone",
    name: "みずのいし",
    nameEn: "Water Stone",
    effect: {}
  },
  {
    id: "wateriumz",
    name: "ミズＺ",
    nameEn: "Waterium Z",
    effect: {}
  },
  {
    id: "watmelberry",
    name: "シーヤのみ",
    nameEn: "Watmel Berry",
    effect: {}
  },
  {
    id: "waveincense",
    name: "うしおのおこう", // Sea Incense と重複
    nameEn: "Wave Incense",
    effect: {}
  },
  {
    id: "weaknesspolicy",
    name: "じゃくてんほけん",
    nameEn: "Weakness Policy",
    effect: {}
  },
  {
    id: "wellspringmask",
    name: "いどのめん",
    nameEn: "Wellspring Mask",
    effect: {}
  },
  {
    id: "wepearberry",
    name: "ズリのみ", // Razz Berry と重複の可能性あり
    nameEn: "Wepear Berry",
    effect: {}
  },
  {
    id: "whippeddream",
    name: "ホイップポップ",
    nameEn: "Whipped Dream",
    effect: {}
  },
  {
    id: "whiteherb",
    name: "しろいハーブ",
    nameEn: "White Herb",
    effect: {}
  },
  {
    id: "widelens",
    name: "こうかくレンズ",
    nameEn: "Wide Lens",
    effect: {}
  },
  {
    id: "wikiberry",
    name: "ウイのみ",
    nameEn: "Wiki Berry",
    effect: {}
  },
  {
    id: "wiseglasses",
    name: "ものしりメガネ",
    nameEn: "Wise Glasses",
    effect: {
      side: 'attacker',
      type: 'none',
    },
  },
  {
    id: "yacheberry",
    name: "ヤチェのみ", // Rabuta Berry と重複の可能性あり
    nameEn: "Yache Berry",
    effect: {}
  },
  {
    id: "zoomlens",
    name: "フォーカスレンズ",
    nameEn: "Zoom Lens",
    effect: {}
  },
  {
    id: "dracoplate",
    name: "りゅうのプレート",
    nameEn: "Draco Plate",
    typeEnhance: 'dragon', // true → 'dragon'
    effect: {
      type: 'none',

    }
  },
  {
    id: "flameplate",
    name: "かえんプレート",
    nameEn: "Flame Plate",
    typeEnhance: 'fire',
    effect: {
      type: 'none',

    }
  },
  {
    id: "splashplate",
    name: "しずくプレート",
    nameEn: "Splash Plate",
    typeEnhance: 'water',
    effect: {
      type: 'none',

    }
  },
  {
    id: "zapplate",
    name: "いかずちプレート",
    nameEn: "Zap Plate",
    typeEnhance: 'electric',
    effect: {
      type: 'none',

    }
  },
  {
    id: "meadowplate",
    name: "みどりのプレート",
    nameEn: "Meadow Plate",
    typeEnhance: 'grass',
    effect: {
      type: 'none',

    }
  },
  {
    id: "icicleplate",
    name: "つららのプレート",
    nameEn: "Icicle Plate",
    typeEnhance: 'ice',
    effect: {
      type: 'none',

    }
  },
  {
    id: "fistplate",
    name: "こぶしのプレート",
    nameEn: "Fist Plate",
    typeEnhance: 'fighting',
    effect: {
      type: 'none',

    }
  },
  {
    id: "toxicplate",
    name: "どくのプレート",
    nameEn: "Toxic Plate",
    typeEnhance: 'poison',
    effect: {
      type: 'none',

    }
  },
  {
    id: "earthplate",
    name: "だいちのプレート",
    nameEn: "Earth Plate",
    typeEnhance: 'ground',
    effect: {
      type: 'none',

    }
  },
  {
    id: "skyplate",
    name: "あおぞらプレート",
    nameEn: "Sky Plate",
    typeEnhance: 'flying',
    effect: {
      type: 'none',

    }
  },
  {
    id: "mindplate",
    name: "ふしぎのプレート",
    nameEn: "Mind Plate",
    typeEnhance: 'psychic',
    effect: {
      type: 'none',

    }
  },
  {
    id: "insectplate",
    name: "たまむしプレート",
    nameEn: "Insect Plate",
    typeEnhance: 'bug',
    effect: {
      type: 'none',

    }
  },
  {
    id: "stoneplate",
    name: "がんせきプレート",
    nameEn: "Stone Plate",
    typeEnhance: 'rock',
    effect: {
      type: 'none',

    }
  },
  {
    id: "spookyplate",
    name: "もののけプレート",
    nameEn: "Spooky Plate",
    typeEnhance: 'ghost',
    effect: {
      type: 'none',

    }
  },
  {
    id: "dreadplate",
    name: "こわもてプレート",
    nameEn: "Dread Plate",
    typeEnhance: 'dark',
    effect: {
      type: 'none',

    }
  },
  {
    id: "ironplate",
    name: "こうてつプレート",
    nameEn: "Iron Plate",
    typeEnhance: 'steel',
    effect: {
      type: 'none',

    }
  },
  {
    id: "pixieplate",
    name: "せいれいプレート",
    nameEn: "Pixie Plate",
    typeEnhance: 'fairy',
    effect: {
      type: 'none',

    }
  },
  {
    id: "charcoal",
    name: "もくたん",
    nameEn: "Charcoal",
    typeEnhance: 'fire',
    effect: {
      type: 'none',

    }
  },
  {
    id: "mystic_water",
    name: "しんぴのしずく",
    nameEn: "Mystic Water",
    typeEnhance: 'water',
    effect: {
      type: 'none',
    }
  },
  {
    id: "magnet",
    name: "じしゃく",
    nameEn: "Magnet",
    typeEnhance: 'electric',
    effect: {
      type: 'none',
    }
  },
  {
    id: "Baxcalibrite",
    name: "セグレイブナイト",
    nameEn: "Baxcalibrite",
    effect: {}
  },
  {
    id: "Chandelurite",
    name: "シャンデラナイト",
    nameEn: "Chandelurite",
    effect: {}
  },
  {
    id: "Chesnaughtite",
    name: "ブリガロンナイト",
    nameEn: "Chesnaughtite",
    effect: {}
  },
  {
    id: "Chimechite",
    name: "チリーンナイト",
    nameEn: "Chimechite",
    effect: {}
  },
  {
    id: "Clefablite",
    name: "ピクシーナイト",
    nameEn: "Clefablite",
    effect: {}
  },
  {
    id: "Crabominite",
    name: "ケケンカナイト",
    nameEn: "Crabominite",
    effect: {}
  },
  {
    id: "Darkranite",
    name: "ダークライナイト",
    nameEn: "Darkranite",
    effect: {}
  },
  {
    id: "Delphoxite",
    name: "マフォクシーナイト",
    nameEn: "Delphoxite",
    effect: {}
  },
  {
    id: "Dragalgite",
    name: "ドラミドロナイト",
    nameEn: "Dragalgite",
    effect: {}
  },
  {
    id: "Dragoninite",
    name: "カイリューナイト",
    nameEn: "Dragoninite",
    effect: {}
  },
  {
    id: "Drampanite",
    name: "ジジーロンナイト",
    nameEn: "Drampanite",
    effect: {}
  },
  {
    id: "Eelektrossite",
    name: "シビルドンナイト",
    nameEn: "Eelektrossite",
    effect: {}
  },
  {
    id: "Emboarite",
    name: "エンブオーナイト",
    nameEn: "Emboarite",
    effect: {}
  },
  {
    id: "Excadrite",
    name: "ドリュウズナイト",
    nameEn: "Excadrite",
    effect: {}
  },
  {
    id: "Falinksite",
    name: "タイレーツナイト",
    nameEn: "Falinksite",
    effect: {}
  },
  {
    id: "Feraligite",
    name: "オーダイルナイト",
    nameEn: "Feraligite",
    effect: {}
  },
  {
    id: "Floettite",
    name: "フラエッテナイト",
    nameEn: "Floettite",
    effect: {}
  },
  {
    id: "Froslassite",
    name: "ユキメノコナイト",
    nameEn: "Froslassite",
    effect: {}
  },
  {
    id: "Garchompite Z",
    name: "ガブリアスナイトZ",
    nameEn: "Garchompite Z",
    effect: {}
  },
  {
    id: "Glimmoranite",
    name: "キラフロルナイト",
    nameEn: "Glimmoranite",
    effect: {}
  },
  {
    id: "Golisopite",
    name: "グソクムシャナイト",
    nameEn: "Golisopite",
    effect: {}
  },
  {
    id: "Golurkite",
    name: "ゴルーグナイト",
    nameEn: "Golurkite",
    effect: {}
  },
  {
    id: "Greninjite",
    name: "ゲッコウガナイト",
    nameEn: "Greninjite",
    effect: {}
  },
  {
    id: "Hawluchanite",
    name: "ルチャブルナイト",
    nameEn: "Hawluchanite",
    effect: {}
  },
  {
    id: "Heatranite",
    name: "ヒードランナイト",
    nameEn: "Heatranite",
    effect: {}
  },
  {
    id: "Lucarionite Z",
    name: "ルカリオナイトZ",
    nameEn: "Lucarionite Z",
    effect: {}
  },
  {
    id: "Magearnite",
    name: "マギアナナイト",
    nameEn: "Magearnite",
    effect: {}
  },
  {
    id: "Malamarite",
    name: "カラマネロナイト",
    nameEn: "Malamarite",
    effect: {}
  },
  {
    id: "Meganiumite",
    name: "メガニウムナイト",
    nameEn: "Meganiumite",
    effect: {}
  },
  {
    id: "Meowsticite",
    name: "ニャオニクスナイト",
    nameEn: "Meowsticite",
    effect: {}
  },
  {
    id: "Pyroarite",
    name: "カエンジシナイト",
    nameEn: "Pyroarite",
    effect: {}
  },
  {
    id: "Raichunite X",
    name: "ライチュウナイトX",
    nameEn: "Raichunite X",
    effect: {}
  },
  {
    id: "Raichunite Y",
    name: "ライチュウナイトY",
    nameEn: "Raichunite Y",
    effect: {}
  },
  {
    id: "Scolipite",
    name: "ペンドラーナイト",
    nameEn: "Scolipite",
    effect: {}
  },
  {
    id: "Scovillainite",
    name: "スコヴィランナイト",
    nameEn: "Scovillainite",
    effect: {}
  },
  {
    id: "Scraftinite",
    name: "ズルズキンナイト",
    nameEn: "Scraftinite",
    effect: {}
  },
  {
    id: "Skarmorite",
    name: "エアームドナイト",
    nameEn: "Skarmorite",
    effect: {}
  },
  {
    id: "Staraptite",
    name: "ムクホークナイト",
    nameEn: "Staraptite",
    effect: {}
  },
  {
    id: "Starminite",
    name: "スターミーナイト",
    nameEn: "Starminite",
    effect: {}
  },
  {
    id: "Tatsugirinite",
    name: "シャリタツナイト",
    nameEn: "Tatsugirinite",
    effect: {}
  },
  {
    id: "Victreebelite",
    name: "ウツボットナイト",
    nameEn: "Victreebelite",
    effect: {}
  },
  {
    id: "Zeraorite",
    name: "ゼラオアナイト",
    nameEn: "Zeraorite",
    effect: {}
  },
  {
    id: "Zygardite",
    name: "ジガルデナイト",
    nameEn: "Zygardite",
    effect: {}
  },
  {
    id: "Absolite Z",
    name: "アブソルナイトZ",
    nameEn: "Absolite Z",
    effect: {}
  },
  {
    id: "Barbaracite",
    name: "ガメノデスナイト",
    nameEn: "Barbaracite",
    effect: {}
  }
];