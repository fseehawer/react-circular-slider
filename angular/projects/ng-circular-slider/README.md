# @fiojs/ng-circular-slider

A native Angular circular slider with signal inputs, arc gauges, gradients, keyboard controls, and Angular forms support. No React runtime or wrapper.

[Live demos](https://fseehawer.github.io/react-circular-slider/angular/) | [Source and issues](https://github.com/fseehawer/react-circular-slider/tree/master/angular)

## Installation

```bash
npm install @fiojs/ng-circular-slider
```

Supports Angular 20, 21, and 22. Angular common, core, and forms are peer dependencies and should use matching versions in your application. The library is published in Angular Package Format with partial compilation.

## Quick Start

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CircularSliderComponent } from '@fiojs/ng-circular-slider';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CircularSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fio-circular-slider
      [(value)]="volume"
      [min]="0"
      [max]="100"
      label="Volume"
      appendToValue="%"
      [trackDraggable]="true"
    />
  `,
})
export class AppComponent {
  readonly volume = signal(40);
}
```

You can also import the standalone component into an NgModule's `imports` array.

Pass the writable signal itself to `[(value)]`, without parentheses. Read it with `volume()` elsewhere, and call `volume.set(60)` to update the slider programmatically. Plain number or string properties also work. The component uses `input()`, `output()`, `computed()`, and `linkedSignal()` internally and works in zoneless applications.

## Values and Forms

Choose one value binding: `[(value)]`, `[(ngModel)]`, `[formControl]`, or `formControlName`. Do not combine them on the same slider. Import `FormsModule` for `ngModel`. `value` is the selected number or custom data item, **not an angle in degrees**.

The component infers its output type from `value` and `data`, so a numeric `[(value)]` binding works with a normal `number` property under strict template checking. Custom string data produces string values.

For reactive forms, import `ReactiveFormsModule` alongside `CircularSliderComponent`:

```typescript
import { FormControl } from '@angular/forms';

readonly speed = new FormControl(80, { nonNullable: true });
```

```html
<fio-circular-slider
  [formControl]="speed"
  [min]="0"
  [max]="160"
  [arcStart]="225"
  [arcEnd]="135"
  [trackGradient]="['#22c55e', '#eab308', '#ef4444']"
  [progressGradient]="['#22c55e', '#eab308', '#ef4444']"
  [trackDraggable]="true"
  label="Speed"
  appendToValue=" km/h"
/>
```

`speed.setValue(100)` updates the slider. `speed.disable()` disables pointer and keyboard interaction. User changes update the form; programmatic writes do not emit `valueChange`. The control becomes touched on blur or when a pointer interaction ends. Resetting to `null` selects the minimum or first custom item. Put validators on the form control as usual.

### Angular 22 Signal Forms

Signal Forms can use the slider's `ControlValueAccessor` integration. Import `FormField` alongside `CircularSliderComponent`, and define bounds in the form schema:

```typescript
import { signal } from '@angular/core';
import { form, FormField, min, max } from '@angular/forms/signals';

readonly settings = signal({ volume: 40 });
readonly settingsForm = form(this.settings, path => {
  min(path.volume, 0);
  max(path.volume, 100);
});
```

```html
<fio-circular-slider
  [formField]="settingsForm.volume"
  label="Volume"
  appendToValue="%"
  [trackDraggable]="true"
/>
```

Value, bounds, disabled/readonly state, dirty/touched tracking, and resets are covered by an Angular 22 installed-package browser test. Do not also bind `value`, `ngModel`, or `formControl`. The library itself does not import `@angular/forms/signals`, keeping Angular 20 and 21 consumers compatible.

## Custom Data

Pass a nonempty array of unique strings or numbers to `data`. These items are evenly spaced and override `min`, `max`, and `step`.

```html
<fio-circular-slider
  [data]="['XS', 'S', 'M', 'L', 'XL']"
  [(ngModel)]="size"
  label="Size"
  [trackDraggable]="true"
/>
```

Initialize `size = 'M'`. Alternatively, use `[(dataIndex)]="index"` to bind the zero-based index, without a value or forms binding. Unknown values fall back to the first item; out-of-range indices are clamped.

## Inputs

