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

    const onChange = (deg) => {
      console.log(deg);
    };

    return (
        <div className={css(styles.wrapper)}>
            <CircularSlider
                onChange={onChange}
            />
        </div>
    );
};

export default App;
