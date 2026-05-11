"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { HostContext } from "./context/hostContext";


export default function Home() {
  const [roomName, setRoomName] = useState("");
  const { setIsHost } = useContext(HostContext);
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [roomId, setRoomId] = useState("");



  useEffect(() => {
    let id = localStorage.getItem("userId");

    if (!id) {
      id = Date.now().toString() + Math.floor(Math.random() * 1000);
      localStorage.setItem("userId", id);
    }

    setUserId(id);
  }, []);
 
   const handleCreateRoom = async () => {

    const res = await fetch("http://localhost:4000/api/createRoom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName, userId }),
    });

    const data:{id:string} = await res.json();
    console.log(data);
    router.push(`/watch/${data.id}`);
    setIsHost(true);
  };

  const handleJoinRoom = () => {
    if (!roomId) {
      alert("Please enter a room ID");
      return;
    }
    router.push(`/watch/${roomId}`);
  }




//  frontend popup for the user to enter the room name and create a room using the API route /api/room/create and then redirect to the room page /watch/[roomId]
  return (
<div className="flex items-center justify-center w-64 h-64 bg-gray-200">
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
    .gw-logo { font-family: 'DM Serif Display', serif; font-size: 28px; letter-spacing: -0.5px; margin: 0 0 4px; }
    .gw-logo em { font-style: italic; opacity: 0.5; }
    .gw-sub { font-family: 'DM Sans', sans-serif; font-size: 13px; opacity: 0.4; margin: 0 0 2rem; letter-spacing: 0.02em; }
    .gw-label { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; opacity: 0.4; margin-bottom: 8px; }
    .gw-input { width: 100%; box-sizing: border-box; padding: 10px 14px; font-family: 'DM Sans', sans-serif; font-size: 14px; border: 0.5px solid rgba(0,0,0,0.15); border-radius: 8px; background: white; outline: none; transition: border-color 0.2s; }
    .gw-input:focus { border-color: rgba(0,0,0,0.4); }
    .gw-input::placeholder { opacity: 0.35; }
    .dark .gw-input { background: #111; border-color: rgba(255,255,255,0.12); color: white; }
    .dark .gw-input:focus { border-color: rgba(255,255,255,0.4); }
    .gw-btn-join { width: 100%; margin-top: 8px; padding: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.04em; border: none; border-radius: 8px; background: #111; color: white; cursor: pointer; transition: opacity 0.15s; }
    .dark .gw-btn-join { background: white; color: #111; }
    .gw-btn-join:hover { opacity: 0.8; }
    .gw-divider { display: flex; align-items: center; gap: 12px; margin: 1.75rem 0; }
    .gw-divider span { font-family: 'DM Sans', sans-serif; font-size: 11px; opacity: 0.35; letter-spacing: 0.06em; white-space: nowrap; }
    .gw-divider::before, .gw-divider::after { content: ''; flex: 1; height: 0.5px; background: rgba(0,0,0,0.12); }
    .dark .gw-divider::before, .dark .gw-divider::after { background: rgba(255,255,255,0.12); }
    .gw-btn-create { width: 100%; margin-top: 8px; padding: 10px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; letter-spacing: 0.04em; border: 0.5px solid rgba(0,0,0,0.2); border-radius: 8px; background: transparent; color: inherit; cursor: pointer; transition: background 0.15s; }
    .dark .gw-btn-create { border-color: rgba(255,255,255,0.2); }
    .gw-btn-create:hover { background: rgba(0,0,0,0.04); }
    .dark .gw-btn-create:hover { background: rgba(255,255,255,0.06); }
  `}</style>

  <div style={{ width: '100%', maxWidth: 360, padding: '0 1rem' }}>
    <h1 className="gw-logo">Group<em>Watch</em></h1>
    <p className="gw-sub">Watch together, wherever you are.</p>

    <div style={{ marginBottom: '1.5rem' }}>
      <p className="gw-label">Join a room</p>
      <input className="gw-input" type="text" placeholder="Enter room ID" value={roomId} onChange={e => setRoomId(e.target.value)} />
      <button className="gw-btn-join" onClick={handleJoinRoom}>Join room</button>
    </div>

    <div className="gw-divider"><span>or</span></div>

    <div>
      <p className="gw-label">Create a room</p>
      <input className="gw-input" type="text" placeholder="Room name" value={roomName} onChange={e => setRoomName(e.target.value)} />
      <button className="gw-btn-create" onClick={handleCreateRoom}>Create room</button>
    </div>
  </div>
</div>
  );
}
