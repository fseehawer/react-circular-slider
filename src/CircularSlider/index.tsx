import React, {useCallback, useEffect, useReducer, useRef, useState} from 'react';
import reducer from '../redux/reducer';
import useEventListener from '../hooks/useEventListener';
import useIsServer from '../hooks/useIsServer';
import Knob from '../Knob';
import Labels from '../Labels';
import Svg from '../Svg';

const spreadDegrees = 360;
const knobOffsetConsts = {
    top: Math.PI / 2,
    right: 0,
    bottom: -Math.PI / 2,
    left: -Math.PI,
} as const;

export type KnobPosition = keyof typeof knobOffsetConsts | number | string;
export interface ContinuousOptions {
    enabled: boolean;
    clicks: number;
    interval: number;
}

export interface CircularSliderProps {
    label?: string;
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
    useMouseAdditionalToTouch?: boolean;
    progressSize?: number;
    trackColor?: string;
    trackSize?: number;
    trackDraggable?: boolean;
    data?: (string | number)[];
    dataIndex?: number;
    progressLineCap?: 'round' | 'butt';
    renderLabelValue?: React.ReactNode;
    onChange?: (value: string | number) => void;
    isDragging?: (dragging: boolean) => void;
    children?: React.ReactNode;
    continuous?: ContinuousOptions;
}

const getSliderRotation = (value: number) => (value < 0 ? -1 : 1);
const getRadians = (degrees: number) => (degrees * Math.PI) / 180;
const generateRange = (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => i + min);
const getKnobOffsetAmount = (knobPosition: KnobPosition): number => {
    if (typeof knobPosition === 'string' && knobPosition in knobOffsetConsts) {
        return knobOffsetConsts[knobPosition as keyof typeof knobOffsetConsts];
    }
    const parsed = typeof knobPosition === 'number' ? knobPosition : parseFloat(knobPosition);
    return getRadians(parsed);
};

