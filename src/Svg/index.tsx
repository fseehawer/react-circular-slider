import React, {useRef} from 'react';

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
    svgFullPath: React.RefObject<SVGPathElement>;
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
    const circleRef = useRef<SVGCircleElement>(null);

    const styles: { [key: string]: React.CSSProperties } = {
        svg: {
            position: 'relative',
            zIndex: 2,
        },
        path: {
            transform: `rotate(${radiansOffset}rad) ${direction === -1 ? 'scale(-1, 1)' : 'scale(1, 1)'}`,
            transformOrigin: 'center center',
        },
    };

    const halfTrack = trackSize / 2;
    const radius = width / 2 - halfTrack;

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
                <radialGradient id={`radial-${label}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={progressColorFrom} />
                    <stop offset="100%" stopColor={progressColorTo} />
                </radialGradient>
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
                strokeLinecap={progressLineCap}
                fill="none"
                stroke={`url(#radial-${label})`}
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
