import React from 'react';
import {StyleSheet, css} from 'aphrodite';

const Labels = (props) => {
    const {
        labelColor,
        labelFontSize,
        labelValueFontSize,
        label,
        value
    } = props;

    const styles = StyleSheet.create({
        labels: {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: `${labelColor}`,
            zIndex: 1,
        },

        value: {
            marginBottom: '2rem'
        },
    });

    return (
        <div className={css(styles.labels)}>
            <div style={{fontSize: labelFontSize}}>{label}</div>
            <div className={css(styles.value)} style={{fontSize: labelValueFontSize}}>
                <code>{value}</code>
            </div>
        </div>
    );
};

export default Labels;
