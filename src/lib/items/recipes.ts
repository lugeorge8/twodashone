export type ComponentId =
  | 'bf'
  | 'bow'
  | 'rod'
  | 'tear'
  | 'chain'
  | 'cloak'
  | 'belt'
  | 'glove';

export type SlamItem = {
  id: string;
  name: string;
  recipe: [ComponentId, ComponentId];
};

function key(a: ComponentId, b: ComponentId) {
  return a < b ? a + '+' + b : b + '+' + a;
}

// NOTE: Base component recipes (no emblems/spatula).
// Source: CommunityDragon (en_us.json) filtered to TFT_Item_* with 2 base components.
export const RECIPE_TO_ITEM: Record<string, { id: string; name: string }> = {
  [key('belt', 'belt')]: { id: 'TFT_Item_CorruptedWarmogsArmor', name: "Warmog's Armor" },
  [key('belt', 'bow')]: { id: 'TFT_Item_Leviathan', name: "Nashor's Tooth" },
  [key('belt', 'cloak')]: { id: 'TFT_Item_SpectralGauntlet', name: "Evenshroud" },
  [key('belt', 'glove')]: { id: 'TFT_Item_PowerGauntlet', name: "Striker's Flail" },
  [key('belt', 'rod')]: { id: 'TFT_Item_Morellonomicon', name: "Morellonomicon" },
  [key('belt', 'tear')]: { id: 'TFT_Item_CorruptedRedemption', name: "Spirit Visage" },
  [key('bf', 'belt')]: { id: 'TFT_Item_SteraksGage', name: "Sterak's Gage" },
  [key('bf', 'bf')]: { id: 'TFT_Item_CorruptedDeathblade', name: "Deathblade" },
  [key('bf', 'bow')]: { id: 'TFT_Item_MadredsBloodrazor', name: "Giant Slayer" },
  [key('bf', 'chain')]: { id: 'TFT_Item_GuardianAngel', name: "Edge of Night" },
  [key('bf', 'cloak')]: { id: 'TFT_Item_Bloodthirster', name: "Bloodthirster" },
  [key('bf', 'glove')]: { id: 'TFT_Item_CorruptedInfinityEdge', name: "Infinity Edge" },
  [key('bf', 'rod')]: { id: 'TFT_Item_HextechGunblade', name: "Hextech Gunblade" },
  [key('bf', 'tear')]: { id: 'TFT_Item_CorruptedSpearOfShojin', name: "Spear of Shojin" },
  [key('bow', 'bow')]: { id: 'TFT_Item_RapidFireCannon', name: "Red Buff" },
  [key('bow', 'glove')]: { id: 'TFT_Item_LastWhisper', name: "Last Whisper" },
  [key('bow', 'tear')]: { id: 'TFT_Item_StatikkShiv', name: "Void Staff" },
  [key('chain', 'belt')]: { id: 'TFT_Item_RedBuff', name: "Sunfire Cape" },
  [key('chain', 'bow')]: { id: 'TFT_Item_TitansResolve', name: "Titan's Resolve" },
  [key('chain', 'chain')]: { id: 'TFT_Item_BrambleVest', name: "Bramble Vest" },
  [key('chain', 'cloak')]: { id: 'TFT_Item_CorruptedGargoyleStoneplate', name: "Gargoyle Stoneplate" },
  [key('chain', 'glove')]: { id: 'TFT_Item_NightHarvester', name: "Steadfast Heart" },
  [key('chain', 'rod')]: { id: 'TFT_Item_Crownguard', name: "Crownguard" },
  [key('chain', 'tear')]: { id: 'TFT_Item_FrozenHeart', name: "Protector's Vow" },
  [key('cloak', 'bow')]: { id: 'TFT_Item_RunaansHurricane', name: "Kraken's Fury" },
  [key('cloak', 'cloak')]: { id: 'TFT_Item_DragonsClaw', name: "Dragon's Claw" },
  [key('cloak', 'glove')]: { id: 'TFT_Item_Quicksilver', name: "Quicksilver" },
  [key('cloak', 'tear')]: { id: 'TFT_Item_AdaptiveHelm', name: "Adaptive Helm" },
  [key('glove', 'glove')]: { id: 'TFT_Item_ThiefsGloves', name: "Thief's Gloves" },
  [key('glove', 'tear')]: { id: 'TFT_Item_CorruptedHandOfJustice', name: "Hand Of Justice" },
  [key('rod', 'bow')]: { id: 'TFT_Item_CorruptedGuinsoosRageblade', name: "Guinsoo's Rageblade" },
  [key('rod', 'cloak')]: { id: 'TFT_Item_IonicSpark', name: "Ionic Spark" },
  [key('rod', 'glove')]: { id: 'TFT_Item_CorruptedJeweledGauntlet', name: "Jeweled Gauntlet" },
  [key('rod', 'rod')]: { id: 'TFT_Item_CorruptedRabadonsDeathcap', name: "Rabadon's Deathcap" },
  [key('rod', 'tear')]: { id: 'TFT_Item_ArchangelsStaff', name: "Archangel's Staff" },
  [key('tear', 'tear')]: { id: 'TFT_Item_BlueBuff', name: "Blue Buff" },
};

export const COMPONENTS: { id: ComponentId; name: string }[] = [
  { id: 'bf', name: 'B.F. Sword' },
  { id: 'bow', name: 'Recurve Bow' },
  { id: 'rod', name: 'Needlessly Large Rod' },
  { id: 'tear', name: 'Tear of the Goddess' },
  { id: 'chain', name: 'Chain Vest' },
  { id: 'cloak', name: 'Negatron Cloak' },
  { id: 'belt', name: "Giant's Belt" },
  { id: 'glove', name: 'Sparring Gloves' },
];

export function computeSlamOptions(components: ComponentId[], cap = 4): SlamItem[] {
  const uniq: Record<string, SlamItem> = {};

  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const a = components[i]!;
      const b = components[j]!;
      const it = RECIPE_TO_ITEM[key(a, b)];
      if (!it) continue;
      uniq[it.id] ??= { id: it.id, name: it.name, recipe: [a, b] };
    }
  }

  const all = Object.values(uniq).sort((x, y) => x.name.localeCompare(y.name));
  return all.slice(0, cap);
}
