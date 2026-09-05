import React from 'react';

export type GradientStop = {
    offset?: string;
    stopColor: string;
    stopOpacity?: number;
};

export type KnobPosition = 'top' | 'right' | 'bottom' | 'left' | number | string;

export interface CircularSliderProps {
    label?: string;
    ariaLabel?: string;
    width?: number;
    direction?: 1 | -1;
    min?: number;
    max?: number;
    initialValue?: number;
    value?: number;
    knobColor?: string;
    knobSize?: number;
    knobPosition?: KnobPosition;
    labelColor?: string;
    labelBottom?: boolean;
    labelFontSize?: string;
    valueFontSize?: string;
    appendToValue?: string;
    prependToValue?: string;
    verticalOffset?: string;
    hideLabelValue?: boolean;
    hideKnob?: boolean;
    hideKnobRing?: boolean;
    knobDraggable?: boolean;
    progressColorFrom?: string;
    progressColorTo?: string;
    progressGradient?: (string | GradientStop)[];
    useMouseAdditionalToTouch?: boolean;
    progressSize?: number;
    trackColor?: string;
    trackGradient?: (string | GradientStop)[];
    trackSize?: number;
    trackDraggable?: boolean;
    data?: (string | number)[];
    dataIndex?: number;
    progressLineCap?: 'round' | 'butt';
    renderLabelValue?: React.ReactNode;
    onChange?: (value: string | number) => void;
    isDragging?: (dragging: boolean) => void;
    children?: React.ReactNode;
    limitDragRange?: boolean;
    arcStart?: number;
    arcEnd?: number;
}

export interface CircularSliderHandle {
    refresh: () => void;
}

declare const CircularSlider: React.ForwardRefExoticComponent<
    CircularSliderProps & React.RefAttributes<CircularSliderHandle>
>;

export default CircularSlider;
