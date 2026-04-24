
import { CreateRoom } from "@/services/room.service";

export async function POST(req:Request) {
    const { userId, roomName } =  await req.json();
     if (!roomName || !userId) throw new Error("Provide RoomName and UserId");
    try {
        const room = CreateRoom(roomName, userId);
        return Response.json(room, { status:200 })
    } catch (error:any) {
        return Response.json({ error: error.message }, { status:400 });
    }
}