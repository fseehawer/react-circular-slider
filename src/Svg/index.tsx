import React from 'react';

export interface SvgProps {
    width: number;
    label: string;
    direction: number;
    strokeDasharray: number;
    strokeDashoffset: number;
    progressColorFrom: string;
    progressColorTo: string;
    progressLineCap?: 'round' | 'butt'; // Not directly used in CSS gradient approach
    progressSize: number; // Thickness of the progress ring
    trackColor: string;
    trackSize: number;
    radiansOffset: number;
    // Retaining this for compatibility, though it's no longer used for drawing the gradient:
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
    // Calculate radius for the track circle
    const halfTrack = trackSize / 2;
    const radius = width / 2 - halfTrack;
    const circumference = 2 * Math.PI * radius;
    // Compute the progress fraction (0 = empty, 1 = full)
    const progressFraction = 1 - strokeDashoffset / circumference;

    // Convert knob rotation (radiansOffset) to degrees for the CSS gradient start angle
    const startAngleDeg = (radiansOffset * 180) / Math.PI;

    // Build a CSS conic gradient.
    // It will show the progress colors up to the percentage indicated by progressFraction,
    // and then transition to transparent.
    const gradient = `conic-gradient(
    from ${startAngleDeg}deg,
    ${progressColorFrom} 0%,
    ${progressColorTo} ${progressFraction * 100}%,
    transparent ${progressFraction * 100}%
  )`;

    // Calculate the inner circle size (mask) so that only a ring of thickness ~progressSize is visible.
    const innerRadius = (width / 2) - progressSize;
    const innerPercent = (innerRadius / (width / 2)) * 100;

    const handleClick = (event: React.MouseEvent | React.TouchEvent) => {
        if (!onMouseDown) return;
        onMouseDown();
    };

    return (
        <div
            style={{
                position: 'relative',
                width: `${width}px`,
                height: `${width}px`,
                userSelect: isDragging ? 'none' : 'auto',
            }}
            onMouseDown={handleClick}
            onTouchStart={handleClick}
        >
            {/* Render the track as an SVG circle */}
            <svg
                width={width}
                height={width}
                viewBox={`0 0 ${width} ${width}`}
                style={{ position: 'absolute', top: 0, left: 0 }}
            >
                <circle
                    strokeWidth={trackSize}
                    fill="none"
                    stroke={trackColor}
                    cx={width / 2}
                    cy={width / 2}
                    r={radius}
                />
            </svg>

            {/* Overlay a div with a CSS conic gradient to represent the progress */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${width}px`,
                    height: `${width}px`,
                    borderRadius: '50%',
                    background: gradient,
                    transform: direction === -1 ? 'scale(-1, 1)' : undefined,
                    // Apply a radial mask to cut out the inner circle, leaving a ring of thickness ~progressSize.
                    maskImage: `radial-gradient(circle, transparent ${innerPercent}%, black ${innerPercent}%)`,
                    WebkitMaskImage: `radial-gradient(circle, transparent ${innerPercent}%, black ${innerPercent}%)`,
                }}
            />
        </div>
    );
};

export default Svg;
