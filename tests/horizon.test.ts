import { test } from 'node:test';
import assert from 'node:assert/strict';
import { horizonProgress, neighborId, resolveStockId, seoulDate } from '../lib/horizon.ts';

test('D-day counts Korean calendar days, not UTC days', () => {
  // 2026-09-24 23:30 UTC is already 2026-09-25 in Seoul.
  assert.equal(seoulDate(new Date('2026-09-24T23:30:00Z')), '2026-09-25');
  const h = horizonProgress('2026-09-08', '2026-12-31', new Date('2026-09-24T03:00:00Z'));
  assert.equal(h.daysLeft, 98); assert.equal(h.elapsedDays, 16); assert.equal(h.totalDays, 114); assert.equal(h.ended, false);
});
test('last day is D-0 and the window ends the next Korean day', () => {
  assert.deepEqual(horizonProgress('2026-09-08', '2026-12-31', new Date('2026-12-31T12:00:00+09:00')), { daysLeft: 0, totalDays: 114, elapsedDays: 114, ended: false });
  const after = horizonProgress('2026-09-08', '2026-12-31', new Date('2027-01-01T00:10:00+09:00'));
  assert.equal(after.ended, true); assert.equal(after.daysLeft, 0); assert.equal(after.elapsedDays, 114);
});
test('keyboard movement clamps at the ends of the ledger', () => {
  const ids = ['a', 'b', 'c'];
  assert.equal(neighborId(ids, 'a', 'ArrowUp'), 'a');
  assert.equal(neighborId(ids, 'a', 'ArrowDown'), 'b');
  assert.equal(neighborId(ids, 'c', 'ArrowDown'), 'c');
  assert.equal(neighborId(ids, 'b', 'End'), 'c');
  assert.equal(neighborId(ids, 'b', 'Home'), 'a');
  assert.equal(neighborId(ids, 'b', 'Enter'), null);
});
test('deep links only open tracked stocks', () => {
  const ids = ['crwv', 'nbis'];
  assert.equal(resolveStockId('nbis', ids), 'nbis');
  assert.equal(resolveStockId('<script>', ids), 'crwv');
  assert.equal(resolveStockId(['nbis'], ids), 'crwv');
  assert.equal(resolveStockId(undefined, ids), 'crwv');
});
