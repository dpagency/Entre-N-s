import { MISSIONS } from './missions';
import { JOURNEY2_MISSIONS } from './journey2Missions';
import { LOCAL_JOURNEYS_ENABLED } from '../localDevelopment';

export const GAME_MISSIONS = [...MISSIONS, ...(LOCAL_JOURNEYS_ENABLED ? JOURNEY2_MISSIONS : [])];
