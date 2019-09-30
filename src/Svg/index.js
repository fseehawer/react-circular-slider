import React from 'react';
import {StyleSheet, css} from 'aphrodite';

const Svg = (props) => {
    const {
        width,
        label,
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
    } = props;

    const styles = StyleSheet.create({
        svg: {
            position: 'relative',
            zIndex: 2
        },
    });

    return (
        <svg
            width={`${width}px`}
            height={`${width}px`}
            viewBox={`0 0 ${width} ${width}`}
            overflow="visible"
            className={css(styles.svg)}
        >
            <defs>
                <linearGradient id={label} x1="100%" x2="0%">
                    <stop offset="0%" stopColor={progressColorFrom}/>
                    <stop offset="100%" stopColor={progressColorTo}/>
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
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeWidth={progressSize}
                style={{transform: `rotate(${radiansOffset}rad)`, transformOrigin: 'center center'}}
                strokeLinecap={progressLineCap !== 'round' ? 'butt' : 'round'}
                fill="none"
                stroke={`url(#${label})`}
                d={`
                        M ${width / 2}, ${width / 2}
                        m 0, -${width / 2}
                        a ${width / 2},${width / 2} 0 0,1 0,${width}
                        a -${width / 2},-${width / 2} 0 0,1 0,-${width}
                    `}/>
        </svg>
    );
};

export default Svg;
