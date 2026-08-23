import React from 'react';
import CircularSlider, { type CircularSliderHandle } from './CircularSlider';
import DragIcon from './assets/drag.svg?react';
import EmojiIcon from './assets/emoji.svg?react';

type DemoExample = {
	title: string;
	tagline: string;
	details: string;
	highlights: string[];
	code: string;
	render: () => React.ReactNode;
};

const StarIcon = ({ size, offset }: { size: number; offset: number }) => (
	<svg
		x={offset}
		y={offset}
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="#fff"
		preserveAspectRatio="xMidYMid meet"
		style={{ filter: 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.25))' }}
	>
		<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
	</svg>
);

const App = () => {
	const [isHot, setIsHot] = React.useState(true);
	const [activeTab, setActiveTab] = React.useState(0);
	const [isMobile, setIsMobile] = React.useState(false);
	const [showMobileCode, setShowMobileCode] = React.useState(false);

	React.useEffect(() => {
		const checkScreenSize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkScreenSize();
		window.addEventListener('resize', checkScreenSize);

		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	const sliderRefs = React.useRef<React.RefObject<CircularSliderHandle | null>[]>([
		React.createRef<CircularSliderHandle>(),
		React.createRef<CircularSliderHandle>(),
		React.createRef<CircularSliderHandle>(),
		React.createRef<CircularSliderHandle>(),
		React.createRef<CircularSliderHandle>(),
		React.createRef<CircularSliderHandle>(),
	]);

	const examples: DemoExample[] = [
		{
			title: 'Temperature',
			tagline: 'Position, value suffixes, and state-driven colors',
			details: 'Use `min`, `max`, and `dataIndex` to choose the value range, then switch colors from `onChange` when the selected value crosses your threshold.',
			highlights: ['knobPosition', 'appendToValue', 'min / max', 'dataIndex', 'onChange'],
			code: `<CircularSlider
  label="Temperature"
  knobPosition="left"
  appendToValue="°"
  min={-100}
  max={100}
  dataIndex={120}
  progressColorFrom={isHot ? '#F0A367' : '#38bdf8'}
  progressColorTo={isHot ? '#F65749' : '#0284c7'}
  labelColor={isHot ? '#F0A367' : '#0284c7'}
  knobColor={isHot ? '#F0A367' : '#0284c7'}
  onChange={(value) => setIsHot(Number(value) > 0)}
/>`,
			render: () => (
				<CircularSlider
					ref={sliderRefs.current[0]}
					label="Temperature"
					knobPosition="left"
					appendToValue="°"
					min={-100}
					max={100}
					dataIndex={120}
					valueFontSize={isMobile ? '3.5rem' : '4rem'}
					trackColor="#e2e8f0"
					progressColorFrom={isHot ? '#F0A367' : '#38bdf8'}
					progressColorTo={isHot ? '#F65749' : '#0284c7'}
					labelColor={isHot ? '#F0A367' : '#0284c7'}
					knobColor={isHot ? '#F0A367' : '#0284c7'}
					onChange={(value) => setIsHot(Number(value) > 0)}
					width={250}
				/>
			),
		},
		{
			title: 'Savings',
			tagline: 'Currency labels, bottom label placement, and custom knob content',
			details: '`prependToValue` and `appendToValue` frame the displayed value. `labelBottom`, `knobSize`, and child SVG content customize the control without replacing the slider logic.',
			highlights: ['prependToValue', 'appendToValue', 'labelBottom', 'knobSize', 'children'],
			code: `<CircularSlider
  label="Savings"
  min={0}
  max={100}
  dataIndex={20}
  prependToValue="$"
  appendToValue="K"
  labelColor="#166534"
  labelBottom={true}
  knobColor="#166534"
  knobSize={72}
  progressColorFrom="#22c55e"
  progressColorTo="#16a34a"
  progressSize={24}
  trackColor="#e2e8f0"
  trackSize={24}
>
  <DragIcon x="22" y="22" width="28px" height="28px" />
</CircularSlider>`,
			render: () => (
				<CircularSlider
					ref={sliderRefs.current[1]}
					label="Savings"
					min={0}
					max={100}
					dataIndex={20}
					prependToValue="$"
					appendToValue="K"
					labelColor="#166534"
					labelBottom={true}
					knobColor="#166534"
					knobSize={isMobile ? 60 : 72}
					progressColorFrom="#22c55e"
					progressColorTo="#16a34a"
					progressSize={isMobile ? 20 : 24}
					trackColor="#e2e8f0"
					trackSize={isMobile ? 20 : 24}
					width={250}
				>
					<DragIcon
						x={isMobile ? '18' : '22'}
						y={isMobile ? '18' : '22'}
						width={isMobile ? '24px' : '28px'}
						height={isMobile ? '24px' : '28px'}
					/>
				</CircularSlider>
			),
		},
		{
			title: 'Alphabet',
			tagline: 'Custom data arrays and compact track styling',
			details: 'Pass `data` when the slider should choose labels instead of numbers. Each item is distributed evenly across the circle.',
			highlights: ['data', 'progressLineCap', 'verticalOffset', 'trackSize', 'children'],
			code: `<CircularSlider
  label="Alphabet"
  progressLineCap="butt"
  dataIndex={1}
  labelColor="#4b5563"
  valueFontSize="6rem"
  verticalOffset="1rem"
  knobColor="#4b5563"
  progressColorFrom="#f59e0b"
  progressColorTo="#d97706"
  progressSize={8}
  trackColor="#e5e7eb"
  trackSize={4}
  data={'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')}
>
  <EmojiIcon x="9" y="9" width="18px" height="18px" />
</CircularSlider>`,
			render: () => (
				<CircularSlider
					ref={sliderRefs.current[2]}
					label="Alphabet"
					progressLineCap="butt"
					dataIndex={1}
					width={250}
					labelColor="#4b5563"
					valueFontSize={isMobile ? '5rem' : '6rem'}
					verticalOffset={isMobile ? '0.75rem' : '1rem'}
					knobColor="#4b5563"
					progressColorFrom="#f59e0b"
					progressColorTo="#d97706"
					progressSize={8}
					trackColor="#e5e7eb"
					trackSize={4}
					data={'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')}
				>
					<EmojiIcon x="9" y="9" width="18px" height="18px" />
				</CircularSlider>
			),
		},
		{
			title: 'Rating',
			tagline: 'Small numeric range with a custom icon',
			details: 'Use a short `min`/`max` range for rating controls, then make the handle more expressive with custom knob children.',
			highlights: ['min / max', 'dataIndex', 'knobSize', 'progressSize', 'children'],
			code: `<CircularSlider
  label="Star Rating"
  min={0}
  max={10}
  dataIndex={5}
  labelColor="#b45309"
  valueFontSize="5rem"
  knobColor="#facc15"
  progressColorFrom="#fbbf24"
  progressColorTo="#f59e0b"
  progressSize={10}
  trackColor="#fef3c7"
  trackSize={6}
  knobSize={68}
>
  <StarIcon width="35" height="35" fill="#fff" />
</CircularSlider>`,
			render: () => {
				const knobSize = isMobile ? 60 : 68;
				const iconSize = isMobile ? 25 : 35;
				const iconOffset = (knobSize - iconSize) / 2;

				return (
					<CircularSlider
						ref={sliderRefs.current[3]}
						label="Star Rating"
						min={0}
						max={10}
						dataIndex={5}
						width={250}
						labelColor="#b45309"
						valueFontSize={isMobile ? '4rem' : '5rem'}
						knobColor="#facc15"
						progressColorFrom="#fbbf24"
						progressColorTo="#f59e0b"
						progressSize={10}
						trackColor="#fef3c7"
						trackSize={6}
						knobSize={knobSize}
					>
						<StarIcon size={iconSize} offset={iconOffset} />
					</CircularSlider>
				);
			},
		},
		{
			title: 'Multi-Stop',
			tagline: 'Progress and track gradients with explicit color stops',
			details: '`progressGradient` and `trackGradient` accept color strings or stop objects, so you can define exact offsets and opacity.',
			highlights: ['progressGradient', 'trackGradient', 'stopOpacity', 'progressSize', 'trackSize'],
			code: `<CircularSlider
  label="Spectrum"
  min={0}
  max={360}
  dataIndex={180}
  appendToValue="°"
  labelColor="#7c3aed"
  knobColor="#7c3aed"
  progressGradient={[
    { offset: '0%', stopColor: '#ef4444' },
    { offset: '20%', stopColor: '#f97316' },
    { offset: '40%', stopColor: '#eab308' },
    { offset: '55%', stopColor: '#22c55e' },
    { offset: '70%', stopColor: '#3b82f6' },
    { offset: '85%', stopColor: '#6366f1' },
    { offset: '100%', stopColor: '#8b5cf6' },
  ]}
  progressSize={12}
  trackGradient={[
    { offset: '0%', stopColor: '#fecaca', stopOpacity: 0.4 },
    { offset: '50%', stopColor: '#bbf7d0', stopOpacity: 0.4 },
    { offset: '100%', stopColor: '#c4b5fd', stopOpacity: 0.4 },
  ]}
  trackSize={12}
/>`,
			render: () => (
				<CircularSlider
					ref={sliderRefs.current[4]}
					label="Spectrum"
					min={0}
					max={360}
					dataIndex={180}
					width={250}
					appendToValue="°"
					labelColor="#7c3aed"
					valueFontSize={isMobile ? '3.5rem' : '4rem'}
					knobColor="#7c3aed"
					knobSize={isMobile ? 40 : 42}
					progressColorFrom="#ef4444"
					progressColorTo="#8b5cf6"
					progressGradient={[
						{ offset: '0%', stopColor: '#ef4444' },
						{ offset: '20%', stopColor: '#f97316' },
						{ offset: '40%', stopColor: '#eab308' },
						{ offset: '55%', stopColor: '#22c55e' },
						{ offset: '70%', stopColor: '#3b82f6' },
						{ offset: '85%', stopColor: '#6366f1' },
						{ offset: '100%', stopColor: '#8b5cf6' },
					]}
					progressSize={12}
					trackGradient={[
						{ offset: '0%', stopColor: '#fecaca', stopOpacity: 0.4 },
						{ offset: '50%', stopColor: '#bbf7d0', stopOpacity: 0.4 },
						{ offset: '100%', stopColor: '#c4b5fd', stopOpacity: 0.4 },
					]}
					trackSize={12}
					progressLineCap="round"
				/>
			),
		},
		{
			title: 'Arc Gauge',
			tagline: 'Partial-circle gauge with capped ends',
			details: '`arcStart` and `arcEnd` turn the full circle into a gauge. Pair them with `progressLineCap="butt"` when you want clean gauge endpoints.',
			highlights: ['arcStart', 'arcEnd', 'progressLineCap', 'progressGradient', 'trackSize'],
			code: `<CircularSlider
  label="km/h"
  min={0}
  max={250}
  dataIndex={80}
  labelColor="#dc2626"
  valueFontSize="2.5rem"
  knobColor="#dc2626"
  knobSize={40}
  progressGradient={[
    { offset: '0%', stopColor: '#dc2626' },
    { offset: '50%', stopColor: '#eab308' },
    { offset: '100%', stopColor: '#22c55e' },
  ]}
  progressSize={14}
  trackColor="#e5e7eb"
  trackSize={14}
  progressLineCap="butt"
  arcStart={225}
  arcEnd={135}
/>`,
			render: () => (
				<CircularSlider
					ref={sliderRefs.current[5]}
					label="km/h"
					min={0}
					max={250}
					dataIndex={80}
					width={250}
					labelColor="#dc2626"
					valueFontSize={isMobile ? '2rem' : '2.5rem'}
					knobColor="#dc2626"
					knobSize={isMobile ? 36 : 40}
					progressGradient={[
						{ offset: '0%', stopColor: '#dc2626' },
						{ offset: '50%', stopColor: '#eab308' },
						{ offset: '100%', stopColor: '#22c55e' },
					]}
					progressSize={14}
					trackColor="#e5e7eb"
					trackSize={14}
					progressLineCap="butt"
					arcStart={225}
					arcEnd={135}
				/>
			),
		},
	];

	const activeExample = examples[activeTab] ?? examples[0];

	const handleTabChange = (index: number) => {
		setActiveTab(index);
		setShowMobileCode(false);
		setIsHot(index === 0);

		setTimeout(() => {
			sliderRefs.current[index]?.current?.refresh();
		}, 50);
	};

	const styles: Record<string, React.CSSProperties> = {
		wrapper: {
			padding: isMobile ? '0.75rem 0.5rem' : '1rem',
			background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
			minHeight: '100vh',
			fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
			color: '#1f2937',
		},
		container: {
			maxWidth: '960px',
			margin: isMobile ? '0 auto' : '1rem auto',
			background: '#fff',
			padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem',
			borderRadius: isMobile ? '1rem' : '1.25rem',
			boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)',
		},
		header: {
			display: 'grid',
			gap: '0.75rem',
			marginBottom: isMobile ? '1.25rem' : '1.75rem',
		},
		h1: {
			fontSize: isMobile ? '1.65rem' : '2.25rem',
			fontWeight: 600,
			margin: 0,
			color: '#233047',
			display: 'flex',
			alignItems: 'center',
			flexWrap: isMobile ? 'wrap' : 'nowrap',
			justifyContent: isMobile ? 'center' : 'flex-start',
			gap: '0.5rem',
		},
		icon: {
			fontSize: isMobile ? '2.6rem' : '1.4em',
			width: isMobile ? '100%' : 'auto',
			textAlign: isMobile ? 'center' : 'left',
		},
		intro: {
			fontSize: isMobile ? '1rem' : '1.1rem',
			color: '#526174',
			lineHeight: 1.6,
			margin: 0,
			maxWidth: '760px',
			textAlign: isMobile ? 'center' : 'left',
		},
		install: {
			margin: 0,
			background: '#111827',
			color: '#f9fafb',
			borderRadius: '0.5rem',
			padding: isMobile ? '0.75rem' : '0.85rem 1rem',
			fontSize: isMobile ? '0.78rem' : '0.9rem',
			overflowX: 'auto',
			fontFamily: '"Fira Code", "Roboto Mono", monospace',
		},
		tabContainer: {
			display: 'flex',
			borderBottom: '2px solid #e2e8f0',
			marginBottom: isMobile ? '1rem' : '1.5rem',
			overflowX: 'auto',
			paddingBottom: '1px',
			msOverflowStyle: 'none',
			scrollbarWidth: 'none',
		},
		tab: {
			appearance: 'none',
			background: 'transparent',
			border: 0,
			borderBottom: '3px solid transparent',
			color: '#64748b',
			cursor: 'pointer',
			font: 'inherit',
			fontSize: isMobile ? '0.85rem' : '0.95rem',
			fontWeight: 600,
			padding: isMobile ? '0.55rem 0.75rem' : '0.75rem 1.1rem',
			transition: 'color 0.2s ease, border-color 0.2s ease',
			whiteSpace: 'nowrap',
		},
		activeTab: {
			color: '#2563eb',
			borderBottomColor: '#2563eb',
		},
		exampleShell: {
			background: '#f8fafc',
			borderRadius: '1rem',
			padding: isMobile ? '1rem 0.85rem' : '1.25rem',
			boxShadow: 'inset 0 1px 3px rgba(15, 23, 42, 0.05)',
		},
		exampleHeader: {
			display: 'grid',
			gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) auto',
			gap: isMobile ? '0.85rem' : '1rem',
			alignItems: 'start',
			marginBottom: '1rem',
		},
		h2: {
			color: '#273449',
			fontSize: isMobile ? '1.2rem' : '1.45rem',
			fontWeight: 700,
			margin: '0 0 0.35rem',
		},
		tagline: {
			color: '#475569',
			fontSize: isMobile ? '0.95rem' : '1rem',
			fontWeight: 600,
			lineHeight: 1.45,
			margin: 0,
		},
		details: {
			color: '#64748b',
			fontSize: isMobile ? '0.9rem' : '0.95rem',
			lineHeight: 1.55,
			margin: '0.5rem 0 0',
			maxWidth: '680px',
		},
		chips: {
			display: 'flex',
			flexWrap: 'wrap',
			gap: '0.45rem',
			justifyContent: isMobile ? 'flex-start' : 'flex-end',
			maxWidth: isMobile ? '100%' : '320px',
		},
		chip: {
			background: '#eff6ff',
			border: '1px solid #bfdbfe',
			borderRadius: '999px',
			color: '#1d4ed8',
			fontFamily: '"Fira Code", "Roboto Mono", monospace',
			fontSize: '0.76rem',
			lineHeight: 1,
			padding: '0.45rem 0.55rem',
			whiteSpace: 'nowrap',
		},
		slider: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			margin: isMobile ? '1rem 0 0.75rem' : '1.25rem 0 1rem',
			padding: isMobile ? '0.5rem' : '1rem',
			transform: isMobile ? 'scale(0.86)' : 'scale(1)',
			transformOrigin: 'center center',
		},
		codeActions: {
			textAlign: 'center',
			margin: '1rem 0 0',
		},
		button: {
			alignItems: 'center',
			backgroundColor: '#eef2ff',
			border: '1px solid #c7d2fe',
			borderRadius: '0.5rem',
			color: '#3730a3',
			cursor: 'pointer',
			display: 'inline-flex',
			fontSize: isMobile ? '0.88rem' : '0.95rem',
			fontWeight: 600,
			gap: '0.4rem',
			justifyContent: 'center',
			padding: isMobile ? '0.55rem 0.85rem' : '0.65rem 1rem',
		},
		codeContainer: {
			transition: 'max-height 0.3s ease, opacity 0.3s ease, margin 0.3s ease',
			maxHeight: showMobileCode ? '760px' : '0',
			opacity: showMobileCode ? 1 : 0,
			overflow: 'hidden',
			margin: showMobileCode ? '1rem 0 0' : '0',
		},
		pre: {
			background: '#111827',
			border: '1px solid #1f2937',
			borderRadius: '0.75rem',
			color: '#e5e7eb',
			fontFamily: '"Fira Code", "Roboto Mono", monospace',
			fontSize: isMobile ? '0.78rem' : '0.88rem',
			lineHeight: 1.6,
			margin: isMobile ? 0 : '1.25rem 0 0',
			overflowX: 'auto',
			padding: isMobile ? '1rem' : '1.1rem 1.25rem',
		},
		footer: {
			marginTop: isMobile ? '1.5rem' : '2rem',
			textAlign: 'center',
			fontSize: isMobile ? '0.8rem' : '0.9rem',
			color: '#64748b',
			paddingBottom: '0.5rem',
		},
		footerText: {
			margin: '0 0 0.35rem',
		},
		donateLink: {
			color: '#475569',
			textDecoration: 'underline',
			textDecorationColor: '#cbd5e1',
			textUnderlineOffset: '3px',
		},
	};

	return (
		<div style={styles.wrapper}>
			<main style={styles.container}>
				<header style={styles.header}>
					<h1 style={styles.h1}>
						<span style={styles.icon}>React Circular Slider</span>
					</h1>
					<p style={styles.intro}>
						Interactive configuration examples for common dial patterns. Pick a tab, try the slider, and use the highlighted props with the code sample.
					</p>
					<pre style={styles.install}>npm install @fseehawer/react-circular-slider</pre>
				</header>

				<nav style={styles.tabContainer} role="tablist" aria-label="Configuration examples">
					{examples.map((example, index) => (
						<button
							key={example.title}
							id={`tab-${index}`}
							type="button"
							role="tab"
							aria-selected={activeTab === index}
							aria-controls={`panel-${index}`}
							style={{
								...styles.tab,
								...(activeTab === index ? styles.activeTab : {}),
							}}
							onClick={() => handleTabChange(index)}
						>
							{example.title}
						</button>
					))}
				</nav>

				<section
					id={`panel-${activeTab}`}
					role="tabpanel"
					aria-labelledby={`tab-${activeTab}`}
					style={styles.exampleShell}
				>
					<div style={styles.exampleHeader}>
						<div>
							<h2 style={styles.h2}>{activeExample.tagline}</h2>
							<p style={styles.details}>{activeExample.details}</p>
						</div>
						<div style={styles.chips} aria-label="Highlighted props">
							{activeExample.highlights.map((prop) => (
								<code key={prop} style={styles.chip}>
									{prop}
								</code>
							))}
						</div>
					</div>

					<div key={activeExample.title} style={styles.slider}>
						{activeExample.render()}
					</div>

					{isMobile ? (
						<>
							<div style={styles.codeActions}>
								<button
									type="button"
									onClick={() => setShowMobileCode((isVisible) => !isVisible)}
									style={styles.button}
								>
									{showMobileCode ? 'Hide Code Sample' : 'View Code Sample'}
									<span>{showMobileCode ? '▲' : '▼'}</span>
								</button>
							</div>
							<div style={styles.codeContainer}>
								<pre style={styles.pre}>{activeExample.code}</pre>
							</div>
						</>
					) : (
						<pre style={styles.pre}>{activeExample.code}</pre>
					)}
				</section>

				<footer style={styles.footer}>
					<p style={styles.footerText}>© 2026 React Circular Slider</p>
					<a
						href="https://www.paypal.com/donate?hosted_button_id=GGLRKKGFPTXJW"
						target="_blank"
						rel="noreferrer"
						style={styles.donateLink}
					>
						Support maintenance
					</a>
				</footer>
			</main>
		</div>
	);
};

export default App;
