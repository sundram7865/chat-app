import express  from "express";
import { loginUser, verifyUser } from "../controllers/user.js";
import { isAuth, myProfile } from "../middleware/isAuth.js";
const router = express.Router();


router.post('/login', loginUser);
router.post('/verify', verifyUser);
router.get('/me',isAuth,myProfile);
export default router