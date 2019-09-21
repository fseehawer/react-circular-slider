import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import CircularSlider from "./CircularSlider";

const App = () => {
    const styles = StyleSheet.create({
        wrapper: {
            margin: '2rem'
        }
    });

    return (
        <div className={css(styles.wrapper)}>
            <CircularSlider />
        </div>
    );
};

export default App;
