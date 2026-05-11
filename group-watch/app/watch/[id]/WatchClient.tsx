"use client"
import { io, Socket } from "socket.io-client"
import { useEffect, useState, useRef, useContext } from "react"
import { useParams, useRouter } from 'next/navigation';
import { HostContext } from "@/app/context/hostContext";

export default function WatchPage() {
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

            if (data.action === "SEEK") {
                 (playerRef as any).current?.seekTo(data.currentTime);
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

                        if (currEventState === (window as any).YT.PlayerState.SEEK) {
                             socketRef.current?.emit("videoAction", { action:"SEEK",  currentTime: currentTime, roomId: id, userId: userId });
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
            <div className="flex h-screen w-full gap-4 p-4" style={{ background: "#f0efeb", fontFamily: "'DM Sans', sans-serif" }}>
        
        {/* Main Video Panel */}
        <div className="w-[70%] flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-6 py-5 border-b border-stone-100">
                <div className="flex items-baseline">
                    <span className="text-xl font-bold tracking-tight text-stone-900">Group</span>
                    <span className="text-xl text-stone-900 italic" style={{ fontFamily: "'DM Serif Display', serif" }}>Watch</span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 mb-1">Watch together, wherever you are.</p>
                <p className="text-[11px] tracking-widest uppercase text-stone-400">Room · {id}</p>
            </div>

            <div className="flex-1 flex flex-col gap-4 p-6">
                <div>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-400 mb-2">Video URL</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Paste a YouTube URL…"
                            className="flex-1 px-4 py-2.5 text-sm text-stone-800 bg-white border border-stone-200 rounded-xl outline-none placeholder-stone-300 focus:border-stone-400 transition-colors"
                            value={vidUrl}
                            onChange={(e) => setVidUrl(e.target.value)}
                        />
                        <button
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-700 active:scale-95 transition-all whitespace-nowrap"
                            onClick={() => {
                                socketRef.current?.emit("sendVideo", { roomId: id, userId: userId, videoId: vidId })
                            }}
                        >
                            Load
                        </button>
                    </div>
                </div>

                <div className="flex-1 rounded-xl border border-dashed border-stone-200 bg-stone-50 overflow-hidden min-h-0">
                    <div className="aspect-video w-full">
                        <div id="yt-player" className="w-full h-full"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Chat Panel */}
        <div className="w-[30%] min-w-[280px] flex flex-col rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
                <p className="font-semibold text-stone-900 text-[15px]">Chat</p>
                <p className="text-[11px] tracking-widest uppercase text-stone-400 mt-0.5">Room · {id}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`px-3.5 py-2.5 rounded-xl max-w-[90%] ${
                            msg.userId === userId
                                ? 'bg-stone-900 self-end'
                                : 'bg-stone-50 border border-stone-200 self-start'
                        }`}
                    >
                        <p className={`text-[10px] font-semibold tracking-widest uppercase mb-1 ${msg.userId === userId ? 'text-white/40' : 'text-stone-400'}`}>
                            {msg.userId}
                        </p>
                        <p className={`text-sm leading-snug ${msg.userId === userId ? 'text-white' : 'text-stone-700'}`}>
                            {msg.content}
                        </p>
                    </div>
                ))}
            </div>

            <div className="border-t border-stone-100 p-4 flex gap-2">
                <input
                    type="text"
                    placeholder="Say something…"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-sm text-stone-800 bg-white border border-stone-200 rounded-xl outline-none placeholder-stone-300 focus:border-stone-400 transition-colors"
                />
                <button
                    className="px-4 py-2.5 text-sm font-semibold text-white bg-stone-900 rounded-xl hover:bg-stone-700 active:scale-95 transition-all"
                    onClick={() => {
                        socketRef.current?.emit("sendMessage", { roomId: id, userId: userId, msg: { content: inputText } });
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    </div>
    )
}