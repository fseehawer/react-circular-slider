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
    arcStart?: number;
    arcEnd?: number;
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
                                     arcStart,
                                     arcEnd,
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

    // Calculate arc path if arcStart and arcEnd are defined
    const isArcMode = typeof arcStart === 'number' && typeof arcEnd === 'number';
    let trackPath = '';
    let progressPath = '';
    
    if (isArcMode) {
        const startAngle = (arcStart - 90) * Math.PI / 180; // Convert to radians, offset by -90° to start at top
        const endAngle = (arcEnd - 90) * Math.PI / 180;
        
        const startX = width / 2 + radius * Math.cos(startAngle);
        const startY = width / 2 + radius * Math.sin(startAngle);
        const endX = width / 2 + radius * Math.cos(endAngle);
        const endY = width / 2 + radius * Math.sin(endAngle);
        
        const arcSpan = ((arcEnd - arcStart) + 360) % 360;
        const largeArc = arcSpan > 180 ? 1 : 0;
        
        trackPath = `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
        progressPath = trackPath;
    } else {
        // Full circle path for non-arc mode
        trackPath = `
            M ${width / 2}, ${width / 2}
            m 0, -${radius}
            a ${radius},${radius} 0 0,1 0,${radius * 2}
            a -${radius},-${radius} 0 0,1 0,-${radius * 2}
        `;
        progressPath = trackPath;
    }

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

    // Create a stable unique gradient ID to avoid conflicts with multiple instances
    // Using useRef so the ID is generated once and remains stable across re-renders
    const gradientIdRef = useRef(`radial-${label}-${Math.random().toString(36).substr(2, 9)}`);
    const gradientId = gradientIdRef.current;
    const trackGradientId = `track-${gradientId}`;
    const progressGradientId = `progress-${gradientId}`;

    // Helper function to create color stops
    const createColorStops = (colors: (string | GradientStop)[]) => {
        return colors.map((color, index) => {
            let stopProps: GradientStop;
            
            if (typeof color === 'string') {
                stopProps = { stopColor: color };
            } else {
                stopProps = color;
            }
            
            let { offset, stopColor, stopOpacity } = stopProps;
            
            // Auto-calculate offset if not provided
            if (!offset) {
                if (index === 0) {
                    offset = '0%';
                } else if (index === colors.length - 1) {
                    offset = '100%';
                } else {
                    offset = `${(100 / (colors.length - 1)) * index}%`;
                }
            }
            
            return (
                <stop
                    key={index}
                    offset={offset}
                    stopColor={stopColor}
                    stopOpacity={stopOpacity ?? 1}
                />
            );
        });
    };

    // Memoize gradient definitions to avoid unnecessary recalculations
    const gradientDefs = useMemo(() => {
        const defs = [];
        
        if (trackGradient && trackGradient.length > 0) {
            defs.push(
                <linearGradient key="track" id={trackGradientId} x1="100%" x2="0%">
                    {createColorStops(trackGradient)}
                </linearGradient>
            );
        }
        
        if (progressGradient && progressGradient.length > 0) {
            defs.push(
                <linearGradient key="progress" id={progressGradientId} x1="100%" x2="0%">
                    {createColorStops(progressGradient)}
                </linearGradient>
            );
        } else {
            // Default gradient for backward compatibility
            defs.push(
                <linearGradient key="progress-default" id={gradientId} x1="100%" x2="0%">
                    <stop offset="0%" stopColor={progressColorFrom}/>
                    <stop offset="100%" stopColor={progressColorTo}/>
                </linearGradient>
            );
        }
        
        return defs;
    }, [trackGradient, progressGradient, trackGradientId, progressGradientId, gradientId, progressColorFrom, progressColorTo]);

    // Determine stroke colors
    const actualTrackStroke = trackGradient && trackGradient.length > 0 
        ? `url(#${trackGradientId})` 
        : trackColor;
    
    const actualProgressStroke = progressGradient && progressGradient.length > 0 
        ? `url(#${progressGradientId})` 
        : `url(#${gradientId})`;

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
                {gradientDefs}
            </defs>
            {isArcMode ? (
                <path
                    ref={circleRef}
                    strokeWidth={trackSize}
                    fill="none"
                    stroke={actualTrackStroke}
                    strokeLinecap={validatedLineCap}
                    d={trackPath}
                />
            ) : (
                <circle
                    ref={circleRef}
                    strokeWidth={trackSize}
                    fill="none"
                    stroke={actualTrackStroke}
                    cx={width / 2}
                    cy={width / 2}
                    r={radius}
                />
            )}
            <path
                style={styles.path}
                ref={svgFullPath}
                strokeDasharray={isArcMode ? 'none' : (strokeDasharray || 0)}
                strokeDashoffset={isArcMode ? 0 : (strokeDashoffset || 0)}
                strokeWidth={progressSize}
                strokeLinecap={validatedLineCap}
                fill="none"
                stroke={actualProgressStroke}
                d={progressPath}
            />
        </svg>
    );
};

export default Svg;