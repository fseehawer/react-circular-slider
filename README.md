# react-circular-slider

![](https://img.shields.io/badge/version-1.0.5-green.svg) ![](https://img.shields.io/badge/license-MIT-blue.svg)

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

## Props

prop             | type   | deafult
-----------------|--------|--------
width            | number | 280
knobColor        | string | #4e63ea
label            | string | Degrees°
labelColor       | string | #272b77
progressColors   | object | {from: '#80C3F3', to: '#4990E2'}
trackColor       | string | #DDDEFB
progressSize     | number | 6
trackSize        | number | 6
onChange         | func   | value => {}


## license

[MIT License](https://opensource.org/licenses/MIT)
