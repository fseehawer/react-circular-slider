import React  from 'react';
import PropTypes from 'prop-types';
import './index.css';

const Knob = ({
	isDragging,
	knobPosition,
	knobColor,
	knobSize,
	hideKnob,
	onMouseDown,
	trackSize,
	children,
}) => {
	const styles = {
		knob: {
			position: 'absolute',
			left: `-${knobSize / 2 - trackSize / 2}px`,
			top: `-${knobSize / 2 - trackSize / 2}px`,
			cursor: 'grab',
			zIndex: 3,
		},

		dragging: {
			cursor: 'grabbing',
		},

		pause: {
			animationPlayState: 'paused'
		},

		animation: {
			transformOrigin: '50% 50%',
			animationTimingFunction: 'ease-out',
			animationDuration: '1500ms',
			animationIterationCount: 'infinite',
			animationName: 'pulse',
		},

		hide: {
			opacity: 0
		}
	};

	const defaultKnobIcon = () => {
		return (
			<svg
				width={`${knobSize}px`}
				height={`${knobSize}px`}
				viewBox={`0 0 36 36`}>
				<rect fill='#FFFFFF' x='14' y='14' width='8' height='1' />
				<rect fill='#FFFFFF' x='14' y='17' width='8' height='1' />
				<rect fill='#FFFFFF' x='14' y='20' width='8' height='1' />
			</svg>
		);
	};

	const customKnobIcon = () => children;

	return (
		<div
			style={{
				transform: `translate(${knobPosition.x}px, ${knobPosition.y}px)`,
				...styles.knob,
				...(isDragging && styles.dragging),
				...(hideKnob && styles.hide),
			}}
			onMouseDown={onMouseDown}
			onTouchStart={onMouseDown}>
			<svg
				width={`${knobSize}px`}
				height={`${knobSize}px`}
				viewBox={`0 0 ${knobSize} ${knobSize}`}>
				<circle
					style={{ ...styles.animation, ...(isDragging && styles.pause) }}
					fill={knobColor}
					fillOpacity='0.2'
					stroke='none'
					cx={knobSize / 2}
					cy={knobSize / 2}
					r={knobSize / 2}
				/>
				<circle
					fill={knobColor}
					stroke='none'
					cx={knobSize / 2}
					cy={knobSize / 2}
					r={(knobSize * 2 / 3) / 2}
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
