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
    const [vidUrl, setVidUrl] = useState("");
    const [recivedVideo, setRecievedVideo] = useState("");



    const vidId = vidUrl.split("v=")[1];

    useEffect(() => {
        socketRef.current = io("http://localhost:4000");

        socketRef.current.on("connect", () => {
            console.log(socketRef.current?.id)
            socketRef.current?.emit("joinRoom", { roomId: id, userId: userId });
            // socketRef.current?.emit("sendMessage", {roomId: id, userId: userId, msg: {content: message}});
            // socketRef.current?.emit("sendVideo", )

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
        socketRef.current.on("receivedVideo", (data) => {
            alert(`${data.userId} shared a video with id ${data.videoId}`)
            setRecievedVideo(data.videoId);
        })

        return () => {
            socketRef.current?.emit("leaveRoom", { roomId: id, userId: userId });
            socketRef.current?.off("userJoined");
            socketRef.current?.off("userLeft");
            socketRef.current?.off("receivedVideo");
            socketRef.current?.disconnect();
        }

    }, [])
    return (
        <div className="flex h-screen gap-4 p-4">
            <div className="w-[70%] flex flex-col border rounded-lg bg-gray-50">
                <div className="flex-1 p-4 text-black">
                    <p className="text-lg font-semibold mb-2">Welcome to the watch page!</p>
                    <p className="text-sm text-gray-700">Room ID: {id}</p>
                    <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-gray-600">
                        <input type="text" placeholder="Youtube Video Url..." className="border rounded px-3 py-2" value={vidUrl} onChange={(e) => setVidUrl(e.target.value)}/>
                        <button className="border rounded bg-blue-500 text-white px-4 py-2 ml-2" onClick={() => {
                            socketRef.current?.emit("sendVideo", {roomId: id, userId: userId, videoId: vidId})
                        }}>Fetch</button>
                        <div>
                            <iframe src={`https://www.youtube.com/embed/${recivedVideo}`} className="border-none"></iframe>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-[30%] min-w-[280px] flex flex-col border rounded-lg bg-gray-50">
                <div className="p-4 border-b bg-white text-black">
                    <p className="font-semibold">Chat</p>
                    <p className="text-xs text-gray-500">Room: {id}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`p-3 bg-white rounded  ${msg.userId === userId ? 'border-green-500 text-right border-r-4' : 'border-blue-500 border-l-4'}`}>
                            <p className="text-sm font-semibold text-gray-700">{msg.userId}</p>
                            <p className="text-gray-800">{msg.content}</p>
                        </div>
                    ))}
                </div>
                <div className="border-t p-4 bg-white text-black">
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
        </div>
    )
}