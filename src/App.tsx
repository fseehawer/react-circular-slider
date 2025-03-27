import React from 'react';
import CircularSlider from './CircularSlider';
import DragIcon from './assets/drag.svg?react';
import EmojiIcon from './assets/emoji.svg?react';

const App = () => {
	const [isDragging, setIsDragging] = React.useState(false);
	const [sliderValue, setSliderValue] = React.useState(0);

	const styles = {
		// Page background and global font
		wrapper: {
			padding: '1rem',
			background: '#fafafa',
			minHeight: '100vh',
			fontFamily: 'Inter, sans-serif',
			color: '#333',
		},
		// Central card container
		container: {
			maxWidth: '680px',
			margin: '0 auto',
			background: '#fff',
			padding: '2rem',
			borderRadius: '1rem',
			boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
		},
		// Main heading
		h1: {
			fontSize: '1.7rem',
			fontWeight: 600,
			marginBottom: '0.5rem',
			color: '#202124',
			marginTop: 0
		},
		// Intro paragraph
		intro: {
			fontSize: '1rem',
			color: '#5f6368',
			lineHeight: 1.6,
			marginBottom: '1.5rem',
		},
		// Subheadings
		h3: {
			fontSize: '1.25rem',
			fontWeight: 500,
			color: '#202124',
			margin: '2rem 0 1rem',
			borderBottom: '1px solid #ddd',
			paddingBottom: '0.5rem',
		},
		// Code blocks
		pre: {
			fontSize: '0.85rem',
			background: '#f1f3f4',
			color: '#3c4043',
			borderRadius: '8px',
			padding: '1rem',
			overflowX: 'auto',
			lineHeight: 1.5,
			fontFamily: 'monospace',
		},
		// Slider section wrapper
		slider: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			flexWrap: 'wrap',
			marginBottom: '2rem',
			marginTop: '1rem',
		},
		// Buttons
		button: {
			padding: '0.5rem 1rem',
			fontSize: '0.9rem',
			backgroundColor: '#4285f4',
			color: '#fff',
			borderRadius: '4px',
			border: 'none',
			margin: '0.3rem',
			cursor: 'pointer',
			transition: 'background 0.2s ease-in-out',
		},
		// Divider line
		divider: {
			border: 'none',
			height: '1px',
			background: '#e0e0e0',
			margin: '3rem 0',
		},
	};

	return (
		<div style={styles.wrapper}>
			<div style={styles.container}>
				<h1 style={styles.h1}>🎯 React Circular Slider</h1>
				<p style={styles.intro}>
					Explore various configurations of the customizable circular slider component.
				</p>

				<h3 style={styles.h3}>Knob on the left and "°" added to the value:</h3>
				<div style={styles.slider}>
					<CircularSlider
						label="Temperature"
						knobPosition="left"
						appendToValue="°"
						valueFontSize="4rem"
						trackColor="#eeeeee"
						progressColorFrom={isDragging ? '#F0A367' : '#00bfbd'}
						progressColorTo={isDragging ? '#F65749' : '#009c9a'}
						labelColor={isDragging ? '#F0A367' : '#00bfbd'}
						knobColor={isDragging ? '#F0A367' : '#00bfbd'}
						isDragging={(value) => setIsDragging(value)}
					/>
				</div>
				<pre style={styles.pre}>{`<CircularSlider
  label="Temperature"
  knobPosition="left"
  appendToValue="°"
/>`}</pre>

				<hr style={styles.divider} />

				<h3 style={styles.h3}>
					Initial value with "$" and "K" using a custom knob icon:
				</h3>
				<div style={styles.slider}>
					<CircularSlider
						label="savings"
						min={0}
						max={100}
						dataIndex={20}
						prependToValue="$"
						appendToValue="K"
						labelColor="#005a58"
						labelBottom={true}
						knobColor="#005a58"
						knobSize={72}
						progressColorFrom="#00bfbd"
						progressColorTo="#009c9a"
						progressSize={24}
						trackColor="#eeeeee"
						trackSize={24}
					>
						<DragIcon x="22" y="22" width="28px" height="28px" />
					</CircularSlider>
				</div>
				<pre style={styles.pre}>{`<CircularSlider
  label="savings"
  min={0}
  max={100}
  dataIndex={20}
  prependToValue="$"
  appendToValue="K"
  labelColor="#005a58"
  labelBottom={true}
  knobColor="#005a58"
  knobSize={72}
  progressColorFrom="#00bfbd"
  progressColorTo="#009c9a"
  progressSize={24}
  trackColor="#eeeeee"
  trackSize={24}
>
  <DragIcon x="22" y="22" width="28px" height="28px" />
</CircularSlider>`}</pre>

				<hr style={styles.divider} />

				<h3 style={styles.h3}>Flat line cap with a smiley knob and character data:</h3>
				<div style={styles.slider}>
					<CircularSlider
						label="Alphabet"
						progressLineCap="flat"
						dataIndex={1}
						width={250}
						labelColor="#212121"
						valueFontSize="6rem"
						verticalOffset="1rem"
						knobColor="#212121"
						progressColorFrom="#ff8500"
						progressColorTo="#a15400"
						progressSize={8}
						trackColor="#eeeeee"
						trackSize={4}
						data={'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')}
					>
						<EmojiIcon x="9" y="9" width="18px" height="18px" />
					</CircularSlider>
				</div>
				<pre style={styles.pre}>{`<CircularSlider
  label="Alphabet"
  progressLineCap="flat"
  dataIndex={1}
  width={250}
  labelColor="#212121"
  valueFontSize="6rem"
  verticalOffset="1rem"
  knobColor="#212121"
  progressColorFrom="#ff8500"
  progressColorTo="#a15400"
  progressSize={8}
  trackColor="#eeeeee"
  trackSize={4}
  data={["A", "B", "C", "D", "E", ...]}
>
  <EmojiIcon x="9" y="9" width="18px" height="18px" />
</CircularSlider>`}</pre>

				<hr style={styles.divider} />

				<h3 style={styles.h3}>Continuous mode (like an iPod click wheel):</h3>
				<div style={styles.slider}>
					<CircularSlider
						min={0}
						max={360}
						continuous={{
							enabled: true,
							clicks: 100,
							increment: 1,
						}}
					/>
				</div>
				<pre style={styles.pre}>{`<CircularSlider
  min={0}
  max={360}
  continuous={{
    enabled: true,
    clicks: 100,
    increment: 1
  }}
/>`}</pre>

				<h3 style={styles.h3}>🙏 Support the project</h3>
				<p>If you find this component useful, consider a small donation. Even one dollar helps!</p>
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
		</div>
	);
};

export default App;
