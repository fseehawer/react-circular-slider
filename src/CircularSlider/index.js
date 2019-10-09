import React, {useEffect, useReducer, useCallback, useRef, memo} from 'react';
import PropTypes from "prop-types";
import {StyleSheet, css} from 'aphrodite';
import reducer from "./reducer";
import useEventListener from "./useEventListener";
import Knob from "../Knob";
import Labels from "../Labels";
import Svg from "../Svg";

const touchSupported = ('ontouchstart' in window);
const SLIDER_EVENT = {
    DOWN: touchSupported ? 'touchstart' : 'mousedown',
    UP: touchSupported ? 'touchend' : 'mouseup',
    MOVE: touchSupported ? 'touchmove' : 'mousemove',
};

const offset = 0.005;
const knobOffset = {
    top: Math.PI / 2,
    right: 0,
    bottom: -Math.PI / 2,
    left: -Math.PI
};

const getSliderRotation = (number) => {
    if(number < 0) return -1;
    return 1;
};

const generateRange = (min, max) => {
    let rangeOfNumbers = [];
    for(let i = min; i <= max; i++) {
        rangeOfNumbers.push(i);
    }
    return rangeOfNumbers;
};

const offsetRelativeToDocument = (ref) => {
    const rect = ref.current.getBoundingClientRect();
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {top: rect.top + scrollTop, left: rect.left + scrollLeft};
};

const styles = StyleSheet.create({
    circularSlider: {
        position: 'relative',
        display: 'inline-block',
        opacity: 0,
        transition: 'opacity 1s ease-in'
    },

    mounted: {
        opacity: 1
    },
});

