// Definitions by: Augusto Lopez <https://github.com/augustolopez>
import React from 'react';
declare module '@fseehawer/react-circular-slider' {

  interface Continuous {
    enabled: boolean;
    clicks: number;
    interval: number;
  }

  type KnobPosition = 'top' | 'right' | 'bottom' | 'left';

  export interface CircularSliderProps {
    label?: string;
    width?: number;
    direction?: number;
    min?: number;
    max?: number;
    initialValue?: number;
    knobColor?: string;
    knobPosition?: KnobPosition | number;
    knobSize?: number;
    hideKnob?: boolean;
    knobDraggable?: boolean;
    labelColor?: string;
    labelBottom?: boolean;
    labelFontSize?: string;
    valueFontSize?: string;
    appendToValue?: string;
    renderLabelValue?: any;
    prependToValue?: string;
    verticalOffset?: string;
    hideLabelValue?: boolean;
    progressLineCap?: string;
    progressColorFrom?: string;
    progressColorTo?: string;
    useMouseAdditionalToTouch?: boolean;
    progressSize?: number;
    trackColor?: string;
    trackSize?: number;
    trackDraggable?: boolean;
    data?: any[];
    dataIndex?: number;
    onChange?: Function;
    children?: React.ReactNode;
    isDragging?: Function;
    continuous?: Continuous;
  }

  const CircularSlider: React.FC<CircularSliderProps>;
  export default CircularSlider;
}
