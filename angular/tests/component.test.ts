import '@angular/compiler';
import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ServerTestingModule, platformServerTesting } from '@angular/platform-server/testing';
import { CircularSliderComponent } from '../dist/ng-circular-slider/fesm2022/fiojs-ng-circular-slider.mjs';

TestBed.initTestEnvironment(ServerTestingModule, platformServerTesting());
afterEach(() => TestBed.resetTestingModule());

function slider(inputs: Record<string, unknown> = {}) {
  TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
  const fixture = TestBed.createComponent(CircularSliderComponent);
  for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
  fixture.detectChanges();
  return {
    fixture,
    component: fixture.componentInstance,
    value: () => fixture.nativeElement.getAttribute('aria-valuenow'),
    text: () => fixture.nativeElement.getAttribute('aria-valuetext'),
    set: (key: string, value: unknown) => { fixture.componentRef.setInput(key, value); fixture.detectChanges(); },
    key: (key: string) => { fixture.debugElement.triggerEventHandler('keydown', { key, preventDefault() {} }); fixture.detectChanges(); },
  };
}

test('signal inputs and programmatic form writes never emit user changes', () => {
  const control = slider({ value: 25, max: 100 });
  const changes: number[] = [];
  const formChanges: number[] = [];
  control.component.valueChange.subscribe((value: number) => changes.push(value));
  control.component.registerOnChange((value: number) => formChanges.push(value));
  control.set('value', 50);
  assert.equal(control.value(), '50');
  control.component.writeValue(70);
  control.fixture.detectChanges();
  assert.equal(control.value(), '70');
  assert.deepEqual(changes, []);
  assert.deepEqual(formChanges, []);
  control.key('ArrowUp');
  assert.deepEqual(changes, [71]);
  assert.deepEqual(formChanges, [71]);
  control.component.writeValue(null);
  control.fixture.detectChanges();
  assert.equal(control.value(), '0');
  assert.deepEqual(changes, [71]);
});

test('linked selection survives unrelated changes and clamps when bounds shrink', () => {
  const control = slider({ value: 42, max: 100 });
  control.key('ArrowUp');
  control.set('label', 'Renamed');
  control.set('max', 200);
  assert.equal(control.value(), '43');
  control.set('max', 40);
  assert.equal(control.value(), '40');
  control.set('min', 45);
  assert.equal(control.value(), '45');
  control.set('value', undefined);
  assert.equal(control.value(), '45');
  control.set('max', undefined);
  control.key('End');
  assert.equal(control.value(), '360');
});

test('index bindings and replacement custom data keep value and index consistent', () => {
  const control = slider({ data: ['S', 'M', 'L'], dataIndex: 1 });
  assert.equal(control.text(), 'M');
  control.key('ArrowRight');
  assert.equal(control.text(), 'L');
  control.set('data', ['L', 'M', 'S']);
  assert.equal(control.text(), 'L');
  assert.equal(control.value(), '0');
  control.set('dataIndex', 99);
  assert.equal(control.text(), 'S');
  control.set('data', ['XS']);
  assert.equal(control.text(), 'XS');
  control.set('data', []);
  assert.equal(control.value(), '0');
});

test('boolean inputs and form-disabled state compose without losing the value', () => {
  const control = slider({ value: 42, disabled: '' });
  control.key('ArrowUp');
  assert.equal(control.value(), '42');
  control.set('disabled', false);
  control.component.setDisabledState(true);
  control.key('ArrowUp');
  assert.equal(control.value(), '42');
  control.component.setDisabledState(false);
  control.key('ArrowUp');
  assert.equal(control.value(), '43');
});
