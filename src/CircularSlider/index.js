import React, {useEffect, useReducer, useCallback, useRef} from 'react';
import window from 'global';
import PropTypes from "prop-types";
import reducer from "../redux/reducer";
import useEventListener from "../hooks/useEventListener";
import useIsServer from "../hooks/useIsServer";
import Knob from "../Knob";
import Labels from "../Labels";
import Svg from "../Svg";

const spreadDegrees = 360;
const knobOffsetConsts = {
    top: Math.PI / 2,
    right: 0,
    bottom: -Math.PI / 2,
    left: -Math.PI
};

const getSliderRotation = (number) => {
    if(number < 0) return -1;
    return 1;
};

const getRadians = (degrees) => {
    return degrees * Math.PI / 180;
};

const generateRange = (min, max) => {
    let rangeOfNumbers = [];
    for(let i = min; i <= max; i++) {
        rangeOfNumbers.push(i);
    }
    return rangeOfNumbers;
};

const getKnobOffsetAmount = (knobPosition) => {
    if (knobPosition in knobOffsetConsts) return knobOffsetConsts[knobPosition];
    return getRadians(knobPosition);
};

const styles = ({
    circularSlider: {
        position: 'relative',
        display: 'inline-block',
        opacity: 0,
        transition: 'opacity 1s ease-in'
    },

    mounted: {
        opacity: 1
    },
});

