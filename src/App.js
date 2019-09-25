import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import CircularSlider from "./CircularSlider";

const App = () => {
    const styles = StyleSheet.create({
        wrapper: {
            margin: '2rem'
        },

        h2: {
            borderBottom: '1px solid #eeeeee',
            paddingBottom: '0.5rem',
        },

        h3: {
            margin: '2rem 0',
            paddingBottom: '1rem'
        }
    });

    const onChange = (deg) => {
        console.log(deg);
    };

    return (
        <div className={css(styles.wrapper)}>
            <h2 className={css(styles.h2)}>react-circular-slider</h2>
            <h3 className={css(styles.h3)}>1. with default props</h3>
            <CircularSlider
                onChange={onChange}
            />

            <h3 className={css(styles.h3)}>2. with custom props</h3>
            <CircularSlider
                label="Alphabet"
                labelColor={"#212121"}
                knobColor={"#212121"}
                progressColorFrom={"#ff8500"}
                progressColorTo={"#a15400"}
                progressSize={4}
                trackColor={"#eeeeee"}
                trackSize={12}
                customData={"ABCDEFGHIJKLMNOPQRSTUVXWYZ".split("")}
                onChange={onChange}
            />
            <p>&nbsp;</p>
            <pre>
                {`<CircularSlider
    label="Alphabet"
    customData=["A","B","C",...]
    labelColor="#212121"
    knobColor="#212121"
    progressColorFrom="#ff8500"
    progressColorTo="#a15400"
    progressSize={4}
    trackColor="#eeeeee"
    trackSize={12}
>`}
            </pre>
        </div>
    );
};

export default App;
