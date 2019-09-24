import React, {useState, useEffect, useCallback, useRef} from 'react';
import {StyleSheet, css} from 'aphrodite';

const touchSupported = ('ontouchstart' in window);

const SLIDER_EVENT = {
    DOWN: touchSupported ? 'touchstart' : 'mousedown',
    UP: touchSupported ? 'touchend' : 'mouseup',
    MOVE: touchSupported ? 'touchmove' : 'mousemove',
};

const CircularSlider = (props) => {
    const {
        label = 'Degrees',
        width = 280,
        knobSize = 36,
        knobRadius = 12,
        knobColor = '#4e63ea',
        labelColor = '#272b77',
        progressColors = {from: '#80C3F3', to: '#4990E2'},
        trackColor = '#DDDEFB',
        progressSize = 6,
        trackSize = 6,
        onChange
    } = props;
    const [state, setState] = useState({
        mounted: false,
        isDragging: false,
        width: 0,
        radius: width / 2,
        degrees: 0,
        knob: {
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
        return {top: rect.top + scrollTop, left: rect.left + scrollLeft, radius: rect.width / 2};
    }, []);

    const knobPosition = useCallback((radians) => {
        const radius = state.radius;
        const offsetRadians = radians + 1.5708; // offset by 90 degrees
        const degrees = (offsetRadians > 0 ? offsetRadians
            :
            ((2 * Math.PI) + offsetRadians)) * (360 / (2 * Math.PI));

        const dashOffset = state.dashFullArray - ((degrees / 360) * state.dashFullArray);

        // props callback for parent
        onChange(Math.round(degrees));

        setState(prevState => ({
            ...prevState,
            dashFullOffset: dashOffset,
            degrees: Math.round(degrees),
            knob: {
                radians: radians,
                x: (radius * Math.cos(radians) + radius),
                y: (radius * Math.sin(radians) + radius),
            }
        }));
    }, [state.dashFullArray, state.radius, onChange]);

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
            mounted: true,
            dashFullArray: pathLength,
            dashFullOffset: pathLength,
            radius: sliderOffset.radius,
            knob: {
                radians: 0,
                x: sliderOffset.radius,
                y: 0,
            },
        }));
    }, [offsetRelativeToDocument, state.width]);

    useEffect(() => {
        window.addEventListener("resize", onResize);

        if (state.isDragging) {
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

    const pulse_animation = {
        "0%": {transform: "scale(1)"},
        "50%": {transform: "scale(0.8)"},
        "100%": {transform: "scale(1)"}
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

        knob: {
            position: 'absolute',
            left: `-${knobSize/2}px`,
            top: `-${knobSize/2}px`,
            cursor: 'grab',
            zIndex: 3
        },

        svg: {
            position: 'relative',
            zIndex: 2
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
        },

        labels: {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: `${labelColor}`,
            zIndex: 1,
        },

        value: {
            fontSize: '4rem',
            marginBottom: '2rem'
        },

        description: {
            fontSize: '1rem',
            textTransform: 'uppercase'
        }
    });

    return (
        <div className={css(styles.circularSlider, state.mounted && styles.mounted)} ref={circularSlider}>
            <svg
                width={`${width}px`}
                height={`${width}px`}
                viewBox={`0 0 ${width} ${width}`}
                overflow="visible"
                className={css(styles.svg)}
            >
                <defs>
                    <linearGradient id="gradient" x1="100%" x2="0%">
                        <stop offset="0%" stopColor={progressColors.from}/>
                        <stop offset="100%" stopColor={progressColors.to}/>
                    </linearGradient>
                </defs>
                <circle
                    strokeWidth={trackSize}
                    fill="none"
                    stroke={trackColor}
                    cx={width / 2}
                    cy={width / 2}
                    r={width / 2}
                />
                <path
                    ref={svgFullPath}
                    strokeDasharray={state.dashFullArray}
                    strokeDashoffset={state.dashFullOffset}
                    strokeWidth={progressSize}
                    strokeLinecap="round"
                    fill="none"
                    stroke="url(#gradient)"
                    d={`
                        M ${width / 2}, ${width / 2}
                        m 0, -${width / 2}
                        a ${width / 2},${width / 2} 0 0,1 0,${width}
                        a -${width / 2},-${width / 2} 0 0,1 0,-${width}
                    `}/>
            </svg>
            <div
                style={{transform: `translate(${state.knob.x}px, ${state.knob.y}px)`}}
                className={css(styles.knob, state.isDragging && styles.drag, state.isDragging && styles.pause)}
                onMouseDown={onMouseDown}
                onTouchStart={onMouseDown}
            >
                <svg
                    width={`${knobSize}px`}
                    height={`${knobSize}px`}
                    viewBox={`0 0 ${knobSize} ${knobSize}`}
                >
                    <circle
                        className={css(!state.isDragging && styles.animation)}
                        fill={knobColor}
                        fillOpacity="0.2"
                        stroke="none"
                        cx={knobSize / 2}
                        cy={knobSize / 2}
                        r={knobSize / 2}
                    />
                    <circle
                        fill={knobColor}
                        stroke="none"
                        cx={knobSize / 2}
                        cy={knobSize / 2}
                        r={knobRadius}
                    />
                    <rect fill="#FFFFFF" x="14" y="14" width={knobSize / 4.5} height="1"/>
                    <rect fill="#FFFFFF" x="14" y="17" width={knobSize / 4.5} height="1"/>
                    <rect fill="#FFFFFF" x="14" y="20" width={knobSize / 4.5} height="1"/>
                </svg>
            </div>
            <div className={css(styles.labels)}>
                <div className={css(styles.description)}>{label}</div>
                <div className={css(styles.value)}><code>{state.degrees}°</code></div>
            </div>
        </div>
    );
};

export default CircularSlider;
