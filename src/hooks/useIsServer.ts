import { useEffect, useState } from 'react';

const useIsServer = (): boolean => {
    const [isServer, setIsServer] = useState(true);

    useEffect(() => {
        setIsServer(false);
    }, []);

    return isServer;
};

export default useIsServer;