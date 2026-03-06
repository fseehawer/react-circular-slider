# react-circular-slider

[![Version](https://img.shields.io/badge/version-3.3.1-green.svg)](https://github.com/fseehawer/react-circular-slider)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A highly customizable circular slider with **zero dependencies**. Check out the [live demos](https://fseehawer.github.io/react-circular-slider/)!

<img src="https://fseehawer.github.io/react-circular-slider/circular-slider.png" alt="An image showing the CircularSlider settings" width="100%" />

## TypeScript Support

This component now has full **TypeScript** support! Enjoy full IntelliSense and strong type-checking out of the box.

*JavaScript users: No worries – the published output is plain JavaScript and works exactly as before.*

## Installation

```bash
npm install @fseehawer/react-circular-slider
```

## example

```javascript
import React from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';

const App: React.FC = () => (
    <>
        <CircularSlider onChange={value => console.log(value)} />
    </>
);

export default App;
```
## Custom Configuration

Customize properties such as the label, colors, data set, and more:

```javascript
import React from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';

const App: React.FC = () => (
    <>
        <CircularSlider
            label="savings"
            labelColor="#005a58"
            knobColor="#005a58"
            progressColorFrom="#00bfbd"
            progressColorTo="#009c9a"
            progressSize={24}
            trackColor="#eeeeee"
            trackSize={24}
            data={['1€', '2€']} // Custom data array
            dataIndex={10}
            onChange={value => console.log(value)}
        />
    </>
);

export default App;
```

## Props

The table below lists all available props along with their TypeScript types, default values, and descriptions.

| Prop                      | Type                                                    | Default                                   | Description                                                                                              |
|---------------------------|---------------------------------------------------------|-------------------------------------------|----------------------------------------------------------------------------------------------------------|
| `width`                   | `number`                                                | `280`                                     | Width of the slider in pixels.                                                                         |
| `direction`               | `1 \| -1`                                               | `1`                                       | Rotation direction: `1` for clockwise, `-1` for anticlockwise.                                           |
| `min`                     | `number`                                                | `0`                                       | Minimum value.                                                                                           |
| `max`                     | `number`                                                | `360`                                     | Maximum value.                                                                                           |
| `initialValue`            | `number`                                                | `0`                                       | Initial value for the label.                                                                             |
| `data`                    | `(string \| number)[]`                                  | `[]`                                      | Array of values or labels, evenly spread over 360°.                                                     |
| `dataIndex`               | `number`                                                | `0`                                       | Initial index position in the data array.                                                              |
| `knobColor`               | `string`                                                | `"#4e63ea"`                               | Color of the knob.                                                                                       |
| `knobSize`                | `number`                                                | `32`                                      | Diameter of the knob in pixels.                                                                          |
| `hideKnob`                | `boolean`                                               | `false`                                   | If `true`, the knob is hidden.                                                                           |
| `hideKnobRing`            | `boolean`                                               | `false`                                   | If `true`, the translucent ring around the knob is hidden.                                               |
| `knobDraggable`           | `boolean`                                               | `true`                                    | If `true`, the knob is draggable.                                                                        |
| `knobPosition`            | `string \| number`                                      | `"top"`                                   | Starting position: accepts `"top"`, `"right"`, `"bottom"`, `"left"` or an angle (in degrees).            |
| `label`                   | `string`                                                | `"ANGLE"`                                 | Text label displayed on the slider.                                                                      |
| `labelColor`              | `string`                                                | `"#272b77"`                               | Color of the label and value text.                                                                       |
| `labelBottom`             | `boolean`                                               | `false`                                   | If `true`, the label is positioned below the slider.                                                   |
| `labelFontSize`           | `string`                                                | `"1rem"`                                  | Font size of the label.                                                                                  |
| `valueFontSize`           | `string`                                                | `"4rem"`                                  | Font size of the displayed value.                                                                        |
| `appendToValue`           | `string`                                                | `""`                                      | Text appended to the value.                                                                              |
| `prependToValue`          | `string`                                                | `""`                                      | Text prepended to the value.                                                                             |
| `renderLabelValue`        | `React.ReactNode`                                       | `null`                                    | Custom JSX for rendering the label and value.                                                            |
| `verticalOffset`          | `string`                                                | `"2rem"`                                  | Vertical offset for the label/value display.                                                             |
| `hideLabelValue`          | `boolean`                                               | `false`                                   | If `true`, both the label and value are hidden.                                                          |
| `progressColorFrom`       | `string`                                                | `"#80C3F3"`                               | Start color for the progress gradient.                                                                   |
| `progressColorTo`         | `string`                                                | `"#4990E2"`                               | End color for the progress gradient.                                                                     |
| `progressSize`            | `number`                                                | `8`                                       | Thickness of the progress track.                                                                         |
| `progressLineCap`         | `"round" \| "butt"`                                     | `"round"`                                 | Cap style for the progress track.                                                                        |
| `trackColor`              | `string`                                                | `"#DDDEFB"`                               | Color of the background track.                                                                           |
| `trackSize`               | `number`                                                | `8`                                       | Thickness of the background track.                                                                       |
| `trackDraggable`          | `boolean`                                               | `false`                                   | If `true`, allows dragging the background track.                                                       |
| `progressGradient`        | `(string \| GradientStop)[]`                            | `undefined`                               | Array of color stops for a multi-stop progress gradient. Overrides `progressColorFrom`/`To`. Each stop can be a color string or `{ offset, stopColor, stopOpacity }`. |
| `trackGradient`           | `(string \| GradientStop)[]`                            | `undefined`                               | Array of color stops for a multi-stop track gradient. Overrides `trackColor`.                           |
| `arcStart`                | `number`                                                | `undefined`                               | Start angle (in degrees) for arc mode. Use with `arcEnd` to create a partial-circle gauge (e.g. `225` for lower-left). |
| `arcEnd`                  | `number`                                                | `undefined`                               | End angle (in degrees) for arc mode. Use with `arcStart` (e.g. `135` for lower-right = 270° speedometer sweep). |
| `onChange`                | `(value: string \| number) => void`                     | `() => {}`                                | Callback fired when the value changes.                                                                   |
| `isDragging`              | `(dragging: boolean) => void`                           | `() => {}`                                | Callback to signal whether the slider is being dragged.                                                |

## Multi-Stop Gradient Example

Use `progressGradient` and/or `trackGradient` for rich multi-color arcs:

```jsx
<CircularSlider
  label="Spectrum"
  min={0}
  max={360}
  dataIndex={180}
  progressGradient={[
    { offset: '0%', stopColor: '#ef4444' },
    { offset: '20%', stopColor: '#f97316' },
    { offset: '40%', stopColor: '#eab308' },
    { offset: '55%', stopColor: '#22c55e' },
    { offset: '70%', stopColor: '#3b82f6' },
    { offset: '85%', stopColor: '#6366f1' },
    { offset: '100%', stopColor: '#8b5cf6' },
  ]}
  trackGradient={[
    { offset: '0%', stopColor: '#fecaca', stopOpacity: 0.4 },
    { offset: '50%', stopColor: '#bbf7d0', stopOpacity: 0.4 },
    { offset: '100%', stopColor: '#c4b5fd', stopOpacity: 0.4 },
  ]}
  progressSize={12}
  trackSize={12}
/>
```

## Arc (Gauge) Example

Use `arcStart` and `arcEnd` to create a partial-circle gauge, like a car speedometer:

```jsx
<CircularSlider
  label="km/h"
  min={0}
  max={250}
  dataIndex={80}
  progressGradient={[
    { offset: '0%', stopColor: '#22c55e' },
    { offset: '50%', stopColor: '#eab308' },
    { offset: '100%', stopColor: '#dc2626' },
  ]}
  progressSize={14}
  trackColor="#e5e7eb"
  trackSize={14}
  progressLineCap="butt"
  arcStart={225}
  arcEnd={135}
/>
```

## Donation

If you find this component useful, please consider a small donation. Even one dollar helps maintain and develop new features!

[You can find the donate button on the bottom of the example page](https://fseehawer.github.io/react-circular-slider/)


## license

[MIT License](https://opensource.org/licenses/MIT)
