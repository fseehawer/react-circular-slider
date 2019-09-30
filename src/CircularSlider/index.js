import React, {useState, useEffect, useCallback, useRef} from 'react';
import {StyleSheet, css} from 'aphrodite';
import Knob from "../Knob";
import Labels from "../Labels";
import Svg from "../Svg";

const touchSupported = ('ontouchstart' in window);

const SLIDER_EVENT = {
    DOWN: touchSupported ? 'touchstart' : 'mousedown',
    UP: touchSupported ? 'touchend' : 'mouseup',
    MOVE: touchSupported ? 'touchmove' : 'mousemove',
};

const CircularSlider = (props) => {
    const {
        label = 'DEGREES',
        width = 280,
        knobColor = '#4e63ea',
        labelColor = '#272b77',
        labelFontSize = '1rem',
        labelValueFontSize = '4rem',
        labelVerticalOffset = '2rem',
        labelHide = false,
        progressColorFrom = '#80C3F3',
        progressColorTo = '#4990E2',
        progressSize = 6,
        trackColor = '#DDDEFB',
        trackSize = 6,
        data = [],
        placeKnobAtIndex = 0,
        progressLineCap = 'round',
        onChange = value => {}
    } = props;
    const [state, setState] = useState({
        mounted: false,
        isDragging: false,
        width: width,
        radius: width / 2,
        label: 0,
        radians: 0,
        knob: {
            x: 0,
            y: 0,
        },
        dashFullArray: 0,
        dashFullOffset: 0
    });

    let radiansOffset = 1.571; // offset by 90 degrees
    let circularSlider = useRef(null);
    let svgFullPath = useRef(null);

    const offsetRelativeToDocument = useCallback(() => {
        const rect = circularSlider.current.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return {top: rect.top + scrollTop, left: rect.left + scrollLeft};
    }, []);

    const knobPosition = useCallback((radians) => {
        const radius = state.radius;
        const offsetRadians = radians + radiansOffset;
        const degrees = (offsetRadians > 0 ? offsetRadians
            :
            ((2 * Math.PI) + offsetRadians)) * (360 / (2 * Math.PI));

        const dashOffset = state.dashFullArray - ((degrees / 360) * state.dashFullArray);
        let currentPoint = 0;

        if(!!data.length) {
            const pointsInCircle = Math.ceil(360 / data.length);
            currentPoint = Math.floor(degrees / pointsInCircle);
        }

        const labelValue = !!data.length ? data[currentPoint] : Math.round(degrees);

        setState(prevState => ({
            ...prevState,
            dashFullOffset: dashOffset,
            label: labelValue,
            knob: {
                x: (radius * Math.cos(radians) + radius),
                y: (radius * Math.sin(radians) + radius),
            }
        }));

        // props callback for parent
        onChange(labelValue);
    }, [state.dashFullArray, state.radius, data, radiansOffset, onChange]);

    const onMouseDown = useCallback((event) => {
        setState(prevState => ({
            ...prevState,
            isDragging: true
        }));

    }, []);

    const onMouseMove = useCallback((event) => {
        event.preventDefault();

        if (!state.isDragging) return;

        let touch;
        if (event.type === 'touchmove') {
            touch = event.changedTouches[0];
        }

        const mouseXFromCenter = (event.type === 'touchmove' ? touch.pageX : event.pageX) -
            (offsetRelativeToDocument().left + state.radius);
        const mouseYFromCenter = (event.type === 'touchmove' ? touch.pageY : event.pageY) -
            (offsetRelativeToDocument().top + state.radius);

        const radians = Math.atan2(mouseYFromCenter, mouseXFromCenter);
        knobPosition(radians);
    }, [state.isDragging, state.radius, knobPosition, offsetRelativeToDocument]);

    const onMouseUp = (event) => {
        setState(prevState => ({
            ...prevState,
            isDragging: false
        }));
    };

    // Get svg path length on mount
    useEffect(() => {
        const pathLength = svgFullPath.current.getTotalLength();

        setState(prevState => ({
            ...prevState,
            mounted: true,
            dashFullArray: pathLength,
        }));
    }, []);

    useEffect(() => {
        const dataArrayLength = data.length;
        const knobPositionIndex = (placeKnobAtIndex > dataArrayLength - 1) ? dataArrayLength : placeKnobAtIndex;

        if(knobPositionIndex && !!dataArrayLength) {
            const pointsInCircle = Math.ceil(360 / dataArrayLength);
            const degrees = knobPositionIndex * pointsInCircle;
            const radians = (degrees * Math.PI / 180) - radiansOffset;

            return knobPosition(radians);
        }

        return knobPosition(-radiansOffset+0.005); // Add to offset to break boundary
        // eslint-disable-next-line
    }, [state.dashFullArray, placeKnobAtIndex, data.length, radiansOffset]);

    useEffect(() => {
        if (state.isDragging) {
            window.addEventListener(SLIDER_EVENT.MOVE, onMouseMove, {passive: false});
            window.addEventListener(SLIDER_EVENT.UP, onMouseUp, {passive: false});
            return () => {
                window.removeEventListener(SLIDER_EVENT.MOVE, onMouseMove);
                window.removeEventListener(SLIDER_EVENT.UP, onMouseUp);
            }
        }
    }, [state.isDragging, onMouseMove]);

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

    return (
        <div className={css(styles.circularSlider, state.mounted && styles.mounted)} ref={circularSlider}>
            <Svg
                width={width}
                label={label}
                strokeDasharray={state.dashFullArray}
                strokeDashoffset={state.dashFullOffset}
                progressColorFrom={progressColorFrom}
                progressColorTo={progressColorTo}
                trackColor={trackColor}
                progressSize={progressSize}
                trackSize={trackSize}
                svgFullPath={svgFullPath}
                progressLineCap={progressLineCap}
            />
            <Knob
                isDragging={state.isDragging}
                knobPosition={{ x: state.knob.x, y: state.knob.y }}
                knobColor={knobColor}
                onMouseDown={onMouseDown}
            />
            <Labels
                labelColor={labelColor}
                labelFontSize={labelFontSize}
                labelVerticalOffset={labelVerticalOffset}
                labelValueFontSize={labelValueFontSize}
                labelHide={labelHide}
                label={label}
                value={`${state.label}`}
            />
        </div>
    );
};

export default CircularSlider;
