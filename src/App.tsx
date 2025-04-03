import React from 'react';
import CircularSlider from './CircularSlider';
import DragIcon from './assets/drag.svg?react';
import EmojiIcon from './assets/emoji.svg?react';

const App = () => {
	const [isHot, setIsHot] = React.useState(true);
	const [activeTab, setActiveTab] = React.useState(0);
	const [isMobile, setIsMobile] = React.useState(false);
	const [showMobileCode, setShowMobileCode] = React.useState(false);

	// Check for mobile screen size on component mount and resize
	React.useEffect(() => {
		const checkScreenSize = () => {
			setIsMobile(window.innerWidth < 768);
		};

		// Initial check
		checkScreenSize();

		// Listen for window resize
		window.addEventListener('resize', checkScreenSize);

		// Cleanup
		return () => window.removeEventListener('resize', checkScreenSize);
	}, []);

	// Store a reference to each slider component for refreshing
	const sliderRefs = React.useRef([
		React.createRef(),
		React.createRef(),
		React.createRef(),
		React.createRef()
	]);

	const styles = {
		// Page background with gradient
		wrapper: {
			padding: isMobile ? '0.75rem 0.5rem' : '1rem',
			background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
			minHeight: '100vh',
			fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
			color: '#2d3748',
		},
		// Central card container with improved shadow
		container: {
			maxWidth: '780px',
			margin: isMobile ? '0 auto' : '1rem auto',
			background: '#fff',
			padding: isMobile ? '1.4rem 1.25rem' : '1.5rem 2rem',
			borderRadius: isMobile ? '1rem' : '1.25rem',
			boxShadow: '0 10px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
		},
		// Main heading with accent color
		h1: {
			fontSize: isMobile ? '1.6rem' : '2rem',
			fontWeight: 700,
			marginBottom: isMobile ? '0.75rem' : '1rem',
			color: '#2c3e50',
			marginTop: 0,
			display: 'flex',
			alignItems: 'center',
			flexWrap: isMobile ? 'wrap' : 'nowrap', // Changed to wrap on mobile
			justifyContent: isMobile ? 'center' : 'flex-start', // Center on mobile
		},
		// Icon sizing - updated for mobile
		icon: {
			fontSize: isMobile ? '3rem' : '1.5em',
			marginRight: isMobile ? 0 : '0.3em',
			marginBottom: isMobile ? '0.5rem' : 0,
			display: 'block',
			width: isMobile ? '100%' : 'auto',
			textAlign: isMobile ? 'center' : 'left',
		},
		// Title text container for mobile
		titleText: {
			width: isMobile ? '100%' : 'auto',
			textAlign: isMobile ? 'center' : 'left',
		},
		// More refined intro paragraph
		intro: {
			fontSize: isMobile ? '1rem' : '1.125rem',
			color: '#5a6a7d',
			lineHeight: 1.6,
			marginBottom: isMobile ? '1.5rem' : '2.5rem',
			maxWidth: '100%',
			textAlign: isMobile ? 'center' : 'left',
		},
		// Improved subheadings with accent color
		h3: {
			fontSize: isMobile ? '1.1rem' : '1.35rem',
			fontWeight: 600,
			color: '#334155',
			margin: isMobile ? '1.5rem 0 1rem' : '2.5rem 0 1.25rem',
			borderBottom: '2px solid #f0f4f8',
			paddingBottom: '0.75rem',
		},
		// Enhanced code blocks
		pre: {
			fontSize: isMobile ? '0.8rem' : '0.9rem',
			background: '#f8fafc',
			color: '#334155',
			borderRadius: '0.75rem',
			padding: isMobile ? '1rem' : '1.25rem',
			overflowX: 'auto',
			lineHeight: 1.6,
			fontFamily: '"Fira Code", "Roboto Mono", monospace',
			boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
			border: '1px solid #e2e8f0',
		},
		// Slider section with card effect
		sliderSection: {
			background: '#f8fafc',
			borderRadius: '1rem',
			padding: isMobile ? '0.25rem 0.75rem' : '0.5rem 1.5rem',
			boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
		},
		// Slider display area
		slider: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			flexWrap: 'wrap',
			marginBottom: isMobile ? '1rem' : '1.5rem',
			marginTop: isMobile ? '0.75rem' : '1rem',
			padding: isMobile ? '0.5rem' : '1rem',
			position: 'relative',
			// Scale down for mobile to fit better
			transform: isMobile ? 'scale(0.85)' : 'scale(1)',
			transformOrigin: 'center center',
		},
		// Improved buttons
		button: {
			padding: isMobile ? '0.5rem 1rem' : '0.6rem 1.2rem',
			fontSize: isMobile ? '0.9rem' : '0.95rem',
			backgroundColor: '#3b82f6',
			color: '#fff',
			borderRadius: '0.5rem',
			border: 'none',
			margin: '0.5rem',
			cursor: 'pointer',
			transition: 'all 0.2s ease-in-out',
			fontWeight: 500,
			boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
			outline: 'none',
		},
		// Code toggle button
		codeToggleButton: {
			backgroundColor: '#f1f5f9',
			color: '#475569',
			boxShadow: 'none',
			border: '1px solid #e2e8f0',
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '0.4rem',
		},
		// Refined divider line
		divider: {
			border: 'none',
			height: '1px',
			background: 'linear-gradient(to right, transparent, #cbd5e1, transparent)',
			margin: isMobile ? '3rem 0' : '4rem 0',
		},
		// Navigation tabs for examples
		tabContainer: {
			display: 'flex',
			borderBottom: '2px solid #e2e8f0',
			marginBottom: isMobile ? '1.25rem' : '2rem',
			overflowX: 'auto',
			paddingBottom: '1px',
			// Hide scrollbar but allow scrolling
			msOverflowStyle: 'none', /* IE and Edge */
			scrollbarWidth: 'none', /* Firefox */
		},
		// Animation for showing/hiding code
		codeContainer: {
			transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out, margin 0.3s ease-in-out',
			maxHeight: showMobileCode ? '500px' : '0',
			opacity: showMobileCode ? 1 : 0,
			overflow: 'hidden',
			margin: showMobileCode ? '1rem 0' : '0',
		},
		tab: {
			padding: isMobile ? '0.5rem 0.75rem' : '0.75rem 1.25rem',
			fontSize: isMobile ? '0.85rem' : '0.95rem',
			fontWeight: 500,
			color: '#64748b',
			cursor: 'pointer',
			borderBottom: '3px solid transparent',
			transition: 'all 0.2s ease',
			whiteSpace: 'nowrap',
		},
		activeTab: {
			color: '#3b82f6',
			borderBottomColor: '#3b82f6',
		},
		// Donation section styling
		donationSection: {
			marginTop: isMobile ? '2rem' : '3rem',
			padding: isMobile ? '1.25rem 1rem' : '1.5rem',
			background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
			borderRadius: '0.75rem',
			border: '1px solid #c2e0ff',
			textAlign: 'center',
		},
		donationTitle: {
			fontSize: isMobile ? '1.1rem' : '1.25rem',
			fontWeight: 600,
			color: '#0369a1',
			marginBottom: '0.75rem',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '0.5rem',
		},
		donationText: {
			color: '#0c4a6e',
			marginBottom: '1rem',
			fontSize: isMobile ? '0.9rem' : 'inherit',
		},
		// Footer credits
		footer: {
			marginTop: isMobile ? '2rem' : '3rem',
			textAlign: 'center',
			fontSize: isMobile ? '0.8rem' : '0.9rem',
			color: '#64748b',
			paddingBottom: '1rem',
		},
	};

	// Example information - removed Continuous, added Rating example
	const tabs = [
		{ title: "Temperature", description: "The starting knob is positioned on the left, displaying the value with a '°' symbol. The color changes when the value exceeds 0°." },
		{ title: "Investment", description: "Initial value with '$' and 'K' using a custom knob icon" },
		{ title: "Alphabet", description: "Butt line cap with a smiley knob and character data" },
		{ title: "Rating", description: "Star rating selector with custom icon and color gradient" }
	];

	// Toggle the code visibility on mobile
	const toggleMobileCode = () => {
		setShowMobileCode(!showMobileCode);
	};

	// Function called when changing tabs to reset states and refresh slider
	const handleTabChange = (index) => {
		setActiveTab(index);
		setIsHot(false);

		// Add small delay to make sure the new tab's slider is mounted
		setTimeout(() => {
			if (sliderRefs.current[index] &&
				sliderRefs.current[index].current &&
				typeof sliderRefs.current[index].current.refresh === 'function') {
				sliderRefs.current[index].current.refresh();
			}
		}, 50);
	};

	return (
		<div style={styles.wrapper}>
			<div style={styles.container}>
				<h1 style={styles.h1}>
					<span style={styles.icon}>🎯</span>
					<span style={styles.titleText}>React Circular Slider</span>
				</h1>

				<p style={styles.intro}>
					{isMobile ?
						"A customizable circular slider for React apps. Perfect for intuitive dial interfaces." :
						"A highly customizable circular slider component for React applications. Perfect for temperature controls, volume knobs, timer selectors, and any UI that requires an intuitive dial interface."
					}
				</p>

				{/* Tab navigation for examples */}
				<div style={styles.tabContainer}>
					{tabs.map((tab, index) => (
						<div
							key={index}
							style={{
								...styles.tab,
								...(activeTab === index ? styles.activeTab : {})
							}}
							onClick={() => handleTabChange(index)}
						>
							{tab.title}
						</div>
					))}
				</div>

				{/* Current example section */}
				<div style={styles.sliderSection}>
					<h3 style={{ ...styles.h3, marginTop: isMobile ? '0.25rem' : '0.5rem' }}>
						{tabs[activeTab].description}
					</h3>

					<div style={styles.slider}>
						{activeTab === 0 && (
							<CircularSlider
								ref={sliderRefs.current[0]}
								label="Temperature"
								knobPosition="left"
								appendToValue="°"
								min={-100}
								max={100}
								dataIndex={120}
								valueFontSize={isMobile ? "3.5rem" : "4rem"}
								trackColor="#e2e8f0"
								progressColorFrom={isHot ? '#F0A367' : '#38bdf8'}
								progressColorTo={isHot ? '#F65749' : '#0284c7'}
								labelColor={isHot ? '#F0A367' : '#0284c7'}
								knobColor={isHot ? '#F0A367' : '#0284c7'}
								onChange={(value) => setIsHot(Number(value) > 0)}
								width={250}
							/>
						)}

						{activeTab === 1 && (
							<CircularSlider
								ref={sliderRefs.current[1]}
								label="savings"
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
								<DragIcon x={isMobile ? "18" : "22"} y={isMobile ? "18" : "22"} width={isMobile ? "24px" : "28px"} height={isMobile ? "24px" : "28px"} />
							</CircularSlider>
						)}

						{activeTab === 2 && (
							<CircularSlider
								ref={sliderRefs.current[2]}
								label="Alphabet"
								progressLineCap="butt"
								dataIndex={1}
								width={250}
								labelColor="#4b5563"
								valueFontSize={isMobile ? "5rem" : "6rem"}
								verticalOffset={isMobile ? "0.75rem" : "1rem"}
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
						)}

						{activeTab === 3 && (
							<CircularSlider
								ref={sliderRefs.current[3]}
								label="Star Rating"
								min={0}
								max={10}
								dataIndex={5}
								width={250}
								labelColor="#f59e0b"
								valueFontSize={isMobile ? "4rem" : "5rem"}
								knobColor="#facc15"
								progressColorFrom="#fbbf24"
								progressColorTo="#f59e0b"
								progressSize={10}
								trackColor="#fef3c7"
								trackSize={6}
								knobSize={isMobile ? 60 : 68}
							>
								{/* You'll need to create a StarIcon SVG or use another icon here */}
								<svg
									width={isMobile ? 25 : 35}
									height={isMobile ? 25 : 35}
									viewBox="0 0 24 24"
									fill="#fff"
									preserveAspectRatio="xMidYMid meet"
									style={{
										filter: 'drop-shadow(0px 0px 1px rgba(0, 0, 0, 0.2))'
									}}
									x="17"
									y="17"
								>
									<path
										d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
								</svg>
							</CircularSlider>
						)}
					</div>
				</div>

				{/* Code display section - conditionally render based on mobile or not */}
				{isMobile ? (
					// On mobile, toggle code visibility
					<>
						<div style={{textAlign: 'center', margin: '1rem 0'}}>
							<button
								onClick={toggleMobileCode}
								style={{
									...styles.button,
									...styles.codeToggleButton
								}}
							>
								{showMobileCode ? 'Hide Code Sample' : 'View Code Sample'}
								<span style={{ fontSize: '0.8rem', marginTop: '2px' }}>
									{showMobileCode ? '▲' : '▼'}
								</span>
							</button>
						</div>

						<div style={styles.codeContainer}>
							{activeTab === 0 && (
								<pre style={styles.pre}>
{`<CircularSlider
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
/>`}
								</pre>
							)}

							{activeTab === 1 && (
								<pre style={styles.pre}>
{`<CircularSlider
  label="savings"
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
</CircularSlider>`}
								</pre>
							)}

							{activeTab === 2 && (
								<pre style={styles.pre}>
{`<CircularSlider
  label="Alphabet"
  progressLineCap="butt"
  dataIndex={1}
  width={250}
  labelColor="#4b5563"
  valueFontSize="6rem"
  verticalOffset="1rem"
  knobColor="#4b5563"
  progressColorFrom="#f59e0b"
  progressColorTo="#d97706"
  progressSize={8}
  trackColor="#e5e7eb"
  trackSize={4}
  data={["A", "B", "C", "D", "E", ...]}
>
  <EmojiIcon x="9" y="9" width="18px" height="18px" />
</CircularSlider>`}
								</pre>
							)}

							{activeTab === 3 && (
								<pre style={styles.pre}>
{`<CircularSlider
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
  <StarIcon width="24" height="24" fill="#fff" />
</CircularSlider>`}
								</pre>
							)}
						</div>
					</>
				) : (
					// On desktop, always show the code
					<>
						{activeTab === 0 && (
							<pre style={styles.pre}>
{`<CircularSlider
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
/>`}
							</pre>
						)}

						{activeTab === 1 && (
							<pre style={styles.pre}>
{`<CircularSlider
  label="savings"
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
</CircularSlider>`}
							</pre>
						)}

						{activeTab === 2 && (
							<pre style={styles.pre}>
{`<CircularSlider
  label="Alphabet"
  progressLineCap="butt"
  dataIndex={1}
  width={250}
  labelColor="#4b5563"
  valueFontSize="6rem"
  verticalOffset="1rem"
  knobColor="#4b5563"
  progressColorFrom="#f59e0b"
  progressColorTo="#d97706"
  progressSize={8}
  trackColor="#e5e7eb"
  trackSize={4}
  data={["A", "B", "C", "D", "E", ...]}
>
  <EmojiIcon x="9" y="9" width="18px" height="18px" />
</CircularSlider>`}
							</pre>
						)}

						{activeTab === 3 && (
							<pre style={styles.pre}>
{`<CircularSlider
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
  <StarIcon width="24" height="24" fill="#fff" />
</CircularSlider>`}
							</pre>
						)}
					</>
				)}

				{/* Donation section with improved styling */}
				<div style={styles.donationSection}>
					<div style={styles.donationTitle}>
						<span role="img" aria-label="Praying hands">🙏</span> Support the project
					</div>
					<p style={styles.donationText}>
						{isMobile ?
							"If you find this component useful, please consider a small donation." :
							"If you find this component useful for your projects, consider a small donation. Every contribution helps maintain and improve this tool!"
						}
					</p>
					<form action="https://www.paypal.com/donate" method="post" target="_top">
						<input type="hidden" name="hosted_button_id" value="GGLRKKGFPTXJW" />
						<input
							type="image"
							src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
							border="0"
							name="submit"
							title="PayPal - The safer, easier way to pay online!"
							alt="Donate with PayPal button"
						/>
						<img
							alt=""
							border="0"
							src="https://www.paypal.com/en_DE/i/scr/pixel.gif"
							width="1"
							height="1"
						/>
					</form>
				</div>

				{/* Footer with credits */}
				<div style={styles.footer}>
					<p>© 2025 React Circular Slider • Made with ❤️ by a developer, for developers</p>
				</div>
			</div>
		</div>
	);
};

export default App;