const CircularSlider = ({
        label = 'ANGLE',
        width = 280,
        direction = 1,
        min = 0,
        max = 360,
        initialValue = 0,
        knobColor = '#4e63ea',
        knobSize = 36,
        knobPosition = 'top',
        labelColor = '#272b77',
        labelBottom = false,
        labelFontSize = '1rem',
        valueFontSize = '3rem',
        appendToValue = '',
        prependToValue = '',
        verticalOffset = '1.5rem',
        hideLabelValue = false,
        hideKnob = false,
        knobDraggable = true,
        progressColorFrom = '#80C3F3',
        progressColorTo = '#4990E2',
        useMouseAdditionalToTouch = false,
        progressSize = 8,
        trackColor = '#DDDEFB',
        trackSize = 8,
        trackDraggable = false,
        data = [],
        dataIndex = 0,
        progressLineCap = 'round',
        renderLabelValue = null,
        children,
        onChange = value => {},
        isDragging = value => {},
        // When continuous is enabled the wheel will go round infinitely up to
        // the max and down to the min values
        continuous = {
            enabled: false,
            clicks: 120,
            interval: 1,
        }
    }) => {
    // This is used to keep track of the previous index when continuous mode is enabled
    const continuousPreviousIndex = useRef(-1);
    const clicksPerLoop = continuous.clicks || Math.floor((max - min) / 3);

    const initialState = {
        mounted: false,
        isDragging: false,
        width: width,
        radius: width / 2,
        knobOffset: getKnobOffsetAmount(knobPosition),
        label: initialValue || 0,
        data: continuous.enabled ? Array.from(Array(clicksPerLoop).keys()) : data,
        radians: 0,
        offset: 0,
        knob: {
            x: 0,
            y: 0,
        },
        dashFullArray: 0,
        dashFullOffset: 0
    };

    const isServer = useIsServer();
    const [state, dispatch] = useReducer(reducer, initialState);
    const circularSlider = useRef(null);
    const svgFullPath = useRef(null);
    const touchSupported = !isServer && ('ontouchstart' in window);
    const useMouse = !touchSupported || (touchSupported && useMouseAdditionalToTouch);

    const setKnobPosition = useCallback((radians) => {
        const radius = state.radius - trackSize / 2;
        const offsetRadians = radians + getKnobOffsetAmount(knobPosition);
        let degrees = (offsetRadians > 0 ? offsetRadians
            :
            ((2 * Math.PI) + offsetRadians)) * (spreadDegrees / (2 * Math.PI));
        // change direction
        const dashOffset = (degrees / spreadDegrees) * state.dashFullArray;
        degrees = (getSliderRotation(direction) === -1 ? spreadDegrees - degrees : degrees);

        const pointsInCircle = (state.data.length - 1) / spreadDegrees;
        const currentPoint = Math.round(degrees * pointsInCircle);

        if(continuous?.enabled ?? false) {
            if(continuousPreviousIndex.current === -1) {
                // Calibrate the loop point of the continuous dial
                continuousPreviousIndex.current = currentPoint
                return
            }


            if(continuousPreviousIndex.current === currentPoint) {
                // If the index has not changed then we are not moving, just
                // update the position of the knob
                dispatch({
                    type: 'setKnobPosition',
                    payload: {
                        dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                        label: Number(state.label),
                        knob: {
                            x: (radius * Math.cos(radians) + radius),
                            y: (radius * Math.sin(radians) + radius),
                        }
                    }
                });
                continuousPreviousIndex.current = currentPoint
                return
            }

            // Determine the direction of the dial
            const positiveDistance = (currentPoint - continuousPreviousIndex.current + clicksPerLoop) % clicksPerLoop;
            const negativeDistance = (continuousPreviousIndex.current - currentPoint + clicksPerLoop) % clicksPerLoop;
            const positive = positiveDistance <= Math.max(1, clicksPerLoop * 0.02)
            const negative = negativeDistance <= Math.max(1, clicksPerLoop * 0.02)

            if(!positive && !negative) {
                // Protect against the dial being moved too far in one direction
                dispatch({
                    type: 'setKnobPosition',
                    payload: {
                        dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                        label: Number(state.label),
                        knob: {
                            x: (radius * Math.cos(radians) + radius),
                            y: (radius * Math.sin(radians) + radius),
                        }
                    }
                });
                continuousPreviousIndex.current = currentPoint
                return
            }

            // Increment or decrement by the interval
            const interval = continuous?.interval ?? 1
            const increment = positive ? interval * positiveDistance : -interval * negativeDistance
            
            continuousPreviousIndex.current = currentPoint
            const newValue = Math.min(max, Math.max(min, Number(state.label) + increment))
            onChange(newValue)
            dispatch({
                      type: 'setKnobPosition',
                      payload: {
                          dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                          label: newValue,
                          knob: {
                              x: (radius * Math.cos(radians) + radius),
                              y: (radius * Math.sin(radians) + radius),
                          }
                      }
                  });
            return
        } else {
            if(state.data[currentPoint] !== state.label) {
                // props callback for parent
                onChange(state.data[currentPoint]);
            }

            dispatch({
                type: 'setKnobPosition',
                payload: {
                    dashFullOffset: getSliderRotation(direction) === -1 ? dashOffset : state.dashFullArray - dashOffset,
                    label: state.data[currentPoint],
                    knob: {
                        x: (radius * Math.cos(radians) + radius),
                        y: (radius * Math.sin(radians) + radius),
                    }
                }
            });
        }
    }, [state.dashFullArray, state.radius, state.data, state.label, knobPosition, trackSize, direction, onChange, continuous.enabled]);

    const onMouseDown = () => {
        isDragging(true);
        dispatch({
            type: 'onMouseDown',
            payload: {
                isDragging: true
            }
        });
    };

    const onMouseUp = () => {
        if(continuous?.enabled ?? false) {
            // Reset the continuous index, so we can recalibrate on the next interaction
            continuousPreviousIndex.current = -1
        }
        
        state.isDragging && isDragging(false);
        dispatch({
            type: 'onMouseUp',
            payload: {
                isDragging: false
            }
        });
    };

    const onMouseMove = useCallback((event) => {
        if (!state.isDragging || (!knobDraggable && !trackDraggable) || ((event.type === 'mousemove') && !useMouse)) return;

        event.preventDefault();

        let touch;
        if (event.type === 'touchmove') {
            touch = event.changedTouches[0];
        }

        const offsetRelativeToDocument = (ref) => {
            const rect = ref.current.getBoundingClientRect();
            const scrollLeft = !isServer && ((window?.pageXOffset ?? 0) || (document?.documentElement?.scrollLeft ?? 0));
            const scrollTop = !isServer && ((window?.pageYOffset ?? 0) || (document?.documentElement?.scrollTop ?? 0));
            return {top: rect.top + scrollTop, left: rect.left + scrollLeft};
        };

        const mouseXFromCenter = (event.type === 'touchmove' ? touch.pageX : event.pageX) -
            (offsetRelativeToDocument(circularSlider).left + state.radius);
        const mouseYFromCenter = (event.type === 'touchmove' ? touch.pageY : event.pageY) -
            (offsetRelativeToDocument(circularSlider).top + state.radius);

        const radians = Math.atan2(mouseYFromCenter, mouseXFromCenter);
        setKnobPosition(radians);
    }, [state.isDragging, state.radius, setKnobPosition, knobDraggable, trackDraggable, isServer]);

    // Get svg path length onmount
    useEffect(() => {
        dispatch({
            type: 'init',
            payload: {
                mounted: true,
                data: state.data.length ? [...state.data] : [...generateRange(min, max)],
                dashFullArray: svgFullPath.current.getTotalLength ? svgFullPath.current.getTotalLength() : 0,
            }
        });
        // eslint-disable-next-line
    }, [max, min]);

    // Set knob position
    useEffect(() => {
        const dataArrayLength = state.data.length;
        const knobPositionIndex = (dataIndex > dataArrayLength - 1) ? dataArrayLength - 1 : dataIndex;

        if(!!dataArrayLength) {
            const pointsInCircle = spreadDegrees / dataArrayLength;
            const offset = getRadians(pointsInCircle) / 2;

            dispatch({
                type: 'setInitialKnobPosition',
                payload: {
                    radians: Math.PI / 2 - state.knobOffset,
                    offset
                }
            });

            if(knobPositionIndex) {
                const degrees = getSliderRotation(direction) * knobPositionIndex * pointsInCircle;
                const radians = getRadians(degrees) - state.knobOffset;

                return setKnobPosition(radians+(offset*getSliderRotation(direction)));
            }
            setKnobPosition(-(state.knobOffset)+(offset*getSliderRotation(direction)));
        }

        // eslint-disable-next-line
    }, [state.dashFullArray, state.knobOffset, state.data.length, dataIndex, direction]);

    useEventListener('touchend', onMouseUp);
    useEventListener('mouseup', onMouseUp);
    useEventListener('touchmove', onMouseMove);
    useEventListener('mousemove', onMouseMove);

    const sanitizedLabel = label.replace(/[\W_]/g, "_");

    return (
        <div style={{...styles.circularSlider, ...(state.mounted && styles.mounted)}} ref={circularSlider}>
            <Svg
                width={width}
                label={sanitizedLabel}
                direction={direction}
                strokeDasharray={state.dashFullArray}
                strokeDashoffset={state.dashFullOffset}
                svgFullPath={svgFullPath}
                progressSize={progressSize}
                progressColorFrom={progressColorFrom}
                progressColorTo={progressColorTo}
                progressLineCap={progressLineCap}
                trackColor={trackColor}
                trackSize={trackSize}
                radiansOffset={state.radians}
                onMouseDown={trackDraggable ? onMouseDown : null}
                isDragging={state.isDragging}
            />
            <Knob
                isDragging={state.isDragging}
                knobPosition={{ x: state.knob.x, y: state.knob.y }}
                knobSize={knobSize}
                knobColor={knobColor}
                trackSize={trackSize}
                hideKnob={hideKnob}
                knobDraggable={knobDraggable}
                onMouseDown={onMouseDown}
            >
                {children}
            </Knob>
            {renderLabelValue || (
                <Labels
                    label={label}
                    labelColor={labelColor}
                    labelBottom={labelBottom}
                    labelFontSize={labelFontSize}
                    verticalOffset={verticalOffset}
                    valueFontSize={valueFontSize}
                    appendToValue={appendToValue}
                    prependToValue={prependToValue}
                    hideLabelValue={hideLabelValue}
                    value={`${state.label}`}
                />
            )}
        </div>
    );
};

