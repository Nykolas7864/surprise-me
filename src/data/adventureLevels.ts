import type { AdventureLevel } from '../types/index.ts';

export const adventureLevels: AdventureLevel[] = [
  {
    level: 1,
    label: 'Play It Safe',
    icon: '\uD83D\uDEE1\uFE0F',
    description: 'Popular, critically acclaimed, same genre',
  },
  {
    level: 2,
    label: 'Slightly Curious',
    icon: '\uD83E\uDD14',
    description: 'Well-known but maybe outside your usual picks',
  },
  {
    level: 3,
    label: 'Open-Minded',
    icon: '\uD83C\uDF00',
    description: 'Mix of familiar and unexpected',
  },
  {
    level: 4,
    label: 'Adventurous',
    icon: '\uD83D\uDE80',
    description: 'Hidden gems, cross-genre, lesser-known creators',
  },
  {
    level: 5,
    label: 'Chaos Mode',
    icon: '\uD83C\uDFB2',
    description: 'Wildcard picks that share a deep thematic thread',
  },
];
