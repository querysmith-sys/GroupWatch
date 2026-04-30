import express from "express";
import {CreateRoom} from "../services/room.service"
const roomRouter = express.Router();

roomRouter.post("/createRoom", (req, res) => {
    const { roomName, userId } = req.body;
    if (!roomName || !userId) return res.status(404).json({msg: "missing roomName or userId"});
    try {
        const room = CreateRoom(roomName, userId);
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({msg: "CreateRoom endpoint Issue"})
    }
})

export default roomRouter;