import React from 'react';
import {StyleSheet, css} from 'aphrodite';
import CircularSlider from "./CircularSlider";

const App = () => {
    const styles = StyleSheet.create({
        wrapper: {
            margin: '4rem auto',
            maxWidth: '20rem'
        }
    });

    return (
        <div className={css(styles.wrapper)}>
            <CircularSlider />
        </div>
    );
};

export default App;
