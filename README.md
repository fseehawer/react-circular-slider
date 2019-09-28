# react-circular-slider

![](https://img.shields.io/badge/version-1.2.1-green.svg) ![](https://img.shields.io/badge/license-MIT-blue.svg)

A highly customizable circular slider with no dependencies. Check out some [live demos here!](https://fseehawer.github.io/react-circular-slider/)

<img src="public/slider.png" alt="CircularSlider example image" width="280" height="280" />

## install

```
npm install @fseehawer/react-circular-slider
```

## example

```javascript
import React from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';

const App = () => {
    return (
        <CircularSlider
            onChange={ value => { console.log(value); } }
        />
    )
};

export default App;
```

The CircularSlider component with some custom props. See the [demos here!](https://fseehawer.github.io/react-circular-slider/)

```javascript
import React from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';

const App = () => {
    return (
        <CircularSlider
            label="savings"
            labelColor="#005a58"
            knobColor="#005a58"
            progressColorFrom="#00bfbd"
            progressColorTo="#009c9a"
            progressSize={24}
            trackColor="#eeeeee"
            trackSize={24}
            data={["1€","2€"]} //...
            placeKnobAtIndex={10}
            onChange={ value => { console.log(value); } }
        />
    )
};

export default App;
```

## Props

prop             | type   | default       | Affects
-----------------|--------|---------------|--------
width            | number | 280           | width of slider
knobColor        | string | #4e63ea       | knob color
label            | string | DEGREES       | label
labelColor       | string | #272b77       | label color
progressColorFrom| string | #80C3F3       | progress track gradient start color
progressColorTo  | string | #4990E2       | progress track gradient end color
progressSize     | number | 6             | progress track size
progressLineCap  | string | round         | progress track cap to be round or flat
trackColor       | string | #DDDEFB       | background track color
trackSize        | number | 6             | background track size
data             | array  | []            | array of data to be spread
placeKnobAtIndex | int    | 0             | place knob at a certain array index
onChange         | func   | value => {}   | returns label value


## license

[MIT License](https://opensource.org/licenses/MIT)