const CircularSlider = memo(({
        label = 'ANGLE',
        width = 280,
        direction = 1,
        min = 0,
        max = 360,
        knobColor = '#4e63ea',
        knobPosition = 'top',
        labelColor = '#272b77',
        labelFontSize = '1rem',
        valueFontSize = '4rem',
        appendToValue = '',
        verticalOffset = '2rem',
        hideLabelValue = false,
        progressColorFrom = '#80C3F3',
        progressColorTo = '#4990E2',
        progressSize = 6,
        trackColor = '#DDDEFB',
        trackSize = 6,
        data = [],
        dataIndex = 0,
        progressLineCap = 'round',
        children,
        onChange = value => {},
    }) => {
    const initialState = {
        mounted: false,
        isDragging: false,
        width: width,
        radius: width / 2,
        knobPosition: knobPosition,
        label: 0,
        data: data,
        radians: 0,
        knob: {
            x: 0,
            y: 0,
        },
        dashFullArray: 0,
        dashFullOffset: 0
    };

    const [state, dispatch] = useReducer(reducer, initialState);
    const circularSlider = useRef(null);
    const svgFullPath = useRef(null);

    const setKnobPosition = useCallback((radians) => {
        const radius = state.radius;
        const offsetRadians = radians + knobOffset[knobPosition];
        let degrees = (offsetRadians > 0 ? offsetRadians
            :
            ((2 * Math.PI) + offsetRadians)) * (360 / (2 * Math.PI));
        // change direction
        const dashOffset = (degrees / 360) * state.dashFullArray;
        degrees = (getSliderRotation(direction) === -1 ? 360 - degrees : degrees);

        const pointsInCircle = state.data.length / 361;
        const currentPoint = Math.floor(degrees * pointsInCircle);

        if(state.data[currentPoint] !== state.label) {
            // props callback for parent
            onChange(state.data[currentPoint]);
        }

        dispatch({
            type: 'setKnobPosition',
            payload: {
                dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                label: state.data[currentPoint],
                knob: {
                    x: (radius * Math.cos(radians) + radius),
                    y: (radius * Math.sin(radians) + radius),
                }
            }
        });
    }, [state.dashFullArray, state.radius, state.data, state.label, knobPosition, direction, onChange]);

    const onMouseDown = () => {
        dispatch({
            type: 'onMouseDown',
            payload: {
                isDragging: true
            }
        });
    };

    const onMouseUp = () => {
        dispatch({
            type: 'onMouseUp',
            payload: {
                isDragging: false
            }
        });
    };

    const onMouseMove = useCallback((event) => {
        if (!state.isDragging) return;

        event.preventDefault();

        let touch;
        if (event.type === 'touchmove') {
            touch = event.changedTouches[0];
        }

        const mouseXFromCenter = (event.type === 'touchmove' ? touch.pageX : event.pageX) -
            (offsetRelativeToDocument(circularSlider).left + state.radius);
        const mouseYFromCenter = (event.type === 'touchmove' ? touch.pageY : event.pageY) -
            (offsetRelativeToDocument(circularSlider).top + state.radius);

        const radians = Math.atan2(mouseYFromCenter, mouseXFromCenter);
        setKnobPosition(radians);
    }, [state.isDragging, state.radius, setKnobPosition]);

    // Get svg path length on mount
    useEffect(() => {
        dispatch({
            type: 'init',
            payload: {
                mounted: true,
                data: state.data.length ? [...state.data] : [...generateRange(min, max)],
                dashFullArray: svgFullPath.current.getTotalLength ? svgFullPath.current.getTotalLength() : 0,
            }
        });
        // eslint-disable-next-line
    }, [max, min]);

    useEffect(() => {
        const dataArrayLength = data.length;
        const knobPositionIndex = (dataIndex > dataArrayLength - 1) ? dataArrayLength - 1 : dataIndex;

        dispatch({
            type: 'setInitialKnobPosition',
            payload: {
                radians: Math.PI / 2 - knobOffset[state.knobPosition],
            }
        });

        if(knobPositionIndex && !!dataArrayLength) {
            const pointsInCircle = Math.ceil(360 / dataArrayLength);
            const degrees = getSliderRotation(direction) * knobPositionIndex * pointsInCircle;
            const radians = (degrees * Math.PI / 180) - knobOffset[state.knobPosition];

            return setKnobPosition(radians+(offset*getSliderRotation(direction)));
        }

        setKnobPosition(-knobOffset[state.knobPosition]+(offset*getSliderRotation(direction)));
        // eslint-disable-next-line
    }, [state.dashFullArray, state.knobPosition, dataIndex, direction, data.length]);

    useEventListener(SLIDER_EVENT.MOVE, onMouseMove);
    useEventListener(SLIDER_EVENT.UP, onMouseUp);

    return (
        <div className={css(styles.circularSlider, state.mounted && styles.mounted)} ref={circularSlider}>
            <Svg
                width={width}
                label={label}
                direction={direction}
                strokeDasharray={state.dashFullArray}
                strokeDashoffset={state.dashFullOffset}
                svgFullPath={svgFullPath}
                progressSize={progressSize}
                progressColorFrom={progressColorFrom}
                progressColorTo={progressColorTo}
                progressLineCap={progressLineCap}
                trackColor={trackColor}
                trackSize={trackSize}
                radiansOffset={state.radians}
            />
            <Knob
                isDragging={state.isDragging}
                knobPosition={{ x: state.knob.x, y: state.knob.y }}
                knobColor={knobColor}
                onMouseDown={onMouseDown}
            >
                {children}
            </Knob>
            <Labels
                label={label}
                labelColor={labelColor}
                labelFontSize={labelFontSize}
                verticalOffset={verticalOffset}
                valueFontSize={valueFontSize}
                appendToValue={appendToValue}
                hideLabelValue={hideLabelValue}
                value={`${state.label}`}
            />
        </div>
    );
});

CircularSlider.propTypes = {
    label: PropTypes.string,
    width: PropTypes.number,
    direction: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    knobColor: PropTypes.string,
    knobPosition: PropTypes.string,
    labelColor: PropTypes.string,
    labelFontSize: PropTypes.string,
    valueFontSize: PropTypes.string,
    appendToValue: PropTypes.string,
    verticalOffset: PropTypes.string,
    hideLabelValue: PropTypes.bool,
    progressLineCap: PropTypes.string,
    progressColorFrom: PropTypes.string,
    progressColorTo: PropTypes.string,
    progressSize: PropTypes.number,
    trackColor: PropTypes.string,
    trackSize: PropTypes.number,
    data: PropTypes.array,
    dataIndex: PropTypes.number,
    onChange: PropTypes.func
};

export default CircularSlider;
