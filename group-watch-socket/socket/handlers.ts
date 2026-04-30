import { JoinRoom } from "../services/room.service";
import { LeaveRoom } from "../services/room.service";
import { Socket } from "socket.io";

export function eventHandler(socket:Socket) {
    socket.on("joinRoom", ({roomId, userId}:{roomId: string, userId: string}) => {
        const room = JoinRoom(roomId, userId);
        socket.join(roomId);
        socket.to(room.id).emit("userJoined", { msg: `${userId} joined the room ${room.name}` })
    })

    socket.on("leaveRoom", ({roomId, userId}:{roomId: string, userId: string}) => {
        const room = LeaveRoom(roomId, userId);
        socket.leave(roomId);
        socket.to(roomId).emit("userLeft", { msg: `${userId} left the room ${room?.name}`} )
    })
}

