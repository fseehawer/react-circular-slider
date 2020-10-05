import React from 'react';
import CircularSlider from './CircularSlider';
import { ReactComponent as DragIcon } from './assets/drag.svg';
import { ReactComponent as EmojiIcon } from './assets/emoji.svg';

const App = () => {
	const styles = {
		wrapper: {
			margin: '2rem',
		},

		h3: {
			margin: '3rem 0 2rem 0',
		},

		pre: {
			fontSize: '0.9rem',
			borderRadius: '0.3rem',
			backgroundColor: '#eeeeee',
			padding: '0.5rem',
		},

		slider: {
			padding: '0 0 0.5rem 0',
		},
	};

	return (
		<div style={styles.wrapper}>
			<h3 style={styles.h3}>
				Anticlockwise rotation with the knob positioned to the right and "°"
				appended to the value:
			</h3>
			<div style={styles.slider}>
				<CircularSlider
					direction={-1}
					knobPosition='right'
					appendToValue='°'
					valueFontSize='4rem'
				/>
			</div>
			<pre className={styles.pre}>
				{`<CircularSlider
    min={0}
    max={360}
    direction={-1}
    knobPosition="right"
    appendToValue="°"
    valueFontSize="4rem"
/>`}
			</pre>
			<h3 className={styles.h3}>
				An initial value of 20, "$" prepended and "K" appended to the value with
				a custom knob icon and the label on the bottom:
			</h3>
			<div className={styles.slider}>
				<CircularSlider
					label='savings account'
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
			<pre className={styles.pre}>
				{`import { ReactComponent as PowerIcon } from './assets/power.svg';
.
.
.
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
    progressColorTo="#005a58"
    progressSize={24}
    trackColor="#eeeeee"
    trackSize={24}
>
    <DragIcon x='22' y='22' width='28px' height='28px' />
</CircularSlider>`}
			</pre>
			<h3 className={styles.h3}>
				A flat line cap with the track size smaller than the progress track size
				and a smiley knob:
			</h3>
			<div className={styles.slider}>
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
			<pre className={styles.pre}>
				{`
import { ReactComponent as EmojiIcon } from './assets/emoji.svg';
.
.
.
<CircularSlider
    width={200}
    progressLineCap="flat"
    dataIndex={1}
    label="Alphabet"
    data=["A","B","C"]//...
    labelColor="#212121"
    valueFontSize="6rem"
    verticalOffset="1rem"
    knobColor="#212121"
    progressColorFrom="#ff8500"
    progressColorTo="#a15400"
    progressSize={8}
    trackColor="#eeeeee"
    trackSize={4}
>
    <EmojiIcon x="9" y="9" width="18px" height="18px" />
</CircularSlider>`}
			</pre>
		</div>
	);
};

export default App;
