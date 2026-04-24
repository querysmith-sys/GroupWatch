"use client"
import { io } from "socket.io-client"
import { useEffect } from "react"

export default function Page () {

    useEffect(() => {
        const socket = io("http://localhost:3000");
        socket.on("connect", () => {
            console.log(socket.id)
        })

        return () => {
            socket.disconnect();
        }

    }, [])
    return (
        <div>
            <p>Welcome to the watch page!</p>
        </div>
    )
}