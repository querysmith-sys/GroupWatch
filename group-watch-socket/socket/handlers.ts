import { JoinRoom } from "../services/room.service";
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
        socket.join(roomId);
        socket.to(room.id).emit("userJoined", { msg: `${userId} joined the room ${room.name}` })
    })

    socket.on("leaveRoom", ({roomId, userId}:{roomId: string, userId: string}) => {
        const room = LeaveRoom(roomId, userId);
        if (room?.deleted) {
            console.log("Host left, room deleted")
            socket.to(roomId).emit("hostLeft", { msg: `The host has left the room ${room.name}` })
            socket.leave(roomId);
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
}

