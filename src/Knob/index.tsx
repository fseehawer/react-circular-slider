import React from 'react';
import './index.css';

export interface KnobProps {
	isDragging: boolean;
	knobPosition: { x: number; y: number };
	knobColor: string;
	knobSize: number;
	hideKnob?: boolean;
	hideKnobRing?: boolean;
	knobDraggable?: boolean;
	trackSize: number;
	children?: React.ReactNode;
	onMouseDown?: (event: React.MouseEvent | React.TouchEvent) => void;
}

const Knob: React.FC<KnobProps> = ({
   isDragging,
   knobPosition,
   knobColor,
   knobSize,
   hideKnob = false,
   hideKnobRing = false,
   knobDraggable = true,
   trackSize,
   children,
   onMouseDown,
								   }) => {
	const styles: { [key: string]: React.CSSProperties } = {
		knob: {
			position: 'absolute',
			left: `-${knobSize / 2 - trackSize / 2}px`,
			top: `-${knobSize / 2 - trackSize / 2}px`,
			cursor: knobDraggable ? 'grab' : 'auto',
			zIndex: 3,
		},
		dragging: {
			cursor: 'grabbing',
		},
		pause: {
			animationPlayState: 'paused',
		},
		animation: {
			transformOrigin: '50% 50%',
			animationTimingFunction: 'ease-out',
			animationDuration: '1500ms',
			animationIterationCount: 'infinite',
			animationName: 'pulse',
		},
		hide: {
			opacity: 0,
		},
	};

	return (
		<div
			style={{
				transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
				...styles.knob,
				...(isDragging ? styles.dragging : {}),
				...(hideKnob ? styles.hide : {}),
			}}
			onMouseDown={onMouseDown}
			onTouchStart={onMouseDown}
		>
			<svg width={knobSize} height={knobSize} viewBox={`0 0 ${knobSize} ${knobSize}`}>
				{!hideKnobRing && (
					<circle
						style={{ ...styles.animation, ...(isDragging ? styles.pause : {}) }}
						fill={knobColor}
						fillOpacity={0.2}
						stroke='none'
						cx={knobSize / 2}
						cy={knobSize / 2}
						r={knobSize / 2}
					/>
				)}
				<circle
					fill={knobColor}
					stroke='none'
					cx={knobSize / 2}
					cy={knobSize / 2}
					r={(knobSize * 2) / 3 / 2}
				/>
				{children ?? (
					<svg width={knobSize} height={knobSize} viewBox='0 0 36 36'>
						<rect fill='#FFFFFF' x='14' y='14' width='8' height='1' />
						<rect fill='#FFFFFF' x='14' y='17' width='8' height='1' />
						<rect fill='#FFFFFF' x='14' y='20' width='8' height='1' />
					</svg>
				)}
			</svg>
		</div>
	);
};

export default Knob;