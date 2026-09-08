# Vue Circular Slider

Native Vue 3 circular sliders and arc gauges. Composition API, TypeScript, Pointer Events, keyboard access, SSR, custom data, and label/knob scoped slots. No framework wrapper or runtime dependency besides Vue.

[Live Vue demos](https://fseehawer.github.io/react-circular-slider/vue/) | [Vue source](https://github.com/fseehawer/react-circular-slider/tree/master/vue) | [npm package](https://www.npmjs.com/package/@fiojs/vue-circular-slider)

Try the live demos for copy-ready Vue examples covering numeric ranges, arc gauges, custom values, forms, and scoped slots.

## Installation

```sh
npm install @fiojs/vue-circular-slider
```

Requires stable **Vue 3.5 or later in the Vue 3 series**. The package ships compiled ESM and bundled declarations. Import the stylesheet once in your application entry or root component; JavaScript does not inject or automatically import CSS.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { CircularSlider } from '@fiojs/vue-circular-slider';
import '@fiojs/vue-circular-slider/style.css';

const value = ref(42);
</script>

<template>
  <CircularSlider v-model="value" :max="100" label="Value" :track-draggable="true" />
</template>
```

The default export is also `CircularSlider`. Numeric and string models are inferred, including the types of emitted values and slot values. Exported types: `CircularSliderProps<T>`, `CircularSliderSlotProps<T>`, `SliderValue`, `GradientStop`, and `KnobPosition`.

## Values And Events

`modelValue` / `update:modelValue` implement `v-model`. With no model, selection starts at `min` or at `dataIndex`, and the component maintains local selection. Custom data uses string or number values, not objects.

| Event | Payload | When |
| --- | --- | --- |
| `update:modelValue` | `T` | A pointer or keyboard action changes the value |
| `change` | `T` | The same user value change, useful for dirty state |
| `update:dataIndex` | `number` | A user action changes the index; supports `v-model:data-index` |
| `dataIndexChange` | `number` | Alias for index notifications |
| `draggingChange` | `boolean` | An accepted drag starts or finishes |
| `touched` | none | Focus leaves the control or a drag finishes/cancels |

Programmatic model, index, bounds, and data updates **never emit value/index change events**. When bounds or data change, the current selection is retained where possible, otherwise snapped/clamped to the new numeric range or the first custom value. These internal adjustments do not rewrite parent state. A changed model takes precedence over a simultaneously changed index; otherwise a changed explicit index takes precedence over retained selection.

Numeric indexes enumerate steps from `min`, with `max` included even when it is not an exact step. Custom-data indexes are zero-based.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { CircularSlider } from '@fiojs/vue-circular-slider';
import '@fiojs/vue-circular-slider/style.css';

const size = ref('M');
const index = ref(2);
const sizes = ['XS', 'S', 'M', 'L', 'XL'];
</script>

<template>
  <CircularSlider v-model="size" v-model:data-index="index" :data="sizes" label="Size" />
</template>
```

## Inputs

Pass numbers/booleans as Vue bindings (`:max="100"`, `:track-draggable="true"`). The table below lists the Vue component's props and defaults.

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` | `T \| null` | unset |
| `min`, `max`, `step` | `number` | `0`, `360`, `1` |
| `data`, `dataIndex` | `readonly T[]`, `number` | `[]`, unset |
| `width` | `number` | `280` |
| `direction` | `1 \| -1` | `1` (clockwise) |
| `knobPosition` | `'top' \| 'right' \| 'bottom' \| 'left' \| number` | `'top'` |
| `arcStart`, `arcEnd` | `number` | unset (full circle) |
| `label`, `ariaLabel` | `string` | `'ANGLE'`, `''` |
| `sliderId` | `string` | automatic stable ID |
| `labelColor`, `labelBottom` | `string`, `boolean` | `'#272b77'`, `false` |
| `labelFontSize`, `valueFontSize` | CSS size strings | `'1rem'`, `'3rem'` |
| `appendToValue`, `prependToValue` | `string` | `''` |
| `verticalOffset` | CSS size string | `'0.5rem'` |
| `hideLabelValue`, `hideKnob`, `hideKnobRing` | `boolean` | `false` |
| `knobDraggable`, `trackDraggable`, `limitDragRange` | `boolean` | `true`, `false`, `true` |
| `disabled`, `readonly` | `boolean` | `false` |
| `knobColor`, `knobSize` | `string`, `number` | `'#4e63ea'`, `36` |
| `progressColorFrom`, `progressColorTo` | `string` | `'#80c3f3'`, `'#4990e2'` |
| `progressGradient`, `trackGradient` | `readonly (string \| GradientStop)[]` | `[]` |
| `progressSize`, `trackSize` | `number` | `8` |
| `progressLineCap` | `'round' \| 'butt'` | `'round'` |
| `trackColor` | `string` | `'#dddefb'` |

`GradientStop` is `{ offset?: string; stopColor: string; stopOpacity?: number }`. Missing offsets are evenly spaced. `progressGradient` overrides the two progress colors; an empty `trackGradient` keeps the neutral `trackColor`. Gradients span the dial/arc endpoints, while an SVG mask reveals only the selected progress.

Angles start at the top (0 degrees), increasing clockwise. Set both arc endpoints to enable an arc, which follows `direction`. Equal endpoints mean a full circle. Pointer positions in the arc gap snap to the nearer endpoint. Full-circle dragging clamps at the min/max boundary by default; set `:limit-drag-range="false"` to allow wrapping. Track clicks can select any point independently of the continuous-drag boundary clamp.

The default value stays centered horizontally and vertically in the dial, independently of labels and prefixes/suffixes. `verticalOffset` sets the label-to-value gap without shifting the value. Custom `#label` content controls its own layout.

## Arc Gauge

```vue
<CircularSlider
  v-model="speed"
  :max="160"
  :arc-start="225"
  :arc-end="135"
  :progress-gradient="['#22c55e', '#eab308', '#ef4444']"
  track-color="#e5e7eb"
  :track-draggable="true"
  label="Speed"
  append-to-value=" km/h"
/>
```

## Scoped Slots

Both `#label` and `#knob` receive `{ value, index, label }`. They render HTML. The label slot replaces the central label/value group; the knob slot overlays the draggable knob. Keep content presentational, since the whole control is a single accessible slider. Set `ariaLabel` and value affixes to describe custom visuals to screen readers.

```vue
<CircularSlider v-model="charge" :max="100" label="Battery" append-to-value="%">
  <template #label="{ value, label }">
    <strong>{{ value }}%</strong>
    <span>{{ label }}</span>
  </template>
  <template #knob="{ value }"><small>{{ value }}</small></template>
</CircularSlider>
```

## Accessibility, Forms And SSR

The root carries `role="slider"`, focusability, min/max/current/text values, and disabled/readonly state. `ariaLabel` overrides `label`. Arrow Up/Right increase; Down/Left decrease. Page Up/Down move ten steps; Home/End select endpoints. Keyboard order is independent of visual direction. Disabled sliders leave the tab order; readonly sliders remain focusable. Both block editing and pause the ring animation. Dragging pauses the ring, and reduced-motion preference removes animation.

Pointer capture keeps mouse/touch/pen drags active outside the dial. Capture is released on completion, cancellation, loss, disable/readonly changes, or unmount. No document-level listeners or browser globals are accessed during setup/SSR.

For native forms, bind state with `v-model`, derive dirty state from a baseline, and set touched state with `@touched`. Add a hidden input with `:value` and `:disabled` when native form submission is needed. See the Forms demo for a complete reset/disabled-state example.

SVG IDs use Vue's [`useId()`](https://vuejs.org/api/composition-api-helpers.html#useid), which is stable across server rendering and hydration. Use matching `app.config.idPrefix` values for server/client if multiple Vue applications share a page. An explicit `sliderId` must be unique. The package ESM can be imported and rendered in Node without a DOM; import CSS through your application bundler separately.

## Local Development

From `vue/` in this repository:

```sh
npm install
npm run build
npm run typecheck
npm test
npm run test:browser
npm run dev
```

The demo imports the compiled package, not library source. `dev` builds it first and serves the [local Vue demo](http://localhost:5187/react-circular-slider/vue/). Rebuild after editing library source. `build:demo` builds the package and outputs the demo into repository `build/vue`. Browser tests use Chromium on port 5187. Install the Playwright Chromium browser if it is not already available.

The source imports framework-independent math from `../shared/slider-math.ts`. Build bundles that math and its public types into `dist`; consumers need no sibling workspace files.
