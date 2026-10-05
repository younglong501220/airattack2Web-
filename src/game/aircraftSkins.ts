export interface AircraftSkin {
  id: string;
  name: string;
  codename: string;
  era: string;
  description: string;
  materialCost: number;
  colors: {
    body: number;           // Fuselage base color
    camo: number;           // Wing/Camo pattern color
    accent: number;         // Nose cowling, wingtips or rudder accent
    spinner: number;        // Propeller spinner color
    cockpitFrame: number;   // Canopy metal framing
    belly?: number;         // Ventral scoop / underside sky color
    tail?: number;          // Vertical stabilizer color (e.g. Red Tail)
    specialStripes?: boolean; // E.g. D-Day black/white stripes
  };
  finish: {
    roughness: number;
    metalness: number;
  };
}

export type PlaneModelKey = 'spitfire' | 'hurricane' | 'dauntless' | 'mustang';

export const AIRCRAFT_SKINS: Record<PlaneModelKey, AircraftSkin[]> = {
  spitfire: [
    {
      id: 'spitfire_raf',
      name: '不列顛空戰 歐陸迷彩',
      codename: 'RAF Woodland Camo',
      era: '1940 不列顛戰役',
      description: '經典皇家空軍草綠與暗褐雙色迷彩，搭配黃色識別翼尖與天空琥珀螺旋槳罩。',
      materialCost: 0,
      colors: {
        body: 0x3d5236, // Olive Drab
        camo: 0x243322, // Dark Moss Camo
        accent: 0xf59e0b, // Yellow wingtips
        spinner: 0xd97706, // Amber spinner
        cockpitFrame: 0x273623,
        belly: 0x64748b, // Sky grey underside
      },
      finish: { roughness: 0.45, metalness: 0.25 },
    },
    {
      id: 'spitfire_desert',
      name: '北非沙漠之狐 荒漠塗裝',
      codename: 'Desert Sand & Earth',
      era: '1942 阿拉曼戰役',
      description: '適應北非與地中海烈日戰場之土黃色沙塵迷彩，具有極佳的低空對地隱蔽性。',
      materialCost: 2,
      colors: {
        body: 0x936f3e, // Middle East Sand
        camo: 0x6b4c2a, // Earth Brown
        accent: 0xd97706,
        spinner: 0xb45309,
        cockpitFrame: 0x593d1f,
        belly: 0x7dd3fc, // Mediterranean Azure underside
      },
      finish: { roughness: 0.55, metalness: 0.15 },
    },
    {
      id: 'spitfire_dday',
      name: '霸王行動 諾曼第斑馬條紋',
      codename: 'D-Day Invasion Stripes',
      era: '1944 諾曼第登陸',
      description: '紀念盟軍大反攻之高對比黑白識別條紋，防止友軍防空砲火誤擊之榮譽塗裝。',
      materialCost: 3,
      colors: {
        body: 0x2f3e2b, // Dark Olive
        camo: 0x1f2b1d,
        accent: 0xffffff, // White Invasion stripe
        spinner: 0x1e293b, // Matte Black spinner
        cockpitFrame: 0x1f2937,
        specialStripes: true,
      },
      finish: { roughness: 0.4, metalness: 0.3 },
    },
    {
      id: 'spitfire_night',
      name: '皇家空軍 夜間獵影者',
      codename: 'Night Interceptor Stealth',
      era: '1943 倫敦夜防戰',
      description: '全黑啞光石墨吸光塗裝搭配血紅機首飾邊，專門用於在夜空雷達引導下截擊夜間轟炸機。',
      materialCost: 4,
      colors: {
        body: 0x181c22, // Matte Graphite Black
        camo: 0x0f1318, // Deep Obsidian
        accent: 0xdc2626, // Crimson Ace red tip
        spinner: 0xb91c1c, // Blood red spinner
        cockpitFrame: 0x111827,
        belly: 0x0b0f14,
      },
      finish: { roughness: 0.65, metalness: 0.4 },
    },
  ],

  hurricane: [
    {
      id: 'hurricane_standard',
      name: '皇家空軍 早期林地雙色',
      codename: 'Battle of Britain RAF',
      era: '1940 英國本土防空',
      description: '厚重杜拉鋁與帆布複合機身經典迷彩，機腹配有大型水冷散熱斗與雙聯 20mm 機砲。',
      materialCost: 0,
      colors: {
        body: 0x384a32,
        camo: 0x273523,
        accent: 0xf59e0b,
        spinner: 0xd97706,
        cockpitFrame: 0x253121,
        belly: 0x5a6e7f,
      },
      finish: { roughness: 0.5, metalness: 0.2 },
    },
    {
      id: 'hurricane_malta',
      name: '馬爾他之鷹 地中海制空海藍',
      codename: 'Malta Sea Defender',
      era: '1942 馬爾他圍城戰',
      description: '地中海艦載與要塞防空專用深海藍塗裝，與天空海面融為一體，具有出色的防鏽防蝕面漆。',
      materialCost: 2,
      colors: {
        body: 0x1e3a5f, // Deep Sea Blue
        camo: 0x2b4c7e, // Mediterranean Slate
        accent: 0x38bdf8, // Sky Cyan
        spinner: 0x0284c7,
        cockpitFrame: 0x172554,
        belly: 0x93c5fd,
      },
      finish: { roughness: 0.4, metalness: 0.35 },
    },
    {
      id: 'hurricane_burma',
      name: '飛虎同盟 緬甸叢林獵犬',
      codename: 'Burma Jungle Striker',
      era: '1943 東南亞中印緬戰區',
      description: '高反差熱帶雨林綠褐迷彩，專門用於壓制日軍地面陣地與中低空戰鬥機。',
      materialCost: 3,
      colors: {
        body: 0x2c4323,
        camo: 0x78350f, // Deep Mud Brown
        accent: 0xeab308, // Jungle Tiger Yellow
        spinner: 0x854d0e,
        cockpitFrame: 0x1b2e15,
        belly: 0x475569,
      },
      finish: { roughness: 0.55, metalness: 0.2 },
    },
    {
      id: 'hurricane_winter',
      name: '東線極地 白雪獵手',
      codename: 'Eastern Front Snow Camo',
      era: '1942 摩爾曼斯克護航',
      description: '白色極地水洗迷彩與深灰凍原色調，能在冰原與暴風雪雲層中達到近乎隱形的偽裝效果。',
      materialCost: 4,
      colors: {
        body: 0xd1d5db, // Frost White Wash
        camo: 0x475569, // Slate Tundra
        accent: 0xef4444, // Eastern Red Star accent
        spinner: 0x1e293b,
        cockpitFrame: 0x334155,
        belly: 0x94a3b8,
      },
      finish: { roughness: 0.45, metalness: 0.25 },
    },
  ],

  dauntless: [
    {
      id: 'dauntless_midway',
      name: '中途島海戰 經典海軍霧藍',
      codename: 'Midway Non-Specular Navy',
      era: '1942 中途島大捷',
      description: '美軍海軍航空隊傳奇無反光海軍藍，特徵為穿孔多孔俯衝減速板與後座雙聯防衛機槍。',
      materialCost: 0,
      colors: {
        body: 0x1e3a5f, // US Navy Blue-Grey
        camo: 0x2b4668,
        accent: 0xffffff, // Insignia White stars
        spinner: 0x64748b, // Steel hub
        cockpitFrame: 0x172554,
        belly: 0x94a3b8, // Light Gull Grey underside
      },
      finish: { roughness: 0.45, metalness: 0.3 },
    },
    {
      id: 'dauntless_tricolor',
      name: '太平洋三色高亮海藍漸層',
      codename: 'Pacific Gloss Tri-Color',
      era: '1943 瓜達康納爾戰役',
      description: '深海拋光深藍、中間藍與天白三色漸層塗裝，美軍艦載俯衝轟炸機巔峰時期的華麗配色。',
      materialCost: 2,
      colors: {
        body: 0x0f2b48, // Gloss Sea Blue
        camo: 0x365478, // Intermediate Blue
        accent: 0x38bdf8,
        spinner: 0x0f172a,
        cockpitFrame: 0x0b1c30,
        belly: 0xf8fafc,
      },
      finish: { roughness: 0.3, metalness: 0.45 },
    },
    {
      id: 'dauntless_yellow',
      name: '企業號艦載 戰前金翼之皇',
      codename: 'Pre-War Golden Wings',
      era: '1939 美國海軍巡弋',
      description: '戰前大艦隊象徵之明豔金黃色機翼搭配銀光機身，歷史航空迷最珍愛的極致收藏塗裝。',
      materialCost: 3,
      colors: {
        body: 0x94a3b8, // Polished Aircraft Duralumin
        camo: 0xeab308, // Chrome Yellow Wings
        accent: 0xdc2626, // Red cowl band
        spinner: 0xdc2626,
        cockpitFrame: 0x475569,
        belly: 0x64748b,
      },
      finish: { roughness: 0.25, metalness: 0.65 },
    },
    {
      id: 'dauntless_night',
      name: '珊瑚海夜煞 隱秘暗影俯衝',
      codename: 'Coral Sea Night Shadow',
      era: '1944 夜間特遣空襲',
      description: '消光煤黑防空雷達抑制塗裝，俯衝穿孔板邊緣透出危險的血紅高爆警示反光。',
      materialCost: 4,
      colors: {
        body: 0x14181f, // Charcoal Night
        camo: 0x1e242d,
        accent: 0xef4444, // Crimson Flap Rim
        spinner: 0x0f172a,
        cockpitFrame: 0x0f172a,
        belly: 0x090d12,
      },
      finish: { roughness: 0.6, metalness: 0.35 },
    },
  ],

  mustang: [
    {
      id: 'mustang_redtail',
      name: '塔斯基吉 紅尾天使拋光銀',
      codename: 'Tuskegee Red Tail Aluminum',
      era: '1944 歐洲空戰護航',
      description: '全金屬鏡面拋光杜拉鋁機身，搭配塔斯基吉第 332 戰鬥機大隊標誌性的血紅垂直尾翼。',
      materialCost: 0,
      colors: {
        body: 0xc8ced8, // Mirror Polished Aluminum
        camo: 0x94a3b8,
        accent: 0xf59e0b, // Yellow wing bands
        spinner: 0xdc2626, // Red spinner
        tail: 0xdc2626, // Crimson Tail
        cockpitFrame: 0x64748b,
        belly: 0xa1a1aa,
      },
      finish: { roughness: 0.2, metalness: 0.85 },
    },
    {
      id: 'mustang_bluenose',
      name: '波德尼藍鼻王牌斥候',
      codename: 'Blue Nosed Bastards (352nd FG)',
      era: '1944 德國本土大空襲',
      description: '第 352 戰鬥大隊專屬之高貴寶藍色機鼻整流罩，曾護航千架轟炸機深入敵境擊潰空軍。',
      materialCost: 2,
      colors: {
        body: 0xdbe2ea, // Polished Aluminum
        camo: 0x93a5b8,
        accent: 0x1d4ed8, // Royal Blue Cowl
        spinner: 0x2563eb, // Bright Blue Spinner
        tail: 0x1e40af,
        cockpitFrame: 0x475569,
        belly: 0x94a3b8,
      },
      finish: { roughness: 0.22, metalness: 0.8 },
    },
    {
      id: 'mustang_olivedrab',
      name: '第八航空隊 迷彩獵殺者',
      codename: 'Eighth Air Force Olive Drab',
      era: '1943 諾曼第空域巡邏',
      description: '美陸軍航空隊標準橄欖暗褐迷彩，機首配有黃黑黑條紋擊殺標識，作戰氣場厚重。',
      materialCost: 3,
      colors: {
        body: 0x3d4a34, // Olive Drab
        camo: 0x273420,
        accent: 0xeab308, // Tiger Yellow nose trim
        spinner: 0xd97706,
        tail: 0x3d4a34,
        cockpitFrame: 0x24301d,
        belly: 0x64748b,
      },
      finish: { roughness: 0.5, metalness: 0.3 },
    },
    {
      id: 'mustang_stealth',
      name: '黑夜幽靈 遠程穿透作戰',
      codename: 'Black Phantom Long Range',
      era: '1945 太平洋跳島夜擊',
      description: '消光曜石黑鈦合金防雷達漆面，金色機砲整流與金黃四葉高升力螺旋槳尖端。',
      materialCost: 4,
      colors: {
        body: 0x17191e, // Stealth Matte Black
        camo: 0x111317,
        accent: 0xf59e0b, // Gold trim
        spinner: 0x334155, // Gunmetal spinner
        tail: 0x0f172a,
        cockpitFrame: 0x1e293b,
        belly: 0x0a0c10,
      },
      finish: { roughness: 0.45, metalness: 0.6 },
    },
  ],
};

export function getSkinById(modelKey: PlaneModelKey, skinId?: string): AircraftSkin {
  const skins = AIRCRAFT_SKINS[modelKey] || AIRCRAFT_SKINS.spitfire;
  if (!skinId) return skins[0];
  const found = skins.find(s => s.id === skinId);
  return found || skins[0];
}
