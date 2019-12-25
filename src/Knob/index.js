import React, {Fragment} from 'react';
import {StyleSheet, css} from 'aphrodite';
import PropTypes from "prop-types";

const Knob = ({
          isDragging,
          knobPosition,
          knobColor,
          knobRadius = 12,
          knobSize = 36,
          onMouseDown,
          trackSize,
          children
      }) => {

    const pulse_animation = {
        "0%": {transform: "scale(1)"},
        "50%": {transform: "scale(0.8)"},
        "100%": {transform: "scale(1)"}
    };

    const styles = StyleSheet.create({
        knob: {
            position: 'absolute',
            left: `-${knobSize/2 - trackSize / 2}px`,
            top: `-${knobSize/2 - trackSize / 2}px`,
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

    const defaultKnobIcon = () => {
        return (
            <Fragment>
                <rect fill="#FFFFFF" x="14" y="14" width="8" height="1"/>
                <rect fill="#FFFFFF" x="14" y="17" width="8" height="1"/>
                <rect fill="#FFFFFF" x="14" y="20" width="8" height="1"/>
            </Fragment>
        );
    };

    const customKnobIcon = () => children;

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
                {children ? customKnobIcon() : defaultKnobIcon()}
            </svg>
        </div>
    );
};

Knob.propTypes = {
    isDragging: PropTypes.bool,
    knobPosition: PropTypes.object,
    knobColor: PropTypes.string,
    knobRadius: PropTypes.number,
    knobSize: PropTypes.number,
    trackSize: PropTypes.number,
    children: PropTypes.element,
    onMouseDown: PropTypes.func,
};

export default Knob;
