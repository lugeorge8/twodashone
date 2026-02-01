export type AugmentOption = {
  id: string;
  name: string;
};

export type Question = {
  id: string;
  scenarioTitle: string;
  scenarioBody: string;
  augments: [AugmentOption, AugmentOption, AugmentOption];
  topPickAugmentId: string;
  streamerName: string;
  streamerUrl?: string;
};

// NOTE: Hardcoded MVP dataset (10 questions). Replace placeholders with real scenarios.
export const QUESTIONS: Question[] = [
  {
    id: "q1",
    scenarioTitle: "Generic opener (no direction)",
    scenarioBody:
      "Stage 2-1. Mixed items, no committed trait. Looking for flexible power.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "b",
    streamerName: "Streamer 1",
  },
  {
    id: "q2",
    scenarioTitle: "Strong early board (win-streak)",
    scenarioBody:
      "Stage 2-1. You have upgraded units and can likely win-streak. Prioritize tempo.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "a",
    streamerName: "Streamer 2",
  },
  {
    id: "q3",
    scenarioTitle: "Weak board (lose-streak)",
    scenarioBody:
      "Stage 2-1. Likely to lose-streak. Value econ/long-term power.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "c",
    streamerName: "Streamer 3",
  },
  {
    id: "q4",
    scenarioTitle: "Clear trait direction", 
    scenarioBody:
      "Stage 2-1. You already have a trait angle forming. Choose the augment that supports it.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "a",
    streamerName: "Streamer 4",
  },
  {
    id: "q5",
    scenarioTitle: "Item-dependent line",
    scenarioBody:
      "Stage 2-1. Your items strongly suggest a carry direction. Pick the augment that spikes that plan.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "b",
    streamerName: "Streamer 5",
  },
  {
    id: "q6",
    scenarioTitle: "Flexible reroll vs fast 8",
    scenarioBody:
      "Stage 2-1. You can either lean into reroll or keep it open for fast 8.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "c",
    streamerName: "Streamer 6",
  },
  {
    id: "q7",
    scenarioTitle: "Highroll opener",
    scenarioBody:
      "Stage 2-1. You highrolled an early carry setup. Choose the highest tempo option.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "a",
    streamerName: "Streamer 7",
  },
  {
    id: "q8",
    scenarioTitle: "Lowroll opener",
    scenarioBody:
      "Stage 2-1. Low board strength. Stabilize later; don’t grief econ.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "b",
    streamerName: "Streamer 8",
  },
  {
    id: "q9",
    scenarioTitle: "Contest risk",
    scenarioBody:
      "Stage 2-1. A likely contested line is on the table. Prefer flexible outs.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "c",
    streamerName: "Streamer 9",
  },
  {
    id: "q10",
    scenarioTitle: "Cap vs tempo",
    scenarioBody:
      "Stage 2-1. Decide between immediate tempo and higher late-game cap.",
    augments: [
      { id: "a", name: "Augment A" },
      { id: "b", name: "Augment B" },
      { id: "c", name: "Augment C" },
    ],
    topPickAugmentId: "a",
    streamerName: "Streamer 10",
  },
];
