<script setup lang="ts" generic="T extends SliderValue = number">
import { computed, onBeforeUnmount, ref, shallowRef, useId, useTemplateRef, watch } from 'vue';
import {
  arcPath, arcSpan, clamp, colorStops, finite, pointAt, positionAngle, progressAtAngle, snapValue,
} from '../../shared/slider-math';
import type { CircularSliderProps, CircularSliderSlotProps, SliderValue } from './types';

defineOptions({ name: 'CircularSlider' });
const props = withDefaults(defineProps<CircularSliderProps<T>>(), {
  min: 0, max: 360, step: 1, data: () => [], width: 280, direction: 1, knobPosition: 'top',
  label: 'ANGLE', ariaLabel: '', sliderId: '', labelColor: '#272b77', labelBottom: false,
  labelFontSize: '1rem', valueFontSize: '3rem', appendToValue: '', prependToValue: '',
  verticalOffset: '0.5rem', hideLabelValue: false, hideKnob: false, hideKnobRing: false,
  knobDraggable: true, trackDraggable: false, limitDragRange: true, disabled: false, readonly: false,
  knobColor: '#4e63ea', knobSize: 36, progressColorFrom: '#80c3f3', progressColorTo: '#4990e2',
  progressGradient: () => [], progressSize: 8, progressLineCap: 'round',
  trackColor: '#dddefb', trackGradient: () => [], trackSize: 8,
});
const emit = defineEmits<{
  'update:modelValue': [value: T];
  'update:dataIndex': [index: number];
  change: [value: T];
  dataIndexChange: [index: number];
  draggingChange: [dragging: boolean];
  touched: [];
}>();
const slots = defineSlots<{
  label?: (props: CircularSliderSlotProps<T>) => unknown;
  knob?: (props: CircularSliderSlotProps<T>) => unknown;
}>();
const element = useTemplateRef<HTMLDivElement>('element');
const generatedId = `vue-circular-slider-${useId()}`;
const dragging = ref(false);
const pointerFocused = ref(false);
let activePointer: number | null = null;

const hasData = computed(() => props.data.length > 0);
const lowerBound = computed(() => finite(props.min, 0));
const upperBound = computed(() => Math.max(lowerBound.value, finite(props.max, 360)));
const increment = computed(() => props.step > 0 ? finite(props.step, 1) : 1);
const lastIndex = computed(() => hasData.value ? props.data.length - 1 : Math.ceil((upperBound.value - lowerBound.value) / increment.value));
const selection = shallowRef<{ value: SliderValue; index: number }>({ value: lowerBound.value, index: 0 });

function selectionFor(value: SliderValue | null | undefined) {
  if (hasData.value) {
    const index = Math.max(0, props.data.indexOf(value as T));
    return { index, value: props.data[index] };
  }
  const selected = snapValue(typeof value === 'number' ? value : lowerBound.value, lowerBound.value, upperBound.value, increment.value);
  return { value: selected, index: selected === upperBound.value ? lastIndex.value : Math.round((selected - lowerBound.value) / increment.value) };
}

function selectionAt(index: number) {
  const next = clamp(Math.round(finite(index, 0)), 0, lastIndex.value);
  return hasData.value ? { index: next, value: props.data[next] }
    : selectionFor(next === lastIndex.value ? upperBound.value : lowerBound.value + next * increment.value);
}

// Keep the user's value across configuration changes, without writing back to the parent.
watch(() => ({ value: props.modelValue, index: props.dataIndex, data: [...props.data], min: lowerBound.value, max: upperBound.value, step: increment.value }), (source, previous) => {
  if (previous ? !Object.is(source.value, previous.value) : source.value !== undefined) {
    selection.value = selectionFor(source.value);
  } else if (source.index !== undefined && (!previous || source.index !== previous.index)) {
    selection.value = selectionAt(source.index);
  } else {
    const current = selection.value;
    selection.value = hasData.value && Object.is(props.data[current.index], current.value)
      ? current : selectionFor(previous ? current.value : source.value);
  }
}, { immediate: true });

