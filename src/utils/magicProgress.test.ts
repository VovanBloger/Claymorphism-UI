import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceMagicProgress,
  getCheckpointPositions,
  getCompletedCount,
  getMagicDurationMs,
  getStarLevels,
  normalizeStageCount,
} from './magicProgress.ts';

test('stage counts keep a distinct ascending progression with the first and final reference stars', () => {
  assert.deepEqual(getStarLevels(2), [0, 4]);
  assert.deepEqual(getStarLevels(3), [0, 2, 4]);
  assert.deepEqual(getStarLevels(4), [0, 1, 3, 4]);
  assert.deepEqual(getStarLevels(5), [0, 1, 2, 3, 4]);
  assert.equal(normalizeStageCount(1), 2);
  assert.equal(normalizeStageCount(9), 5);
  assert.equal(normalizeStageCount(3.6), 4);
  assert.equal(normalizeStageCount(Number.NaN), 5);
});

test('checkpoints light only when the filling edge reaches each center, including exact boundaries', () => {
  assert.deepEqual(getCheckpointPositions(5), [0.1, 0.3, 0.5, 0.7, 0.9]);
  for (const count of [2, 3, 4, 5]) {
    const positions = getCheckpointPositions(count);
    assert.equal(positions[0], 0.1);
    assert.equal(positions.at(-1), 0.9);
    positions.forEach((position, index) => {
      assert.equal(getCompletedCount(position - 0.000001, count), index);
      assert.equal(getCompletedCount(position, count), index + 1);
    });
  }
});

test('pause retains the timeline and changing speed affects only subsequent travel', () => {
  const first = advanceMagicProgress({ elapsedMs: 0, deltaMs: 1200, stageCount: 5 });
  const paused = advanceMagicProgress({ elapsedMs: first.elapsedMs, deltaMs: 10000, stageCount: 5, playing: false });
  assert.deepEqual(paused, first);
  const resumed = advanceMagicProgress({ elapsedMs: paused.elapsedMs, deltaMs: 1000, stageCount: 5, speed: 2 });
  assert.equal(resumed.elapsedMs, 3200);
  assert.equal(resumed.completed, 2);
  const slow = advanceMagicProgress({ elapsedMs: resumed.elapsedMs, deltaMs: 1000, stageCount: 5, speed: 0.5 });
  assert.equal(slow.elapsedMs, 3700);
});

test('a delayed frame counts every crossed checkpoint and clamps at completion without wrapping', () => {
  const before = advanceMagicProgress({ elapsedMs: 0, deltaMs: 800, stageCount: 5 });
  assert.equal(before.completed, 0);
  const crossed = advanceMagicProgress({ elapsedMs: before.elapsedMs, deltaMs: 6400, stageCount: 5 });
  assert.equal(crossed.completed, 4);
  const finish = advanceMagicProgress({ elapsedMs: crossed.elapsedMs, deltaMs: 1e6, stageCount: 5 });
  assert.deepEqual(finish, { elapsedMs: 10000, progress: 1, completed: 5, finished: true });
  assert.deepEqual(advanceMagicProgress({ elapsedMs: finish.elapsedMs, deltaMs: 500, stageCount: 5 }), finish);
  assert.equal(getMagicDurationMs(2), 4000);
});

test('invalid frame inputs cannot make progress reverse, become NaN, or exceed the track', () => {
  const state = advanceMagicProgress({ elapsedMs: 1000, deltaMs: -50, stageCount: 3 });
  assert.equal(state.elapsedMs, 1000);
  const invalid = advanceMagicProgress({ elapsedMs: Number.NaN, deltaMs: Number.POSITIVE_INFINITY, speed: Number.NaN, stageCount: Number.NaN });
  assert.deepEqual(invalid, { elapsedMs: 0, progress: 0, completed: 0, finished: false });
  assert.equal(getCompletedCount(-1, 5), 0);
  assert.equal(getCompletedCount(10, 5), 5);
});
