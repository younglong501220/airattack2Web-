import { MissionConfig } from './types';

export const MISSIONS_LIST: MissionConfig[] = [
  {
    id: 'mission_1',
    code: 'OP-PACIFIC-DAWN',
    title: '第一戰役：珊瑚海拂曉突擊',
    sector: '扇區 01 · 珊瑚海環礁',
    briefing:
      '偵察機回報敵軍前哨基地正在環礁集結。我軍噴火式戰鬥機編隊將於拂曉時分展開低空突防，重點清除沿岸 88mm 防空砲地堡與兵工廠，壓制敵方空中巡邏機。',
    weather: 'sunny',
    targetAirKills: 10,
    targetGroundKills: 4,
    hasBoss: false,
    rewardGold: 850,
    rewardMaterials: 4,
    mapWaypoints: [
      { x: 18, y: 82, label: '母艦起飛點 (CV-6)', type: 'airfield' },
      { x: 42, y: 55, label: '沿岸 Flak 88 地堡群', type: 'flak' },
      { x: 68, y: 35, label: '南角燃料軍需庫', type: 'factory' },
      { x: 84, y: 18, label: '前線野戰機場', type: 'airfield' },
    ],
    enemyIntel: [
      {
        name: 'Bf-109 獵鷹戰鬥機',
        type: '高空輕型截擊機',
        threat: 'MODERATE',
        notes: '機動靈活，常以雙機編隊俯衝，雙聯機砲可迅速予以擊落。',
      },
      {
        name: 'Flak 88 重裝高射砲堡',
        type: '固定重型防空工事',
        threat: 'HIGH',
        notes: '具備自動旋轉仰角追瞄系統，請於投彈準心進入射程時果斷投擲 500lb 重磅炸彈。',
      },
    ],
  },
  {
    id: 'mission_2',
    code: 'OP-IRON-TYPHOON',
    title: '第二戰役：鋼鐵怒濤雷雨突襲',
    sector: '扇區 04 · 暴風海峽防線',
    briefing:
      '強烈熱帶氣旋正籠罩敵軍深水軍港。惡劣的暴風雨能掩蓋我軍發動機聲響，但雨幕會干擾視野。必須提防具備高空刺耳尖嘯的 Ju-87 斯圖卡俯衝轟炸機與中低空掠海魚雷攻擊機！',
    weather: 'rainstorm',
    targetAirKills: 16,
    targetGroundKills: 6,
    hasBoss: false,
    rewardGold: 1400,
    rewardMaterials: 8,
    mapWaypoints: [
      { x: 15, y: 85, label: '出擊空域 (暴風雨前線)', type: 'airfield' },
      { x: 38, y: 62, label: '防空雷達陣列', type: 'flak' },
      { x: 55, y: 40, label: '斯圖卡潛伏航道', type: 'airfield' },
      { x: 82, y: 22, label: '軍港後勤重型兵工廠', type: 'factory' },
    ],
    enemyIntel: [
      {
        name: 'Ju-87 斯圖卡俯衝轟炸機',
        type: '急墜俯衝轟炸機',
        threat: 'HIGH',
        notes: '高空巡航後會突然急劇俯衝迫近，並配備後座自衛機槍，切莫與其發生空中對撞！',
      },
      {
        name: '中島九七式 魚雷/掠海攻擊機',
        type: '重型低空攻擊機',
        threat: 'HIGH',
        notes: '裝甲極為厚重，會向前方施放破片散彈，建議集中機砲火力優先點殺。',
      },
      {
        name: '重型彈藥製造廠',
        type: '特級地面設施',
        threat: 'HIGH',
        notes: '被炸毀時會引發強烈二次殉爆，並高機率爆出降落傘空投物資！',
      },
    ],
  },
  {
    id: 'mission_3',
    code: 'OP-TITAN-FORTRESS',
    title: '第三戰役：鐵血空中堡壘決戰',
    sector: '扇區 09 · 迷霧群島秘密核心',
    briefing:
      '大霧封鎖了核心海域！情報顯示敵軍秘密建造了代號【齊柏林天罰號】超重型四發空中要塞。這是一座浮動空中要塞，裝備多聯裝防空砲塔與巡航火箭。全軍出動，配合僚機誓死擊潰巨艦！',
    weather: 'dense_fog',
    targetAirKills: 20,
    targetGroundKills: 8,
    hasBoss: true,
    bossName: '超重型空中堡壘【齊柏林天罰號】',
    rewardGold: 2600,
    rewardMaterials: 16,
    mapWaypoints: [
      { x: 20, y: 88, label: '大霧集結區', type: 'airfield' },
      { x: 45, y: 60, label: '迷霧外圍重砲防禦線', type: 'flak' },
      { x: 70, y: 40, label: '地下燃油精煉總庫', type: 'factory' },
      { x: 85, y: 15, label: '決戰空域：【齊柏林天罰號】', type: 'boss' },
    ],
    enemyIntel: [
      {
        name: '超重型空中堡壘【齊柏林天罰號】',
        type: '空中旗艦 BOSS',
        threat: 'CRITICAL',
        notes: '裝備 4 具旋轉防空砲塔與巨額重裝甲，需藉由僚機牽制，投擲多枚戰術重彈並集中機砲掃射！',
      },
      {
        name: 'Fw-190 赤色王牌截擊機',
        type: '高機動精銳戰機',
        threat: 'HIGH',
        notes: '飛行員經驗老道，擅長大角度蛇形機動規避彈幕。',
      },
    ],
  },
];
