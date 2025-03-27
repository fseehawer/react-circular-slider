import React, { useRef, useEffect } from 'react';

export interface SvgProps {
    width: number;
    label: string;
    direction: number;
    strokeDasharray: number;
    strokeDashoffset: number;
    progressColorFrom: string;
    progressColorTo: string;
    progressLineCap?: 'round' | 'butt';
    progressSize: number;
    trackColor: string;
    trackSize: number;
    radiansOffset: number;
    svgFullPath: React.RefObject<SVGPathElement | null>;
    onMouseDown?: () => void;
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
                                     progressLineCap = 'round',
                                     progressSize,
                                     trackColor,
                                     trackSize,
                                     radiansOffset,
                                     svgFullPath,
                                     onMouseDown,
                                     isDragging,
                                 }) => {
    const circleRef = useRef<SVGCircleElement | null>(null);
    const pathRef = useRef<SVGPathElement | null>(null);

    const styles: { [key: string]: React.CSSProperties } = {
        svg: {
            position: 'relative',
            zIndex: 2,
        },
        path: {
            transform: `rotate(${radiansOffset}rad) ${direction === -1 ? 'scale(-1, 1)' : 'scale(1, 1)'}`,
            transformOrigin: 'center center',
            // Ensure no transition during resize to avoid animation bugs
            transition: isDragging ? 'none' : 'stroke-dashoffset 0.1s ease-in-out',
        },
    };

    const halfTrack = trackSize / 2;
    const radius = width / 2 - halfTrack;

    // Ensure valid linecap value
    const validatedLineCap: 'round' | 'butt' =
        progressLineCap === 'round' || progressLineCap === 'butt'
            ? progressLineCap
            : 'round';

    // Link the internal path ref to the forwarded ref
    useEffect(() => {
        if (pathRef.current) {
            svgFullPath.current = pathRef.current;

            // Calculate path length on mount and when width changes
            if (svgFullPath.current && svgFullPath.current?.getTotalLength) {
                const length = svgFullPath.current?.getTotalLength();
                // Dispatch this measurement if needed via a provided callback
            }
        }

        // Clean up ref on unmount
        return () => {
            svgFullPath.current = null;
        };
    }, [svgFullPath, width]);

    // Create the SVG path definition based on current dimensions
    const createPathDefinition = () => {
        return `
            M ${width / 2}, ${width / 2}
            m 0, -${radius}
            a ${radius},${radius} 0 0,1 0,${radius * 2}
            a -${radius},-${radius} 0 0,1 0,-${radius * 2}
        `;
    };

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
        onMouseDown();
    };

    // Unique ID for the gradient to avoid conflicts with multiple instances
    const gradientId = `radial-${label}-${width.toString().replace('.', '-')}`;

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
                <linearGradient id={gradientId} x1="100%" x2="0%">
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
                ref={(node) => {
                    // Assign to both refs
                    pathRef.current = node;
                    svgFullPath.current = node;
                }}
                strokeDasharray={strokeDasharray || 0}
                strokeDashoffset={strokeDashoffset || 0}
                strokeWidth={progressSize}
                strokeLinecap={validatedLineCap}
                fill="none"
                stroke={`url(#${gradientId})`}
                d={createPathDefinition()}
            />
        </svg>
    );
};

export default Svg;