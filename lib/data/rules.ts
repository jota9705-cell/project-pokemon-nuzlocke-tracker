import { NuzlockeRules } from '@/types';
import rulesData from '@/game_data/nuzlocke_rules.json';

export const nuzlockeRules = rulesData as NuzlockeRules;

export function getAllRules() {
  return [...nuzlockeRules.basic_rules, ...nuzlockeRules.optional_rules];
}

export function getBasicRules() {
  return nuzlockeRules.basic_rules;
}

export function getOptionalRules() {
  return nuzlockeRules.optional_rules;
}

export function getDefaultRules(): string[] {
  return getAllRules()
    .filter(rule => rule.default)
    .map(rule => rule.id);
}

export function getMandatoryRules(): string[] {
  return nuzlockeRules.basic_rules
    .filter(rule => rule.mandatory)
    .map(rule => rule.id);
}
