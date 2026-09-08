import type { GradientStop, KnobPosition, SliderValue } from '../../shared/slider-math';

export type { GradientStop, KnobPosition, SliderValue } from '../../shared/slider-math';

export interface CircularSliderSlotProps<T extends SliderValue = SliderValue> {
  value: T;
  index: number;
  label: string;
}

export interface CircularSliderProps<T extends SliderValue = SliderValue> {
  modelValue?: T | null;
  min?: number;
  max?: number;
  step?: number;
  data?: readonly T[];
  dataIndex?: number;
  width?: number;
  direction?: 1 | -1;
  knobPosition?: KnobPosition;
  arcStart?: number;
  arcEnd?: number;
  label?: string;
  ariaLabel?: string;
  sliderId?: string;
  labelColor?: string;
  labelBottom?: boolean;
  labelFontSize?: string;
  valueFontSize?: string;
  appendToValue?: string;
  prependToValue?: string;
  verticalOffset?: string;
  hideLabelValue?: boolean;
  hideKnob?: boolean;
  hideKnobRing?: boolean;
  knobDraggable?: boolean;
  trackDraggable?: boolean;
  limitDragRange?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  knobColor?: string;
  knobSize?: number;
  progressColorFrom?: string;
  progressColorTo?: string;
  progressGradient?: readonly (string | GradientStop)[];
  progressSize?: number;
  progressLineCap?: 'round' | 'butt';
  trackColor?: string;
  trackGradient?: readonly (string | GradientStop)[];
  trackSize?: number;
}
