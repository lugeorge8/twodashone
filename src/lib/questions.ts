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
    id: "patch16.03b_scenario00001",
    scenarioTitle: "patch16.03b_scenario00001",
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
    id: "patch16.03b_scenario00002",
    scenarioTitle: "patch16.03b_scenario00002",
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
    id: "patch16.03b_scenario00003",
    scenarioTitle: "patch16.03b_scenario00003",
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
    id: "patch16.03b_scenario00004",
    scenarioTitle: "patch16.03b_scenario00004",
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
    id: "patch16.03b_scenario00005",
    scenarioTitle: "patch16.03b_scenario00005",
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
    id: "patch16.03b_scenario00006",
    scenarioTitle: "patch16.03b_scenario00006",
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
    id: "patch16.03b_scenario00007",
    scenarioTitle: "patch16.03b_scenario00007",
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
    id: "patch16.03b_scenario00008",
    scenarioTitle: "patch16.03b_scenario00008",
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
    id: "patch16.03b_scenario00009",
    scenarioTitle: "patch16.03b_scenario00009",
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
    id: "patch16.03b_scenario00010",
    scenarioTitle: "patch16.03b_scenario00010",
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
