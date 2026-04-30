"use client"
import { io } from "socket.io-client"
import { useEffect } from "react"
import { useParams } from 'next/navigation';

export default function Page () {
const { id } =  useParams();
const userId =  localStorage.getItem("userId");
    useEffect(() => {
        const socket = io("http://localhost:3000");
        socket.on("connect", () => {
            console.log(socket.id)
            socket.emit("joinRoom", {roomId: id, userId: userId});
           
        })
            socket.on("userJoined", (data) => {
              alert(data.msg)
            })
            socket.on("userLeft", (data) => {
                alert(data.msg)
            })
        return () => {
            socket.emit("leaveRoom", {roomId: id, userId: userId});
            socket.off("userJoined");
            socket.off("userLeft");
            socket.disconnect();
        }

    }, [])
    return (
        <div>
            <p>Welcome to the watch page!</p>
            <p>Room ID: {id}</p>
        </div>
    )
}