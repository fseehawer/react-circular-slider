import React from 'react';
import {StyleSheet, css} from 'aphrodite';

const Svg = (props) => {
    const {
        width,
        strokeDasharray,
        strokeDashoffset,
        progressColors,
        trackColor,
        progressSize,
        trackSize,
        svgFullPath,
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
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
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
    );
};

export default Svg;
