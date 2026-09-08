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
			display: 'grid',
			gridTemplateRows: 'minmax(0, 1fr) auto minmax(0, 1fr)',
			justifyItems: 'center',
			textAlign: 'center',
			color: labelColor,
			userSelect: 'none',
			pointerEvents: 'none',
			zIndex: 1,
		},
		label: {
			gridRow: labelBottom ? 3 : 1,
			alignSelf: labelBottom ? 'start' : 'end',
			fontSize: labelFontSize,
			lineHeight: 1.15,
			maxWidth: '70%',
			overflowWrap: 'anywhere',
			...(labelBottom ? { marginTop: verticalOffset } : { marginBottom: verticalOffset }),
		},
		value: {
			gridRow: 2,
			fontSize: valueFontSize,
			lineHeight: 1,
			maxWidth: '70%',
			overflowWrap: 'anywhere',
			position: 'relative',
		},
		code: {
			display: 'block',
			lineHeight: 'inherit',
		},
		appended: {
			position: 'absolute',
			left: '100%',
			top: '0',
		},
		prepended: {
			position: 'absolute',
			right: '100%',
			top: '0',
		},
		hide: {
			display: 'none',
		},
	};

	return (
		<div style={{ ...styles.labels, ...(hideLabelValue ? styles.hide : {}) }}>
			<div style={styles.label}>{label}</div>
			<div style={styles.value}>
				<code style={styles.code}>
					<span style={styles.prepended}>{prependToValue}</span>
					<span data-slider-value="" style={{ display: 'block' }}>{value}</span>
					<span style={styles.appended}>{appendToValue}</span>
				</code>
			</div>
		</div>
	);
};

export default Labels;
