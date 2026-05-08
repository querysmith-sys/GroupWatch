"use client"
import { io, Socket } from "socket.io-client"
import { useEffect, useState, useRef, useContext } from "react"
import { useParams, useRouter } from 'next/navigation';
import { HostContext } from "@/app/context/hostContext";

export default function Page() {
    const { id } = useParams();
    const userId = localStorage.getItem("userId");
    const [messages, setMessage] = useState<Array<{ userId: string, content: string }>>([]);
    const socketRef = useRef<Socket | null>(null);
    const [inputText, setInputText] = useState("");
    const [vidUrl, setVidUrl] = useState("");
    const [recivedVideo, setRecievedVideo] = useState("");
    const router = useRouter();
    const playerRef = useRef(null);
    const [apiReady, setApiReady] = useState(false);
    const { isHost } = useContext(HostContext);
    const vidId = vidUrl.split("v=")[1];
    const hasJoined = useRef(false);

    useEffect(() => {
        if (hasJoined.current) return;
        hasJoined.current = true;
        socketRef.current = io("http://localhost:4000");

        const emitLeave = () => {
            socketRef.current?.emit("leaveRoom", { roomId: id, userId: userId });
        };
        window.addEventListener("beforeunload", emitLeave);
        socketRef.current.on("connect", () => {
            console.log(socketRef.current?.id)
            socketRef.current?.emit("joinRoom", { roomId: id, userId: userId });

        })
        socketRef.current.on("userJoined", (data) => {
            console.log(data)
            alert(data.msg)
        })
        socketRef.current.on("userLeft", (data) => {
            alert(data.msg)
        })
        socketRef.current.on("receivedMessage", (data) => {
            setMessage(prev => [...prev, { userId: data.userId, content: data.message.content }])
        })
        socketRef.current.on("receivedVideo", (data) => {
            alert(`${data.userId} shared a video with id ${data.videoId}`)
            setRecievedVideo(data.videoId);
        })

        socketRef.current.on("hostLeft", (data) => {
            alert(data.msg);
            router.push("/");
        })

        // listener for videoAction evnt
        socketRef.current.on("videoAction", (data) => {
            if (data.action === "PLAY") {
                (playerRef as any).current?.seekTo(data.currentTime, true);
                (playerRef as any).current?.playVideo();
            }

            if (data.action === "PAUSE") {
                (playerRef as any).current?.pauseVideo();
            }
        })

        // running the scriptdownloads the source code logic and execute it, it creates a object window.yt so if it is not created it creates a script tag and add it to the dom and define a global callback function onYouTubeIframeAPIReady which is called when the script is loaded and ready to use and in that we set apiReady to true so that we can render the player
    if (!(window as any).YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        
        // 2. Define the global callback
        (window as any).onYouTubeIframeAPIReady = () => {
            setApiReady(true);
        };
    } else {
        setApiReady(true);
    }

        return () => {
            if (hasJoined.current) return;
            console.log("it recahes here")
            window.removeEventListener("beforeunload", emitLeave);
            emitLeave();
            // socketRef.current?.emit("leaveRoom", { roomId: id, userId: userId });
            socketRef.current?.off("userJoined");
            socketRef.current?.off("userLeft");
            socketRef.current?.off("receivedMessage");
            socketRef.current?.off("receivedVideo");
            socketRef.current?.off("hostLeft");
            // socketRef.current?.disconnect();
        }

    }, [])

    useEffect(() => {
    if (apiReady && recivedVideo) {
        if (!playerRef.current) {
            // Create new player
            playerRef.current = new (window as any).YT.Player('yt-player', {
                videoId: recivedVideo,
                playerVars:{
                    'controls': isHost ? 1 : 0,
                    'disablekb': isHost ? 1 : 0
                },
                events: {
                    'onStateChange': (event: any) => {
                        // Handle sync logic here (emit to socket when user pauses/plays)
                        console.log("State changed:", event.data);
                        let currEventState = event.data;
                        let currentTime = (playerRef.current as any).getCurrentTime();
                        if (currEventState === (window as any).YT.PlayerState.PLAYING) {
                            socketRef.current?.emit("videoAction", { action:"PLAY",  currentTime: currentTime, roomId: id, userId: userId });
                        }

                        if (currEventState === (window as any).YT.PlayerState.PAUSED) {
                            socketRef.current?.emit("videoAction", { action:"PAUSE",  currentTime: currentTime, roomId: id, userId: userId });
                        }
                    }
                }
            });
        } else {
            // If player exists, just load the new video
            (playerRef.current as any).loadVideoById(recivedVideo);
        }
    }
}, [apiReady, recivedVideo]);

    return (
        <div className="flex h-screen gap-4 p-4">
            <div className="w-[70%] flex flex-col border rounded-lg bg-gray-50">
                <div className="flex-1 p-4 text-black">
                    <p className="text-lg font-semibold mb-2">Welcome to the watch page!</p>
                    <p className="text-sm text-gray-700">Room ID: {id}</p>
                    <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white p-6 text-gray-600">
                        <input type="text" placeholder="Youtube Video Url..." className="border rounded px-3 py-2" value={vidUrl} onChange={(e) => setVidUrl(e.target.value)} />
                        <button className="border rounded bg-blue-500 text-white px-4 py-2 ml-2" onClick={() => {
                            socketRef.current?.emit("sendVideo", { roomId: id, userId: userId, videoId: vidId })
                        }}>Fetch</button>
                        {/* <div>
                            <iframe id="yt-palyer" src={`https://www.youtube.com/embed/${recivedVideo}`} className="border-none"></iframe>
                        </div> */}
                        <div className="aspect-video w-full mt-4">
                            <div id="yt-player"></div>
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