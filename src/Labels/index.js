import React from 'react';
import {StyleSheet, css} from 'aphrodite';

const Labels = (props) => {
    const {
        labelColor,
        labelFontSize,
        labelValueFontSize,
        labelVerticalOffset,
        labelHide,
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
            userSelect: 'none',
            zIndex: 1,
        },

        value: {
            fontSize: `${labelValueFontSize}`,
            marginBottom: `calc(${labelVerticalOffset})`
        },

        hide: {
            display: 'none'
        }
    });

    return (
        <div className={css(styles.labels, labelHide && styles.hide)}>
            <div style={{fontSize: labelFontSize}}>{label}</div>
            <div className={css(styles.value)}>
                <code>{value}</code>
            </div>
        </div>
    );
};

export default Labels;
