import React from 'react';

export interface LabelsProps {
	label: string;
	value: string;
	labelColor?: string;
	labelBottom?: boolean;
	labelFontSize?: string;
	valueFontSize?: string;
	appendToValue?: string;
	prependToValue?: string;
	verticalOffset?: string;
	hideLabelValue?: boolean;
}

const Labels: React.FC<LabelsProps> = ({
   label,
   value,
   labelColor = '#000',
   labelBottom = false,
   labelFontSize = '1rem',
   valueFontSize = '3rem',
   appendToValue = '',
   prependToValue = '',
   verticalOffset = '1.5rem',
   hideLabelValue = false,
}) => {
	const styles: { [key: string]: React.CSSProperties } = {
		labels: {
			position: 'absolute',
			top: '0',
			left: '0',
			width: '100%',
			height: '100%',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'center',
			alignItems: 'center',
			color: labelColor,
			userSelect: 'none',
			zIndex: 1,
		},
		value: {
			fontSize: valueFontSize,
			position: 'relative',
		},
		bottomMargin: {
			marginBottom: `calc(${verticalOffset})`,
		},
		appended: {
			position: 'absolute',
			right: '0',
			top: '0',
			transform: 'translate(100%, 0)',
		},
		prepended: {
			position: 'absolute',
			left: '0',
			top: '0',
			transform: 'translate(-100%, 0)',
		},
		hide: {
			display: 'none',
		},
	};

	return (
		<div style={{ ...styles.labels, ...(hideLabelValue ? styles.hide : {}) }}>
			{!labelBottom && <div style={{ fontSize: labelFontSize }}>{label}</div>}
			<div style={{ ...styles.value, ...(!labelBottom ? styles.bottomMargin : {}) }}>
				<code>
					<span style={styles.prepended}>{prependToValue}</span>
					{value}
					<span style={styles.appended}>{appendToValue}</span>
				</code>
			</div>
			{labelBottom && <div style={{ fontSize: labelFontSize }}>{label}</div>}
		</div>
	);
};

export default Labels;
