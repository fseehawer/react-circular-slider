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
        progressColorFrom = '#80C3F3',
        progressColorTo = '#4990E2',
        progressSize = 6,
        trackColor = '#DDDEFB',
        trackSize = 6,
        customData = [],
        onChange = value => {}
    } = props;
    const [state, setState] = useState({
        mounted: false,
        isDragging: false,
        width: width,
        radius: width / 2,
        degrees: 0,
        knob: {
            radians: 0,
            x: 0,
            y: 0,
        },
        dashFullArray: 0,
        dashFullOffset: 0
    });

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
        const offsetRadians = radians + 1.5708; // offset by 90 degrees
        const degrees = (offsetRadians > 0 ? offsetRadians
            :
            ((2 * Math.PI) + offsetRadians)) * (360 / (2 * Math.PI));

        const dashOffset = state.dashFullArray - ((degrees / 360) * state.dashFullArray);
        let currentPoint = 0;

        if(customData.length) {
            const pointsInCircle = 360 / customData.length;
            currentPoint = Math.floor(degrees / pointsInCircle)
        }

        // props callback for parent
        onChange(customData.length ? customData[currentPoint] : Math.round(degrees));

        setState(prevState => ({
            ...prevState,
            dashFullOffset: dashOffset,
            degrees: customData.length ? customData[currentPoint] : Math.round(degrees),
            knob: {
                radians: radians,
                x: (radius * Math.cos(radians) + radius),
                y: (radius * Math.sin(radians) + radius),
            }
        }));
    }, [state.dashFullArray, state.radius, customData, onChange]);

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

    useEffect(() => {
        const pathLength = svgFullPath.current.getTotalLength();

        setState(prevState => ({
            ...prevState,
            mounted: true,
            dashFullArray: pathLength,
            dashFullOffset: pathLength,
            radius: state.radius,
            degrees: customData.length ? customData[0] : 0,
            knob: {
                radians: 0,
                x: state.radius,
                y: 0,
            },
        }));
    }, [offsetRelativeToDocument, state.radius, customData]);

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
            />
            <Knob
                isDragging={state.isDragging}
                knobPosition={{ x: state.knob.x, y: state.knob.y }}
                knobColor={knobColor}
                onMouseDown={onMouseDown}
            />
            <Labels
                labelColor={labelColor}
                label={label}
                value={`${state.degrees}`}
            />
        </div>
    );
};

export default CircularSlider;
