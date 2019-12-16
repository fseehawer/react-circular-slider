import {useEffect, useRef} from 'react';

let winObj = null;

if (typeof window !== 'undefined') {
    winObj = window;
}

const useEventListener = (eventName, handler, element= winObj) => {
    const savedHandler = useRef(null);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
            if(winObj === null) return;
            const isSupported = element && element.addEventListener;
            if (!isSupported) return;

            // Create event listener that calls handler function stored in ref
            const eventListener = event => savedHandler.current(event);

            element.addEventListener(eventName, eventListener, {passive: false});
            return () => {
                element.removeEventListener(eventName, eventListener);
            };
        },
        [eventName, element]
    );
};

export default useEventListener;