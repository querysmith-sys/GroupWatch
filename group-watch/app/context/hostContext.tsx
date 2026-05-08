"use client"
import {createContext} from 'react';

export const HostContext = createContext<{isHost:boolean, setIsHost: React.Dispatch<React.SetStateAction<boolean>>}>({isHost:false, setIsHost: () => {}});