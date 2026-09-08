# @fiojs/wc-circular-slider

An accessible, form-associated circular slider and arc gauge for standalone HTML or any framework. Built with Lit 3, with no React, Angular, or Vue dependencies.

[Live Web Component demos](https://fseehawer.github.io/react-circular-slider/web-component/) | [Web Component source](https://github.com/fseehawer/react-circular-slider/tree/master/web-component) | [npm package](https://www.npmjs.com/package/@fiojs/wc-circular-slider)

Try the live demos for copy-ready HTML and JavaScript examples covering numeric ranges, arc gauges, custom values, native forms, and slots.

## Installation

```sh
npm install @fiojs/wc-circular-slider
```

```ts
import { CircularSliderElement, registerCircularSlider } from '@fiojs/wc-circular-slider';

registerCircularSlider();
const slider = document.querySelector<CircularSliderElement>('fio-circular-slider')!;
slider.value = 42;
slider.addEventListener('input', () => console.log(slider.value));
```

```html
<fio-circular-slider value="42" min="0" max="100" step="1"
  label="Value" track-draggable></fio-circular-slider>
```

Registration is explicit. Alternatively, `import '@fiojs/wc-circular-slider/register'` registers the default tag, guarding repeated imports and existing definitions. `registerCircularSlider('my-circular-slider')` defines an alternative tag using a subclass. The root exports `CircularSliderElement` (also aliased as `CircularSlider`), `registerCircularSlider`, and the `SliderValue`, `KnobPosition`, and `GradientStop` types.

## Standalone HTML / CDN

Load the published browser module directly from the CDN. No bundler or framework is required.

```html
<!doctype html>
<html lang="en">
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Circular slider</title>
  <script type="module"
    src="https://cdn.jsdelivr.net/npm/@fiojs/wc-circular-slider@1/dist/register.js"></script>
  <fio-circular-slider value="42" max="100" label="Value" track-draggable>
  </fio-circular-slider>
</html>
```

The browser distribution is self-contained ESM: Lit and shared slider math are bundled, with relative chunk imports confined to `dist`. No import map is needed. Package Node imports select `dist/node/index.js`, which bundles Lit's SSR-compatible base class. Importing the root or `/register` in Node requires no browser globals and does not register an element. Direct browser distribution URLs are browser-only; use the package root in SSR code. Type declarations retain normal Lit type imports, provided by the package dependency, and have no worktree/shared-source paths.

## Properties

Primitive attributes use kebab-case. Set arrays through JavaScript properties, not JSON attributes. Numeric attributes convert to numbers except `value`, which accepts numeric strings as well as custom string values. Native `required`, `disabled`, and `readonly` attributes use presence semantics. Other Boolean options accept either a bare attribute or `="true"`; `="false"` explicitly turns an option off (including default-true options).

| Property | Default | Meaning |
| --- | --- | --- |
| `value` | `min` or first data item | Selected `number \| string`; numeric values clamp/snap |
| `min`, `max`, `step` | `0`, `360`, `1` | Numeric bounds and increment; uneven maximum remains reachable |
| `data`, `dataIndex` | `[]`, resolved index | Readonly primitive array and selected zero-based index |
| `width`, `direction` | `280`, `1` | Diameter in px; `1` clockwise or `-1` counterclockwise |
| `knobPosition` | `'top'` | `'top'`, `'right'`, `'bottom'`, `'left'`, or angle in degrees |
| `arcStart`, `arcEnd` | unset | Clock angles (0 at top); equal endpoints mean a full circle |
| `label`, `ariaLabel` | `'ANGLE'`, `''` | Visual label and optional accessible-name override |
| `name`, `required` | `''`, `false` | Native form submission name and required constraint |
| `disabled`, `readonly` | `false`, `false` | Block interaction; disabled excludes submission and tab focus |
| `knobDraggable`, `trackDraggable`, `limitDragRange` | `true`, `false`, `true` | Pointer target controls and continuous endpoint clamping |
| `hideKnob`, `hideKnobRing`, `hideLabelValue` | `false` | Visibility options |
| `labelBottom` | `false` | Position label beneath value |
| `prependToValue`, `appendToValue` | `''` | Visual and accessible value affixes |
| `labelColor`, `knobColor` | `#202326`, `#0891b2` | Literal colors |
| `labelFontSize`, `valueFontSize`, `verticalOffset` | `1rem`, `3rem`, `0.5rem` | Literal CSS lengths |
| `knobSize`, `trackSize`, `progressSize` | `36`, `8`, `8` | Diameter/stroke widths in px |
| `trackColor` | `#e5e7eb` | Neutral track color |
| `progressColorFrom`, `progressColorTo` | `#67e8f9`, `#0d9488` | Default progress gradient |
| `progressGradient`, `trackGradient` | `[]` | Arrays of color strings or `GradientStop` objects |
| `progressLineCap` | `'round'` | `'round'` or `'butt'` |

```ts
slider.data = ['XS', 'S', 'M', 'L', 'XL'];
slider.value = 'M';
slider.progressGradient = [
  { offset: '0%', stopColor: '#22c55e', stopOpacity: 1 },
  '#eab308',
  { offset: '100%', stopColor: '#ef4444' },
];
```

Reassign arrays to trigger updates. Bounds and data changes preserve the current selection when possible, otherwise clamp/snap numeric values or choose the first available data item. `dataIndex` writes select by index. A subsequent value write selects by value, so reordering data preserves that selected value. All these programmatic operations are silent. After connection, `await slider.updateComplete` waits for rendered/ARIA updates.

The default value stays centered horizontally and vertically in the dial, independently of labels and prefixes/suffixes. `verticalOffset` sets the label-to-value gap without shifting the value. Custom `slot="label"` content controls its own layout. The `value-number` CSS part targets just the centered value, excluding its affixes.

## Events and Accessibility

`input` bubbles and is composed, firing only when a user changes the selection. The element's `.value`, `.dataIndex`, and native form value are current before listeners run. Read the value from the event target; there is no custom event detail.

`change` also bubbles and is composed. It fires once at pointer release, cancellation, lost capture, or blur if the gesture changed the value, and on key release/blur after a changed keyboard gesture. No-op gestures, programmatic writes, reset, restoration, disabling, and removal do not emit changes. Programmatic writes during a gesture cancel its pending commit. Reassigning the current value is harmless, supporting framework two-way binding.

The focusable host has `role="slider"`, a name, numeric bounds/current value, readable value text, and disabled/readonly/required/invalid states. Custom data uses indexes for numeric ARIA values and the selected item for value text. Arrow keys step, Page Up/Down move ten steps, Home/End select endpoints. Direction changes pointer rotation, not keyboard increase/decrease semantics. Pointer capture supports mouse, touch, and pen. Readonly remains focusable and submitted; disabled (including disabled fieldsets) is not. The knob ring pauses during dragging and stops for readonly, disabled, or reduced-motion users.

## Native Forms

```html
<form id="settings">
  <fieldset>
    <fio-circular-slider name="volume" value="40" max="100"
      label="Volume" required track-draggable></fio-circular-slider>
  </fieldset>
  <button type="reset">Reset</button>
</form>
```

```ts
const form = document.querySelector<HTMLFormElement>('#settings')!;
const slider = form.querySelector('fio-circular-slider')!;
await slider.updateComplete;
new FormData(form).get('volume'); // '40'
slider.value = 65;
new FormData(form).get('volume'); // '65', synchronously, without input/change
form.reset(); // restores the initial selected value, silently
slider.setCustomValidity('Please confirm this setting');
slider.reportValidity();
slider.setCustomValidity('');
```

ElementInternals supplies `form`, `labels`, `validity`, `validationMessage`, `willValidate`, `checkValidity()`, `reportValidity()`, and `setCustomValidity()`. As with a native range, numeric values cannot remain outside the effective bounds or off-step; data values resolve to an available item. Explicit empty values (`value = ''`) are preserved in numeric mode and fail `required`. An empty custom data item also fails `required`. Disabled and readonly controls are exempt from validation. Reset restores the selection captured at the first update; browser state restoration preserves the selected value's string/number type. ElementInternals support is required for native form participation.

## Shadow Parts and Slots

Supported parts: `knob`, `knob-ring`, `track`, `progress`, `label`, `value`, `value-number`.

```css
fio-circular-slider::part(value) { font-weight: 700; }
fio-circular-slider::part(knob-ring) { animation: none; }
```

```html
<fio-circular-slider label="Battery" value="65" max="100" track-draggable>
  <div slot="label"><strong>65%</strong><span>Battery</span></div>
  <small slot="knob">65</small>
</fio-circular-slider>
```

Slots are display-only, inert, and hidden from accessibility because the host provides slider semantics. Do not place interactive controls in them. The parent owns slot content and can update its text on `input`; slot nodes are preserved during rendering. Color properties accept hex, named, RGB(A), and HSL(A) literals; length properties accept nonnegative px/rem/em/% values. URLs, CSS variables/functions outside the allowlist, declarations, and markup are rejected in styling properties. Labels/data/affixes render as escaped text, never raw HTML. Consumer-authored CSS and slot DOM remain the consumer's responsibility.

## Local Development

```sh
npm install
npm run build
npm run typecheck
npm test
npm run test:browser
npm run dev
```

The [local Web Component demo](http://127.0.0.1:5188/react-circular-slider/web-component/) imports the built browser entry, not source. `npm run build:demo` writes only the generated sibling `build/web-component` directory. Package tests are in this package's `test` directory. These development commands do not publish or deploy the package.

Implementation references: [Lit reactive properties](https://lit.dev/docs/components/properties/), [Lit SSR authoring](https://lit.dev/docs/ssr/authoring/), [MDN setFormValue](https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/setFormValue), [MDN pointer capture](https://developer.mozilla.org/en-US/docs/Web/API/Element/setPointerCapture).
