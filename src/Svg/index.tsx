"use client";
import React, { useRef, useMemo } from 'react';

export type GradientStop = {
    offset?: string;
    stopColor: string;
    stopOpacity?: number;
};

export interface SvgProps {
    width: number;
    label: string;
    direction: number;
    strokeDasharray: number;
    strokeDashoffset: number;
    progressColorFrom: string;
    progressColorTo: string;
    progressGradient?: (string | GradientStop)[];
    progressLineCap?: 'round' | 'butt';
    progressSize: number;
    trackColor: string;
    trackGradient?: (string | GradientStop)[];
    trackSize: number;
    radiansOffset: number;
    svgFullPath: React.RefObject<SVGPathElement | null>;
    onMouseDown?: (event: React.MouseEvent | React.TouchEvent) => void;
    isDragging?: boolean;
}

const Svg: React.FC<SvgProps> = ({
                                     width,
                                     label,
                                     direction,
                                     strokeDasharray,
                                     strokeDashoffset,
                                     progressColorFrom,
                                     progressColorTo,
                                     progressGradient,
                                     progressLineCap = 'round',
                                     progressSize,
                                     trackColor,
                                     trackGradient,
                                     trackSize,
                                     radiansOffset,
                                     svgFullPath,
                                     onMouseDown,
                                     isDragging,
                                 }) => {
    const circleRef = useRef<SVGCircleElement | null>(null);

    // Keep styles simple with no transitions
    const styles: { [key: string]: React.CSSProperties } = {
        svg: {
            position: 'relative',
            zIndex: 2,
            userSelect: isDragging ? 'none' : 'auto',
        },
        path: {
            transform: `rotate(${radiansOffset}rad) ${direction === -1 ? 'scale(-1, 1)' : 'scale(1, 1)'}`,
            transformOrigin: 'center center',
            // No transition to make movement instant
            transition: 'none',
        },
    };

    const halfTrack = trackSize / 2;
    const radius = width / 2 - halfTrack;

    const validatedLineCap: 'round' | 'butt' =
        progressLineCap === 'round' || progressLineCap === 'butt'
            ? progressLineCap
            : 'round';

    const handleClick = (event: React.MouseEvent | React.TouchEvent) => {
        if (!onMouseDown) return;
        const bounds = circleRef.current?.getBoundingClientRect();
        if (!bounds) return;

        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;
        const distance = Math.sqrt((clientX - centerX) ** 2 + (clientY - centerY) ** 2);
        const threshold = bounds.width / (isDragging ? 4 : 2) - trackSize;
        if (distance < threshold) return;
        onMouseDown(event);
    };

    // Create stable unique gradient IDs to avoid conflicts with multiple instances
    const progressGradientIdRef = useRef(`progress-${label}-${Math.random().toString(36).substr(2, 9)}`);
    const trackGradientIdRef = useRef(`track-${label}-${Math.random().toString(36).substr(2, 9)}`);
    const progressGradientId = progressGradientIdRef.current;
    const trackGradientId = trackGradientIdRef.current;

    // Helper function to create color stops
    const createColorStops = useMemo(() => {
        return (colors: (string | GradientStop)[]) => {
            return colors.map((color, index) => {
                let stopData: GradientStop;
                if (typeof color === 'string') {
                    stopData = { stopColor: color };
                } else {
                    stopData = color;
                }

                const { offset, stopColor, stopOpacity } = stopData;

                let finalOffset: string;
                if (offset) {
                    finalOffset = offset;
                } else if (index === 0) {
                    finalOffset = '0%';
                } else if (index === colors.length - 1) {
                    finalOffset = '100%';
                } else {
                    finalOffset = `${(100 / (colors.length - 1)) * index}%`;
                }

                return (
                    <stop
                        key={index}
                        offset={finalOffset}
                        stopColor={stopColor}
                        stopOpacity={stopOpacity ?? 1}
                    />
                );
            });
        };
    }, []);

    // Determine stroke values
    const trackStroke = trackGradient ? `url(#${trackGradientId})` : trackColor;
    const progressStroke = progressGradient ? `url(#${progressGradientId})` : `url(#${progressGradientId})`;

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
                {trackGradient && (
                    <linearGradient id={trackGradientId} x1="100%" x2="0%">
                        {createColorStops(trackGradient)}
                    </linearGradient>
                )}
                <linearGradient id={progressGradientId} x1="100%" x2="0%">
                    {progressGradient ? (
                        createColorStops(progressGradient)
                    ) : (
                        <>
                            <stop offset="0%" stopColor={progressColorFrom}/>
                            <stop offset="100%" stopColor={progressColorTo}/>
                        </>
                    )}
                </linearGradient>
            </defs>
            <circle
                ref={circleRef}
                strokeWidth={trackSize}
                fill="none"
                stroke={trackStroke}
                cx={width / 2}
                cy={width / 2}
                r={radius}
            />
            <path
                style={styles.path}
                ref={svgFullPath}
                strokeDasharray={strokeDasharray || 0}
                strokeDashoffset={strokeDashoffset || 0}
                strokeWidth={progressSize}
                strokeLinecap={validatedLineCap}
                fill="none"
                stroke={progressStroke}
                d={`
    M ${width / 2}, ${width / 2}
    m 0, -${radius}
    a ${radius},${radius} 0 0,1 0,${radius * 2}
    a -${radius},-${radius} 0 0,1 0,-${radius * 2}
  `}
            />
        </svg>
    );
};

export default Svg;