const CircularSlider: React.FC<CircularSliderProps> = (props) => {
    const {
        label = 'ANGLE',
        width = 280,
        direction = 1,
        min = 0,
        max = 360,
        initialValue = 0,
        value = null,
        knobColor = '#4e63ea',
        knobSize = 36,
        knobPosition = 'top',
        labelColor = '#272b77',
        labelBottom = false,
        labelFontSize = '1rem',
        valueFontSize = '3rem',
        appendToValue = '',
        prependToValue = '',
        verticalOffset = '1.5rem',
        hideLabelValue = false,
        hideKnob = false,
        hideKnobRing = false,
        knobDraggable = true,
        progressColorFrom = '#80C3F3',
        progressColorTo = '#4990E2',
        useMouseAdditionalToTouch = false,
        progressSize = 8,
        trackColor = '#DDDEFB',
        trackSize = 8,
        trackDraggable = false,
        data = [],
        dataIndex = 0,
        progressLineCap = 'round',
        renderLabelValue = null,
        children,
        onChange = () => {},
        isDragging = () => {},
        continuous = { enabled: false, clicks: 120, interval: 1 },
    } = props;

    const continuousPreviousIndex = useRef(-1);
    const clicksPerLoop = continuous.clicks || Math.floor((max - min) / 3);

    const initialState = {
        mounted: false,
        isDragging: false,
        width,
        radius: width / 2,
        knobOffset: getKnobOffsetAmount(knobPosition),
        label: initialValue,
        data: continuous.enabled ? Array.from(Array(clicksPerLoop).keys()) : data,
        radians: 0,
        offset: 0,
        knob: { x: 0, y: 0 },
        dashFullArray: 0,
        dashFullOffset: 0,
    };

    const isServer = useIsServer();
    const [state, dispatch] = useReducer(reducer, initialState);
    const circularSlider = useRef<HTMLDivElement | null>(null);
    const svgFullPath = useRef<SVGPathElement | null>(null);
    const touchSupported = !isServer && 'ontouchstart' in window;
    const useMouse = !touchSupported || (touchSupported && useMouseAdditionalToTouch);
    const [valueFromParent, setValueFromParent] = useState<number | undefined>();

    const setKnobPosition = useCallback((radians: number) => {
        const radius = state.radius - trackSize / 2;
        const offsetRadians = radians + getKnobOffsetAmount(knobPosition);
        let degrees = ((offsetRadians > 0 ? offsetRadians : (2 * Math.PI) + offsetRadians) * spreadDegrees) / (2 * Math.PI);
        const dashOffset = (degrees / spreadDegrees) * state.dashFullArray;
        degrees = getSliderRotation(direction) === -1 ? spreadDegrees - degrees : degrees;
        const pointsInCircle = (state.data.length - 1) / spreadDegrees;
        const currentPoint = Math.round(degrees * pointsInCircle);

        const updateKnob = (labelValue: string | number) => {
            dispatch({
                type: 'setKnobPosition',
                payload: {
                    dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                    label: labelValue,
                    knob: {
                        x: radius * Math.cos(radians) + radius,
                        y: radius * Math.sin(radians) + radius,
                    },
                },
            });
        };

        if (continuous.enabled) {
            if (continuousPreviousIndex.current === -1) {
                continuousPreviousIndex.current = currentPoint;
                return;
            }
            if (continuousPreviousIndex.current === currentPoint) {
                updateKnob(Number(state.label));
                return;
            }

            const positiveDistance = (currentPoint - continuousPreviousIndex.current + clicksPerLoop) % clicksPerLoop;
            const negativeDistance = (continuousPreviousIndex.current - currentPoint + clicksPerLoop) % clicksPerLoop;
            const positive = positiveDistance <= Math.max(1, clicksPerLoop * 0.02);
            const negative = negativeDistance <= Math.max(1, clicksPerLoop * 0.02);

            if (!positive && !negative) {
                updateKnob(Number(state.label));
                continuousPreviousIndex.current = currentPoint;
                return;
            }

            const interval = continuous.interval ?? 1;
            const increment = positive ? interval * positiveDistance : -interval * negativeDistance;
            continuousPreviousIndex.current = currentPoint;
            const newValue = Math.min(max, Math.max(min, Number(state.label) + increment));
            onChange(newValue);
            updateKnob(newValue);
            return;
        }

        const labelValue = state.data[currentPoint];
        if (labelValue !== state.label) onChange(labelValue);
        updateKnob(labelValue);
    }, [state, direction, trackSize, knobPosition, continuous, max, min, onChange]);

    const onMouseDown = () => {
        isDragging(true);
        dispatch({ type: 'onMouseDown', payload: { isDragging: true } });
    };

    const onMouseUp = () => {
        if (continuous.enabled) continuousPreviousIndex.current = -1;
        state.isDragging && isDragging(false);
        dispatch({ type: 'onMouseUp', payload: { isDragging: false } });
    };

    const onMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
        if (!state.isDragging || (!knobDraggable && !trackDraggable) || (event.type === 'mousemove' && !useMouse)) return;
        event.preventDefault();

        const touch = (event as TouchEvent).type === 'touchmove' ? (event as TouchEvent).changedTouches[0] : null;
        const getOffset = (ref: React.RefObject<HTMLElement | null>): { top: number; left: number } => {
            const element = ref.current;
            if (!element) {
                return { top: 0, left: 0 };
            }
            const rect: DOMRect = element.getBoundingClientRect();
            const scrollLeft = window.pageXOffset ?? document.documentElement.scrollLeft ?? 0;
            const scrollTop = window.pageYOffset ?? document.documentElement.scrollTop ?? 0;
            return {
                top: rect.top + scrollTop,
                left: rect.left + scrollLeft,
            };
        };

        const offset = getOffset(circularSlider);
        const pageX = touch ? touch.pageX : (event as MouseEvent).pageX;
        const pageY = touch ? touch.pageY : (event as MouseEvent).pageY;
        const mouseX = pageX - (offset.left + state.radius);
        const mouseY = pageY - (offset.top + state.radius);
        const radians = Math.atan2(mouseY, mouseX);
        setKnobPosition(radians);
    }, [state.isDragging, knobDraggable, trackDraggable, useMouse, isServer, state.radius, setKnobPosition]);

    useEffect(() => {
        dispatch({
            type: 'init',
            payload: {
                mounted: true,
                data: state.data.length ? [...state.data] : [...generateRange(min, max)],
                dashFullArray: svgFullPath.current?.getTotalLength?.() ?? 0,
            },
        });
    }, [max, min]);

    useEffect(() => {
        const dataArrayLength = state.data.length;
        const index = dataIndex >= dataArrayLength ? dataArrayLength - 1 : dataIndex;
        const pointsInCircle = spreadDegrees / dataArrayLength;
        const offset = getRadians(pointsInCircle) / 2;
        dispatch({
            type: 'setInitialKnobPosition',
            payload: {
                radians: Math.PI / 2 - state.knobOffset,
                offset,
            },
        });
        const degrees = getSliderRotation(direction) * index * pointsInCircle;
        const radians = getRadians(degrees) - state.knobOffset;
        setKnobPosition(radians + offset * getSliderRotation(direction));
    }, [state.dashFullArray, state.knobOffset, state.data.length, dataIndex, direction]);

    useEffect(() => {
        if (typeof value === 'number') {
            setValueFromParent(value);
            const radians = getRadians(value);
            const offsetRadians = -state.knobOffset + radians * getSliderRotation(direction);
            setKnobPosition(offsetRadians);
        }
    }, [direction, state.knobOffset, value]);

    useEventListener('touchend', onMouseUp);
    useEventListener('mouseup', onMouseUp);
    useEventListener('touchmove', onMouseMove);
    useEventListener('mousemove', onMouseMove);

    const sanitizedLabel = label.replace(/[^a-zA-Z0-9-_]/g, '_');
    const sliderStyle: React.CSSProperties = {
        position: 'relative',
        display: 'inline-block',
        opacity: state.mounted ? 1 : 0,
        transition: 'opacity 1s ease-in',
    };

    return (
        <div style={sliderStyle} ref={circularSlider}>
            <Svg
                width={width}
                label={sanitizedLabel}
                direction={direction}
                strokeDasharray={state.dashFullArray}
                strokeDashoffset={state.dashFullOffset}
                svgFullPath={svgFullPath}
                progressSize={progressSize}
                progressColorFrom={progressColorFrom}
                progressColorTo={progressColorTo}
                progressLineCap={progressLineCap as 'round' | 'butt'}
                trackColor={trackColor}
                trackSize={trackSize}
                radiansOffset={state.radians}
                onMouseDown={trackDraggable ? onMouseDown : undefined}
                isDragging={state.isDragging}
            />
            <Knob
                isDragging={state.isDragging}
                knobPosition={state.knob}
                knobSize={knobSize}
                knobColor={knobColor}
                trackSize={trackSize}
                hideKnob={hideKnob}
                hideKnobRing={hideKnobRing}
                knobDraggable={knobDraggable}
                onMouseDown={onMouseDown}
            >
                {children}
            </Knob>
            {renderLabelValue ?? (
                <Labels
                    label={label}
                    labelColor={labelColor}
                    labelBottom={labelBottom}
                    labelFontSize={labelFontSize}
                    verticalOffset={verticalOffset}
                    valueFontSize={valueFontSize}
                    appendToValue={appendToValue}
                    prependToValue={prependToValue}
                    hideLabelValue={hideLabelValue}
                    value={`${valueFromParent ?? state.label}`}
                />
            )}
        </div>
    );
};

export default CircularSlider;
