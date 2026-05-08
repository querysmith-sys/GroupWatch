"use client"
import { useState } from "react";
import { HostContext } from "./hostContext";


export function HostProvider({children}: {children: React.ReactNode}) {
    //  this is going to be known from who created the room
    const [isHost, setIsHost] = useState(false);

    return (
        <HostContext.Provider value={{isHost, setIsHost}}>
            {children}
        </HostContext.Provider>

    )

}