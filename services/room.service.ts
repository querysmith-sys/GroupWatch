
type Room  = {
    id: string,
    name: string,
    host: string,
    users: string[]
}
const rooms: Map<string, Room> = new Map();

export const CreateRoom =  ( room_name:string, userId:string ) => {
    
    const roomId =  Date.now().toString() + Math.floor(Math.random() * 100);

    const room:Room = {
        id: roomId,
        name: room_name,
        host: userId,
        users: [userId]
    }
    rooms.set(roomId, room);

    return room
}


export const JoinRoom =  ( roomId:string, userId:string) => {
    const room = rooms.get(roomId);
    if (!room) {
        throw new Error("Room not found");
    }
    if (room.users.includes(userId)) return room;
    room.users.push(userId);
    return room;
}


export const LeaveRoom = ( roomId:string, userId:string) => {
    const room =  rooms.get(roomId);
    if (!room) {
        throw new Error("Room not found");
    }
    if (!room.users.includes(userId)) {
        return room;
    }
    if (userId === room.host) {
        rooms.delete(roomId)
        return;
    }
    room.users.filter(item => item != userId);

    return room;
}