const size = computed(() => Math.max(40, finite(props.width, 280)));
const knobDiameter = computed(() => clamp(finite(props.knobSize, 36), 0, size.value / 2));
const trackWidth = computed(() => clamp(finite(props.trackSize, 8), 0, size.value / 2));
const progressWidth = computed(() => clamp(finite(props.progressSize, 8), 0, size.value / 2));
const radius = computed(() => Math.max(1, (size.value - Math.max(knobDiameter.value, trackWidth.value, progressWidth.value)) / 2 - 2));
const rotation = computed(() => props.direction === -1 ? -1 : 1);
const hasArc = computed(() => Number.isFinite(props.arcStart) && Number.isFinite(props.arcEnd));
const start = computed(() => hasArc.value ? props.arcStart! : positionAngle(props.knobPosition));
const span = computed(() => hasArc.value ? arcSpan(start.value, props.arcEnd!, rotation.value) : 360);
const progress = computed(() => {
  if (hasData.value) return lastIndex.value ? selection.value.index / lastIndex.value : 0;
  const length = upperBound.value - lowerBound.value;
  return length ? (Number(selection.value.value) - lowerBound.value) / length : 0;
});
const path = computed(() => arcPath(start.value, span.value, rotation.value, radius.value, size.value / 2));
const knobPoint = computed(() => pointAt(start.value + progress.value * span.value * rotation.value, radius.value, size.value / 2));
const gradientStart = computed(() => span.value < 360 ? pointAt(start.value, radius.value, size.value / 2) : { x: 0, y: size.value / 2 });
const gradientEnd = computed(() => span.value < 360 ? pointAt(start.value + span.value * rotation.value, radius.value, size.value / 2) : { x: size.value, y: size.value / 2 });
const gradientId = computed(() => props.sliderId || generatedId);
const progressStops = computed(() => colorStops(props.progressGradient.length ? props.progressGradient : [props.progressColorFrom, props.progressColorTo]));
const trackStops = computed(() => colorStops(props.trackGradient));
const valueText = computed(() => `${props.prependToValue}${selection.value.value}${props.appendToValue}`);
const slotProps = computed<CircularSliderSlotProps<T>>(() => ({ value: selection.value.value as T, index: selection.value.index, label: props.label }));
const interactive = computed(() => !props.disabled && !props.readonly);

function changeSelection(next: typeof selection.value) {
  const previous = selection.value;
  selection.value = next;
  if (!Object.is(previous.value, next.value)) {
    emit('update:modelValue', next.value as T);
    emit('change', next.value as T);
  }
  if (previous.index !== next.index) {
    emit('update:dataIndex', next.index);
    emit('dataIndexChange', next.index);
  }
}

function pointerDown(event: PointerEvent) {
  pointerFocused.value = true;
  if (!interactive.value || activePointer !== null || event.button !== 0 || !event.isPrimary) return;
  const target = event.target as Element;
  const isKnob = Boolean(target.closest('[data-knob]'));
  const isTrack = Boolean(target.closest('[data-track]'));
  if (isKnob ? !props.knobDraggable : !isTrack || !props.trackDraggable) return;
  event.preventDefault();
  element.value?.focus({ preventScroll: true });
  activePointer = event.pointerId;
  element.value?.setPointerCapture(event.pointerId);
  dragging.value = true;
  emit('draggingChange', true);
  if (!isKnob) updateFromPointer(event, false);
}

function pointerMove(event: PointerEvent) {
  if (event.pointerId !== activePointer || !interactive.value) return;
  event.preventDefault();
  updateFromPointer(event, true);
}

function updateFromPointer(event: PointerEvent, continuous: boolean) {
  const bounds = element.value!.getBoundingClientRect();
  const x = event.clientX - bounds.left - bounds.width / 2;
  const y = event.clientY - bounds.top - bounds.height / 2;
  if (Math.hypot(x, y) < 1) return;
  const angle = Math.atan2(y, x) * 180 / Math.PI + 90;
  let nextProgress = progressAtAngle(angle, start.value, span.value, rotation.value);
  if (continuous && props.limitDragRange && span.value === 360) {
    if (progress.value > 0.75 && nextProgress < 0.25) nextProgress = 1;
    else if (progress.value < 0.25 && nextProgress > 0.75) nextProgress = 0;
  }
  changeSelection(hasData.value ? selectionAt(nextProgress * lastIndex.value)
    : selectionFor(lowerBound.value + nextProgress * (upperBound.value - lowerBound.value)));
}

function finishDrag(touched = false, notify = true) {
  if (activePointer === null) return;
  const pointer = activePointer;
  activePointer = null;
  dragging.value = false;
  if (element.value?.hasPointerCapture(pointer)) element.value.releasePointerCapture(pointer);
  if (notify) emit('draggingChange', false);
  if (touched) emit('touched');
}

function pointerEnd(event: PointerEvent) {
  if (event.pointerId === activePointer) finishDrag(true);
}

function keyDown(event: KeyboardEvent) {
  pointerFocused.value = false;
  if (!interactive.value) return;
  let index = selection.value.index;
  switch (event.key) {
    case 'ArrowRight': case 'ArrowUp': index++; break;
    case 'ArrowLeft': case 'ArrowDown': index--; break;
    case 'PageUp': index += 10; break;
    case 'PageDown': index -= 10; break;
    case 'Home': index = 0; break;
    case 'End': index = lastIndex.value; break;
    default: return;
  }
  event.preventDefault();
  changeSelection(selectionAt(index));
}

watch(interactive, (enabled) => { if (!enabled) finishDrag(); });
onBeforeUnmount(() => finishDrag(false, false));
</script>

