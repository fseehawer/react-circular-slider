import React from 'react';
import CircularSlider from './CircularSlider';
import DragIcon from './assets/drag.svg?react';
import EmojiIcon from './assets/emoji.svg?react';

const App = () => {
	const [isDragging, setIsDragging] = React.useState(false);
	const [sliderValue, setSliderValue] = React.useState(0);

	const styles = {
		wrapper: {
			padding: '2rem',
			background: '#f9f9fb',
			minHeight: '100vh',
			fontFamily: '"Inter", sans-serif',
		},
		container: {
			maxWidth: '900px',
			margin: '0 auto',
			background: '#fff',
			padding: '2rem',
			borderRadius: '1rem',
			boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
		},
		h1: {
			fontSize: '2rem',
			fontWeight: 600,
			color: '#333',
		},
		intro: {
			color: '#666',
			fontSize: '1rem',
			marginBottom: '2rem',
		},
		h3: {
			fontSize: '1.4rem',
			color: '#333',
			margin: '2.5rem 0 1rem',
			borderBottom: '1px solid #ddd',
			paddingBottom: '0.3rem',
		},
		pre: {
			fontSize: '0.85rem',
			background: '#1e1e1e',
			color: '#dcdcdc',
			borderRadius: '8px',
			padding: '1rem',
			overflowX: 'auto',
			fontFamily: 'monospace',
			lineHeight: '1.5',
		},
		slider: {
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			flexWrap: 'wrap',
			marginBottom: '1rem',
		},
		button: {
			padding: '0.5rem 1rem',
			fontSize: '1rem',
			backgroundColor: '#00bfbd',
			color: '#fff',
			borderRadius: '0.5rem',
			border: 'none',
			margin: '0.3rem',
			cursor: 'pointer',
			transition: 'background 0.2s ease-in-out',
		},
		divider: {
			border: 'none',
			height: '1px',
			background: '#eee',
			margin: '3rem 0',
		}
	};

	return (
		<div style={styles.wrapper}>
			<div style={styles.container}>
				<h1 style={styles.h1}>🎯 React Circular Slider Demo</h1>
				<p style={styles.intro}>Explore various configurations of the customizable circular slider component.</p>

				<h3 style={styles.h3}>Anticlockwise rotation with knob on right and "+°" label:</h3>
				<div style={styles.slider}>
					<CircularSlider
						label='Temperature'
						direction={-1}
						knobPosition='right'
						appendToValue='°'
						valueFontSize='4rem'
						trackColor="#eeeeee"
						progressColorFrom={isDragging ? "#F0A367" : "#00bfbd"}
						progressColorTo={isDragging ? "#F65749" : "#009c9a"}
						labelColor={isDragging ? "#F0A367" : "#00bfbd"}
						knobColor={isDragging ? "#F0A367" : "#00bfbd"}
						isDragging={(value) => setIsDragging(value)}
					/>
				</div>
				<div>isDragging: {isDragging ? "yes 🥵" : "no 😑"}</div>
				<pre style={styles.pre}>{`<CircularSlider ... />`}</pre>

				<hr style={styles.divider} />

				<h3 style={styles.h3}>Initial value with "$" and "K" using a custom knob icon:</h3>
				<div style={styles.slider}>
					<CircularSlider
						label='savings'
						min={0}
						max={100}
						dataIndex={20}
						prependToValue='$'
						appendToValue='K'
						labelColor='#005a58'
						labelBottom={true}
						knobColor='#005a58'
						knobSize={72}
						progressColorFrom='#00bfbd'
						progressColorTo='#009c9a'
						progressSize={24}
						trackColor='#eeeeee'
						trackSize={24}>
						<DragIcon x='22' y='22' width='28px' height='28px' />
					</CircularSlider>
				</div>
				<pre style={styles.pre}>{`<CircularSlider ... > <DragIcon /> </CircularSlider>`}</pre>

				<hr style={styles.divider} />

				<h3 style={styles.h3}>Flat line cap with a smiley knob and character data:</h3>
				<div style={styles.slider}>
					<CircularSlider
						label='Alphabet'
						progressLineCap='flat'
						dataIndex={1}
						width={250}
						labelColor='#212121'
						valueFontSize='6rem'
						verticalOffset='1rem'
						knobColor='#212121'
						progressColorFrom='#ff8500'
						progressColorTo='#a15400'
						progressSize={8}
						trackColor='#eeeeee'
						trackSize={4}
						data={'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')}>
						<EmojiIcon x='9' y='9' width='18px' height='18px' />
					</CircularSlider>
				</div>
				<pre style={styles.pre}>{`<CircularSlider data={['A', 'B', ...]} ... />`}</pre>

				<hr style={styles.divider} />

				<h3 style={styles.h3}>Slider bound to external state with control buttons:</h3>
				<div style={styles.slider}>
					<CircularSlider
						value={sliderValue}
						onChange={(value) => setSliderValue(value)}
					/>
				</div>
				<div style={styles.slider}>
					<h3>sliderValue: {sliderValue}</h3>
					{[ -45, -1, 0, 1, 45 ].map(val => (
						<button
							key={val}
							style={styles.button}
							onClick={() => setSliderValue(val === 0 ? 0 : sliderValue + val)}
						>{val > 0 ? `+${val}` : val}</button>
					))}
				</div>
				<pre style={styles.pre}>{`<CircularSlider value={sliderValue} onChange={...} />`}</pre>

				<hr style={styles.divider} />

				<h3 style={styles.h3}>Continuous mode (like an iPod click wheel):</h3>
				<div style={styles.slider}>
					<CircularSlider
						min={0}
						max={360}
						knobPosition='right'
						appendToValue='°'
						valueFontSize='4rem'
						trackColor="#eeeeee"
						trackDraggable={true}
						continuous={{
							enabled: true,
							clicks: 100,
							increment: 1,
						}}
					/>
				</div>
				<pre style={styles.pre}>{`<CircularSlider continuous={{ enabled: true, clicks: 100, increment: 1 }} />`}</pre>

				<hr style={styles.divider} />

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
					<img alt="" border="0" src="https://www.paypal.com/en_DE/i/scr/pixel.gif" width="1" height="1" />
				</form>
			</div>
		</div>
	);
};

export default App;
