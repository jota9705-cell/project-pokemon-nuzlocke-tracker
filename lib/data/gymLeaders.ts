import { GymLeader } from '@/types';
import gymLeadersData from '@/game_data/gym_leaders.json';

export const gymLeaders = gymLeadersData as GymLeader[];

export function getGymLeaderByNumber(gymNumber: number): GymLeader[] {
  return gymLeaders.filter(leader => leader.gym_number === gymNumber);
}

export function getAllGymNumbers(): number[] {
  const numbers = [...new Set(gymLeaders.map(l => l.gym_number))];
  return numbers.sort((a, b) => a - b);
}

export function getKantoLeaders(): GymLeader[] {
  return gymLeaders.filter(l => l.gym_number <= 8);
}

export function getHoennLeaders(): GymLeader[] {
  return gymLeaders.filter(l => l.gym_number > 8);
}
