"use client"
import { io, Socket } from "socket.io-client"
import { useEffect, useState, useRef } from "react"
import { useParams } from 'next/navigation';

export default function Page() {
    const { id } = useParams();
    const userId = localStorage.getItem("userId");
    const [messages, setMessage] = useState<Array<{ userId: string, content: string }>>([]);
    const socketRef = useRef<Socket | null>(null);
    const [inputText, setInputText] = useState("");

    useEffect(() => {
        socketRef.current = io("http://localhost:4000");

        socketRef.current.on("connect", () => {
            console.log(socketRef.current?.id)
            socketRef.current?.emit("joinRoom", { roomId: id, userId: userId });
            // socketRef.current?.emit("sendMessage", {roomId: id, userId: userId, msg: {content: message}});

        })
        socketRef.current.on("userJoined", (data) => {
            console.log(data)
            alert(data.msg)
        })
        socketRef.current.on("userLeft", (data) => {
            alert(data.msg)
        })
        socketRef.current.on("receivedMessage", (data) => {
            // alert(`${data.userId} : ${data.message.content}`)
            setMessage(prev => [...prev, {userId: data.userId, content: data.message.content}])
        })

        return () => {
            socketRef.current?.emit("leaveRoom", { roomId: id, userId: userId });
            socketRef.current?.off("userJoined");
            socketRef.current?.off("userLeft");
            socketRef.current?.disconnect();
        }

    }, [])
    return (
        <div className="flex h-screen gap-4 p-4">
            {/* Chat interface - Left side */}
            <div className="flex-1 flex flex-col border rounded-lg bg-gray-50">
                {/* Messages container - scrollable */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="p-3 bg-white rounded border-l-4 border-blue-500">
                            <p className="text-sm font-semibold text-gray-700">{msg.userId}</p>
                            <p className="text-gray-800">{msg.content}</p>
                        </div>
                    ))}
                </div>
                <div className="border-t p-4 bg-white">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter msg.."
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            className="flex-1 border rounded px-3 py-2"
                        />
                        <button className="border rounded bg-red-500 text-white px-4 py-2" onClick={() => {
                            socketRef.current?.emit("sendMessage", { roomId: id, userId: userId, msg: { content: inputText } });
                        }}>
                            Send
                        </button>
                    </div>
                </div>
            </div>
            <div className="w-64 border rounded p-4">
                <p>Welcome to the watch page!</p>
                <p>Room ID: {id}</p>
            </div>
        </div>
    )
}