import assert from 'node:assert/strict';
import { test } from 'node:test';
import { arcPath, arcSpan, colorStops, pointAt, positionAngle, progressAtAngle, snapValue } from '../shared/slider-math.ts';

test('gauge endpoints and gap snapping follow the chosen direction', () => {
  assert.equal(arcSpan(225, 135, 1), 270);
  assert.equal(arcSpan(135, 225, -1), 270);
  assert.ok(pointAt(225, 100, 140).x < 140);
  assert.ok(pointAt(135, 100, 140).x > 140);
  assert.equal(progressAtAngle(225, 225, 270, 1), 0);
  assert.equal(progressAtAngle(0, 225, 270, 1), 0.5);
  assert.equal(progressAtAngle(135, 225, 270, 1), 1);
  assert.equal(progressAtAngle(210, 225, 270, 1), 0);
  assert.equal(progressAtAngle(150, 225, 270, 1), 1);
});

test('angle and value progress round-trip across directions and orientations', () => {
  for (const direction of [1, -1] as const) {
    for (const start of [-45, 0, 90, 225, 500]) {
      for (const end of [45, 90, 135, 315]) {
        const span = arcSpan(start, end, direction);
        for (const progress of [0, 0.1, 0.5, 0.9]) {
          assert.ok(Math.abs(progressAtAngle(start + span * direction * progress, start, span, direction) - progress) < 1e-10);
        }
      }
    }
  }
});

test('equal endpoints retain a full circle and start positions normalize', () => {
  assert.equal(arcSpan(0, 360, 1), 360);
  assert.equal(arcPath(90, 360, -1, 100, 140).match(/ A /g)?.length, 2);
  assert.equal(positionAngle('left'), 270);
  assert.equal(positionAngle(-90), 270);
  assert.equal(positionAngle(NaN), 0);
});

test('fractional steps, uneven maxima and degenerate ranges stay bounded', () => {
  assert.equal(snapValue(0.30000000000000004, 0, 1, 0.1), 0.3);
  assert.equal(snapValue(9.8, 0, 10, 3), 10);
  assert.equal(snapValue(9, 0, 10, 3), 9);
  assert.equal(snapValue(-20, -5, 5, 0.5), -5);
  assert.equal(snapValue(20, 7, 7, 1), 7);
  assert.equal(snapValue(NaN, 5, 10, 1), 5);
});

test('gradient stops keep explicit offsets and clamp opacity', () => {
  assert.deepEqual(colorStops(['green', 'yellow', 'red']).map(stop => stop.offset), ['0%', '50%', '100%']);
  assert.equal(colorStops([{ offset: '20%', stopColor: 'red', stopOpacity: 0 }])[0].stopOpacity, 0);
  assert.equal(colorStops([{ stopColor: 'red', stopOpacity: 2 }])[0].stopOpacity, 1);
  assert.equal(colorStops(['green'])[0].offset, '0%');
});