| Input | Default | Meaning |
| --- | --- | --- |
| `value` | minimum / first item | Selected `number` or `string`; supports `[(value)]`. |
| `min`, `max` | `0`, `360` | Inclusive numeric bounds; use `min <= max`. |
| `step` | `1` | Positive numeric increment. The exact maximum remains reachable even when the range is not divisible by the step. |
| `data` | `[]` | Custom `readonly (string \| number)[]`. An empty array uses the numeric range. |
| `dataIndex` | `0` | Selected index; supports `[(dataIndex)]`. |
| `width` | `280` | Maximum diameter in CSS pixels. The slider shrinks to fit its parent. |
| `direction` | `1` | `1` clockwise; `-1` counterclockwise. |
| `knobPosition` | `'top'` | Full-circle start: `'top'`, `'right'`, `'bottom'`, `'left'`, or degrees clockwise from the top. |
| `arcStart`, `arcEnd` | unset | Both are required for a gauge. Angles use 0 at top, 90 at right. The arc follows `direction`; equal endpoints make a full circle. |
| `label`, `ariaLabel` | `'ANGLE'`, `''` | Visible label and optional accessible name override. |
| `labelColor` | `'#272b77'` | Label and value color. |
| `labelBottom` | `false` | Place the label below the value. |
| `labelFontSize`, `valueFontSize` | `'1rem'`, `'3rem'` | CSS font sizes. |
| `prependToValue`, `appendToValue` | `''` | Value prefix and suffix; included in accessible value text. |
| `verticalOffset` | `'0.5rem'` | CSS gap between label and value. |
| `hideLabelValue` | `false` | Hide the visual label and value; keep accessibility attributes. |
| `knobColor`, `knobSize` | `'#4e63ea'`, `36` | Knob color and diameter. |
| `hideKnob`, `hideKnobRing` | `false` | Hide the knob or its translucent outer ring. |
| `knobDraggable`, `trackDraggable` | `true`, `false` | Enable pointer interaction on the knob or track. |
| `limitDragRange` | `true` | Prevent a full-circle drag from wrapping between maximum and minimum. Arc gauges always clamp to their endpoints. |
| `disabled`, `readonly` | `false` | Prevent user changes. Disabled sliders also leave the tab order. Form-disabled state takes precedence. |
| `trackColor`, `trackSize` | `'#dddefb'`, `8` | Background track color and thickness. |
| `progressColorFrom`, `progressColorTo` | `'#80c3f3'`, `'#4990e2'` | Default progress gradient colors. |
| `progressSize`, `progressLineCap` | `8`, `'round'` | Progress thickness and `'round'` or `'butt'` line ends. |
| `progressGradient`, `trackGradient` | `[]` | Color strings or `GradientStop` objects. Override default colors. |
| `knobTemplate`, `labelTemplate` | `null` | Custom Angular `TemplateRef` content. |
| `sliderId` | generated | Optional unique prefix for SVG gradient IDs; useful across independently bootstrapped applications. |

## Outputs

| Output | Payload | When |
| --- | --- | --- |
| `valueChange` | `string \| number` | User interaction changes the selected value. |
| `dataIndexChange` | `number` | User interaction changes the selected index. |
| `draggingChange` | `boolean` | A pointer drag starts or ends. |

The slider supports mouse, touch, and pen through Pointer Events. Arrow keys move one step, Page Up/Down move ten steps, and Home/End select the endpoints. Custom data uses its index for `aria-valuenow` and the selected item for `aria-valuetext`.

## Gradients and Templates

```typescript
import { GradientStop } from '@fiojs/ng-circular-slider';

readonly colors: GradientStop[] = [
  { offset: '0%', stopColor: '#22c55e' },
  { offset: '50%', stopColor: '#eab308', stopOpacity: 0.9 },
  { offset: '100%', stopColor: '#ef4444' },
];
```

Missing offsets are distributed evenly. Arc gradients are linear in SVG space from the start point to the end point, so the speed gauge starts green and ends red. They are not conic gradients: stop percentages describe the gradient axis, not distance around the curve.

```html
<ng-template #knob let-value>
  <span>{{ value }}</span>
</ng-template>
<ng-template #center let-value let-label="label">
  <strong>{{ value }}%</strong>
  <span>{{ label }}</span>
</ng-template>

<fio-circular-slider
  [(ngModel)]="charge"
  [max]="100"
  label="Battery"
  [knobTemplate]="knob"
  [labelTemplate]="center"
/>
```

Templates receive `{ $implicit: value, value, label }`. Keep projected content noninteractive because the component itself is the accessible slider control.

## React Version

The React package remains available as [`@fiojs/react-circular-slider`](https://www.npmjs.com/package/@fiojs/react-circular-slider). The Angular package has its own version history. Visual configuration is similar, but Angular uses templates and forms rather than React nodes and callbacks.

## License

MIT
