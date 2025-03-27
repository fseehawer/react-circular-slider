import React, {useCallback, useEffect, useReducer, useRef, useState, forwardRef, useImperativeHandle} from 'react';
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

// Export the handle type for TypeScript users
export interface CircularSliderHandle {
    refresh: () => void;
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

const CircularSlider = forwardRef<CircularSliderHandle, CircularSliderProps>((props, ref) => {
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
    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Reference to track dragging state internally
    const draggingRef = useRef(false);

    // We'll use this to store the last position when dragging ends
    const lastDragPositionRef = useRef<{
        radians: number;
        label: string | number;
        knob: { x: number; y: number };
        dashOffset: number;
    } | null>(null);

    // Initialize state with proper data
    const dataArray = continuous.enabled
        ? Array.from(Array(clicksPerLoop).keys())
        : data.length > 0
            ? [...data]
            : [...generateRange(min, max)];

    const initialState = {
        mounted: false,
        isDragging: false,
        width,
        radius: width / 2,
        knobOffset: getKnobOffsetAmount(knobPosition),
        label: initialValue,
        data: dataArray,
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
    const initCompletedRef = useRef(false);

    // Tracks whether we need to skip effects to prevent loops
    const skipEffectsRef = useRef(false);

    const setKnobPosition = useCallback((radians: number) => {
        // Calculate position
        const radius = state.radius - trackSize / 2;
        const offsetRadians = radians + getKnobOffsetAmount(knobPosition);
        let degrees = ((offsetRadians > 0 ? offsetRadians : (2 * Math.PI) + offsetRadians) * spreadDegrees) / (2 * Math.PI);
        const dashOffset = (degrees / spreadDegrees) * state.dashFullArray;
        degrees = getSliderRotation(direction) === -1 ? spreadDegrees - degrees : degrees;
        const pointsInCircle = Math.max(1, (state.data.length - 1) / spreadDegrees);
        const currentPoint = Math.round(degrees * pointsInCircle);

        // Ensure currentPoint is within bounds
        const safeCurrentPoint = Math.min(Math.max(0, currentPoint), state.data.length - 1);
        const labelValue = state.data[safeCurrentPoint];

        // Calculate the knob x,y position
        const knobXY = {
            x: radius * Math.cos(radians) + radius,
            y: radius * Math.sin(radians) + radius,
        };

        // Save this position in case we need to restore it
        lastDragPositionRef.current = {
            radians,
            label: labelValue,
            knob: knobXY,
            dashOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset
        };

        if (continuous.enabled) {
            if (continuousPreviousIndex.current === -1) {
                continuousPreviousIndex.current = currentPoint;
                return;
            }

            if (continuousPreviousIndex.current === currentPoint) {
                dispatch({
                    type: 'setKnobPosition',
                    payload: {
                        dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                        label: labelValue,
                        knob: knobXY,
                    },
                });
                return;
            }

            const positiveDistance = (currentPoint - continuousPreviousIndex.current + clicksPerLoop) % clicksPerLoop;
            const negativeDistance = (continuousPreviousIndex.current - currentPoint + clicksPerLoop) % clicksPerLoop;
            const positive = positiveDistance <= Math.max(1, clicksPerLoop * 0.02);
            const negative = negativeDistance <= Math.max(1, clicksPerLoop * 0.02);

            if (!positive && !negative) {
                dispatch({
                    type: 'setKnobPosition',
                    payload: {
                        dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                        label: labelValue,
                        knob: knobXY,
                    },
                });
                continuousPreviousIndex.current = currentPoint;
                return;
            }

            const interval = continuous.interval ?? 1;
            const increment = positive ? interval * positiveDistance : -interval * negativeDistance;
            continuousPreviousIndex.current = currentPoint;
            const newValue = Math.min(max, Math.max(min, Number(state.label) + increment));

            // Only trigger onChange when not in initial setup
            if (initCompletedRef.current) {
                onChange(newValue);
            }

            dispatch({
                type: 'setKnobPosition',
                payload: {
                    dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                    label: newValue,
                    knob: knobXY,
                },
            });
            return;
        }

        // Trigger onChange if needed and not in initial setup
        if (labelValue !== state.label && initCompletedRef.current) {
            onChange(labelValue);
        }

        // Update state with new position
        dispatch({
            type: 'setKnobPosition',
            payload: {
                dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                label: labelValue,
                knob: knobXY,
            },
        });
    }, [state, trackSize, knobPosition, direction, continuous, onChange, min, max]);

    const onMouseDown = () => {
        draggingRef.current = true;
        skipEffectsRef.current = true;

        isDragging(true);
        dispatch({ type: 'onMouseDown', payload: { isDragging: true } });
    };

    const onMouseUp = () => {
        if (continuous.enabled) {
            continuousPreviousIndex.current = -1;
        }

        if (state.isDragging) {
            isDragging(false);
            draggingRef.current = false;
            dispatch({ type: 'onMouseUp', payload: { isDragging: false } });

            // Ensure we maintain the last position
            if (lastDragPositionRef.current) {
                // Keep effects disabled a bit longer
                skipEffectsRef.current = true;

                // Re-enable effects after a short delay
                setTimeout(() => {
                    skipEffectsRef.current = false;
                }, 100);
            }
        }
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
    }, [state.isDragging, state.radius, knobDraggable, trackDraggable, useMouse, setKnobPosition]);

    // Function to recalculate and update values when resized
    const refresh = useCallback(() => {
        if (!circularSlider.current || !svgFullPath.current) return;

        // Don't refresh during dragging
        if (draggingRef.current) return;

        // Get new measurements
        const newWidth = width;
        const newRadius = newWidth / 2;

        // Update state with new dimensions
        dispatch({
            type: 'updateDimensions',
            payload: {
                width: newWidth,
                radius: newRadius,
                dashFullArray: svgFullPath.current.getTotalLength() || 0,
            },
        });

        // Reposition the knob based on the last position
        if (lastDragPositionRef.current) {
            setTimeout(() => {
                if (!draggingRef.current && lastDragPositionRef.current) {
                    setKnobPosition(lastDragPositionRef.current.radians);
                }
            }, 10);
        }
    }, [width, setKnobPosition]);

    // Expose the refresh method via ref
    useImperativeHandle(ref, () => ({
        refresh,
    }));

    // Initialize the component
    useEffect(() => {
        dispatch({
            type: 'init',
            payload: {
                mounted: true,
                dashFullArray: svgFullPath.current?.getTotalLength?.() ?? 0,
            },
        });
    }, []);

    // Initial position setup
    useEffect(() => {
        if (!state.mounted || state.dashFullArray === 0 || skipEffectsRef.current) return;

        // Calculate initial position
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

        // Only continue if we haven't already initialized
        if (!initCompletedRef.current) {
            const degrees = getSliderRotation(direction) * index * pointsInCircle;
            const radians = getRadians(degrees) - state.knobOffset;
            const positioningRadians = radians + offset * getSliderRotation(direction);

            setKnobPosition(positioningRadians);
            initCompletedRef.current = true;
        }
    }, [state.mounted, state.dashFullArray, state.knobOffset, direction, state.data.length, dataIndex, setKnobPosition]);

    // Handle external value prop changes
    useEffect(() => {
        if (!state.mounted || skipEffectsRef.current || draggingRef.current) return;

        if (typeof value === 'number') {
            setValueFromParent(value);
            const radians = getRadians(value);
            const offsetRadians = -state.knobOffset + radians * getSliderRotation(direction);

            // Use timeout to break the update cycle
            setTimeout(() => {
                if (!draggingRef.current) {
                    setKnobPosition(offsetRadians);
                }
            }, 0);
        }
    }, [direction, state.knobOffset, value, state.mounted, setKnobPosition]);

    // Setup ResizeObserver
    useEffect(() => {
        if (typeof ResizeObserver === 'undefined') return;

        const observeResize = () => {
            if (circularSlider.current) {
                resizeObserverRef.current = new ResizeObserver(() => {
                    if (!draggingRef.current) {
                        refresh();
                    }
                });
                resizeObserverRef.current.observe(circularSlider.current);
            }
        };

        observeResize();

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
        };
    }, [refresh]);

    // Window resize fallback
    useEffect(() => {
        const handleResize = () => {
            if (!draggingRef.current) {
                refresh();
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [refresh]);

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
});

export default CircularSlider;