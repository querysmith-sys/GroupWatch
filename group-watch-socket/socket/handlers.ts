import { isHost, JoinRoom } from "../services/room.service";
import { LeaveRoom } from "../services/room.service";
import { checkRoomExist } from "../services/room.service";
import { Socket } from "socket.io";


type chatData = {
    userId: string,
    roomId: string
    msg: {
        content: string
    }
}



export function eventHandler(socket:Socket, io: any) {
    socket.on("joinRoom", ({roomId, userId}:{roomId: string, userId: string}) => {
        const room = JoinRoom(roomId, userId);
        if (!room) {
            console.log("Failed to join room");
            return;
        }
        socket.join(roomId);
        socket.to(room.id).emit("userJoined", { msg: `${userId} joined the room ${room.name}` })
    })

    socket.on("leaveRoom", ({roomId, userId}:{roomId: string, userId: string}) => {
        const room = LeaveRoom(roomId, userId);
        if (!room) {
            console.log("Failed to leave room");
            return;
        }
        if (room?.deleted) {
            console.log("Host left, room deleted")
            socket.to(roomId).emit("hostLeft", { msg: `The host has left the room ${room.name}` })
            socket.leave(roomId);
            // socket.disconnect()
            return;
        }
        socket.leave(roomId);
        socket.to(roomId).emit("userLeft", { msg: `${userId} left the room ${room?.name}`} )
    })

    socket.on("sendMessage", (data:chatData) => {
        if (!checkRoomExist(data.roomId)) {
             throw new Error("Room not exist");
        }
        const msg = data.msg.content;
        // send it everyone in the room including sender
        io.to(data.roomId).emit("receivedMessage", {userId: data.userId, message: {content: msg}})
    })

    socket.on("sendVideo", (data:{roomId: string, userId: string, videoId: string}) => {
        if (!checkRoomExist(data.roomId))  {
            throw new Error("Room not exist");
        }
        io.to(data.roomId).emit("receivedVideo", {userId: data.userId, videoId: data.videoId})
    })

    socket.on("videoAction", (data:{roomId: string, userId: string, action: string, currentTime: number}) => {
        if (!checkRoomExist(data.roomId)) {
            return;
        }
        if (!isHost(data.roomId, data.userId)){return;}
        if (data.action === "PLAY" ) {
            socket.to(data.roomId).emit("videoAction", { action: "PLAY", currentTime: data.currentTime })
        }

        if (data.action === "PAUSE") {
            socket.to(data.roomId).emit("videoAction", { action: "PAUSE", currentTime: data.currentTime })
        }

        if (data.action === "SEEK") {
            socket.to(data.roomId).emit("videoAction", { action: "SEEK", currentTime: data.currentTime })
        }
    })
}
