import { clamp, finite, snapValue, type SliderValue } from '../../shared/slider-math.js';

export interface Selection { value: SliderValue; index: number }
export interface Bounds { min: number; max: number; step: number; last: number }

export function boundsFor(min: number, max: number, step: number, data: readonly SliderValue[]): Bounds {
  const lower = finite(min, 0);
  const upper = Math.max(lower, finite(max, 360));
  const increment = step > 0 ? finite(step, 1) : 1;
  return { min: lower, max: upper, step: increment, last: data.length ? data.length - 1 : Math.ceil((upper - lower) / increment) };
}

export function selectionFor(value: SliderValue | undefined, data: readonly SliderValue[], bounds: Bounds): Selection {
  if (data.length) {
    let index = data.indexOf(value!);
    if (index < 0 && typeof value === 'string') index = data.findIndex(item => String(item) === value);
    index = Math.max(0, index);
    return { value: data[index], index };
  }
  if (value === '') return { value: '', index: 0 };
  const selected = snapValue(Number(value ?? bounds.min), bounds.min, bounds.max, bounds.step);
  return { value: selected, index: selected === bounds.max ? bounds.last : Math.round((selected - bounds.min) / bounds.step) };
}

export function selectionAt(index: number, data: readonly SliderValue[], bounds: Bounds): Selection {
  const next = clamp(Math.round(finite(index, 0)), 0, bounds.last);
  return data.length ? { value: data[next], index: next }
    : selectionFor(next === bounds.last ? bounds.max : bounds.min + next * bounds.step, data, bounds);
}
