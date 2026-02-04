export type TrainingMode = 'augment_2_1' | 'augment_3_2' | 'augment_4_2';

export function modeToAugmentStage(mode: TrainingMode): 2 | 3 | 4 {
  if (mode === 'augment_3_2') return 3;
  if (mode === 'augment_4_2') return 4;
  return 2;
}

export function modeToStageLabel(mode: TrainingMode): '2-1' | '3-2' | '4-2' {
  if (mode === 'augment_3_2') return '3-2';
  if (mode === 'augment_4_2') return '4-2';
  return '2-1';
}
