import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import CircularSlider from "./CircularSlider";

const App = () => {
    const styles = StyleSheet.create({
        wrapper: {
            margin: '2rem'
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
          padding: '0 0 0.5rem 0'
        }
    });

    return (
        <div className={css(styles.wrapper)}>
            <h3 className={css(styles.h3)}>Anticlockwise rotation with the knob positioned to the right:</h3>
            <div className={css(styles.slider)}>
                <CircularSlider
                    direction={-1}
                    knobZeroPosition="right"
                    labelValueAppend="°"
                />
            </div>
            <pre className={css(styles.pre)}>
                {`<CircularSlider
    direction={-1}
    knobZeroPosition="right"
    labelValueAppend="°"
/>`}
            </pre>
            <h3 className={css(styles.h3)}>Data array with an initial value:</h3>
            <div className={css(styles.slider)}>
                <CircularSlider
                    label="savings"
                    data={["1€","2€","3€","4€","5€","6€","7€","8€","9€","10€","20€","30€","40€","50€","60€","70€","80€","90€","100€","200€","300€","400€","500€","600€","700€","800€","900€","1000€","2000€","3000€","4000€","5000€","6000€","7000€","8000€","9000€","10000€"]}
                    initialDataIndex={10}
                    labelColor={"#005a58"}
                    knobColor={"#005a58"}
                    progressColorFrom={"#00bfbd"}
                    progressColorTo={"#009c9a"}
                    progressSize={24}
                    trackColor={"#eeeeee"}
                    trackSize={24}
                />
            </div>
            <pre className={css(styles.pre)}>
                {`<CircularSlider
    label="savings"
    data=["1€","2€",...]
    initialDataIndex={10}
    labelColor="#005a58"
    knobColor="#005a58"
    progressColorFrom="#00bfbd"
    progressColorTo="#005a58"
    progressSize={24}
    trackColor="#eeeeee"
    trackSize={24}
/>`}
            </pre>
            <h3 className={css(styles.h3)}>Some props with flat line cap:</h3>
            <div className={css(styles.slider)}>
                <CircularSlider
                    label="Alphabet"
                    progressLineCap="flat"
                    initialDataIndex={1}
                    width={250}
                    labelColor={"#212121"}
                    labelValueFontSize={"6rem"}
                    knobColor={"#212121"}
                    progressColorFrom={"#ff8500"}
                    progressColorTo={"#a15400"}
                    progressSize={8}
                    trackColor={"#eeeeee"}
                    trackSize={4}
                    data={"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")}
                />
            </div>
            <pre className={css(styles.pre)}>
                {`<CircularSlider
    width={200}
    progressLineCap="flat"
    initialDataIndex={1}
    label="Alphabet"
    data=["A","B","C",...]
    labelColor="#212121"
    labelValueFontSize="6rem"
    knobColor="#212121"
    progressColorFrom="#ff8500"
    progressColorTo="#a15400"
    progressSize={8}
    trackColor="#eeeeee"
    trackSize={4}
/>`}
            </pre>
        </div>
    );
};

export default App;
