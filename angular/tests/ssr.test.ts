import '@angular/compiler';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { APP_ID, Component, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication } from '@angular/platform-server';
import { CircularSliderComponent } from '../dist/ng-circular-slider/fesm2022/fiojs-ng-circular-slider.mjs';

class ServerExample {}
Component({
  selector: 'test-root',
  standalone: true,
  imports: [CircularSliderComponent],
  template: '<fio-circular-slider [value]="80" [max]="160" [arcStart]="225" [arcEnd]="135" label="Speed" /><fio-circular-slider [value]="20" label="Volume" />',
})(ServerExample);

test('server rendering needs no browser globals and keeps per-request gradient IDs stable', async () => {
  const render = () => renderApplication(
    context => bootstrapApplication(ServerExample, {
      providers: [provideZonelessChangeDetection(), { provide: APP_ID, useValue: 'ssr-test' }],
    }, context),
    { document: '<!doctype html><html><body><test-root></test-root></body></html>', url: 'https://example.com/', allowedHosts: ['example.com'] },
  );
  const first = await render();
  const second = await render();
  assert.match(first, /aria-valuenow="80"/);
  assert.match(first, /aria-valuenow="20"/);
  const ids = (html: string) => [...html.matchAll(/id="(ssr-test-circular-slider-[^"]+)"/g)].map(match => match[1]);
  assert.equal(ids(first).length, 4);
  assert.equal(new Set(ids(first)).size, 4);
  assert.deepEqual(ids(first), ids(second));
});
