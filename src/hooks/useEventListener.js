import {useEffect, useRef} from 'react';
import window from 'global';

const useEventListener = (eventName, handler) => {
    const savedHandler = useRef(null);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
            if(typeof window !== "undefined") {
                // Create event listener that calls handler function stored in ref
                const eventListener = event => savedHandler.current(event);

                window.addEventListener(eventName, eventListener, {passive: false});
                return () => {
                    window.removeEventListener(eventName, eventListener);
                };
            }
        },
        [eventName]
    );
};

export default useEventListener;