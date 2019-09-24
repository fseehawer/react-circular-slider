import React from 'react';
import {StyleSheet, css} from 'aphrodite';

const Labels = (props) => {
    const {
        labelColor,
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
            fontSize: '4rem',
            marginBottom: '2rem'
        },

        description: {
            fontSize: '1rem',
            textTransform: 'uppercase'
        }
    });

    return (
        <div className={css(styles.labels)}>
            <div className={css(styles.description)}>{label}</div>
            <div className={css(styles.value)}>
                <code>{value}</code>
            </div>
        </div>
    );
};

export default Labels;
