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
        }
    });

    const onSliderChange = (deg) => {
        console.log(deg);
    };

    return (
        <div className={css(styles.wrapper)}>
            <h2 className={css(styles.h2)}>react-circular-slider</h2>
            <h3 className={css(styles.h3)}>example 1:</h3>
            <pre>
                {`<CircularSlider
    onChange={onSliderChange}
/>`}
            </pre>
            <p>&nbsp;</p>
            <CircularSlider
                onChange={onSliderChange}
            />
            <p>&nbsp;</p>
            <h3 className={css(styles.h3)}>example 2:</h3>
            <pre>
                {`<CircularSlider
    label="savings"
    data=["1€","2€",...]
    placeKnobAtIndex={10}
    labelColor="#005a58"
    knobColor="#005a58"
    progressColorFrom="#00bfbd"
    progressColorTo="#005a58"
    progressSize={24}
    trackColor="#eeeeee"
    trackSize={24}
/>`}
            </pre>
            <p>&nbsp;</p>
            <CircularSlider
                label="savings"
                labelColor={"#005a58"}
                knobColor={"#005a58"}
                progressColorFrom={"#00bfbd"}
                progressColorTo={"#009c9a"}
                progressSize={24}
                trackColor={"#eeeeee"}
                trackSize={24}
                placeKnobAtIndex={10}
                data={["1€","2€","3€","4€","5€","6€","7€","8€","9€","10€","20€","30€","40€","50€","60€","70€","80€","90€","100€","200€","300€","400€","500€","600€","700€","800€","900€","1000€","2000€","3000€","4000€","5000€","6000€","7000€","8000€","9000€","10000€"]}
            />
            <p>&nbsp;</p>
            <h3 className={css(styles.h3)}>example 3:</h3>
            <pre>
                {`<CircularSlider
    label="Alphabet"
    width={200}
    data=["A","B","C",...]
    labelColor="#212121"
    labelValueFontSize="6rem"
    knobColor="#212121"
    progressLineCap="flat"
    progressColorFrom="#ff8500"
    progressColorTo="#a15400"
    progressSize={8}
    trackColor="#eeeeee"
    trackSize={4}
/>`}
            </pre>
            <p>&nbsp;</p>
            <CircularSlider
                label="Alphabet"
                width={250}
                labelColor={"#212121"}
                labelValueFontSize={"6rem"}
                knobColor={"#212121"}
                progressColorFrom={"#ff8500"}
                progressColorTo={"#a15400"}
                progressSize={8}
                trackColor={"#eeeeee"}
                trackSize={4}
                progressLineCap="flat"
                data={"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")}
            />
            <p>&nbsp;</p>
        </div>
    );
};

export default App;