CircularSlider.propTypes = {
    label: PropTypes.string,
    width: PropTypes.number,
    direction: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
    knobColor: PropTypes.string,
    knobPosition: PropTypes.oneOfType([
        PropTypes.oneOf(Object.keys(knobOffsetConsts)),
        PropTypes.number,
    ]),
    hideKnob: PropTypes.bool,
    knobDraggable: PropTypes.bool,
    labelColor: PropTypes.string,
    labelBottom: PropTypes.bool,
    labelFontSize: PropTypes.string,
    valueFontSize: PropTypes.string,
    appendToValue: PropTypes.string,
    renderLabelValue: PropTypes.element,
    prependToValue: PropTypes.string,
    verticalOffset: PropTypes.string,
    hideLabelValue: PropTypes.bool,
    progressLineCap: PropTypes.string,
    progressColorFrom: PropTypes.string,
    progressColorTo: PropTypes.string,
    useMouseAdditionalToTouch: PropTypes.bool,
    progressSize: PropTypes.number,
    trackDraggable: PropTypes.bool,
    trackColor: PropTypes.string,
    trackSize: PropTypes.number,
    data: PropTypes.array,
    dataIndex: PropTypes.number,
    onChange: PropTypes.func,
    isDragging: PropTypes.func
};

export default CircularSlider;
