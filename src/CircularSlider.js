import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import {StyleSheet, css} from 'aphrodite';

const touchSupported = ('ontouchstart' in window);

const SLIDER_EVENT = {
    DOWN: touchSupported ? 'touchstart' : 'mousedown',
    UP: touchSupported ? 'touchend' : 'mouseup',
    MOVE: touchSupported ? 'touchmove' : 'mousemove',
};

const CircularSlider = () => {
    const [state, setState] = useState({
        isDragging: false,
        radius: 193,
        indicator: {
            scale: 1,
            radians: -1,
            x: 191,
            y: 0,
        },
        dashFullArray: 0,
        dashFullOffset: 0
    });

    const pulse_animation = {
        "0%": {transform: "scale(1)"},
        "50%": {transform: "scale(0.8)"},
        "100%": {transform: "scale(1)"}
    };

    const styles = StyleSheet.create({
        circularSlider: {
            position: 'relative',
        },

        indicator: {
            position: 'absolute',
            left: '-16px',
            top: '-16px',
            cursor: 'grab',
            touchAction: 'none'
        },

        drag: {
            cursor: 'grabbing'
        },

        pause: {
            animationPlayState: 'paused',
        },

        animation: {
            animationDuration: '1500ms',
            transformOrigin: '50% 50%',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-out',
            animationName: [pulse_animation]
        }
    });

    let circularSlider = useRef(null);
    let svgFullPath = useRef(null);

    const offsetRelativeToDocument = useCallback(() => {
        const rect = circularSlider.current.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
    }, []);

    const indicatorPosition = useCallback((radians) => {
        const radius = state.radius;
        const offsetRadians = radians + 1.5708; // offset by 90 degrees
        const degrees = (offsetRadians > 0 ? offsetRadians
            :
            ((2 * Math.PI) + offsetRadians)) * (360 / (2 * Math.PI));

        const dashOffset = state.dashFullArray - ((degrees / 360) * state.dashFullArray);

        setState(prevState => ({
            ...prevState,
            dashFullOffset: dashOffset,
            indicator: {
                scale: 1,
                radians: radians,
                x: (radius * Math.cos(radians) + radius),
                y: (radius * Math.sin(radians) + radius),
            }
        }));
    }, [state.dashFullArray, state.radius]);

    const onMouseDown = useCallback((event) => {
        setState(prevState => ({
            ...prevState,
            isDragging: true
        }));

    }, []);

    const onMouseMove = useCallback((event) => {
        if(!state.isDragging) return;
        event.preventDefault();
        event.stopImmediatePropagation();

        let touch;
        if (event.type === 'touchmove') {
            touch = event.changedTouches[0];
        }

        const mouseXFromCenter = (event.type === 'touchmove' ? touch.pageX : event.pageX) -
            (offsetRelativeToDocument().left + state.radius);
        const mouseYFromCenter = (event.type === 'touchmove' ? touch.pageY : event.pageY) -
            (offsetRelativeToDocument().top + state.radius);

        const radians = Math.atan2(mouseYFromCenter, mouseXFromCenter);
        indicatorPosition(radians);
    }, [state.isDragging, state.radius, indicatorPosition, offsetRelativeToDocument]);

    const onMouseUp = (event) => {
        setState(prevState => ({
            ...prevState,
            isDragging: false
        }));
    };

    useLayoutEffect(() => {
        setState(prevState => ({
            ...prevState,
            dashFullArray: svgFullPath.current.getTotalLength(),
            dashFullOffset: svgFullPath.current.getTotalLength(),
        }));
    }, []);

    useEffect( () => {
        if(state.isDragging) {
            document.addEventListener(SLIDER_EVENT.MOVE, onMouseMove);
            document.addEventListener(SLIDER_EVENT.UP, onMouseUp);
            return () => {
                document.removeEventListener(SLIDER_EVENT.MOVE, onMouseMove);
                document.removeEventListener(SLIDER_EVENT.UP, onMouseUp);
            }
        }
    }, [state.isDragging, onMouseMove]);

    return (
        <div className={css(styles.circularSlider)} ref={circularSlider}>
            <svg width="390px" height="390px" viewBox="0 0 390 390">
                <defs>
                    <linearGradient id="gradient" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#80C3F3"/>
                        <stop offset="100%" stopColor="#4990E2"/>
                    </linearGradient>
                    <linearGradient id="gradient2" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#4990E2"/>
                        <stop offset="100%" stopColor="#80C3F3"/>
                    </linearGradient>
                </defs>
                <circle strokeWidth={4} fill="none" stroke="#DDDEFB" cx={195} cy={195} r={state.radius} />
                <path
                    ref={svgFullPath}
                    strokeDasharray={state.dashFullArray}
                    strokeDashoffset={state.dashFullOffset}
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    stroke="url(#gradient)"
                    d="
                        M 195, 195
                        m 0, -193
                        a 193,193 0 0,1 0,386
                        a -193,-193 0 0,1 0,-386
                    "/>
            </svg>
            <div
                style={{transform: `translate(${state.indicator.x}px, ${state.indicator.y}px)`}}
                className={css(styles.indicator, state.isDragging && styles.drag, state.isDragging && styles.pause)}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
            >
                <svg
                    width="36px"
                    height="36px"
                    viewBox="0 0 36 36"
                >
                    <circle fill="#5C4BEA" fillOpacity="0.2" stroke="none" cx="18" cy="18" r="18" className={css(!state.isDragging && styles.animation)} />
                    <circle fill="#5C4BEA" stroke="none" cx="18" cy="18" r="12" />
                    <rect fill="#FFFFFF" x="13" y="14" width="9" height="1" />
                    <rect fill="#FFFFFF" x="13" y="17" width="9" height="1" />
                    <rect fill="#FFFFFF" x="13" y="20" width="9" height="1" />
                </svg>
            </div>
        </div>
    );
};

export default CircularSlider;
