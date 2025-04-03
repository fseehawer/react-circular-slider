"use client";
import React, {useCallback, useEffect, useReducer, useRef, forwardRef, useImperativeHandle} from 'react';
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
    } = props;

    const resizeObserverRef = useRef<ResizeObserver | null>(null);

    // Reference to track dragging state internally
    const draggingRef = useRef(false);

    // Prevent reset issues by tracking the current value position
    const currentPositionRef = useRef<{
        radians: number;
        label: string | number;
        knob: { x: number; y: number };
        dashOffset: number;
    } | null>(null);

    // Store the last data index to detect changes
    const lastDataIndexRef = useRef(dataIndex);

    // Flag to track if a click operation is in progress
    const clickInProgressRef = useRef(false);

    // Flag to disable effects temporarily
    const disableEffectsRef = useRef(false);

    // Flag to prevent effect execution during specific operations
    const preventPositionResetRef = useRef(false);

    // Initialize state with proper data
    const dataArray = data.length > 0 ? [...data] : [...generateRange(min, max)];

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

    // Use ref for valueFromParent instead of state to prevent render cycles
    const valueFromParentRef = useRef<number | undefined>(undefined);
    const initCompletedRef = useRef(false);

    // Track if the component is currently mounted to prevent state updates after unmount
    const isMountedRef = useRef(false);

    // Track if the current position was set by dragging
    const positionSetByDragRef = useRef(false);

    // Add this to setKnobPosition to ensure the SVG path is correctly initialized at zero
    const setKnobPosition = useCallback((radians: number, fromDrag = false) => {
        // Skip updates if disabled
        if (disableEffectsRef.current && !fromDrag) return;

        // Track if this position was set by dragging
        if (fromDrag) {
            positionSetByDragRef.current = true;
            // Reset after a short delay
            setTimeout(() => {
                positionSetByDragRef.current = false;
            }, 300);
        }

        // Calculate position
        const radius = state.radius - trackSize / 2;
        const offsetRadians = radians + getKnobOffsetAmount(knobPosition);

        // Convert radians to degrees (0-360)
        let degrees = ((offsetRadians > 0 ? offsetRadians : (2 * Math.PI) + offsetRadians) * spreadDegrees) / (2 * Math.PI);

        // Apply direction
        degrees = getSliderRotation(direction) === -1 ? spreadDegrees - degrees : degrees;

        // Calculate dash offset for SVG path
        const dashOffset = (degrees / spreadDegrees) * state.dashFullArray;
        const dashOffsetValue = getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset;

        // Map the angle to an index in the data array
        // Ensure we map to the full 360 degrees range
        const dataArrayLength = state.data.length;
        const normalizedDegrees = (degrees + 360) % 360; // Ensure positive value 0-360
        const dataPointIndex = Math.round((normalizedDegrees / 360) * (dataArrayLength - 1));

        // Ensure the index is within bounds
        const safeIndex = Math.min(Math.max(0, dataPointIndex), dataArrayLength - 1);
        const labelValue = state.data[safeIndex];

        // Calculate the knob x,y position
        const knobXY = {
            x: radius * Math.cos(radians) + radius,
            y: radius * Math.sin(radians) + radius,
        };

        // Handle special case for zero value
        // Only apply the special case if we're at the true zero and not in the
        // middle of a drag operation
        const isZeroValue = (
            (!fromDrag && dataIndex === 0) ||
            (!fromDrag && safeIndex === 0 && dataArrayLength > 1) ||
            (typeof labelValue === 'number' && labelValue === 0 && !fromDrag) ||
            (typeof labelValue === 'string' && labelValue === '0' && !fromDrag)
        );

        // If it's a true zero value (not during dragging), set dashFullOffset appropriately
        const finalDashOffset = isZeroValue ? state.dashFullArray : dashOffsetValue;

        // Save this position as the current position
        currentPositionRef.current = {
            radians,
            label: labelValue,
            knob: knobXY,
            dashOffset: finalDashOffset
        };

        // Trigger onChange if needed and not in initial setup
        if (labelValue !== state.label && initCompletedRef.current) {
            onChange(labelValue);
        }

        // Update state with new position
        dispatch({
            type: 'setKnobPosition',
            payload: {
                dashFullOffset: finalDashOffset,
                label: labelValue,
                knob: knobXY,
            },
        });
    }, [state, trackSize, knobPosition, direction, onChange, dataIndex]);

    // Position the dataIndex to the correct position in the circle
    const positionForDataIndex = useCallback(() => {
        if (!state.mounted || state.data.length === 0) return;

        // Don't reposition if this position was set by dragging
        if (positionSetByDragRef.current) return;

        // Don't reposition if we're trying to prevent reset
        if (preventPositionResetRef.current) return;

        // Ensure dataIndex is within bounds
        const dataIndexSafe = Math.min(Math.max(0, dataIndex), state.data.length - 1);

        // Calculate the angle in degrees based on the dataIndex
        // Map the dataIndex to the full 360-degree circle
        const degrees = (dataIndexSafe / (state.data.length - 1)) * 360 * getSliderRotation(direction);

        // Convert to radians and adjust for knob offset
        const radians = getRadians(degrees) - state.knobOffset;

        // Apply the position
        setKnobPosition(radians);

        // Update last known data index
        lastDataIndexRef.current = dataIndex;
    }, [dataIndex, state.mounted, state.data.length, state.knobOffset, direction, setKnobPosition]);

    const onMouseDown = (event: React.MouseEvent | React.TouchEvent) => {
        // Prevent clicking during ongoing drag operation
        if (clickInProgressRef.current) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        // Set flags to track dragging state
        draggingRef.current = true;
        disableEffectsRef.current = true;
        clickInProgressRef.current = true;
        preventPositionResetRef.current = true;

        // Notify parent
        isDragging(true);

        // Update component state
        dispatch({ type: 'onMouseDown', payload: { isDragging: true } });

        // Reset click flag after a short delay
        setTimeout(() => {
            clickInProgressRef.current = false;
        }, 100);
    };

    const onMouseUp = () => {
        // Only process if we're actually dragging
        if (state.isDragging) {
            // Update dragging state
            isDragging(false);
            draggingRef.current = false;

            // Update component state
            dispatch({ type: 'onMouseUp', payload: { isDragging: false } });

            // Keep prevention active for a bit longer to avoid reset on release
            setTimeout(() => {
                if (isMountedRef.current) {
                    disableEffectsRef.current = false;

                    // Keep preventing position reset for longer
                    setTimeout(() => {
                        if (isMountedRef.current) {
                            preventPositionResetRef.current = false;
                        }
                    }, 250);
                }
            }, 50);
        }
    };

    const onMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
        if (!state.isDragging || (!knobDraggable && !trackDraggable) || (event.type === 'mousemove' && !useMouse)) return;

        // Prevent default to avoid browser behaviors
        event.preventDefault();

        // Get mouse/touch position
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

        // Calculate mouse position relative to component center
        const offset = getOffset(circularSlider);
        const pageX = touch ? touch.pageX : (event as MouseEvent).pageX;
        const pageY = touch ? touch.pageY : (event as MouseEvent).pageY;
        const mouseX = pageX - (offset.left + state.radius);
        const mouseY = pageY - (offset.top + state.radius);

        // Convert to radians
        const radians = Math.atan2(mouseY, mouseX);

        // Apply the new position, specifying it comes from drag
        setKnobPosition(radians, true);
    }, [state.isDragging, state.radius, knobDraggable, trackDraggable, useMouse, setKnobPosition]);

    // Function to recalculate and update values when resized
    const refresh = useCallback(() => {
        if (!circularSlider.current || !svgFullPath.current || !isMountedRef.current) return;

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
                dashFullArray: svgFullPath.current?.getTotalLength() || 0,
            },
        });

        // Reposition the knob based on the last position
        if (currentPositionRef.current) {
            // Small timeout to let the dimensions update first
            setTimeout(() => {
                if (!draggingRef.current && currentPositionRef.current && isMountedRef.current) {
                    disableEffectsRef.current = true;

                    // Use the current position's radians to preserve exact position
                    setKnobPosition(currentPositionRef.current?.radians ?? 0);

                    // Re-enable effects after a short delay
                    setTimeout(() => {
                        if (isMountedRef.current) {
                            disableEffectsRef.current = false;
                        }
                    }, 50);
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
        isMountedRef.current = true;
        disableEffectsRef.current = true;

        dispatch({
            type: 'init',
            payload: {
                mounted: true,
                dashFullArray: svgFullPath.current?.getTotalLength?.() ?? 0,
            },
        });

        // Re-enable effects after initialization
        setTimeout(() => {
            if (isMountedRef.current) {
                disableEffectsRef.current = false;
            }
        }, 100);

        // Cleanup on unmount
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Setup initial position
    useEffect(() => {
        if (!state.mounted || state.dashFullArray === 0 || disableEffectsRef.current || initCompletedRef.current) return;

        // Initialize with offset configuration
        dispatch({
            type: 'setInitialKnobPosition',
            payload: {
                radians: Math.PI / 2 - state.knobOffset,
                offset: 0,
            },
        });

        // Initialize with correct data index position
        positionForDataIndex();

        // Mark initialization as complete
        initCompletedRef.current = true;
    }, [state.mounted, state.dashFullArray, state.knobOffset, positionForDataIndex]);

    // Handle dataIndex changes after initialization
    useEffect(() => {
        if (!state.mounted || !initCompletedRef.current || disableEffectsRef.current || draggingRef.current) return;

        // Only update if the dataIndex actually changed
        if (dataIndex !== lastDataIndexRef.current) {
            // Update position when dataIndex changes
            positionForDataIndex();
        }
    }, [dataIndex, positionForDataIndex, state.mounted]);

    // Handle external value prop changes
    useEffect(() => {
        if (!state.mounted || disableEffectsRef.current || draggingRef.current || preventPositionResetRef.current) return;

        if (typeof value === 'number' && value !== valueFromParentRef.current) {
            valueFromParentRef.current = value;
            const radians = getRadians(value);
            const offsetRadians = -state.knobOffset + radians * getSliderRotation(direction);

            // Use a small delay to break the update cycle
            setTimeout(() => {
                if (!draggingRef.current && isMountedRef.current && !preventPositionResetRef.current) {
                    setKnobPosition(offsetRadians);
                }
            }, 0);
        }
    }, [direction, state.knobOffset, value, state.mounted, setKnobPosition]);

    // Setup ResizeObserver to watch for container size changes
    useEffect(() => {
        if (typeof ResizeObserver === 'undefined') return;

        const observeResize = () => {
            if (circularSlider.current) {
                resizeObserverRef.current = new ResizeObserver(() => {
                    if (!draggingRef.current && isMountedRef.current) {
                        refresh();
                    }
                });
                resizeObserverRef.current?.observe(circularSlider.current);
            }
        };

        observeResize();

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current?.disconnect();
            }
        };
    }, [refresh]);

    // Window resize fallback
    useEffect(() => {
        const handleResize = () => {
            if (!draggingRef.current && isMountedRef.current) {
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
        width: 'max-content',
        opacity: state.mounted ? 1 : 0,
        transition: 'opacity 1s ease-in',
    };

    // Prepare display value from either parent prop or internal state
    const displayValue = typeof valueFromParentRef.current !== 'undefined'
        ? `${valueFromParentRef.current}`
        : `${state.label}`;

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
                    value={displayValue}
                />
            )}
        </div>
    );
});

export default CircularSlider;