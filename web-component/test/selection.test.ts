import assert from 'node:assert/strict';
import { test } from 'node:test';
import { boundsFor, selectionAt, selectionFor } from '../src/selection.js';
import { safeColor, safeLength, safeOffset } from '../src/safe-style.js';

test('fractional steps and uneven maxima stay reachable', () => {
  const bounds = boundsFor(0, 10, 3, []);
  assert.deepEqual(selectionAt(4, [], bounds), { value: 10, index: 4 });
  assert.deepEqual(selectionAt(3, [], bounds), { value: 9, index: 3 });
  assert.equal(selectionFor('0.31', [], boundsFor(0, 1, 0.1, [])).value, 0.3);
  assert.equal(selectionFor(200, [], bounds).value, 10);
});

test('invalid bounds are normalized and an explicit empty value is preserved', () => {
  assert.deepEqual(boundsFor(7, 2, 0, []), { min: 7, max: 7, step: 1, last: 0 });
  assert.equal(selectionFor(NaN, [], boundsFor(5, 10, NaN, [])).value, 5);
  assert.equal(selectionFor('', [], boundsFor(0, 100, 1, [])).value, '');
});

test('data selections preserve values across reordered arrays and support numeric HTML values', () => {
  const data = ['L', 'M', 'S'];
  assert.deepEqual(selectionFor('M', data, boundsFor(0, 100, 1, data)), { value: 'M', index: 1 });
  assert.deepEqual(selectionAt(100, data, boundsFor(0, 100, 1, data)), { value: 'S', index: 2 });
  assert.equal(selectionFor('20', [10, 20], boundsFor(0, 100, 1, [10, 20])).value, 20);
  assert.equal(selectionFor('missing', data, boundsFor(0, 100, 1, data)).value, 'L');
});

test('style inputs cannot inject declarations, URL resources, or markup', () => {
  for (const input of ['url(https://example.com/track)', 'red;position:fixed', '</style><script>x</script>', 'var(--remote)', 'expression(alert(1))']) {
    assert.equal(safeColor(input, '#000'), '#000');
    assert.equal(safeLength(input, '1rem'), '1rem');
  }
  assert.equal(safeColor('rgba(10, 20, 30, .5)', '#000'), 'rgba(10, 20, 30, .5)');
  assert.equal(safeLength('2.5rem', '1rem'), '2.5rem');
  assert.equal(safeOffset('50%'), '50%');
  assert.equal(safeOffset('50%; color:red'), '0%');
});
