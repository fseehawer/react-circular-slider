import { useEffect, useRef } from 'react';

function useEventListener<K extends keyof WindowEventMap>(
    eventName: K,
    handler: (event: WindowEventMap[K]) => void
): void {
    const savedHandler = useRef<((event: WindowEventMap[K]) => void) | undefined>(undefined);

    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.addEventListener) {
            const eventListener = (event: WindowEventMap[K]) => {
                if (savedHandler.current) savedHandler.current(event);
            };
            window.addEventListener(eventName, eventListener, { passive: false });
            return () => {
                window.removeEventListener(eventName, eventListener);
            };
        }
    }, [eventName]);
}

export default useEventListener;
