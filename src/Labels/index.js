import React from 'react';
import {StyleSheet, css} from 'aphrodite';

const Labels = (props) => {
    const {
        labelColor,
        labelFontSize,
        labelValueFontSize,
        labelValueAppend,
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
            marginBottom: `calc(${labelVerticalOffset})`,
            position: 'relative'
        },

        appended: {
            position: 'absolute',
            right: '0',
            top: 0,
            transform: 'translate(100%, 0)'
        },

        hide: {
            display: 'none'
        }
    });

    return (
        <div className={css(styles.labels, labelHide && styles.hide)}>
            <div style={{fontSize: labelFontSize}}>{label}</div>
            <div className={css(styles.value)}>
                <code>{value}<span className={css(styles.appended)}>{labelValueAppend}</span></code>
            </div>
        </div>
    );
};

export default Labels;
