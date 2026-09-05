"use client";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useReducer, useRef, forwardRef } from 'react';
import reducer from '../redux/reducer';
import useEventListener from '../hooks/useEventListener';
import useIsServer from '../hooks/useIsServer';
import Knob from '../Knob';
import Labels from '../Labels';
import Svg, { type GradientStop } from '../Svg';

const spreadDegrees = 360;
const knobOffsetConsts = {
    top: Math.PI / 2,
    right: 0,
    bottom: -Math.PI / 2,
    left: -Math.PI,
} as const;

export type KnobPosition = keyof typeof knobOffsetConsts | number | string;
export type { GradientStop };

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

// Export the handle type for TypeScript users
export interface CircularSliderHandle {
    refresh: () => void;
}

const getSliderRotation = (value: number) => (value < 0 ? -1 : 1);
const getRadians = (degrees: number) => (degrees * Math.PI) / 180;
const generateRange = (min: number, max: number) => {
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        return [];
    }

    const step = min <= max ? 1 : -1;
    const length = Math.floor(Math.abs(max - min)) + 1;

    return Array.from({ length }, (_, i) => min + i * step);
};
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(min, value), max);
const normalizeDegrees = (degrees: number) => ((degrees % spreadDegrees) + spreadDegrees) % spreadDegrees;
const getArcSpan = (arcStart: number, arcEnd: number) => normalizeDegrees(arcEnd - arcStart) || spreadDegrees;
const getDistanceBetweenDegrees = (from: number, to: number) => {
    const distance = Math.abs(from - to);
    return Math.min(distance, spreadDegrees - distance);
};
const constrainDegreesToArc = (degrees: number, arcStart: number, arcEnd: number) => {
    const normalizedArcStart = normalizeDegrees(arcStart);
    const normalizedArcEnd = normalizeDegrees(arcEnd);
    const normalizedDegrees = normalizeDegrees(degrees);

    if (normalizedArcStart === normalizedArcEnd) {
        return normalizedDegrees;
    }

    if (normalizedArcEnd >= normalizedArcStart) {
        return clamp(normalizedDegrees, normalizedArcStart, normalizedArcEnd);
    }

    if (normalizedDegrees > normalizedArcEnd && normalizedDegrees < normalizedArcStart) {
        const distToStart = getDistanceBetweenDegrees(normalizedDegrees, normalizedArcStart);
        const distToEnd = getDistanceBetweenDegrees(normalizedDegrees, normalizedArcEnd);
        return distToStart <= distToEnd ? normalizedArcStart : normalizedArcEnd;
    }

    return normalizedDegrees;
};
const getDegreesInArc = (degrees: number, arcStart: number, arcEnd: number) => {
    const normalizedDegrees = normalizeDegrees(degrees);
    const normalizedArcStart = normalizeDegrees(arcStart);
    const normalizedArcEnd = normalizeDegrees(arcEnd);

    if (normalizedArcStart === normalizedArcEnd || normalizedArcEnd < normalizedArcStart) {
        return normalizedDegrees >= normalizedArcStart
            ? normalizedDegrees - normalizedArcStart
            : (spreadDegrees - normalizedArcStart) + normalizedDegrees;
    }

    return normalizedDegrees - normalizedArcStart;
};
const getKnobOffsetAmount = (knobPosition: KnobPosition): number => {
    if (typeof knobPosition === 'string' && knobPosition in knobOffsetConsts) {
        return knobOffsetConsts[knobPosition as keyof typeof knobOffsetConsts];
    }
    const parsed = typeof knobPosition === 'number' ? knobPosition : Number.parseFloat(knobPosition);
    return Number.isFinite(parsed) ? getRadians(parsed) : knobOffsetConsts.top;
};

type PointerEventLike = React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent;

const getPointerPagePosition = (event: PointerEventLike) => {
    if ('touches' in event && event.touches.length > 0) {
        return {
            pageX: event.touches[0].pageX,
            pageY: event.touches[0].pageY,
        };
    }

    if ('changedTouches' in event && event.changedTouches.length > 0) {
        return {
            pageX: event.changedTouches[0].pageX,
            pageY: event.changedTouches[0].pageY,
        };
    }

    const mouseEvent = event as React.MouseEvent | MouseEvent;

    return {
        pageX: mouseEvent.pageX,
        pageY: mouseEvent.pageY,
    };
};

const getElementOffset = (element: HTMLElement | null): { top: number; left: number } => {
    if (!element) {
        return { top: 0, left: 0 };
    }

    const rect = element.getBoundingClientRect();
    const scrollLeft = window.pageXOffset ?? document.documentElement.scrollLeft ?? 0;
    const scrollTop = window.pageYOffset ?? document.documentElement.scrollTop ?? 0;

    return {
        top: rect.top + scrollTop,
        left: rect.left + scrollLeft,
    };
};

