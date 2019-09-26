# react-circular-slider

![](https://img.shields.io/badge/version-1.1.2-green.svg) ![](https://img.shields.io/badge/license-MIT-blue.svg)

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
    label="savings"
    labelColor="#212121"
    knobColor="#212121"
    progressColorFrom="#ff8500"
    progressColorTo="#a15400"
    progressSize={4}
    trackColor=#eeeeee"
    trackSize={12}
    data={["1€","2€",...]}
    startIndex={10}
    onChange={onSliderChange}
/>
```

## Props

prop             | type   | deafult
-----------------|--------|--------
width            | number | 280
knobColor        | string | #4e63ea
label            | string | DEGREES
labelColor       | string | #272b77
progressColorFrom| string | #80C3F3
progressColorTo  | string | #4990E2
progressSize     | number | 6
trackColor       | string | #DDDEFB
trackSize        | number | 6
data             | array  | []
startIndex       | number | 0
onChange         | func   | value => {}


## license

[MIT License](https://opensource.org/licenses/MIT)
