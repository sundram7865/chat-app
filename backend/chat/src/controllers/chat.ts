import TryCatch from "../config/TryCatch.js";
import type { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { Chat } from "../models/chat.js";

export const createNewChat = TryCatch(async (req: AuthenticatedRequest, res) => {
    const  userId  = req.user?._id;
    const {otherUserId} = req.body;
    if ( !otherUserId) {
        return res.status(400).json({ message: " other user ID are required" });
    }
    const existingChat = await Chat.findOne({ users: { $all: [userId, otherUserId],$size:2 } });
    if (existingChat) {
        res.json({
            message : "Chat already exists",
            chatId:existingChat._id
        })
        return;
    }
    const newChat = await Chat.create({ users: [userId, otherUserId] });
    res.status(201).json({ 
        message: "Chat created successfully",
         chatId:newChat._id
    });
});