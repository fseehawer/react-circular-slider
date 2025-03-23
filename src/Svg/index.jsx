import React, { useRef } from 'react';
import PropTypes from "prop-types";

const Svg = ({
         width,
         label,
         direction,
         strokeDasharray,
         strokeDashoffset,
         progressColorFrom,
         progressColorTo,
         trackColor,
         progressSize,
         trackSize,
         svgFullPath,
         radiansOffset,
         progressLineCap,
         onMouseDown,
         isDragging
     }) => {
    const circleRef = useRef(null)
    const styles = ({
        svg: {
            position: 'relative',
            zIndex: 2
        },

        path: {
            transform: `rotate(${radiansOffset}rad) ${direction === -1 ? 'scale(-1, 1)' : 'scale(1, 1)'}`,
            transformOrigin: 'center center'
        }
    });

    const halfTrack = trackSize / 2;
    const radius = width / 2 - halfTrack;

    /**
     * Check that there is a click handler and that the click happened on the
     * circumference of the circle (e.g. that the user is dragging the track to
     * change the value) and then call the handler
     * @param {SyntheticBaseEvent} event 
     */
    const handleClick = (event) => {
        if(!onMouseDown) return

        const circleBounds = circleRef.current.getBoundingClientRect();

        const mouseX = event?.clientX || event?.touches[0]?.clientX;
        const mouseY = event.clientY || event?.touches[0]?.clientY;
        const circleCenterX = circleBounds.left + circleBounds.width / 2;
        const circleCenterY = circleBounds.top + circleBounds.height / 2;
        const distance = Math.sqrt(
          Math.pow(mouseX - circleCenterX, 2) + Math.pow(mouseY - circleCenterY, 2)
        );

        const threshold = (circleBounds.width / isDragging ? 4 : 2) - trackSize
        if (distance < threshold) {
            return
        }
        
        onMouseDown()
    }
    
    return (
        <svg
            width={`${width}px`}
            height={`${width}px`}
            viewBox={`0 0 ${width} ${width}`}
            overflow="visible"
            style={styles.svg}
            onMouseDown={handleClick}
            onTouchStart={handleClick}
        >
            <defs>
                <linearGradient id={label} x1="100%" x2="0%">
                    <stop offset="0%" stopColor={progressColorFrom}/>
                    <stop offset="100%" stopColor={progressColorTo}/>
                </linearGradient>
            </defs>
            <circle
                ref={circleRef}
                strokeWidth={trackSize}
                fill="none"
                stroke={trackColor}
                cx={width / 2}
                cy={width / 2}
                r={radius}
            />
            <path
                style={styles.path}
                ref={svgFullPath}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeWidth={progressSize}
                strokeLinecap={progressLineCap !== 'round' ? 'butt' : 'round'}
                fill="none"
                stroke={`url(#${label})`}
                d={`
                        M ${width / 2}, ${width / 2}
                        m 0, -${width / 2 - halfTrack}
                        a ${width / 2 - halfTrack},${width / 2 - halfTrack} 0 0,1 0,${width - halfTrack*2}
                        a -${width / 2 - halfTrack},-${width / 2 - halfTrack} 0 0,1 0,-${width - halfTrack*2}
                    `}/>
        </svg>
    );
};

Svg.propTypes = {
    width: PropTypes.number,
    label: PropTypes.string,
    direction: PropTypes.number,
    svgFullPath: PropTypes.object,
    strokeDasharray: PropTypes.number,
    strokeDashoffset: PropTypes.number,
    progressColorFrom: PropTypes.string,
    progressColorTo: PropTypes.string,
    progressLineCap: PropTypes.string,
    progressSize: PropTypes.number,
    trackColor: PropTypes.string,
    trackSize: PropTypes.number,
    radiansOffset: PropTypes.number,
};

export default Svg;