const getRadiansFromPointerEvent = (
    event: PointerEventLike,
    element: HTMLElement | null,
    radius: number,
) => {
    const pointer = getPointerPagePosition(event);
    const offset = getElementOffset(element);
    const mouseX = pointer.pageX - (offset.left + radius);
    const mouseY = pointer.pageY - (offset.top + radius);

    return Math.atan2(mouseY, mouseX);
};

const CircularSlider = forwardRef<CircularSliderHandle, CircularSliderProps>((props, ref) => {
    const {
        label = 'ANGLE',
        ariaLabel,
        width = 280,
        direction = 1,
        min = 0,
        max = 360,
        initialValue = 0,
        value,
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
        progressGradient,
        useMouseAdditionalToTouch = false,
        progressSize = 8,
        trackColor = '#DDDEFB',
        trackGradient,
        trackSize = 8,
        trackDraggable = false,
        data = [],
        dataIndex = 0,
        progressLineCap = 'round',
        renderLabelValue,
        children,
        onChange = () => {},
        isDragging = () => {},
        limitDragRange = false,
        arcStart,
        arcEnd,
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

    // Store the last direction to detect changes
    const lastDirectionRef = useRef(direction);

    // Flag to track if a click operation is in progress
    const clickInProgressRef = useRef(false);

    // Flag to disable effects temporarily
    const disableEffectsRef = useRef(false);

    // Flag to prevent effect execution during specific operations
    const preventPositionResetRef = useRef(false);

    const dataArray = useMemo(
        () => (data.length > 0 ? [...data] : [...generateRange(min, max)]),
        [data, min, max]
    );

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
        if (state.data.length === 0) return;

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
        let degrees = normalizeDegrees((offsetRadians * spreadDegrees) / (2 * Math.PI));

        // Apply direction
        degrees = getSliderRotation(direction) === -1 ? spreadDegrees - degrees : degrees;

        // Handle arc constraints if defined
        if (typeof arcStart === 'number' && typeof arcEnd === 'number') {
            degrees = constrainDegreesToArc(degrees, arcStart, arcEnd);
            radians = getRadians(degrees) - getKnobOffsetAmount(knobPosition);
        }

        // Calculate dash offset and data index
        const dataArrayLength = state.data.length;
        const normalizedDegrees = normalizeDegrees(degrees);
        let dashOffsetValue: number;
        let dataPointIndex: number;

        if (typeof arcStart === 'number' && typeof arcEnd === 'number') {
            // Arc mode: map position within the arc to data and dash
            const arcProgress = clamp(getDegreesInArc(normalizedDegrees, arcStart, arcEnd) / getArcSpan(arcStart, arcEnd), 0, 1);
            dataPointIndex = Math.round(arcProgress * (dataArrayLength - 1));
            dashOffsetValue = state.dashFullArray - arcProgress * state.dashFullArray;
        } else {
            // Full circle mode
            const dashOffset = (degrees / spreadDegrees) * state.dashFullArray;
            dashOffsetValue = state.dashFullArray - dashOffset;
            dataPointIndex = Math.round((normalizedDegrees / spreadDegrees) * (dataArrayLength - 1));
        }

        // Ensure the index is within bounds
        const safeIndex = clamp(dataPointIndex, 0, dataArrayLength - 1);
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
            dashOffset: finalDashOffset,
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
    }, [state, trackSize, knobPosition, direction, onChange, dataIndex, arcStart, arcEnd]);

    const getRadiansForDataIndex = useCallback((targetDataIndex: number) => {
        const maxIndex = Math.max(state.data.length - 1, 0);
        const safeIndex = clamp(targetDataIndex, 0, maxIndex);
        const progress = maxIndex === 0 ? 0 : safeIndex / maxIndex;

        if (typeof arcStart === 'number' && typeof arcEnd === 'number') {
            const targetDegrees = normalizeDegrees(arcStart + progress * getArcSpan(arcStart, arcEnd));
            return getRadians(targetDegrees) - state.knobOffset;
        }

        return getRadians(progress * spreadDegrees * getSliderRotation(direction)) - state.knobOffset;
    }, [arcStart, arcEnd, direction, state.data.length, state.knobOffset]);

    const getCurrentDataIndex = useCallback(() => {
        const currentLabel = currentPositionRef.current?.label ?? state.label;
        const currentIndex = state.data.findIndex((item) => item === currentLabel);
        const maxIndex = Math.max(state.data.length - 1, 0);

        return currentIndex >= 0 ? currentIndex : clamp(dataIndex, 0, maxIndex);
    }, [dataIndex, state.data, state.label]);

    // Position the dataIndex to the correct position in the circle
    const positionForDataIndex = useCallback(() => {
        if (!state.mounted || state.data.length === 0) return;

        // Don't reposition if this position was set by dragging
        if (positionSetByDragRef.current) return;

        // Don't reposition if we're trying to prevent reset
        if (preventPositionResetRef.current) return;

        // Apply the position
        setKnobPosition(getRadiansForDataIndex(dataIndex));

        // Update last known data index
        lastDataIndexRef.current = dataIndex;
    }, [dataIndex, getRadiansForDataIndex, setKnobPosition, state.mounted, state.data.length]);

    const constrainRadiansToDataRange = useCallback((radians: number) => {
        if (!limitDragRange) {
            return radians;
        }

        let normalizedRadians = radians;
        while (normalizedRadians < 0) normalizedRadians += 2 * Math.PI;
        while (normalizedRadians >= 2 * Math.PI) normalizedRadians -= 2 * Math.PI;

        const degrees = (normalizedRadians * 180) / Math.PI;
        const adjustedDegrees = getSliderRotation(direction) === -1 ? spreadDegrees - degrees : degrees;
        const normalizedDegrees = normalizeDegrees(adjustedDegrees);
        const maxIndex = Math.max(state.data.length - 1, 0);
        const targetIndex = Math.round((normalizedDegrees / spreadDegrees) * maxIndex);
        const clampedIndex = clamp(targetIndex, 0, maxIndex);
        const clampedDegrees = maxIndex === 0 ? 0 : (clampedIndex / maxIndex) * spreadDegrees;
        const adjustedClampedDegrees = getSliderRotation(direction) === -1
            ? spreadDegrees - clampedDegrees
            : clampedDegrees;

        return getRadians(adjustedClampedDegrees) - getKnobOffsetAmount(knobPosition);
    }, [direction, knobPosition, limitDragRange, state.data.length]);

    const updatePositionFromPointer = useCallback((event: PointerEventLike) => {
        const radians = getRadiansFromPointerEvent(event, circularSlider.current, state.radius);
        setKnobPosition(constrainRadiansToDataRange(radians), true);
    }, [constrainRadiansToDataRange, setKnobPosition, state.radius]);

    const onMouseDown = (event: React.MouseEvent | React.TouchEvent) => {
        // Prevent clicking during ongoing drag operation
        if (clickInProgressRef.current) {
            event.preventDefault();
            event.stopPropagation();
            return false;
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

        return true;
    };

    const onTrackMouseDown = (event: React.MouseEvent | React.TouchEvent) => {
        if (onMouseDown(event)) {
            updatePositionFromPointer(event);
        }
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

    const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!knobDraggable && !trackDraggable) return;
        if (state.data.length === 0) return;

        const currentIndex = getCurrentDataIndex();
        let newIndex = currentIndex;

        switch (event.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                event.preventDefault();
                newIndex = Math.min(currentIndex + 1, state.data.length - 1);
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                event.preventDefault();
                newIndex = Math.max(currentIndex - 1, 0);
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                newIndex = state.data.length - 1;
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                return;
            default:
                return;
        }

        if (newIndex !== currentIndex) {
            setKnobPosition(getRadiansForDataIndex(newIndex));
        }
    }, [getCurrentDataIndex, getRadiansForDataIndex, knobDraggable, setKnobPosition, state.data.length, trackDraggable]);

    const onMouseMove = useCallback((event: MouseEvent | TouchEvent) => {
        if (!state.isDragging || (!knobDraggable && !trackDraggable) || (event.type === 'mousemove' && !useMouse)) return;

        // Prevent default to avoid browser behaviors
        event.preventDefault();
        updatePositionFromPointer(event);
    }, [state.isDragging, knobDraggable, trackDraggable, useMouse, updatePositionFromPointer]);

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

    // Handle direction changes after initialization
    useEffect(() => {
        if (!state.mounted || !initCompletedRef.current || disableEffectsRef.current || draggingRef.current) return;

        if (direction !== lastDirectionRef.current) {
            lastDirectionRef.current = direction;
            positionForDataIndex();
        }
    }, [direction, positionForDataIndex, state.mounted]);

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
    const displayValue = typeof value === 'number'
        ? `${value}`
        : typeof valueFromParentRef.current !== 'undefined'
            ? `${valueFromParentRef.current}`
            : `${state.label}`;
    const hasCustomData = data.length > 0;
    const numericDisplayValue = Number.parseFloat(displayValue);
    const ariaValueNow = hasCustomData
        ? getCurrentDataIndex()
        : Number.isFinite(numericDisplayValue)
            ? numericDisplayValue
            : undefined;

    return (
        <div
            style={sliderStyle}
            ref={circularSlider}
            role="slider"
            aria-label={`${ariaLabel ?? label}: ${displayValue}`}
            aria-valuemin={hasCustomData ? 0 : min}
            aria-valuemax={hasCustomData ? state.data.length - 1 : max}
            aria-valuenow={ariaValueNow}
            aria-valuetext={`${prependToValue}${displayValue}${appendToValue}`}
            tabIndex={0}
            onKeyDown={onKeyDown}
        >
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
                progressGradient={progressGradient}
                progressLineCap={progressLineCap}
                trackColor={trackColor}
                trackGradient={trackGradient}
                trackSize={trackSize}
                radiansOffset={state.radians}
                onMouseDown={trackDraggable ? onTrackMouseDown : undefined}
                isDragging={state.isDragging}
                arcStart={arcStart}
                arcEnd={arcEnd}
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
                onMouseDown={knobDraggable ? onMouseDown : undefined}
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
