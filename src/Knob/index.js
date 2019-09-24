import React from 'react';
import {StyleSheet, css} from 'aphrodite';

const Knob = (props) => {
    const {
        isDragging,
        knobPosition,
        knobColor,
        knobRadius = 12,
        knobSize = 36,
        onMouseDown,
    } = props;

    const pulse_animation = {
        "0%": {transform: "scale(1)"},
        "50%": {transform: "scale(0.8)"},
        "100%": {transform: "scale(1)"}
    };

    const styles = StyleSheet.create({
        knob: {
            position: 'absolute',
            left: `-${knobSize/2}px`,
            top: `-${knobSize/2}px`,
            cursor: 'grab',
            zIndex: 3
        },

        dragging: {
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
    });

    return (
        <div
            style={{transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`}}
            className={css(styles.knob, isDragging && styles.dragging)}
            onMouseDown={onMouseDown}
            onTouchStart={onMouseDown}
        >
            <svg
                width={`${knobSize}px`}
                height={`${knobSize}px`}
                viewBox={`0 0 ${knobSize} ${knobSize}`}
            >
                <circle
                    className={css(styles.animation, isDragging && styles.pause)}
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
                <rect fill="#FFFFFF" x="14" y="14" width="8" height="1"/>
                <rect fill="#FFFFFF" x="14" y="17" width="8" height="1"/>
                <rect fill="#FFFFFF" x="14" y="20" width="8" height="1"/>
            </svg>
        </div>
    );
};

export default Knob;
