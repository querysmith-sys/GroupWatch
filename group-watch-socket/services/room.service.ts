
type Room  = {
    id: string,
    name: string,
    host: string,
    users: string[],
    deleted?: boolean | false
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
    console.log(rooms)
    return room
}

// TODO: handle the case where when host  or user unmount by editing the roomid in url  he should be shown page not fouond or room not found in frontend
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
       return;
    }
    if (!room.users.includes(userId)) {
        return room;
    }
    if (userId === room.host) {
        room.deleted = true; 
        const roomDeletedInfo = room;
        rooms.delete(roomId)
        return roomDeletedInfo;
    }
    room.users = room.users.filter(item => item != userId);

    return room;
}



export const checkRoomExist = (roomId:string) => {
    const room = rooms.has(roomId);
    return room;
}