import React, { useState, useEffect, useCallback, useRef } from 'react';
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
        width: 0,
        radius: 0,
        indicator: {
            scale: 1,
            radians: -1,
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
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft, radius: rect.width / 2 };
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
        event.preventDefault();

        setState(prevState => ({
            ...prevState,
            isDragging: true
        }));

    }, []);

    const onMouseMove = useCallback((event) => {
        event.preventDefault();

        if(!state.isDragging) return;

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
        event.preventDefault();

        setState(prevState => ({
            ...prevState,
            isDragging: false
        }));
    };

    const onResize = (event) => {
        setState(prevState => ({
            ...prevState,
            width: event.currentTarget.innerWidth
        }));
    };

    useEffect(() => {
        const sliderOffset = offsetRelativeToDocument();
        const pathLength = svgFullPath.current.getTotalLength();

        setState(prevState => ({
            ...prevState,
            dashFullArray: pathLength,
            dashFullOffset: pathLength,
            radius: sliderOffset.radius,
            indicator: {
                scale: 1,
                radians: 0,
                x: sliderOffset.radius,
                y: 0,
            },
        }));
    }, [offsetRelativeToDocument, state.width]);

    useEffect( () => {
        window.addEventListener("resize", onResize);

        if(state.isDragging) {
            window.addEventListener(SLIDER_EVENT.MOVE, onMouseMove, {passive: false});
            window.addEventListener(SLIDER_EVENT.UP, onMouseUp, {passive: false});
            return () => {
                window.removeEventListener(SLIDER_EVENT.MOVE, onMouseMove);
                window.removeEventListener(SLIDER_EVENT.UP, onMouseUp);
            }
        }

        return () => {
            window.removeEventListener("resize", onResize);
        }
    }, [state.isDragging, onMouseMove]);

    return (
        <div className={css(styles.circularSlider)} ref={circularSlider}>
            <svg width="390px" height="390px" viewBox="0 0 390 390" overflow="visible" className={css(styles.svg)}>
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
                <circle strokeWidth={4} fill="none" stroke="#DDDEFB" cx={195} cy={195} r={195} />
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
                        m 0, -195
                        a 195,195 0 0,1 0,390
                        a -195,-195 0 0,1 0,-390
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
        left: '-18px',
        top: '-18px',
        cursor: 'grab',
    },

    svg: {
        width: '100%',
        height: 'auto'
    },

    drag: {
        cursor: 'grabbing',
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

export default CircularSlider;
