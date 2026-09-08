import assert from 'node:assert/strict';
import { test } from 'node:test';
import { arcPath, arcSpan, colorStops, pointAt, progressAtAngle, snapValue } from '../projects/ng-circular-slider/src/slider-math.ts';

test('speed gauge runs clockwise from lower-left to lower-right', () => {
  assert.equal(arcSpan(225, 135, 1), 270);
  const start = pointAt(225, 100, 140);
  const end = pointAt(135, 100, 140);
  assert.ok(start.x < 140 && start.y > 140);
  assert.ok(end.x > 140 && end.y > 140);
  assert.equal(progressAtAngle(225, 225, 270, 1), 0);
  assert.equal(progressAtAngle(0, 225, 270, 1), 0.5);
  assert.equal(progressAtAngle(135, 225, 270, 1), 1);
  assert.equal(progressAtAngle(210, 225, 270, 1), 0);
  assert.equal(progressAtAngle(150, 225, 270, 1), 1);
});

test('pointer angles round-trip through every arc orientation and direction', () => {
  for (const direction of [1, -1] as const) {
    for (const start of [-45, 0, 90, 225, 500]) {
      for (const end of [45, 90, 135, 315]) {
        const span = arcSpan(start, end, direction);
        for (const progress of [0, 0.1, 0.5, 0.9]) {
          const angle = start + span * direction * progress;
          assert.ok(Math.abs(progressAtAngle(angle, start, span, direction) - progress) < 1e-10);
        }
      }
    }
  }
});

test('equal endpoints produce a real full circle with two SVG arcs', () => {
  assert.equal(arcSpan(0, 360, 1), 360);
  assert.equal(arcPath(90, 360, -1, 100, 140).match(/ A /g)?.length, 2);
});

test('fractional increments, uneven maxima and zero-width ranges stay reachable', () => {
  assert.equal(snapValue(0.30000000000000004, 0, 1, 0.1), 0.3);
  assert.equal(snapValue(9.8, 0, 10, 3), 10);
  assert.equal(snapValue(9, 0, 10, 3), 9);
  assert.equal(snapValue(-20, -5, 5, 0.5), -5);
  assert.equal(snapValue(20, 7, 7, 1), 7);
  assert.equal(snapValue(NaN, 5, 10, 1), 5);
});

test('gradient offsets and opacity preserve explicit values', () => {
  assert.deepEqual(colorStops(['green', 'yellow', 'red']).map(stop => stop.offset), ['0%', '50%', '100%']);
  assert.equal(colorStops([{ offset: '20%', stopColor: 'red', stopOpacity: 0 }])[0].stopOpacity, 0);
  assert.equal(colorStops(['green'])[0].offset, '0%');
});
