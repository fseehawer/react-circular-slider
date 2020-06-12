import { useState, useEffect } from 'react'

const useIsServer = () => {
    const [isServer, setIsServer] = useState(true)
    useEffect(() => {
        setIsServer(false)
    }, [])
    return isServer
}

export default useIsServer;