# react-circular-slider

![](https://img.shields.io/badge/version-1.0.7-green.svg) ![](https://img.shields.io/badge/license-MIT-blue.svg)

A highly customizable circular slider with no dependencies. 

You can see some [examples](https://fseehawer.github.io/react-circular-slider/) here!

## install

```
npm install @fseehawer/react-circular-slider
```

## example

```javascript
import React from 'react';
import CircularSlider from '@fseehawer/react-circular-slider';
const App = () => {
    const onSliderChange = (value) => {
        // use value
        console.log(value);
    };
    
    return (
        <CircularSlider
            onChange={onSliderChange}
        />
    )
};

export default App;
```

The CircularSlider component with some custom props. See [example](https://fseehawer.github.io/react-circular-slider/) here!

```
<CircularSlider
    label="Alphabet"
    labelColor="#212121"
    knobColor="#212121"
    progressColorFrom="#ff8500"
    progressColorTo="#a15400"
    progressSize={4}
    trackColor=#eeeeee"
    trackSize={12}
    customData={"ABCDEFGHIJKLMNOPQRSTUVXWYZ".split("")}
    onChange={onChange}
/>
```

## Props

prop             | type   | deafult
-----------------|--------|--------
width            | number | 280
knobColor        | string | #4e63ea
label            | string | Degrees°
labelColor       | string | #272b77
progressColorFrom| string | #80C3F3
progressColorTo  | string | #4990E2
progressSize     | number | 6
trackColor       | string | #DDDEFB
trackSize        | number | 6
customData       | array  | []
onChange         | func   | value => {}


## license

[MIT License](https://opensource.org/licenses/MIT)
