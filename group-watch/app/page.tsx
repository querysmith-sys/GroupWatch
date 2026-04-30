"use client"
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";



export default function Home() {
  const [roomName, setRoomName] = useState("");
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
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black"> 
            <h1>GroupWatch</h1>
            <p>Welcome to the GroupWatch!</p>
            <input type="text" placeholder="Room ID" value={roomId} onChange={e => setRoomId(e.target.value)}/>
            <button className="border bg-red-500 text-white px-4 py-2 rounded" onClick={handleJoinRoom}>
              Join
            </button>
            <input type="text" placeholder="Enter Room Name" value={roomName} onChange={e => setRoomName(e.target.value)}/>
            <button className="border bg-blue-500 text-white px-4 py-2 rounded" onClick={handleCreateRoom}>
              CreateRoom
            </button>
    </div>
  );
}
