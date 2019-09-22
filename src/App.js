import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import CircularSlider from "./CircularSlider";

const App = () => {
    const styles = StyleSheet.create({
        wrapper: {
            marginTop: '4rem',
            textAlign: 'center'
        }
    });

    return (
        <div className={css(styles.wrapper)}>
            <CircularSlider
            />
        </div>
    );
};

export default App;
