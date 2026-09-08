export type SliderValue = string | number;
export type KnobPosition = 'top' | 'right' | 'bottom' | 'left' | number;
export interface GradientStop {
  offset?: string;
  stopColor: string;
  stopOpacity?: number;
}
export interface CircularSliderTemplateContext {
  $implicit: SliderValue;
  value: SliderValue;
  label: string;
}

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));
export const normalizeAngle = (angle: number): number => ((angle % 360) + 360) % 360;
export const finite = (value: number | undefined, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

export function positionAngle(position: KnobPosition): number {
  return typeof position === 'number'
    ? normalizeAngle(finite(position, 0))
    : ({ top: 0, right: 90, bottom: 180, left: 270 }[position] ?? 0);
}

export function arcSpan(start: number, end: number, direction: 1 | -1): number {
  return normalizeAngle((end - start) * direction) || 360;
}

export function pointAt(angle: number, radius: number, center: number) {
  const radians = (angle - 90) * Math.PI / 180;
  return { x: center + radius * Math.cos(radians), y: center + radius * Math.sin(radians) };
}

export function arcPath(start: number, span: number, direction: 1 | -1, radius: number, center: number): string {
  const first = pointAt(start, radius, center);
  const last = pointAt(start + span * direction, radius, center);
  const sweep = direction === 1 ? 1 : 0;
  if (span === 360) {
    const middle = pointAt(start + 180 * direction, radius, center);
    return `M ${first.x} ${first.y} A ${radius} ${radius} 0 0 ${sweep} ${middle.x} ${middle.y} A ${radius} ${radius} 0 0 ${sweep} ${first.x} ${first.y}`;
  }
  return `M ${first.x} ${first.y} A ${radius} ${radius} 0 ${span > 180 ? 1 : 0} ${sweep} ${last.x} ${last.y}`;
}

export function progressAtAngle(angle: number, start: number, span: number, direction: 1 | -1): number {
  const delta = normalizeAngle((angle - start) * direction);
  if (delta <= span) return delta / span;
  // Pointer positions in a gauge's gap snap to the nearest endpoint.
  return 360 - delta <= delta - span ? 0 : 1;
}

export function snapValue(value: number, min: number, max: number, step: number): number {
  const bounded = clamp(finite(value, min), min, max);
  const rounded = clamp(min + Math.round((bounded - min) / step) * step, min, max);
  const closest = max - bounded < Math.abs(rounded - bounded) ? max : rounded;
  return Number(closest.toFixed(12));
}

export function colorStops(stops: readonly (string | GradientStop)[]): Required<GradientStop>[] {
  return stops.map((stop, index) => {
    const item = typeof stop === 'string' ? { stopColor: stop } : stop;
    return {
      offset: item.offset ?? `${stops.length <= 1 ? 0 : index * 100 / (stops.length - 1)}%`,
      stopColor: item.stopColor,
      stopOpacity: clamp(finite(item.stopOpacity, 1), 0, 1),
    };
  });
}