<template>
  <div ref="element" class="fio-circular-slider" role="slider" :tabindex="disabled ? -1 : 0"
    :aria-label="ariaLabel || label || 'Circular slider'" :aria-valuemin="hasData ? 0 : lowerBound"
    :aria-valuemax="hasData ? data.length - 1 : upperBound" :aria-valuenow="hasData ? selection.index : selection.value"
    :aria-valuetext="valueText" :aria-disabled="disabled" :aria-readonly="readonly" :style="{ width: `${size}px` }"
    :class="{ 'is-disabled': disabled, 'is-dragging': dragging, 'is-pointer-focused': pointerFocused, 'has-draggable-knob': knobDraggable }"
    @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerEnd" @pointercancel="pointerEnd"
    @lostpointercapture="pointerEnd" @keydown="keyDown" @blur="pointerFocused = false; emit('touched')">
    <svg class="dial fio-cs-dial" :viewBox="`0 0 ${size} ${size}`" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient :id="`${gradientId}-progress`" gradientUnits="userSpaceOnUse"
          :x1="gradientStart.x" :y1="gradientStart.y" :x2="gradientEnd.x" :y2="gradientEnd.y">
          <stop v-for="(stop, index) in progressStops" :key="index" :offset="stop.offset" :stop-color="stop.stopColor" :stop-opacity="stop.stopOpacity" />
        </linearGradient>
        <linearGradient :id="`${gradientId}-track`" gradientUnits="userSpaceOnUse"
          :x1="gradientStart.x" :y1="gradientStart.y" :x2="gradientEnd.x" :y2="gradientEnd.y">
          <stop v-for="(stop, index) in trackStops" :key="index" :offset="stop.offset" :stop-color="stop.stopColor" :stop-opacity="stop.stopOpacity" />
        </linearGradient>
        <mask :id="`${gradientId}-mask`" maskUnits="userSpaceOnUse" x="0" y="0" :width="size" :height="size" style="mask-type: alpha">
          <path :d="path" fill="none" stroke="white" pathLength="100" stroke-dasharray="100 100"
            :stroke-dashoffset="100 * (1 - progress)" :stroke-width="progressWidth" :stroke-linecap="progressLineCap" :opacity="progress === 0 ? 0 : 1" />
        </mask>
      </defs>
      <path class="fio-cs-track" :d="path" fill="none" :stroke-width="trackWidth" :stroke-linecap="progressLineCap"
        :stroke="trackGradient.length ? `url(#${gradientId}-track)` : trackColor" pointer-events="none" />
      <path class="progress fio-cs-progress" :d="path" fill="none" :stroke-width="progressWidth" :stroke-linecap="progressLineCap"
        :stroke="`url(#${gradientId}-progress)`" :mask="`url(#${gradientId}-mask)`" pointer-events="none" />
      <path data-track="" :d="path" fill="none" stroke="transparent" :stroke-width="Math.max(trackWidth, progressWidth) + 20"
        :pointer-events="trackDraggable && interactive ? 'stroke' : 'none'" :class="{ 'fio-cs-draggable': trackDraggable && interactive }" />
      <g v-if="!hideKnob" data-knob="" :transform="`translate(${knobPoint.x},${knobPoint.y})`" :class="{ 'fio-cs-draggable': knobDraggable && interactive }">
        <circle v-if="!hideKnobRing" class="knob-ring fio-cs-knob-ring" :r="knobDiameter / 2" :fill="knobColor" opacity="0.2" />
        <circle :r="knobDiameter / 3" :fill="knobColor" />
        <path v-if="!slots.knob" d="M -4 -3 H 4 M -4 0 H 4 M -4 3 H 4" stroke="white" stroke-width="1" pointer-events="none" />
      </g>
    </svg>
    <div v-if="slots.knob && !hideKnob" class="fio-cs-knob-content" data-knob="" aria-hidden="true"
      :class="{ 'fio-cs-draggable': knobDraggable && interactive }"
      :style="{ left: `${knobPoint.x / size * 100}%`, top: `${knobPoint.y / size * 100}%`, width: `${knobDiameter / size * 100}%`, height: `${knobDiameter / size * 100}%` }">
      <slot name="knob" v-bind="slotProps" />
    </div>
    <div v-if="!hideLabelValue" class="fio-cs-labels" aria-hidden="true"
      :style="{ color: labelColor, gap: verticalOffset, '--label-gap': verticalOffset, '--label-font-size': labelFontSize, '--value-font-size': valueFontSize }">
      <slot name="label" v-bind="slotProps">
        <div class="fio-cs-default-labels">
          <div class="fio-cs-label" :class="{ 'fio-cs-label-bottom': labelBottom }">{{ label }}</div>
          <div class="fio-cs-value"><span class="fio-cs-affix fio-cs-prefix">{{ prependToValue }}</span><span data-slider-value>{{ selection.value }}</span><span class="fio-cs-affix fio-cs-suffix">{{ appendToValue }}</span></div>
        </div>
      </slot>
    </div>
  </div>
</template>
