/** Pure timing and checkpoint geometry for the magical progress bar. */
export const MAGIC_STAGE_MIN = 2;
export const MAGIC_STAGE_MAX = 5;
export const MAGIC_STAGE_DURATION_MS = 2000;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function normalizeStageCount(count: number): number {
  return Number.isFinite(count) ? clamp(Math.round(count), MAGIC_STAGE_MIN, MAGIC_STAGE_MAX) : MAGIC_STAGE_MAX;
}

/** Include both the first star and the royal final star at every supported count. */
export function getStarLevels(count: number): number[] {
  const stages = normalizeStageCount(count);
  return Array.from({ length: stages }, (_, index) => Math.round(index * (MAGIC_STAGE_MAX - 1) / (stages - 1)));
}

/** Centers are fractions of the complete track, leaving room for its round caps. */
export function getCheckpointPositions(count: number): number[] {
  const stages = normalizeStageCount(count);
  return Array.from({ length: stages }, (_, index) => Math.round((0.1 + 0.8 * index / (stages - 1)) * 1e6) / 1e6);
}

export function getCompletedCount(progress: number, count: number): number {
  const fill = Number.isFinite(progress) ? clamp(progress, 0, 1) : 0;
  return getCheckpointPositions(count).filter(position => fill >= position).length;
}

export function getMagicDurationMs(count: number): number {
  return normalizeStageCount(count) * MAGIC_STAGE_DURATION_MS;
}

export interface MagicProgressState {
  /** Virtual timeline at 1x; retain this value when changing speed or pausing. */
  elapsedMs: number;
  progress: number;
  completed: number;
  finished: boolean;
}

export interface MagicProgressStep {
  elapsedMs: number;
  deltaMs: number;
  stageCount: number;
  speed?: number;
  playing?: boolean;
}

/**
 * Advance a finite virtual timeline using a real frame delta. The UI can compare
 * completed before/after this call to celebrate every crossed checkpoint.
 * Reset the frame timestamp on resume so paused wall time is never counted.
 */
export function advanceMagicProgress({ elapsedMs, deltaMs, stageCount, speed = 1, playing = true }: MagicProgressStep): MagicProgressState {
  const duration = getMagicDurationMs(stageCount);
  const previous = Number.isFinite(elapsedMs) ? clamp(elapsedMs, 0, duration) : 0;
  const delta = Number.isFinite(deltaMs) ? Math.max(0, deltaMs) : 0;
  const multiplier = Number.isFinite(speed) ? clamp(speed, 0.5, 2) : 1;
  const next = Math.min(duration, previous + (playing ? delta * multiplier : 0));
  const progress = next / duration;
  return { elapsedMs: next, progress, completed: getCompletedCount(progress, stageCount), finished: next >= duration };
}
