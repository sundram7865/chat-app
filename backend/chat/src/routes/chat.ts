import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createNewChat, getAllChats } from "../controllers/chat.js";

const router = express.Router();

router.post("/chat/new",isAuth,createNewChat);
router.get("/chat/all",isAuth,getAllChats);

export default router;