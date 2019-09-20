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
        radius: 193,
        indicator: {
            scale: 1,
            radians: -1,
            x: 191,
            y: 0,
        }
    });

    const pulse_animation = {
        "0%": {transform: "scale(0.8)"},
        "50%": {transform: "scale(1)"},
        "100%": {transform: "scale(0.8)"}
    };

    const styles = StyleSheet.create({
        circularSlider: {
            position: 'relative',
        },

        indicator: {
            position: 'absolute',
            left: '-16px',
            top: '-16px',
        },

        animation: {
            animationDuration: '1500ms',
            transformOrigin: '50% 50%',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-out',
            animationName: [pulse_animation]
        }
    });

    let dashOffset = 0;
    let dashFullOffset = 0;
    let circularSlider = useRef(null);
    let svgPath = null;
    let svgFullPath = null;
    let mouseXFromCenter = 0;
    let mouseYFromCenter = 0;

    const onMouseDown = useCallback((event) => {
        setState(prevState => ({
            ...prevState,
            isDragging: true
        }));
        event.preventDefault();

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, []);

    const onMouseMove = useCallback((event) => {
        console.log('mouse move isDragging', state.isDragging);
        if(state.isDragging) return;
        event.stopPropagation();
        event.preventDefault();

        let touch;
        if (event.type === 'touchmove') {
            touch = event.changedTouches[0];
        }

        mouseXFromCenter = (event.type === 'touchmove' ? touch.pageX : event.pageX) -
            (offsetRelativeToDocument().left + state.radius);
        mouseYFromCenter = (event.type === 'touchmove' ? touch.pageY : event.pageY) -
            (offsetRelativeToDocument().top + state.radius);

        const radians = Math.atan2(mouseYFromCenter, mouseXFromCenter);
        indicatorPosition(radians);
        console.log(radians, 'radians')
    }, []);

    const indicatorPosition = (radians) => {
        const radius = state.radius;

            setState(prevState => ({
            ...prevState,
            indicator: {
                scale: 1,
                radians: radians,
                x: (radius * Math.cos(radians) + radius),
                y: (radius * Math.sin(radians) + radius),
            }
        }));
    };

    const onMouseUp = (event) => {
        console.log('mouse up')
        setState(prevState => ({
            ...prevState,
            isDragging: false
        }));
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    };

    const offsetRelativeToDocument = useCallback(() => {
        const rect = circularSlider.current.getBoundingClientRect();
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
    }, []);

    let transformStyles = null;

    useEffect( () => {
        dashOffset = svgPath.getTotalLength();
        dashFullOffset = svgFullPath.getTotalLength();

        console.log(transformStyles, 'transformStyles');

        return () => {

        }
    }, [state]);

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
                <path
                    ref={(path) => { svgPath = path }}
                    strokeDasharray={1}
                    strokeDashoffset={1}
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    stroke="url(#gradient)"
                    d="
                M 195, 195
                m 0, -193
                a 193,193 0 0,1 0,386
            "/>
                <path
                    strokeDasharray={1}
                    strokeDashoffset={1}
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                    stroke="url(#gradient2)"
                    d="
                M 195, 195
                m 0, 193
                a -193,-193 0 0,1 0,-386
            "/>
                <path
                    ref={(path) => { svgFullPath = path }}
                    strokeDasharray={1}
                    strokeDashoffset={1}
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
            <div style={{transform: `translate(${state.indicator.x}px, ${state.indicator.y}px)`}} className={css(styles.indicator)}>
                <svg
                    id="oneOff"
                    width="36px"
                    height="36px"
                    viewBox="0 0 36 36"
                    onMouseDown={onMouseDown}
                    className={css(styles.animation)}
                >
                    <circle fill="#5C4BEA" fillOpacity="0.2" stroke="none" cx="18" cy="18" r="18"/>
                    <circle fill="#5C4BEA" stroke="none" cx="18" cy="18" r="12"/>
                    <rect fill="#FFFFFF" x="13" y="14" width="9" height="1"/>
                    <rect fill="#FFFFFF" x="13" y="17" width="9" height="1"/>
                    <rect fill="#FFFFFF" x="13" y="20" width="9" height="1"/>
                </svg>
            </div>
            <p>Dragging: {state.isDragging ? 'true' : 'false'}</p>
        </div>
    );
};

export default CircularSlider;
